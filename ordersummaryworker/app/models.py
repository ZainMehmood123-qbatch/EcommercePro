# app/models.py
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base
import enum

class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class ProductStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "User"
    __table_args__ = {"extend_existing": True}
    id = Column(String, primary_key=True)
    fullname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    mobile = Column(String)
    password = Column(String, nullable=False)
    resetTokenVersion = Column(Integer, default=0)
    role = Column(Enum(Role), default=Role.USER)
    stripeCustomerId = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Product(Base):
    __tablename__ = "Product"
    __table_args__ = {"extend_existing": True}
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Product(Base):
    __tablename__ = "Product"
    __table_args__ = {"extend_existing": True}
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProductVariant(Base):
    __tablename__ = "ProductVariant"
    id = Column(String, primary_key=True)
    productId = Column(String, ForeignKey("Product.id"), nullable=False)
    colorName = Column(String)
    colorCode = Column(String)
    size = Column(String)
    stock = Column(Integer, default=0)
    price = Column(Float, nullable=False)
    image = Column(String)
    isDeleted = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Order(Base):
    __tablename__ = "Order"
    id = Column(String, primary_key=True)
    userId = Column(String, nullable=False)
    total = Column(Float, default=0)
    createdAt = Column(DateTime, default=datetime.utcnow)

class OrderItem(Base):
    __tablename__ = "OrderItem"
    id = Column(String, primary_key=True)
    orderId = Column(String, ForeignKey("Order.id"))
    qty = Column(Integer, default=0)
    price = Column(Float, default=0)

class OrderSummary(Base):
    __tablename__ = "OrderSummary"
    id = Column(Integer, primary_key=True)
    totalOrders = Column(Integer, default=0)
    totalUnits = Column(Integer, default=0)
    totalAmount = Column(Float, default=0)
    lastUpdated = Column(DateTime, default=datetime.utcnow)
