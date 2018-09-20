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
const worker = new Worker(URL.createObjectURL(new Blob([code])))

describe('promisify', () => {
  test('should work', () => {
    const promiseWorker = promisify(worker)
    expect(promiseWorker).toBeInstanceOf(Worker)
  })

  test('should throw error if not worker', () => {
    expect(() => promisify({})).toThrowError(TypeError)
  })
})

const promiseWorker = promisify(worker)

describe('promise worker', () => {
  test('should work', async () => {
    const e = await promiseWorker.postMessage(2)
    expect(e.data).toBe(4)
  })

  test('should work on reject', async () => {
    await expect(promiseWorker.postMessage(NaN)).rejects.toThrowError('Not a Number')
  })

  test('should work terminate', () => {
    // not supported on jsdom-worker
    expect(() => promiseWorker.terminate()).toThrowError('Not Supported')
  })
})
