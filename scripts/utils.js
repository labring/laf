const assert = require('assert')
const child_process = require('child_process')

const images = {
  system_server: 'lafyun/system-server',
  app_service: 'lafyun/app-service',
  system_client: 'lafyun/system-client'
}

function getSystemServerVersion() {
  const json = require('../packages/system-server/package.json')

  assert.ok(json)
  return json?.version
}

function getAppServiceVersion() {
  const json = require('../packages/app-service/package.json')

  assert.ok(json)
  return json?.version
}

function getSystemClientVersion() {
  const json = require('../packages/system-client/package.json')

  assert.ok(json)
  return json?.version
}


/**
 * build docker image
 * @param {string} filepath path of Dockerfile
 */
 function buildImage(filepath, tag, latest_tag) {
  const sub = child_process.spawn('docker', ['build', '-t', tag, '-t', latest_tag, filepath])

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
 * push docker image
 * @param {string} filepath path of Dockerfile
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
  getSystemServerVersion,
  getAppServiceVersion,
  getSystemClientVersion,
  buildImage,
  pushImage,
  images
}