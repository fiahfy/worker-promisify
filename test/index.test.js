import 'jsdom-worker'
import AsyncWorker from '../src'

describe('async worker', () => {
  test('should work', async () => {
    const code = `onmessage = (e) => postMessage(e.data * 2)`
    const worker = new global.Worker(URL.createObjectURL(new global.Blob([code])))
    const asyncWorker = new AsyncWorker(worker)
    const e = await asyncWorker.postMessage(1)
    expect(e.data).toBe(2)
  })

  test('should work with error', async () => {
    global.console = {
      error: jest.fn()
    }
    const code = `onmessage = (e) => throw new Error()`
    const worker = new global.Worker(URL.createObjectURL(new global.Blob([code])))
    const asyncWorker = new AsyncWorker(worker)
    expect(asyncWorker.postMessage(1)).rejects.toThrow()
  })
})
