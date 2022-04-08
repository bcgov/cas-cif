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
release: {{ .Release.Name }}
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
{{- if $artSa.spec }}
- name: artifacts-pull-{{ .Values.artifactoryServiceAccount }}-{{ $artSa.spec.current_plate }}
{{- else }}
{{/*
When running helm template, or using --dry-run, lookup returns an empty object
*/}}
- name: image-pull-secret-here
{{- end }}
{{- end }}

{{- define "cas-cif.appUserSecret" }}
{{- printf "%s-%s" (include "cas-cif.fullname" .) "postgres-pguser-cifapp" }}
{{- end }}

{{- define "cas-cif.appUserPgEnv" }}
- name: PGUSER
  valueFrom:
    secretKeyRef:
      key: user
      name: {{ template "cas-cif.appUserSecret" . }}
- name: PGPASSWORD
  valueFrom:
    secretKeyRef:
      key: password
      name: {{ template "cas-cif.appUserSecret" . }}
- name: PGDATABASE
  valueFrom:
    secretKeyRef:
      key: dbname
      name: {{ template "cas-cif.appUserSecret" . }}
- name: PGPORT
  valueFrom:
    secretKeyRef:
      key: pgbouncer-port
      name: {{ template "cas-cif.appUserSecret" . }}
- name: PGHOST
  valueFrom:
    secretKeyRef:
      key: pgbouncer-host
      name: {{ template "cas-cif.appUserSecret" . }}
{{- end }}


{{- define "cas-cif.dbSecret" }}
{{- printf "%s-%s" (include "cas-cif.fullname" .) "postgres-pguser-cif" }}
{{- end }}

{{- define "cas-cif.cifUserPgEnv" }}
- name: PGUSER
  valueFrom:
    secretKeyRef:
      key: user
      name: {{ template "cas-cif.dbSecret" . }}
- name: PGPASSWORD
  valueFrom:
    secretKeyRef:
      key: password
      name: {{ template "cas-cif.dbSecret" . }}
- name: PGDATABASE
  valueFrom:
    secretKeyRef:
      key: dbname
      name: {{ template "cas-cif.dbSecret" . }}
- name: PGPORT
  valueFrom:
    secretKeyRef:
      key: pgbouncer-port
      name: {{ template "cas-cif.dbSecret" . }}
- name: PGHOST
  valueFrom:
    secretKeyRef:
      key: pgbouncer-host
      name: {{ template "cas-cif.dbSecret" . }}
{{- end }}

{{- define "cas-cif.superUserSecret" }}
{{- printf "%s-%s" (include "cas-cif.fullname" .) "postgres-pguser-postgres" }}
{{- end }}

{{- define "cas-cif.superUserPgEnv" }}
- name: PGUSER
  valueFrom:
    secretKeyRef:
      key: user
      name: {{ template "cas-cif.superUserSecret" . }}
- name: PGPASSWORD
  valueFrom:
    secretKeyRef:
      key: password
      name: {{ template "cas-cif.superUserSecret" . }}
- name: PGDATABASE
  valueFrom:
    secretKeyRef:
      key: dbname
      name: {{ template "cas-cif.superUserSecret" . }}
- name: PGPORT
  valueFrom:
    secretKeyRef:
      key: port
      name: {{ template "cas-cif.superUserSecret" . }}
- name: PGHOST
  valueFrom:
    secretKeyRef:
{{/*
  superusers cannot connect via pgbouncer so we use host instead of pgbouncer-host here
*/}}
      key: host
      name: {{ template "cas-cif.superUserSecret" . }}
{{- end }}
