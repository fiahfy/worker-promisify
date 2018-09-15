# @fiahfy/worker-promisify

> Promisify postMessage for Web Worker.

## Installation
```
npm install @fiahfy/worker-promisify
```

## Usage
```js
import promisify from '@fiahfy/worker-promisify'

const worker = new Worker('worker.js')
const promiseWorker = promisify(worker)

promiseWorker.postMessage('ping').then((e) => {
  console.log(e.data)
})
```
