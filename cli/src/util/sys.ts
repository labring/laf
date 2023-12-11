import { ProjectSchema } from '../schema/project'

export function getAppPath(): string {
  return process.cwd()
}

export function getBaseDir(): string {
  const projectSchema = ProjectSchema.read()
  return projectSchema?.spec?.baseDir || './'
}
