/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testSequencer: './jest-sequencer.js',
  maxWorkers: 1,
  verbose: true,
}
