import { getHomeDir, writeYamlFile, ensureDirectory } from '../../utils/path';
import * as path from 'node:path'
import * as fs from 'node:fs'
import { getApplicationByAppid, listApplication } from '../../apis/application';
import * as Table from 'cli-table3';
import { ApplicationMetadata } from '../../templates/application';
import { APPLICATION_METADATA_FILE_NAME, FUNCTIONS_DIRECTORY_NAME } from '../../utils/constant'


export async function handleInitApplication(appid: string, options: { sync: boolean }) { 
  const applicationYamlPath = path.join(getHomeDir(), APPLICATION_METADATA_FILE_NAME)
  if (fs.existsSync(applicationYamlPath)) {
    console.log('The application configuration file already exists in the current directory, unable to initialize the application')
    return
  }
  const res = await getApplicationByAppid(appid);
  const applicationMetadata: ApplicationMetadata = {
    appid: res.data.appid,
    name: res.data.name,
    regionName: res.data.regionName,
    bundleName: res.data.bundleName,
  }
  writeYamlFile(applicationYamlPath, applicationMetadata);

  // init directory
  ensureDirectory(path.join(getHomeDir(), FUNCTIONS_DIRECTORY_NAME))


  // if sync is true, load remote data in local
  if (options.sync) {

  }

}

export async function handleListApplication() {
  const table = new Table({
    head: ['appid', 'name', 'region', 'bundle', 'runtime', 'phase'],
  })
  const res = await listApplication();
  for (let app of res.data) {
    table.push([app.appid, app.name, app.regionName, app.bundleName, app.runtimeName, app.phase])
  }
  console.log(table.toString());
}