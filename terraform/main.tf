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
