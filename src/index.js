export default (worker) => {
  return new Proxy(worker, {
    get (target, name) {
      switch (name) {
        case 'postMessage':
          return (...args) => {
            return new Promise((resolve, reject) => {
              try {
                target.onmessage = (e) => {
                  resolve(e)
                }
                target.onerror = (e) => {
                  reject(e)
                }
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
