// myboerse.bz is a vBulletin forum

const name = "myboerse.bz"
const baseUrl = `https://${name}/`
//const formSelector = 'form[action="search.php?do=process"]' // first form on page does not work
const formSelector = 'form[action="search.php?do=process"][id="searchform"]'
const inputSelector = "input[name]"
const resultsSelector = "div.block.searchresults"
const linkSelector = "a[href]"
const errorSelector = "body > div.standard_error"

function log(...args) {
  console.log(name, ...args)
}

async function search(searchQuery) {
  // get hidden form values
  const response1 = await fetch(`${baseUrl}search.php`)
  if (response1.status == 429) {
    return "<div>error: rate limiting</div>"
  }
  log("response1.status", response1.status)
  const doc1 = await documentOfResponse(response1)
  log("form doc", doc1)
  /** @type {HTMLFormElement} */
  const form = doc1.querySelector(formSelector)
  log("search form", form)
  const method = form.getAttribute("method") // post
  const action = form.getAttribute("action") // search.php?do=process
  const data = parseForm(form)
  data.query = searchQuery
  log("form data", data)
  // FIXME use same charset as in response1.headers.get("Content-Type")
  let body = new URLSearchParams(data).toString()
  log(`body with charset=utf8`, body)
  const charset = (response.headers.get("content-type").match(/;\s*charset=(.*)(?:;|$)/) || [])[1]
  if (charset && charset != "UTF-8") { // TODO check more? utf-8, utf8, UTF8, ...
    const encoder = new TextEncoder(charset)
    body = encoder.encode(body)
    log(`body with charset=${charset}`, body)
  }
  const headers = {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
  // get search results
  const response2 = await fetch(`${baseUrl}${action}`, {method, body, headers})
  if (response2.status == 429) {
    return "<div>error: rate limiting</div>"
  }
  log("response2.status", response2.status)
  const doc2 = await documentOfResponse(response2)
  log("results doc", doc2)
  const results = doc2.querySelector(resultsSelector)
  if (!results) {
    // possible reason: no results
    if (doc2._source.match(/Deine Suchanfrage erzielte keine Treffer. Bitte versuche es mit anderen Suchbegriffen./)) {
      return ""
    }
    const error = doc2.querySelector(errorSelector)
    if (error) {
      return error.outerHTML
    }
    // possible reason: Bad gateway Error code 502 -> TODO wait and retry
    if (doc2.querySelector("head > title").endsWith(" used Cloudflare to restrict access")) {
      return "<div>error: rate limiting</div>"
    }
    log("results doc", doc2)
    return "<div>error: no results</div>" + doc2.body.innerHTML
  }
  // fix relative urls
  for (const a of results.querySelectorAll(linkSelector)) {
    const href = a.getAttribute("href")
    // TODO better. keep absolute urls
    a.setAttribute("href", `${baseUrl}${href}`)
  }
  return results.outerHTML
}
