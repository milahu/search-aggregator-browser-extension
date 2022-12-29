export type DocumentWithSource = Document & {_source: string;}

import formSerialize from "form-serialize"

/**
* parse html document from http response. \
* also handle non-utf8 data.
*
* use this instead of
* ```
* const html = await response.text()
* const doc = new DOMParser().parseFromString(html, "text/html");
* ```
*/
export async function documentOfResponse(response: Response): Promise<DocumentWithSource> {
  if (!response) throw new Error("no response")
  // example content-type: text/html; charset=ISO-8859-1
  const type = response.headers.get("content-type").split(";")[0] || "text/html"
  const charset = (response.headers.get("content-type").match(/;\s*charset=(.*)(?:;|$)/) || [])[1]
  let html = ""
  if (charset && charset != "UTF-8") { // TODO check more? utf-8, utf8, UTF8, ...
    const decoder = new TextDecoder(charset)
    const buffer = await response.arrayBuffer()
    html = decoder.decode(buffer) // convert from charset to utf8
  }
  else {
    html = await response.text()
  }
  // TODO check supported type
  // @ts-ignore
  const rawDoc = new DOMParser().parseFromString(html, type)
  // @ts-ignore Property '_source' does not exist on type 'Document'.ts(2339)
  rawDoc._source = html
  return rawDoc as DocumentWithSource
  /*
  const doc: DocumentWithSource = {
    ...rawDoc,
    _source: html,
  }
  return doc
  */
}

// https://stackoverflow.com/questions/57121467/import-a-module-from-string-variable
// WONTFIX Refused to load the script ... because it violates the following Content Security Policy directive: "script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.
export function importFromString(str) {
  if (globalThis.URL.createObjectURL) {
    const blob = new Blob([str], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const module = import(url)
    URL.revokeObjectURL(url) // GC objectURLs
    return module
  }
  //const url = "data:text/javascript;base64," + btoa(str)
  const url = "data:text/javascript," + str
  return import(url)
}

/**
 * parse html form to object of values
 */
export function parseForm(form: HTMLFormElement): Record<string, any> {
  return formSerialize(form, {hash: true})
}
