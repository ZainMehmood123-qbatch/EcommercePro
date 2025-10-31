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
    db = SessionLocal()
    try:
        # Total number of orders
        total_orders = db.query(func.count(Order.id)).scalar() or 0

        # Total quantity of all items
        total_units = db.query(func.sum(OrderItem.qty)).scalar() or 0

        # Total sales amount (sum of qty * price)
        total_amount = db.query(func.sum(OrderItem.qty * OrderItem.price)).scalar() or 0

        # Either update existing summary or create a new one
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


# @celery.task(name="app.tasks.import_products_from_csv")
# def import_products_from_csv(file_content: str):
#     """Background task to import products + variants from uploaded CSV."""
#     db = SessionLocal()
#     try:
#         reader = csv.DictReader(io.StringIO(file_content))
#         for row in reader:
#             title = row.get("title")
#             color = row.get("colorName")
#             size = row.get("size")
#             price = float(row.get("price") or 0)
#             stock = int(row.get("stock") or 0)
#             image = row.get("image")

#             product = db.query(Product).filter(Product.title == title).first()
#             if not product:
#                 product = Product(id=str(uuid.uuid4()), title=title)
#                 db.add(product)
#                 db.commit()

#             existing_variant = (
#                 db.query(ProductVariant)
#                 .filter(
#                     ProductVariant.productId == product.id,
#                     ProductVariant.colorName == color,
#                     ProductVariant.size == size,
#                 )
#                 .first()
#             )
#             if not existing_variant:
#                 variant = ProductVariant(
#                     id=str(uuid.uuid4()),
#                     productId=product.id,
#                     colorName=color,
#                     colorCode=row.get("colorCode"),
#                     size=size,
#                     stock=stock,
#                     price=price,
#                     image=image,
#                 )
#                 db.add(variant)

#         db.commit()
#         print("✅ Products imported successfully!")
#     except Exception as e:
#         db.rollback()
#         print("❌ Error importing products:", e)
#     finally:
#         db.close()


@celery.task(name="app.tasks.import_products_from_csv")
def import_products_from_csv(file_path: str):
    """Background task — process CSV file in streaming (chunked) manner."""
    db = SessionLocal()
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            batch_size = 2
            variants_batch = []

            for i, row in enumerate(reader, start=1):
                title = row.get("title")
                color = row.get("colorName")
                size = row.get("size")
                price = float(row.get("price") or 0)
                stock = int(row.get("stock") or 0)
                image = row.get("image")
                color_code = row.get("colorCode")

                # Check if product exists
                product = db.query(Product).filter(Product.title == title).first()
                if not product:
                    product = Product(id=str(uuid.uuid4()), title=title)
                    db.add(product)
                    db.commit()

                # Check if variant exists
                existing_variant = (
                    db.query(ProductVariant)
                    .filter(
                        ProductVariant.productId == product.id,
                        ProductVariant.colorName == color,
                        ProductVariant.size == size,
                    )
                    .first()
                )

                if not existing_variant:
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

                # Commit every N rows
                if i % batch_size == 0:
                    db.add_all(variants_batch)
                    db.commit()
                    variants_batch.clear()
                    print(f"✅ Imported {i} rows so far...")

            # Commit remaining rows
            if variants_batch:
                db.add_all(variants_batch)
                db.commit()

        print("✅ All products imported successfully!")
    except Exception as e:
        db.rollback()
        print("❌ Error importing products:", e)
    finally:
        db.close()