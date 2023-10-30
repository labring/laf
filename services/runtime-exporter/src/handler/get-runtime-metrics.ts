import { RequestHandler } from 'express'
import { ClusterService } from '../helper/cluster.service'
import Config from '../config'
import * as prom from 'prom-client'
import { ContainerStatus, PodStatus } from '@kubernetes/client-node/dist/top'

const register = new prom.Registry()

const RUNTIME_CPU = new prom.Gauge({
  name: 'laf_runtime_cpu',
  help: 'the cpu of the runtime container',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const RUNTIME_MEMORY = new prom.Gauge({
  name: 'laf_runtime_memory',
  help: 'the memory of the runtime container',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const RUNTIME_CPU_LIMIT = new prom.Gauge({
  name: 'laf_runtime_cpu_limit',
  help: 'the cpu of the runtime container limit',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const RUNTIME_MEMORY_LIMIT = new prom.Gauge({
  name: 'laf_runtime_memory_limit',
  help: 'the memory of the runtime container limit',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

function updateMetrics(
  container: ContainerStatus,
  containerName: string,
  podName: string,
  appid: string,
) {
  RUNTIME_CPU.labels(containerName, podName, appid).set(
    Number(container.CPUUsage.CurrentUsage),
  )
  RUNTIME_MEMORY.labels(containerName, podName, appid).set(
    Number(container.MemoryUsage.CurrentUsage),
  )
  RUNTIME_CPU_LIMIT.labels(containerName, podName, appid).set(
    Number(container.CPUUsage.LimitTotal),
  )
  RUNTIME_MEMORY_LIMIT.labels(containerName, podName, appid).set(
    Number(container.MemoryUsage.LimitTotal),
  )
}

const getRuntimeMetrics: RequestHandler = async (req, res) => {
  const token = req.query.token

  if (!token || Config.API_SECRET !== token) {
    return res.status(403).send('forbidden')
  }

  const LABEL_KEY_APP_ID = 'laf.dev/appid'

  const pods: PodStatus[] = await ClusterService.getPodForAllNameSpaces()

  for (const pod of pods) {
    const labels = pod.Pod.metadata.labels
    const appid = labels ? labels[LABEL_KEY_APP_ID] : undefined
    if (appid) {
      for (const container of pod.Containers) {
        const containerName = container.Container
        const podName = pod.Pod.metadata.name
        updateMetrics(container, containerName, podName, appid)
      }
    }
  }
  res.set('Content-Type', 'text/plain;')
  res.send(await register.metrics())
}

export default getRuntimeMetrics
