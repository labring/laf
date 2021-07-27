

const { LocalFileStorage } = require('../../dist/lib/storage/local_file_storage')
const path = require('path')
const assert = require('assert')

const root = path.join(process.cwd(), "upload")

describe("LocalFileStorage class", () => {

  it("constructor", async () => {
    const storage = new LocalFileStorage(process.cwd())
    assert.strictEqual(storage.rootPath, process.cwd())
  })

  it('saveFile', async () => {
    const storage = new LocalFileStorage(root)

    const r = await storage.saveFile('tsconfig.json')
    console.log(r)

  })
})