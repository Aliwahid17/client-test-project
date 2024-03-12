from celery import Celery
from .config import get_settings

celery_app = Celery(
    "worker",
    broker=f"redis://{get_settings().REDIS_HOST}:{get_settings().REDIS_PORT}/{get_settings().REDIS_DB}",
    backend=f"redis://{get_settings().REDIS_HOST}:{get_settings().REDIS_PORT}/{get_settings().REDIS_DB}",
)

celery_app.conf.worker_concurrency = 2
celery_app.autodiscover_tasks(["core.tasks"])