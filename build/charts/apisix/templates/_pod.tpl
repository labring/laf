{{- define "apisix.podTemplate" -}}
metadata:
  annotations:
    checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    {{- if .Values.apisix.podAnnotations }}
    {{- range $key, $value := $.Values.apisix.podAnnotations }}
    {{ $key }}: {{ $value | quote }}
    {{- end }}
    {{- end }}
  labels:
    {{- include "apisix.selectorLabels" . | nindent 4 }}
spec:
  {{- with .Values.global.imagePullSecrets }}
  imagePullSecrets:
    {{- range $.Values.global.imagePullSecrets }}
    - name: {{ . }}
    {{- end }}
  {{- end }}
  serviceAccountName: {{ include "apisix.serviceAccountName" . }}
  {{- with .Values.apisix.podSecurityContext }}
  securityContext: 
    {{- . | toYaml | nindent 4 }}
  {{- end }}
  {{- with .Values.apisix.priorityClassName }}
  priorityClassName: {{ . }}
  {{- end }}
  containers:
    - name: {{ .Chart.Name }}
      {{- with .Values.apisix.securityContext }}
      securityContext:
        {{- . | toYaml | nindent 8 }}
      {{- end }}
      image: "{{ .Values.apisix.image.repository }}:{{ default .Chart.AppVersion .Values.apisix.image.tag }}"
      imagePullPolicy: {{ .Values.apisix.image.pullPolicy }}
      env:
      {{- if .Values.apisix.timezone }}
        - name: TZ
          value: {{ .Values.apisix.timezone }}
      {{- end }}
      {{- if .Values.apisix.extraEnvVars }}
      {{- include "apisix.tplvalues.render" (dict "value" .Values.apisix.extraEnvVars "context" $) | nindent 8 }}
      {{- end }}
      ports:
        - name: http
          containerPort: {{ .Values.gateway.http.containerPort }}
          protocol: TCP
        - name: tls
          containerPort: {{ .Values.gateway.tls.containerPort }}
          protocol: TCP
        {{- if .Values.admin.enabled }}
        - name: admin
          containerPort: {{ .Values.admin.port }}
          protocol: TCP
        {{- end }}
        {{- if .Values.serviceMonitor.enabled }}
        - name: prometheus
          containerPort: {{ .Values.serviceMonitor.containerPort }}
          protocol: TCP
        {{- end }}
        {{- if and .Values.gateway.stream.enabled (or (gt (len .Values.gateway.stream.tcp) 0) (gt (len .Values.gateway.stream.udp) 0)) }}
        {{- with .Values.gateway.stream }}
        {{- if (gt (len .tcp) 0) }}
        {{- range $index, $port := .tcp }}
        - name: proxy-tcp-{{ $index | toString }}
          containerPort: {{ $port }}
          protocol: TCP
        {{- end }}
        {{- end }}
        {{- if (gt (len .udp) 0) }}
        {{- range $index, $port := .udp }}
        - name: proxy-udp-{{ $index | toString }}
          containerPort: {{ $port }}
          protocol: UDP
        {{- end }}
        {{- end }}
        {{- end }}
        {{- end }}
      readinessProbe:
        failureThreshold: 6
        initialDelaySeconds: 10
        periodSeconds: 10
        successThreshold: 1
        tcpSocket:
          port: {{ .Values.gateway.http.containerPort }}
        timeoutSeconds: 1
      lifecycle:
        preStop:
          exec:
            command:
              - /bin/sh
              - -c
              - "sleep 30"
      volumeMounts:
      {{- if .Values.apisix.setIDFromPodUID }}
        - mountPath: /usr/local/apisix/conf/apisix.uid
          name: id
          subPath: apisix.uid
      {{- end }}
        - mountPath: /usr/local/apisix/conf/config.yaml
          name: apisix-config
          subPath: config.yaml
      {{- if and .Values.gateway.tls.enabled .Values.gateway.tls.existingCASecret }}
        - mountPath: /usr/local/apisix/conf/ssl/{{ .Values.gateway.tls.certCAFilename }}
          name: ssl
          subPath: {{ .Values.gateway.tls.certCAFilename }}
      {{- end }}
      {{- if .Values.etcd.auth.tls.enabled }}
        - mountPath: /etcd-ssl
          name: etcd-ssl
      {{- end }}
      {{- if .Values.customPlugins.enabled }}
      {{- range $plugin := .Values.customPlugins.plugins }}
      {{- range $mount := $plugin.configMap.mounts }}
        - mountPath: {{ $mount.path }}
          name: plugin-{{ $plugin.configMap.name }}
          subPath: {{ $mount.key }}
      {{- end }}
      {{- end }}
      {{- end }}
      {{- if .Values.apisix.luaModuleHook.enabled }}
      {{- range $mount := .Values.apisix.luaModuleHook.configMapRef.mounts }}
        - mountPath: {{ $mount.path }}
          name: lua-module-hook
          subPath: {{ $mount.key }}
      {{- end }}
      {{- end }}
      {{- if .Values.extraVolumeMounts }}
      {{- toYaml .Values.extraVolumeMounts | nindent 8 }}
      {{- end }}
      resources:
      {{- toYaml .Values.apisix.resources | nindent 8 }}
  {{- if .Values.apisix.hostNetwork }}
  hostNetwork: true
  dnsPolicy: ClusterFirstWithHostNet
  {{- end }}
  hostNetwork: {{ .Values.apisix.hostNetwork }}
  initContainers:
    {{- if .Values.etcd.enabled }}
    - name: wait-etcd
      image: {{ .Values.initContainer.image }}:{{ .Values.initContainer.tag }}
      {{- if .Values.etcd.fullnameOverride }}
      command: ['sh', '-c', "until nc -z {{ .Values.etcd.fullnameOverride }} {{ .Values.etcd.service.port }}; do echo waiting for etcd `date`; sleep 2; done;"]
      {{ else }}
      command: ['sh', '-c', "until nc -z {{ .Release.Name }}-etcd.{{ .Release.Namespace }}.svc.{{ .Values.etcd.clusterDomain }} {{ .Values.etcd.service.port }}; do echo waiting for etcd `date`; sleep 2; done;"]
      {{- end }}
    {{- end }}
    {{- if .Values.extraInitContainers }}
    {{- toYaml .Values.extraInitContainers | nindent 4 }}
    {{- end }}
  volumes:
    - configMap:
        name: {{ include "apisix.fullname" . }}
      name: apisix-config
    {{- if and .Values.gateway.tls.enabled .Values.gateway.tls.existingCASecret }}
    - secret:
        secretName: {{ .Values.gateway.tls.existingCASecret | quote }}
      name: ssl
    {{- end }}
    {{- if .Values.etcd.auth.tls.enabled }}
    - secret:
        secretName: {{ .Values.etcd.auth.tls.existingSecret | quote }}
      name: etcd-ssl
    {{- end }}
    {{- if .Values.apisix.setIDFromPodUID }}
    - downwardAPI:
        items:
          - path: "apisix.uid"
            fieldRef:
              fieldPath: metadata.uid
      name: id
    {{- end }}
    {{- if .Values.customPlugins.enabled }}
    {{- range $plugin := .Values.customPlugins.plugins }}
    - name: plugin-{{ $plugin.configMap.name }}
      configMap:
        name: {{ $plugin.configMap.name }}
    {{- end }}
    {{- end }}
    {{- if .Values.apisix.luaModuleHook.enabled }}
    - name: lua-module-hook
      configMap:
        name: {{ .Values.apisix.luaModuleHook.configMapRef.name }}
    {{- end }}
    {{- if .Values.extraVolumes }}
    {{- toYaml .Values.extraVolumes | nindent 4 }}
    {{- end }}
  {{- with .Values.apisix.nodeSelector }}
  nodeSelector:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.apisix.affinity }}
  affinity:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.apisix.tolerations }}
  tolerations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end -}}
