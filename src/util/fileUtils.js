const fs = require('fs');
const { promisify } = require('util');
const rimraf = require('rimraf');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const copyFile = promisify(fs.copyFile);
const changePermissions = promisify(fs.chmod);

const promisifiedRimraf = dir => new Promise(res => rimraf(dir, res));

const exists = async path => (
  new Promise((res) => {
    fs.stat(path, (err) => {
      if (err === null) res(true);
      res(false);
    });
  })
);

const createDirectory = async (name, path) => {
  const dir = `${path}/${name}`;

  const dirExists = await exists(dir);
  if (!dirExists) {
    await mkdir(dir);
  }
};

const createJSONFile = async (fileName, path, json) => {
  const configStr = JSON.stringify(json, null, 2);
  await writeFile(`${path}/${fileName}.json`, configStr);
};

const getNamiPath = homedir => (`${homedir}/.nami`);

const getStagingPath = homedir => (`${getNamiPath(homedir)}/staging`);

const readConfig = async (homedir) => {
  const namiPath = getNamiPath(homedir);
  const config = await readFile(`${namiPath}/config.json`);
  return JSON.parse(config);
};

const readResources = async (homedir) => {
  const namiPath = getNamiPath(homedir);
  const resourceInfo = await readFile(`${namiPath}/resources.json`);
  return JSON.parse(resourceInfo);
};

const writeResources = async (homedir, resource, idString) => {
  const namiPath = getNamiPath(homedir);
  let resourcesJSON = await readFile(`${namiPath}/resources.json`);

  resourcesJSON = JSON.parse(resourcesJSON);
  resourcesJSON[resource] = idString;
  resourcesJSON = JSON.stringify(resourcesJSON, null, 2);

  await writeFile(`${namiPath}/resources.json`, resourcesJSON);
};

const writeTemplateToStage = async (lambdaName, template, homedir) => {
  await mkdir(`${getNamiPath(homedir)}/staging/${lambdaName}`);
  await writeFile(`${getNamiPath(homedir)}/staging/${lambdaName}/${lambdaName}.js`, template);
};

const writeTemplateLocally = async (lambdaName, template) => {
  await mkdir(`${process.cwd()}/${lambdaName}`);
  await writeFile(`${process.cwd()}/${lambdaName}/${lambdaName}.js`, template);
};

const createKeyPairFile = async (homedir, namiKeyPair) => {
  const namiPath = getNamiPath(homedir);
  await writeFile(`${namiPath}/${namiKeyPair.KeyName}.pem`, namiKeyPair.KeyMaterial);
  await writeFile(`${process.cwd()}/${namiKeyPair.KeyName}.pem`, namiKeyPair.KeyMaterial);
};

const changePermissionsOnKeyPairFile = async (homedir, namiKeyPair) => {
  const namiPath = getNamiPath(homedir);
  await changePermissions(`${namiPath}/${namiKeyPair.KeyName}.pem`, 0o400);
  await changePermissions(`${process.cwd()}/${namiKeyPair.KeyName}.pem`, 0o400);
};

const copyEC2SetupScript = async (namiPath, sourceDir) => {
  const sourceFile = `${sourceDir}/docker_mongo_setup.sh`;
  const destinationFile = `${namiPath}/docker_mongo_setup.sh`;

  await copyFile(sourceFile, destinationFile);
};

module.exports = {
  readConfig,
  createDirectory,
  createJSONFile,
  getNamiPath,
  exists,
  createKeyPairFile,
  copyFile,
  readFile,
  writeFile,
  mkdir,
  getStagingPath,
  copyEC2SetupScript,
  readResources,
  writeResources,
  changePermissionsOnKeyPairFile,
  writeTemplateToStage,
  writeTemplateLocally,
  promisifiedRimraf,
};
