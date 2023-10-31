import { RequestHandler } from 'express'
import { ClusterService, Metric } from '../helper/cluster.service'
import Config from '../config'
import * as prom from 'prom-client'

const register = new prom.Registry()

const RUNTIME_CPU = new prom.Gauge({
  name: 'laf_runtime_cpu',
  help: 'the cpu of the runtime',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const RUNTIME_MEMORY = new prom.Gauge({
  name: 'laf_runtime_memory',
  help: 'the memory of the runtime',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const RUNTIME_CPU_LIMIT = new prom.Gauge({
  name: 'laf_runtime_cpu_limit',
  help: 'the cpu of the runtime limit',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const RUNTIME_MEMORY_LIMIT = new prom.Gauge({
  name: 'laf_runtime_memory_limit',
  help: 'the memory of the runtime limit',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

function updateMetrics(metric: Metric) {
  RUNTIME_CPU.labels(metric.containerName, metric.podName, metric.appid).set(
    metric.cpu,
  )
  RUNTIME_MEMORY.labels(metric.containerName, metric.podName, metric.appid).set(
    metric.memory,
  )
}

function updateLimitMetrics(metric: Metric) {
  RUNTIME_CPU_LIMIT.labels(
    metric.containerName,
    metric.podName,
    metric.appid,
  ).set(metric.cpu)
  RUNTIME_MEMORY_LIMIT.labels(
    metric.containerName,
    metric.podName,
    metric.appid,
  ).set(metric.memory)
}

const getRuntimeMetrics: RequestHandler = async (req, res) => {
  const token = req.query.token

  if (!token || Config.API_SECRET !== token) {
    return res.status(403).send('forbidden')
  }

  const runtimeMetrics =
    await ClusterService.getRuntimePodMetricsForAllNamespaces()

  for (const metric of runtimeMetrics) {
    updateMetrics(metric)
  }

  const runtimeLimitMetrics =
    await ClusterService.getRuntimePodsLimitForAllNamespaces()

  for (const metric of runtimeLimitMetrics) {
    updateLimitMetrics(metric)
  }

  res.set('Content-Type', 'text/plain')
  res.send(await register.metrics())
}

export default getRuntimeMetrics
