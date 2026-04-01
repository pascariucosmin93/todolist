{{- define "todolist.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "todolist.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "todolist.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "todolist.namespace" -}}
{{- default .Release.Namespace .Values.namespaceOverride -}}
{{- end -}}

{{- define "todolist.labels" -}}
app.kubernetes.io/name: {{ include "todolist.name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "todolist.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todolist.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "todolist.backendFullname" -}}
{{- printf "%s-backend" (include "todolist.fullname" .) -}}
{{- end -}}

{{- define "todolist.frontendFullname" -}}
{{- printf "%s-frontend" (include "todolist.fullname" .) -}}
{{- end -}}

{{- define "todolist.postgresFullname" -}}
{{- printf "%s-postgres" (include "todolist.fullname" .) -}}
{{- end -}}

{{- define "todolist.databaseHost" -}}
{{- if .Values.externalPostgres.enabled -}}
{{- .Values.externalPostgres.host -}}
{{- else -}}
{{- include "todolist.postgresFullname" . -}}
{{- end -}}
{{- end -}}

{{- define "todolist.databasePort" -}}
{{- if .Values.externalPostgres.enabled -}}
{{- .Values.externalPostgres.port | toString -}}
{{- else -}}
{{- .Values.postgres.service.port | toString -}}
{{- end -}}
{{- end -}}

{{- define "todolist.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "todolist.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}
