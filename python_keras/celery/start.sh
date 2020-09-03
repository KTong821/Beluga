#!/bin/bash

celery flower -A tasks --address=0.0.0.0 --port=5555 &
celery -A tasks worker -l info
