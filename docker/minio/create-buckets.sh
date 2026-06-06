#!/bin/sh
set -eu

until mc alias set local "http://minio:9000" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
  sleep 2
done

mc mb --ignore-existing "local/$MINIO_PUBLIC_BUCKET"
mc mb --ignore-existing "local/$MINIO_PRIVATE_BUCKET"

mc anonymous set download "local/$MINIO_PUBLIC_BUCKET"
mc anonymous set none "local/$MINIO_PRIVATE_BUCKET"
