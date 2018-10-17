const Key = {
  resolve: Symbol('resolve'),
  reject: Symbol('reject')
}

export default (worker) => {
  if (!(worker instanceof Worker)) {
    throw new TypeError('Cannot convert except Worker')
  }

  worker.onmessage = (e) => {
    if (worker[Key.resolve] instanceof Function) {
      worker[Key.resolve](e)
    } else if (worker[Key.resolve] instanceof Object) {
      const { data } = e
      const { key, data: containedData } = data
      if (worker[Key.resolve][key]) {
        worker[Key.resolve][key]({ ...e, data: containedData })
      }
    }
  }

  worker.onerror = (e) => {
    if (worker[Key.reject] instanceof Function) {
      worker[Key.reject](e)
    } else if (worker[Key.reject] instanceof Object) {
      Object.keys(worker[Key.reject]).forEach((key) => {
        worker[Key.reject][key](e)
      })
    }
  }

  return new Proxy(worker, {
    get(target, name) {
      switch (name) {
        case 'postMessage':
          return (...args) => {
            const [message] = args
            const { key } = message
            return new Promise((resolve, reject) => {
              if (!key) {
                target[Key.resolve] = resolve
                target[Key.reject] = reject
              } else {
                if (!(target[Key.resolve] instanceof Object)) {
                  target[Key.resolve] = {}
                }
                target[Key.resolve][key] = resolve
                if (!(target[Key.reject] instanceof Object)) {
                  target[Key.reject] = {}
                }
                target[Key.reject][key] = reject
              }

              try {
                target.postMessage(...args)
              } catch (e) {
                reject(e)
              }
            })
          }
        default:
          return target[name]
      }
    }
  })
}
