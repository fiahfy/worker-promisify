# @fiahfy/worker-promisify

> Promisify postMessage for Web Worker.

## Installation
```
npm install @fiahfy/worker-promisify
```

## Usage
`worker.js`
```js
onmessage = (e) => {
  postMessage('pong')
}
```
`main.js`
```js
import promisify from '@fiahfy/worker-promisify'

const worker = new Worker('worker.js')
const promiseWorker = promisify(worker)

promiseWorker.postMessage('ping').then((e) => {
  console.log(e.data) // pong
})
```

### Parallel execution
`worker.js`
```js
onmessage = ({ data: { key, data } }) => {
  postMessage({ key, data: Math.pow(data, 2) }) // must pass key and set return value to data
}
```
`main.js`
```js
import promisify from '@fiahfy/worker-promisify'

const worker = new Worker('worker.js')
const promiseWorker = promisify(worker)

Promise.all([
  promiseWorker.postMessage({ key: 'foo', data: 2 }), // must set unique keys
  promiseWorker.postMessage({ key: 'bar', data: 3 })
]).then(([e1, e2]) => {
  console.log(e1.data) // 4
  console.log(e2.data) // 9
})
```
