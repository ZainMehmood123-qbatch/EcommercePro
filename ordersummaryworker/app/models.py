from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

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
