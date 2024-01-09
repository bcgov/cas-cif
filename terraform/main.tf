# Terraform workspace configuration. To apply changes to this file, use `make create_workspace`

terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      # version = "1.13" 
    }
    google = {
      source = "hashicorp/google"
      version = "~> 5.2.0"
    }
  }
}

# # Configure OCP infrastructure to setup the host and authentication token
# provider "kubernetes" {
#   load_config_file = "false"
#   host             = var.kubernetes_host
#   token            = var.kubernetes_token
# }

# Configure GCP infrastructure to setup the credentials, default project and location (zone and/or region) for your resources
provider "google" {
  project     = var.project_id
  region      = local.region
}

# Create GCS buckets
resource "google_storage_bucket" "bucket" {
  for_each = { for v in var.apps : v => v }
  name = "${var.openshift_namespace}-${each.value}"
  location = local.region
}

# Create GCP service accounts for each GCS bucket
resource "google_service_account" "account" {
  for_each     = { for v in var.apps : v => v }
  account_id   = "sa-${var.openshift_namespace}-${each.value}"
  display_name = "${var.openshift_namespace}-${each.value} Service Account"
  depends_on   = [google_storage_bucket.bucket]
}

# Assign Storage Admin role for the corresponding service accounts
resource "google_storage_bucket_iam_member" "admin" {
  for_each   = { for v in var.apps : v => v }
  bucket     = ${var.openshift_namespace}-each.value
  role       = "roles/storage.admin"
  member     = "serviceAccount:${google_service_account.account[each.key].email}"
  depends_on = [google_service_account.account]
}

# Create viewer GCP service accounts for each GCS bucket
resource "google_service_account" "viewer_account" {
  for_each     = { for v in var.apps : v => v }
  account_id   = "ro-${var.openshift_namespace}-${each.value}"
  display_name = "${var.openshift_namespace}-${each.value} Viewer Service Account"
  depends_on   = [google_storage_bucket.bucket]
}

resource "google_project_iam_custom_role" "viewer_role" {
  role_id     = "casStorageViewer"
  title       = "Storage Viewer Role"
  description = "A role for accounts allowed to list the contents of buckets and to access files in them"
  permissions = ["storage.buckets.get", "storage.buckets.list", "storage.objects.get", "storage.objects.list"]
}

# Assign Storage Viewer role for the corresponding service accounts
resource "google_storage_bucket_iam_member" "viewer" {
  for_each   = { for v in var.apps : v => v }
  bucket     = ${var.openshift_namespace}-each.value
  role       = google_project_iam_custom_role.viewer_role.id
  member     = "serviceAccount:${google_service_account.viewer_account[each.key].email}"
  depends_on = [google_service_account.viewer_account]
}

# Create keys for the service accounts
resource "google_service_account_key" "key" {
  for_each           = { for v in var.apps : v => v }
  service_account_id = ${var.openshift_namespace}-google_service_account.account[each.key].name
}

resource "kubernetes_secret" "secret_sa" {
  for_each = { for v in var.apps : v => v }
  metadata {
    name      = "gcp-${var.openshift_namespace}-${each.value}-service-account-key"
    namespace = ${var.openshift_namespace}
    labels = {
      created-by = "Terraform"
    }
  }

  data = {
    "bucket_name"      = ${var.openshift_namespace}-each.value
    "credentials.json" = base64decode(google_service_account_key.key[each.key].private_key)
    "viewer_credentials.json" = base64decode(google_service_account_key.viewer_key[each.key].private_key)
  }
}

resource "kubernetes_secret" "secret_tfc" {
  for_each = { for v in var.kubernetes_namespaces : v => v }
  metadata {
    name      = "terraform-cloud-workspace"
    namespace = each.key
    labels = {
      created-by = "Terraform"
    }
  }

  data = {
    "token"        = var.terraform_cloud_token
    "workspace_id" = var.terraform_cloud_workspace_id
  }
}
