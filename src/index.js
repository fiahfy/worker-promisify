export default class AsyncWorker {
  constructor (worker) {
    this.worker = worker
  }
  postMessage (...args) {
    return new Promise((resolve, reject) => {
      try {
        this.worker.onmessage = (e) => {
          resolve(e)
        }
        this.worker.onerror = (e) => {
          reject(e)
        }
        this.worker.postMessage(...args)
      } catch (e) {
        reject(e)
      }
    })
  }
  terminate () {
    this.worker.terminate()
  }
}
