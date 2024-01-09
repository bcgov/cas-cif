#!/bin/bash
SOURCE_STATE_PATH="./temp-state/tfcloud.tfstate"
TARGET_STATE_PATH="./temp-state/local.tfstate"

NAMESPACE="c53ff1-dev"
declare -a PATHS=("google_storage_bucket.bucket" "google_service_account.account" "google_storage_bucket_iam_member.admin" "google_service_account.viewer_account" "google_storage_bucket_iam_member.viewer" "google_service_account_key.key" "google_service_account_key.viewer_key" "kubernetes_secret.secret_sa")
declare -a APPS=("cif-documents" "cif-backups")

for path in "${PATHS[@]}"; do
  for app in "${APPS[@]}"; do
    source_resource="${path}[\"${NAMESPACE},${app}\"]"
    target_resource="${path}[\"${app}\"]"

    terraform state mv -state="${SOURCE_STATE_PATH}" -state-out="${TARGET_STATE_PATH}" "${source_resource}" "${target_resource}"
  
  done
done

# Need to think about this more
declare -a UNLOOP_PATHS=("google_project_iam_custom_role.viewer_role")

for path in "${UNLOOP_PATHS[@]}"; do
  source_resource="${path}"
  target_resource="${path}"

  terraform state mv -state="${SOURCE_STATE_PATH}" -state-out="${TARGET_STATE_PATH}" "${source_resource}" "${target_resource}"
  
done
