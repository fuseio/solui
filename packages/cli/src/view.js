import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { assertSpecValid } from '@solui/processor'

import { FRONTEND_FOLDER, BUILD_FOLDER, createConfig } from './webpack.config'

class Viewer {
  constructor ({ port, artifacts, spec, verbose }) {
    this.verbose = verbose
    this.port = port
    this.artifacts = artifacts
    this.spec = spec
  }

  async start () {
    this.virtualModules = new VirtualModulesPlugin({
      [ this._getArtifactsModulePath() ]: JSON.stringify(this.artifacts),
      [ this._getSpecModulePath() ]: JSON.stringify(this.spec),
    })

    const config = createConfig({ virtualModules: this.virtualModules })

    const webpackCompiler = webpack(config)

    const compilationPromise = new Promise((resolve, reject) => {
      webpackCompiler.hooks.done.tap('done', stats => {
        try {
          if (stats.hasErrors()) {
            reject(new Error(stats.toString({ chunks: false, colors: true })))
          } else {
            resolve()
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    const host = '127.0.0.1'

    const webpackDevServerOptions = {
      contentBase: BUILD_FOLDER,
      compress: true,
      hot: true,
      host,
      stats: this.verbose ? 'normal' : 'errors-only',
    }

    WebpackDevServer.addDevServerEntrypoints(config, webpackDevServerOptions)

    this.server = new WebpackDevServer(webpackCompiler, webpackDevServerOptions)

    await new Promise((resolve, reject) => {
      this.server.listen(this.port, host, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

    await compilationPromise
  }

  updateSpec (newSpec) {
    this.spec = newSpec
    this.virtualModules.writeModule(this._getSpecModulePath(), JSON.stringify(this.spec))
  }

  updateArtifacts (newArtifacts) {
    this.artifacts = newArtifacts
    this.virtualModules.writeModule(this._getArtifactsModulePath(), JSON.stringify(this.artifacts))
  }

  getLocalEndpoint () {
    return `http://localhost:${this.port}`
  }

  getEndpoint () {
    return `http://0.0.0.0:${this.port}`
  }

  _getArtifactsModulePath () {
    return path.join(FRONTEND_FOLDER, 'artifacts.json')
  }

  _getSpecModulePath() {
    return path.join(FRONTEND_FOLDER, 'spec.json')
  }
}

export const startViewer = async cfg => {
  await assertSpecValid(cfg)

  const g = new Viewer(cfg)
  await g.start()

  return g
}
