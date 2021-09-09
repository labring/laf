
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
