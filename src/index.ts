import {loadJS} from './util'
import {polvoServiceClient} from "./polvoClient";
import {GetWeightedVersionRequest} from "@aiocean/polvojs/aiocean/polvo/v1/polvo_service_pb";

export interface PolvoClientOptions {}

export class PolvoClient {
  constructor(address: string, options: PolvoClientOptions = {}) {

  }

  async getPackageEndpoint(packageName: string): Promise<string> {
    let request: GetWeightedVersionRequest = new GetWeightedVersionRequest()
    request.setPackageOrn('erasdf')
    let response = await polvoServiceClient.getWeightedVersion(request)
    console.log(response.getVersion()?.getEntryPointUrl())
    return ''
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
    const [packageName, componentName] = componentPath.split('/')

    if (!Object.prototype.hasOwnProperty.call(window, packageName)) {
      await this.loadPackage(packageName, '')
    }

    // @ts-ignore
    const container: RemoteContainer = window[packageName]
    const factory = await container.get('./' + componentName)
    return factory()
  }
}

export function createPolvoClient(address: string, options?: PolvoClientOptions) {
  return new PolvoClient(address, options)
}
