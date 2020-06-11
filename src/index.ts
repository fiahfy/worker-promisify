type InnerWorker = Worker & {
  resolve?: (e: MessageEvent) => void
  reject?: (e: ErrorEvent) => void
  resolveMap?: {
    [key: string]: (e: MessageEvent & { data: any }) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  }
  rejectMap?: {
    [key: string]: (e: ErrorEvent) => void
  }
}

type PromiseWorker = Omit<Worker, 'postMessage'> & {
  postMessage: (
    message: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options?: PostMessageOptions | undefined
  ) => Promise<MessageEvent>
  parallelPostMessage: (
    key: string,
    message: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options?: PostMessageOptions | undefined
  ) => Promise<MessageEvent>
}

export const promisify = (worker: Worker): PromiseWorker => {
  const innerWorker = worker as InnerWorker
  innerWorker.onmessage = (e) => {
    if (innerWorker.resolve) {
      innerWorker.resolve(e)
    } else if (innerWorker.resolveMap) {
      const { data } = e
      const { key, data: containedData } = data
      if (innerWorker.resolveMap[key]) {
        innerWorker.resolveMap[key]({ ...e, data: containedData })
      }
    }
  }

  innerWorker.onerror = (e) => {
    if (innerWorker.reject) {
      innerWorker.reject(e)
    } else if (innerWorker.rejectMap) {
      Object.keys(innerWorker.rejectMap).forEach((key: string) => {
        if (innerWorker.rejectMap?.[key]) {
          innerWorker.rejectMap[key](e)
        }
      })
    }
  }

  const promiseWorker = new Proxy(innerWorker, {
    get(target, name) {
      switch (name) {
        case 'postMessage':
          return (...args: Parameters<typeof promiseWorker.postMessage>) => {
            return new Promise((resolve, reject) => {
              target.resolve = resolve
              target.reject = reject

              try {
                target.postMessage(...args)
              } catch (e) {
                reject(e)
              }
            })
          }
        case 'parallelPostMessage':
          return (
            ...args: Parameters<typeof promiseWorker.parallelPostMessage>
          ) => {
            const [key, message, ...others] = args
            const newMessage = { key, data: message }
            return new Promise((resolve, reject) => {
              if (!target.resolveMap) {
                target.resolveMap = {}
              }
              target.resolveMap[key] = resolve
              if (!target.rejectMap) {
                target.rejectMap = {}
              }
              target.rejectMap[key] = reject

              try {
                target.postMessage(newMessage, ...others)
              } catch (e) {
                reject(e)
              }
            })
          }
        default:
          return target[name as keyof Worker]
      }
    },
  }) as PromiseWorker

  return promiseWorker
}
