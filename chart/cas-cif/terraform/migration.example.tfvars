# Required paramaters
project_id          = "id_to_google_project_where_storage_buckets_are_held"
kubernetes_host     = "https://domain.address.of.kubernetes.host:9999"
kubernetes_token    = "sha256~auth_token_for_terraform_to_work_with_kubernetes"
openshift_namespace = "a1b2c3-dev"
apps                = ["subproject_names", "for_namespace_applications"]
