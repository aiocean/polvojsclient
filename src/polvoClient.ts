import {
  PolvoServicePromiseClient
} from '@aiocean/polvojs/aiocean/polvo/v1/polvo_service_grpc_web_pb'

export const polvoServiceClient = new PolvoServicePromiseClient('https://polvo-endpoint.aiocean.services')
