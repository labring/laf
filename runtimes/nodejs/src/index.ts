import { start } from 'core-runtime'
import * as path from 'path'


const defaultDependencyPath = path.join(path.dirname(__dirname), '/')

start({
  dependencyPath: defaultDependencyPath
})
