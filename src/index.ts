import {loadJS} from './util'
import {
  GetVersionRequest
} from "@aiocean/polvojs/aiocean/polvo/v1/polvo_service_pb"
import {PolvoServicePromiseClient} from "@aiocean/polvojs/aiocean/polvo/v1/polvo_service_grpc_web_pb"


export class PolvoClient {
  private polvoServiceClient: PolvoServicePromiseClient;

  constructor(address: string) {
    this.polvoServiceClient = new PolvoServicePromiseClient(address)
  }

  async getPackageEndpoint(packageName: string, version: string): Promise<string> {
    let request: GetVersionRequest = new GetVersionRequest()
    request.setOrn('packages/'+ packageName + '/versions/' + version)

    let response = await this.polvoServiceClient.getVersion(request)
    return response.getVersion()?.getManifestUrl() || ''
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
    if (matches === null || matches.length !== 4) {
      return Promise.reject('component path is invalid')
    }

    const [,packageName, componentName, versionName] = matches

    if (!Object.prototype.hasOwnProperty.call(window, packageName)) {
      const endpoint = await this.getPackageEndpoint(packageName, versionName)
      await this.loadPackage(packageName, endpoint)
    }

    // @ts-ignore
    const container: RemoteContainer = window[packageName]
    const factory = await container.get('./' + componentName)
    return factory()
  }
}

export function createPolvoClient(address: string) {
  return new PolvoClient(address)
}
