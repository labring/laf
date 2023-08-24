{{- /*
Generated file. Do not change in-place! In order to change this file first read following link:
https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/hack
*/ -}}
{{- define "rules.names" }}
rules:
  - "alertmanager.rules"
  - "config-reloaders"
  - "etcd"
  - "general.rules"
  - "k8s.rules"
  - "kube-apiserver-availability.rules"
  - "kube-apiserver-burnrate.rules"
  - "kube-apiserver-histogram.rules"
  - "kube-apiserver-slos"
  - "kube-prometheus-general.rules"
  - "kube-prometheus-node-recording.rules"
  - "kube-scheduler.rules"
  - "kube-state-metrics"
  - "kubelet.rules"
  - "kubernetes-apps"
  - "kubernetes-resources"
  - "kubernetes-storage"
  - "kubernetes-system"
  - "kubernetes-system-kube-proxy"
  - "kubernetes-system-apiserver"
  - "kubernetes-system-kubelet"
  - "kubernetes-system-controller-manager"
  - "kubernetes-system-scheduler"
  - "node-exporter.rules"
  - "node-exporter"
  - "node.rules"
  - "node-network"
  - "prometheus-operator"
  - "prometheus"
{{- end }}