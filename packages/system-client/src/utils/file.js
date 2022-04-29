
/**
 * export raw text
 * @param {string} name
 * @param {string} data
 */
export function exportRawText(name, data) {
  var urlObject = window.URL || window.webkitURL || window
  var export_blob = new Blob([data])
  var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
  save_link.href = urlObject.createObjectURL(export_blob)
  save_link.download = name
  save_link.click()
}

/**
 * export raw blob
 * @param {string} name
 * @param {Blob} data
 */
export function exportRawBlob(name, data) {
  const reader = new FileReader()
  reader.readAsDataURL(data)
  reader.onload = e => {
    const save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
    save_link.href = e.target.result
    save_link.download = name
    save_link.click()
  }
}

/**
 * read text from local file
 * @param {File} file
 */
export async function readTextFromFile(file, encoding = 'utf-8') {
  const reader = new FileReader()
  reader.readAsText(file)

  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

export function byte2gb(bytes) {
  return Math.floor(bytes / 1024 / 1024 / 1024)
}

export function gb2byte(gb) {
  return gb * 1024 * 1024 * 1024
}
