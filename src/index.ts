export interface PolvoClientOptions {}

export class PolvoClient {
  constructor(address: string, options: PolvoClientOptions = {}) {

  }
}

export function createPolvoClient(address: string, options?: PolvoClientOptions) {
  return new PolvoClient(address, options)
}
