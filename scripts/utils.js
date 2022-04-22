const assert = require('assert')
const child_process = require('child_process')

const images = {
  'system-server': 'lafyun/system-server',
  'app-service': 'lafyun/app-service',
  'gateway': 'lafyun/gateway'
}

function getPackageVersion(packagePath) {
  const json = require(`${packagePath}/package.json`)

  assert.ok(json)
  return json?.version
}

/**
 * build docker image
 * @param {string} filepath path of Dockerfile
 */
 function buildImage(filepath, tag, latest_tag) {
  const sub = child_process.spawn('docker', ['build', '-t', tag, filepath])

  sub.stdout.on('data', (data) => {
    console.log(`${tag} stdout: ${data}`);
  });
  
  sub.stderr.on('data', (data) => {
    console.error(`${tag} output: ${data}`);
  });
  
  sub.on('close', (code) => {
    console.log(`${tag} child process exited with code ${code}`);
  });
 }


/**
 * Docker tag
 * @param {string} sourceImage 
 * @param {string} targetImage 
 */
 function tagImage(sourceImage, targetImage) {
  const sub = child_process.spawn('docker', ['tag', sourceImage, targetImage])

  sub.stdout.on('data', (data) => {
    console.log(`${targetImage} stdout: ${data}`);
  });
  
  sub.stderr.on('data', (data) => {
    console.error(`${targetImage} output: ${data}`);
  });
  
  sub.on('close', (code) => {
    console.log(`${targetImage} child process exited with code ${code}`);
  });
 }


/**
 * push docker image
 * @param {string} image
 */
 function pushImage(tag) {
  const sub = child_process.spawn('docker', ['push', tag])

  sub.stdout.on('data', (data) => {
    console.log(`${tag} stdout: ${data}`);
  });
  
  sub.stderr.on('data', (data) => {
    console.error(`${tag} output: ${data}`);
  });
  
  sub.on('close', (code) => {
    console.log(`${tag} child process exited with code ${code}`);
  });
}


module.exports = {
  getPackageVersion,
  buildImage,
  pushImage,
  tagImage,
  images
}