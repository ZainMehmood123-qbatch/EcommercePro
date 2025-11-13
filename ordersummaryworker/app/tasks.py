# app/tasks.py
import csv
import io
import uuid
from datetime import datetime
from app.celery_app import celery
from app.db import SessionLocal
from app.models import Order, OrderItem, OrderSummary, Product, ProductVariant
from sqlalchemy import func

@celery.task(name="app.tasks.recalculate_summary")
def recalculate_summary():
    """
    Incremental summary recalculation — only processes orders created after the last summary update.
    """
    db = SessionLocal()
    try:
        summary = db.query(OrderSummary).first()

        if not summary:
            summary = OrderSummary(
                totalOrders=0,
                totalUnits=0,
                totalAmount=0,
                lastUpdated=datetime(2000, 1, 1),
            )
            db.add(summary)
            db.commit()

        last_time = summary.lastUpdated or datetime(2000, 1, 1)

        new_orders_count = (
            db.query(func.count(Order.id))
            .filter(Order.createdAt > last_time)
            .scalar()
            or 0
        )

        new_units = (
            db.query(func.sum(OrderItem.qty))
            .join(Order, OrderItem.orderId == Order.id)
            .filter(Order.createdAt > last_time)
            .scalar()
            or 0
        )

        new_amount = (
            db.query(func.sum(OrderItem.qty * OrderItem.price))
            .join(Order, OrderItem.orderId == Order.id)
            .filter(Order.createdAt > last_time)
            .scalar()
            or 0
        )

        summary.totalOrders += new_orders_count
        summary.totalUnits += new_units
        summary.totalAmount += new_amount
        summary.lastUpdated = datetime.utcnow()

        db.commit()
        print(
            f"Summary incrementally updated! "
            f"+{new_orders_count} orders, +{new_units} units, +{new_amount} amount"
        )

    except Exception as e:
        db.rollback()
        print("Error updating summary incrementally:", e)
    finally:
        db.close()

@celery.task(name="app.tasks.import_products_from_csv")
def import_products_from_csv(file_path: str):
    """Background task — import products + variants from CSV safely."""
    db = SessionLocal()
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            batch_size = 5
            variants_batch = []

            for i, row in enumerate(reader, start=1):
                title = (row.get("title") or "").strip()
                color = (row.get("colorName") or "").strip()
                color_code = (row.get("colorCode") or "").strip()
                size = (row.get("size") or "").strip()
                price = float(row.get("price") or 0)
                stock = int(row.get("stock") or 0)
                image = (row.get("image") or "").strip()

                if not title or not color or not size:
                    print(f"⚠️ Skipping invalid row #{i} — missing title/color/size.")
                    continue

                product = db.query(Product).filter(Product.title == title).first()
                if not product:
                    product = Product(id=str(uuid.uuid4()), title=title)
                    db.add(product)
                    db.commit()  

                existing_variant = (
                    db.query(ProductVariant)
                    .filter(
                        ProductVariant.productId == product.id,
                        ProductVariant.colorName == color,
                        ProductVariant.size == size,
                    )
                    .first()
                )

                in_batch = any(
                    v.productId == product.id and v.colorName == color and v.size == size
                    for v in variants_batch
                )

                if existing_variant or in_batch:
                    print(f"Variant already exists for {title} ({color}-{size})")
                    continue  

                print(f"➡️ Adding variant for {title} ({color}-{size})")
                variant = ProductVariant(
                    id=str(uuid.uuid4()),
                    productId=product.id,
                    colorName=color,
                    colorCode=color_code,
                    size=size,
                    stock=stock,
                    price=price,
                    image=image,
                )
                variants_batch.append(variant)

                if i % batch_size == 0:
                    db.add_all(variants_batch)
                    db.commit()
                    print(f"✅ Imported {i} rows so far...")
                    variants_batch.clear()

            if variants_batch:
                db.add_all(variants_batch)
                db.commit()

        print("All products imported successfully!")
    except Exception as e:
        db.rollback()
        print("Error importing products:", e)
    finally:
        db.close()
