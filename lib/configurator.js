const Promise = require('bluebird')
const debug = require('debug')('meshblu-connector-configurator-no-config:configurator')
const bindAll = require('lodash/fp/bindAll')
const path = require('path')
const glob = Promise.promisify(require('glob'))

const { MeshbluConnectorDaemon } = require('meshblu-connector-daemon')

class MeshbluConnectorConfigurator {
  constructor({ connectorHome, pm2Home }) {
    bindAll(Object.getOwnPropertyNames(MeshbluConnectorConfigurator.prototype), this)

    if (!connectorHome) throw new Error('Missing required parameter: connectorHome')
    if (!pm2Home) throw new Error('Missing required parameter: pm2Home')

    this.connectorsPath = path.resolve(path.join(connectorHome, 'connectors-no-config'))
    this.pm2Home = pm2Home
  }

  configurate() {
    return this.getConnectors().each(this.daemonize)
  }

  daemonize(type) {
    debug(`Daemonizing ${type}`)
    const daemon = new MeshbluConnectorDaemon({ type, connectorsPath: this.connectorsPath, pm2Home: this.pm2Home })
    return daemon.start()
  }

  getConnectors() {
    const globPath = path.join(this.connectorsPath, '*')
    debug('getConnectors', globPath)
    return glob(globPath).map(connectorPath => path.basename(connectorPath))
  }
}

module.exports.MeshbluConnectorConfigurator = MeshbluConnectorConfigurator
