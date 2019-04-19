const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const os = require('os');

const homedir = os.homedir();
const {
  exists,
  readFile,
  writeFile,
  getStagingPath,
} = require('./fileUtils');

const stagingPath = `${getStagingPath(homedir)}`;

const packageTemplateObj = {
  dependencies: {},
};

module.exports = async function installLambdaDependencies(lambdaName) {
  const isNativeModule = (name) => {
    const nativeModules = Object.keys(process.binding('natives'));
    return !(nativeModules.indexOf(name) === -1);
  };

  const npmDependencies = async () => {
    const lambdaFile = await readFile(`${stagingPath}/${lambdaName}/${lambdaName}.js`, 'utf8');
    const dependencies = lambdaFile.split('exports')[0].match(/require\([^)]+\)/g) || [];
    return dependencies.map(pkg => pkg.slice(9, -2)).filter(pkg => !isNativeModule(pkg));
  };

  const dir = `${stagingPath}/${lambdaName}`;
  const packages = await npmDependencies();

  const installPackages = async () => {
    for (let i = 0; i < packages.length; i += 1) {
      await exec(`npm install ${packages[i]}`, { cwd: dir });
    }
  };

  if (packages.length) {
    const packageFilePath = `${dir}/package.json`;
    const packageFileExists = await exists(packageFilePath);

    if (!packageFileExists) {
      const templateJson = JSON.stringify(packageTemplateObj);
      await writeFile(packageFilePath, templateJson);
    }

    await installPackages();
  }
};
