{{/*
Expand the name of the chart.
*/}}
{{- define "cas-cif.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "cas-cif.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cas-cif.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cas-cif.labels" -}}
helm.sh/chart: {{ include "cas-cif.chart" . }}
{{ include "cas-cif.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cas-cif.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cas-cif.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "cas-cif.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "cas-cif.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Gets the prefix of the namespace. (09269b, ... )
*/}}
{{- define "cas-cif.namespacePrefix" }}
{{- (split "-" .Release.Namespace)._0 | trim -}}
{{- end }}

{{/*
Gets the suffix of the namespace. (-dev, -tools, ... )
*/}}
{{- define "cas-cif.namespaceSuffix" }}
{{- (split "-" .Release.Namespace)._1 | trim -}}
{{- end }}


{{- define "cas-cif.imagePullSecrets" }}
{{- $artSa := (lookup "artifactory.devops.gov.bc.ca/v1alpha1" "ArtifactoryServiceAccount" .Release.Namespace .Values.artifactoryServiceAccount) }}
{{- $artPullSecretSuffix := $artSa.spec.current_plate }}
- name: artifacts-pull-{{ .Values.artifactoryServiceAccount }}-{{ $artPullSecretSuffix }}
{{- end }}
