# app/celery_app.py
from celery import Celery

celery = Celery(
    "order_summary_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

celery.conf.beat_schedule = {
    "recalculate-summary-every-2-minutes": {
        "task": "app.tasks.recalculate_summary",
        "schedule": 120.0,  # 2 minutes
    },
}

celery.autodiscover_tasks(["app.tasks"])
