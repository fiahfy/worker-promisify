import 'jsdom-worker'
import { promisify } from '../src'

const code = `
  onmessage = ({ data }) => {
    if (isNaN(data)) {
      throw new TypeError('Not a Number')
    }
    postMessage(Math.pow(data, 2))
  }
`
const worker = new Worker(URL.createObjectURL(new Blob([code])))

describe('promisify', () => {
  test('should work', () => {
    const promiseWorker = promisify(worker)
    expect(promiseWorker).toBeInstanceOf(Worker)
  })
})

const promiseWorker = promisify(worker)

describe('terminate', () => {
  test('should work', () => {
    // not supported on jsdom-worker
    expect(() => promiseWorker.terminate()).toThrowError('Not Supported')
  })
})

describe('postMessage', () => {
  test('should work', async () => {
    const e = await promiseWorker.postMessage(2)
    expect(e.data).toBe(4)
  })

  test('should work on reject', async () => {
    await expect(promiseWorker.postMessage(NaN)).rejects.toThrowError(TypeError)
  })
})

const code2 = `
  onmessage = ({ data: { key, data } }) => {
    if (isNaN(data)) {
      throw new TypeError('Not a Number')
    }
    setTimeout(() => {
      postMessage({ key, data })
    }, data)
  }
`
const worker2 = new Worker(URL.createObjectURL(new Blob([code2])))
const delayWorker = promisify(worker2)

describe('postMessage in parallel', () => {
  test('should work', async () => {
    const [e1, e2] = await Promise.all([
      delayWorker.parallelPostMessage('foo', 100),
      delayWorker.parallelPostMessage('bar', 200),
    ])
    expect(e1.data).toBe(100)
    expect(e2.data).toBe(200)
  })

  test('should work on reject', async () => {
    await expect(
      Promise.all([
        delayWorker.parallelPostMessage('foo', NaN),
        delayWorker.parallelPostMessage('bar', 200),
      ])
    ).rejects.toThrowError(TypeError)
  })
})
