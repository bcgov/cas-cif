# Since variables could be overridden via environment variables, use local values to define immutable values
locals {
  # The GCP region to create things in. https://cloud.google.com/compute/docs/regions-zones"
  region = "northamerica-northeast1" # Montreal
}

variable "project_id" {
  description = "The ID of the GCP project"
}

variable "kubernetes_host" {
  description = "The hostname of the OCP cluster"
}

variable "kubernetes_token" {
  description = "The authentication token of the OCP cluster"
}

# # TODO: Remove legacy (from cas-shelf) vars
# variable "namespace_apps" {
#   type        = list(string)
#   description = "The list of namespace and app name pairs of the OCP project"
# }

variable "apps" {
  type = list(string)
  description = "The list of app names for the OCP project in a namespace"
}

variable "openshift_namespace" {
  type = string
  description = "The OCP project namespace"
}

variable "kubernetes_namespaces" {
  type        = list(string)
  description = "The OCP namespaces to run jobs"
}

variable "terraform_cloud_token" {
  description = "The user/team token of Terraform Cloud"
}

variable "terraform_cloud_workspace_id" {
  description = "The workspace id of Terraform Cloud"
}
