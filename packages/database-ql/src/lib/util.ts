export const createPromiseCallback = () => {
  let cb: any
  if (!Promise) {
    cb = () => {}
    cb.promise = {}

    const throwPromiseNotDefined = () => {
      throw new Error(
        'Your Node runtime does support ES6 Promises. ' +
        'Set "global.Promise" to your preferred implementation of promises.')
    }

    Object.defineProperty(cb.promise, 'then', { get: throwPromiseNotDefined })
    Object.defineProperty(cb.promise, 'catch', { get: throwPromiseNotDefined })
    return cb
  }

  const promise = new Promise((resolve, reject) => {
    cb = (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    }
  })
  cb.promise = promise
  return cb
}