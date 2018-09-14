# @fiahfy/worker-promisify

> Promisify postMessage for Web Worker.

## Installation
```
npm install @fiahfy/worker-promisify
```

## Usage
```
import AsyncWorker from '@fiahfy/worker-promisify'

const worker = new Worker('worker.js')
const asyncWorker = new AsyncWorker(worker)

asyncWorker.postMessage('ping').then((e) => {
  console.log(e.data)
})
```
