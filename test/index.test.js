import 'jsdom-worker'
import promisify from '../src'

const code = `
  onmessage = ({ data }) => {
    if (isNaN(data)) {
      throw new Error('Not a Number')
    }
    postMessage(data * 2)
  }
`
const worker = new global.Worker(URL.createObjectURL(new global.Blob([code])))
const promiseWorker = promisify(worker)

describe('promisify worker', () => {
  test('should work', async () => {
    const e = await promiseWorker.postMessage(2)
    expect(e.data).toBe(4)
  })

  test('should work with error', async () => {
    await expect(promiseWorker.postMessage(NaN)).rejects.toThrowError('Not a Number')
  })

  test('terminate should work', () => {
    // not supported on jsdom-worker
    expect(() => promiseWorker.terminate()).toThrowError('Not Supported')
  })
})
