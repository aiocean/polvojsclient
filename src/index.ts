import {loadJS} from './util'

export class PolvoClient {
  private readonly polvoProxyAddress: string;

  constructor(address: string) {
    this.polvoProxyAddress = address
  }

  async loadPackage (packageName: string, endpointUrl: string): Promise<HTMLScriptElement> {

    await loadJS(endpointUrl)

    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // @ts-ignore
    await __webpack_init_sharing__('default')
    // @ts-ignore
    const container = window[packageName] // or get the container somewhere else

    // @ts-ignore
    if (!container || !container.init) { throw new Error(`Cannot load external remote: ${packageName} from url: ${endpointUrl}`) }

    // Initialize the container, it may provide shared modules
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default)

    return container
  }

  async useComponent <T>(componentPath: string): Promise<T> {
    const regex = /^([^\/]+)\/([^\/]+)@([^\/]+)/gm
    const matches = regex.exec(componentPath)
    if (matches === null || matches.length < 3) {
      return Promise.reject('component path is invalid')
    }

    let [,packageName, componentName, versionName] = matches

    if (versionName === '') {
      versionName = 'any'
    }

    if (!Object.prototype.hasOwnProperty.call(window, packageName)) {
      const endpoint = this.polvoProxyAddress + '/packages/' + packageName + '/versions/' + versionName
      await this.loadPackage(packageName, endpoint)
    }

    // @ts-ignore
    const container: RemoteContainer = window[packageName]
    const factory = await container.get('./' + componentName)
    return factory()
  }
}
