#!/bin/bash
celery flower -A tasks.celery --address=0.0.0.0 --port=5555 &
celery -A tasks.celery worker -l info
