import { RequestHandler } from 'express'
import { ClusterService } from '../helper/cluster.service'
import Config from '../config'
import * as prom from 'prom-client'
import { ContainerStatus, PodStatus } from '@kubernetes/client-node/dist/top'

const register = new prom.Registry()

const CONTAINER_CPU = new prom.Gauge({
  name: 'laf_runtime_cpu',
  help: 'the cpu of the runtime container',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const CONTAINER_MEMORY = new prom.Gauge({
  name: 'laf_runtime_memory',
  help: 'the memory of the runtime container',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const CONTAINER_CPU_limit = new prom.Gauge({
  name: 'laf_runtime_cpu_limit',
  help: 'the cpu of the runtime container limit',
  registers: [register],
  labelNames: ['containerName', 'podName', 'appid'],
})

const CONTAINER_MEMORY_limit = new prom.Gauge({
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
  CONTAINER_CPU.labels(containerName, podName, appid).set(
    Number(container.CPUUsage.CurrentUsage),
  )
  CONTAINER_MEMORY.labels(containerName, podName, appid).set(
    Number(container.MemoryUsage.CurrentUsage),
  )
  CONTAINER_CPU_limit.labels(containerName, podName, appid).set(
    Number(container.CPUUsage.LimitTotal),
  )
  CONTAINER_MEMORY_limit.labels(containerName, podName, appid).set(
    Number(container.MemoryUsage.LimitTotal),
  )
}

const getRuntimeMetrics: RequestHandler = async (req, res) => {
  const token = req.query.token
  console.log(token)

  // if (!token || Config.JWT_SECRET !== token) {
  //   return res.status(403).send('forbidden')
  // }

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
  res.set('Content-Type', 'text/plain; version=0.0.4')
  res.send(await register.metrics())
}

export default getRuntimeMetrics
