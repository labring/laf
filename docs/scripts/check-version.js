const { engines } = require("../package.json");
const semver = require("semver");
const node_version = engines.node;

// Lock lockFileVersion to version 2 And resolve import error when import xxx from 'node:xxx'
if (!semver.satisfies(process.version, node_version)) {
  console.log(
    `Required node version ${node_version} not satisfied with current version ${process.version}.`
  );
  process.exit(1);
}
