# app/tasks.py
from app.celery_app import celery
from app.db import SessionLocal
from app.models import Order, OrderItem, OrderSummary
from sqlalchemy import func
from datetime import datetime

@celery.task(name="app.tasks.recalculate_summary")
def recalculate_summary():
    db = SessionLocal()
    try:
        # ✅ Total number of orders
        total_orders = db.query(func.count(Order.id)).scalar() or 0

        # ✅ Total quantity of all items
        total_units = db.query(func.sum(OrderItem.qty)).scalar() or 0

        # ✅ Total sales amount (sum of qty * price)
        total_amount = db.query(func.sum(OrderItem.qty * OrderItem.price)).scalar() or 0

        # ✅ Either update existing summary or create a new one
        summary = db.query(OrderSummary).first()
        if summary:
            summary.totalOrders = total_orders
            summary.totalUnits = total_units
            summary.totalAmount = total_amount
            summary.lastUpdated = datetime.utcnow()
        else:
            summary = OrderSummary(
                totalOrders=total_orders,
                totalUnits=total_units,
                totalAmount=total_amount,
                lastUpdated=datetime.utcnow(),
            )
            db.add(summary)

        db.commit()
        print(
            f"✅ Summary updated successfully! "
            f"Orders: {total_orders}, Units: {total_units}, Amount: {total_amount}"
        )

    except Exception as e:
        db.rollback()
        print("❌ Error recalculating summary:", e)

    finally:
        db.close()
