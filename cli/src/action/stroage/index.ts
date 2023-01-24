import { bucketControllerCreate, bucketControllerFindAll, bucketControllerRemove, bucketControllerUpdate } from "../../api/v1/storage";
import { readApplicationConfig } from "../../config/application";
import * as Table from 'cli-table3';
import * as prompts from 'prompts';
import { CreateBucketDto, UpdateBucketDto } from "../../api/v1/data-contracts";
import { getEmoji } from "../../util/print";


export async function list() {
  const appConfig = readApplicationConfig()
  const buckets = await bucketControllerFindAll(appConfig.appid)
  const table = new Table({
    head: ['name', 'shortName', 'policy', 'updatedAt'],
  })
  for (let item of buckets) {
    table.push([item.name, item.shortName, item.policy, item.updatedAt])
  }
  console.log(table.toString());
}


const policySelect = {
  type: 'select',
  name: 'policy',
  message: 'please select policy',
  choices: [
    { title: 'private', value: 'private' },
    { title: 'readonly', value: 'readonly' },
    { title: 'readwrite', value: 'readwrite' }
  ],
};


export async function create(bucketName, options) {
  if (options) {

  }
  const appConfig = readApplicationConfig()
  console.log('please select bucket storage policy')
  const policyResult = await prompts(policySelect);
  const bucketDto: CreateBucketDto = {
    shortName: bucketName,
    policy: policyResult.policy,
  }
  await bucketControllerCreate(appConfig.appid, bucketDto)
  console.log(`${getEmoji('✅')} bucket ${bucketName} created`)
}

export async function update(bucketName, options) {
  if (options) { }
  const appConfig = readApplicationConfig()
  console.log('please select the storage policy to be replaced')
  const policyResult = await prompts(policySelect);
  const bucketDto: UpdateBucketDto = {
    policy: policyResult.policy,
  }
  await bucketControllerUpdate(appConfig.appid, bucketName, bucketDto)
  console.log(`${getEmoji('✅')} bucket ${bucketName} updated`)
}

export async function del(bucketName, options) {
  if (options) {

  }
  const appConfig = readApplicationConfig()
  await bucketControllerRemove(appConfig.appid, bucketName)
  console.log(`${getEmoji('✅')} bucket ${bucketName} deleted`)
}