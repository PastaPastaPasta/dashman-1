const {
  createContainer: createAwilixContainer,
  InjectionMode,
  asFunction,
  asValue,
  asClass,
} = require('awilix');

const Docker = require('dockerode');

const path = require('path');
const os = require('os');

const ensureHomeDirFactory = require('./config/configFile/ensureHomeDirFactory');
const ConfigJsonFileRepository = require('./config/configFile/ConfigJsonFileRepository');
const createSystemConfigsFactory = require('./config/systemConfigs/createSystemConfigsFactory');
const resetSystemConfigFactory = require('./config/systemConfigs/resetSystemConfigFactory');
const migrateConfigOptions = require('./config/migrateConfigOptions');
const systemConfigs = require('./config/systemConfigs/systemConfigs');

const renderServiceTemplatesFactory = require('./templates/renderServiceTemplatesFactory');
const writeServiceConfigsFactory = require('./templates/writeServiceConfigsFactory');

const DockerCompose = require('./docker/DockerCompose');
const StartedContainers = require('./docker/StartedContainers');
const stopAllContainersFactory = require('./docker/stopAllContainersFactory');
const dockerPullFactory = require('./docker/dockerPullFactory');

const startCoreFactory = require('./core/startCoreFactory');
const createRpcClient = require('./core/createRpcClient');
const waitForCoreStart = require('./core/waitForCoreStart');
const waitForCoreSync = require('./core/waitForCoreSync');
const waitForBlocks = require('./core/waitForBlocks');
const waitForConfirmations = require('./core/waitForConfirmations');
const generateBlsKeys = require('./core/generateBlsKeys');

const createNewAddress = require('./core/wallet/createNewAddress');
const generateBlocks = require('./core/wallet/generateBlocks');
const generateToAddress = require('./core/wallet/generateToAddress');
const importPrivateKey = require('./core/wallet/importPrivateKey');
const getAddressBalance = require('./core/wallet/getAddressBalance');
const sendToAddress = require('./core/wallet/sendToAddress');
const registerMasternode = require('./core/wallet/registerMasternode');

const generateToAddressTaskFactory = require('./listr/tasks/wallet/generateToAddressTaskFactory');
const registerMasternodeTaskFactory = require('./listr/tasks/registerMasternodeTaskFactory');
const initTaskFactory = require('./listr/tasks/platform/initTaskFactory');
const startNodeTaskFactory = require('./listr/tasks/startNodeTaskFactory');

const createTenderdashRpcClient = require('./tenderdash/createTenderdashRpcClient');
const initializeTenderdashNodeFactory = require('./tenderdash/initializeTenderdashNodeFactory');

async function createDIContainer(options) {
  const container = createAwilixContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  /**
   * Config
   */
  const homeDirPath = options.DASHMAN_HOME_DIR ? options.DASHMAN_HOME_DIR : path.resolve(os.homedir(), '.dashman');

  container.register({
    homeDirPath: asValue(homeDirPath),
    configFilePath: asValue(path.join(homeDirPath, 'config.json')),
    ensureHomeDir: asFunction(ensureHomeDirFactory),
    configRepository: asClass(ConfigJsonFileRepository),
    systemConfigs: asValue(systemConfigs),
    createSystemConfigs: asFunction(createSystemConfigsFactory),
    resetSystemConfig: asFunction(resetSystemConfigFactory),
    migrateConfigOptions: asValue(migrateConfigOptions),
    // `configCollection` and `config` are registering on command init
  });

  /**
   * Templates
   */
  container.register({
    renderServiceTemplates: asFunction(renderServiceTemplatesFactory),
    writeServiceConfigs: asFunction(writeServiceConfigsFactory),
  });

  /**
   * Docker
   */
  container.register({
    docker: asFunction(() => (
      new Docker()
    )).singleton(),
    dockerCompose: asClass(DockerCompose),
    startedContainers: asFunction(() => (
      new StartedContainers()
    )).singleton(),
    stopAllContainers: asFunction(stopAllContainersFactory).singleton(),
    dockerPull: asFunction(dockerPullFactory).singleton(),
  });

  /**
   * Core
   */
  container.register({
    createRpcClient: asValue(createRpcClient),
    waitForCoreStart: asValue(waitForCoreStart),
    waitForCoreSync: asValue(waitForCoreSync),
    startCore: asFunction(startCoreFactory).singleton(),
    waitForBlocks: asValue(waitForBlocks),
    waitForConfirmations: asValue(waitForConfirmations),
    generateBlsKeys: asValue(generateBlsKeys),
  });

  /**
   * Core Wallet
   */
  container.register({
    createNewAddress: asValue(createNewAddress),
    generateBlocks: asValue(generateBlocks),
    generateToAddress: asValue(generateToAddress),
    importPrivateKey: asValue(importPrivateKey),
    getAddressBalance: asValue(getAddressBalance),
    sendToAddress: asValue(sendToAddress),
    registerMasternode: asValue(registerMasternode),
  });

  /**
   * Tenderdash
   */
  container.register({
    createTenderdashRpcClient: asValue(createTenderdashRpcClient),
    initializeTenderdashNode: asFunction(initializeTenderdashNodeFactory),
  });

  /**
   * Tasks
   */
  container.register({
    generateToAddressTask: asFunction(generateToAddressTaskFactory),
    registerMasternodeTask: asFunction(registerMasternodeTaskFactory),
    initTask: asFunction(initTaskFactory),
    startNodeTask: asFunction(startNodeTaskFactory),
  });

  return container;
}

module.exports = createDIContainer;
