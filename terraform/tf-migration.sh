#!/bin/bash
SOURCE_STATE_PATH="./temp-state/tfcloud.tfstate"
TARGET_STATE_PATH="./temp-state/local.tfstate"

NAMESPACE="c53ff1-dev"
declare -a PATHS=("google_storage_bucket.bucket" "google_service_account.account")
declare -a APPS=("cif-documents" "cif-backups")

for path in "${PATHS[@]}"; do
  for app in "${APPS[@]}"; do
    source_resource="${path}[\"${NAMESPACE},${app}\"]"
    target_resource="${path}[\"${app}\"]"

    terraform state mv -state="${SOURCE_STATE_PATH}" -state-out="${TARGET_STATE_PATH}" "${source_resource}" "${target_resource}"
  
  done
done
