#! /usr/bin/env sh
# adapted from https://github.com/tiangolo/uvicorn-gunicorn-docker
set -e

export APP_MODULE=${APP_MODULE:-"main:storage_api"}

if [ -f /storage/gunicorn_conf.py ]; then
    DEFAULT_GUNICORN_CONF=/storage/gunicorn_conf.py
elif [ -f /storage/api/gunicorn_conf.py ]; then
    DEFAULT_GUNICORN_CONF=/storage/api/gunicorn_conf.py
else
    DEFAULT_GUNICORN_CONF=/gunicorn_conf.py
fi
export GUNICORN_CONF=${GUNICORN_CONF:-$DEFAULT_GUNICORN_CONF}

echo "$GUNICORN_CONF" "$APP_MODULE"

# Start Gunicorn
exec gunicorn -k uvicorn.workers.UvicornWorker -c "$GUNICORN_CONF" "$APP_MODULE"
