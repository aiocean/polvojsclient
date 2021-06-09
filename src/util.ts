
const scriptsCache: Record<string, Promise<HTMLScriptElement>|null> = {}

export const loadJS = async (src: string) => {
  if (scriptsCache[src]) {
    return scriptsCache
  }

  const dfd = deferred({ timeout: 30000, id: src })

  const { document: doc } = window

  const script = doc.createElement('script')

  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', src)

  script.addEventListener('error', err => {
    scriptsCache[src] = null
    // @ts-ignore
    dfd.reject(err)
  })

  script.addEventListener('load', () => {
    // @ts-ignore
    dfd.resolve(script)
  })

  doc.head.appendChild(script)

  scriptsCache[src] = dfd

  return dfd
}

type DeferredArgument = {
  id: string,
  timeout: number
}

const deferred = (args: DeferredArgument): Promise<HTMLScriptElement> => {
  args = args || {}

  const { timeout } = args

  let resolver: (value: HTMLScriptElement) => void
  let rejector: (reason?: ErrorEvent) => void
  const promise = new Promise<HTMLScriptElement>((resolve, reject) => {
    resolver = resolve
    rejector = reject
  })

  // @ts-ignore
  promise.resolve = (arg: HTMLScriptElement) => {
    clearTimeout(timeoutId)
    resolver(arg)
  }

  // @ts-ignore
  promise.reject = (arg: ErrorEvent) => {
    clearTimeout(timeoutId)
    rejector(arg)
  }

  const id = args.id || 'anonymous deferred'
  const timeoutId = setTimeout(
    () => rejector(new ErrorEvent(`timeout (${timeout}) reached on "${id}"`)),
    timeout
  )

  return promise
}
