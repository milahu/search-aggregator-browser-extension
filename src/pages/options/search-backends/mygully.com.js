// mygully.com is a vBulletin forum

const name = "mygully.com"
const baseUrl = `https://${name}/`
const formSelector = 'form[action="search.php?do=process"]'
const inputSelector = "input[name]"
const resultsSelector = "table#threadslist"
const linkSelector = "a[href]"

function asciiOfGerman(str) {
  const specialCharMap = {
    "ä": "ae",
    "ö": "oe",
    "ü": "ue",
    "Ä": "Ae",
    "Ö": "Oe",
    "Ü": "Ue",
    "ß": "sz",
  }
  return str.replace(
    new RegExp(Object.keys(specialCharMap).join("|"), "g"),
    (char) => specialCharMap[char])
}

async function search(searchQuery) {
  // get hidden form values
  var response = await fetch(baseUrl)
  //var response = await fetch(`${baseUrl}search.php`) // TODO
  var doc = await documentOfResponse(response)
  /** @type {HTMLFormElement} */
  var form = doc.querySelector(formSelector)
  //console.log("search form", form)
  var method = form.getAttribute("method"); // post
  var action = form.getAttribute("action"); // search.php?do=process
  /** @type {NodeListOf<HTMLInputElement>} */
  var inputs = form.querySelectorAll(inputSelector)
  var data = Object.fromEntries(Array.from(inputs).map(
    (input) => [input.getAttribute("name"), input.getAttribute("value")]));
  data.query = searchQuery;
  data.query = asciiOfGerman(data.query)
  var body = new URLSearchParams(data).toString()
  var headers = {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'};
  // get search results
  var response = await fetch(`${baseUrl}${action}`, {method, body, headers});
  var doc = await documentOfResponse(response)
  var results = doc.querySelector(resultsSelector)
  if (!results) {
    // possible reason: no results
    if (doc._source.match(/Deine Suchanfrage erzielte keine Treffer. Bitte versuche es mit anderen Suchbegriffen./)) {
      return ""
    }
    // possible reason: Bad gateway Error code 502 -> TODO wait and retry
    console.log("results doc", doc)
    return "<div>error: no results</div>" + doc.body.innerHTML;
  }
  // fix relative urls
  for (const a of results.querySelectorAll(linkSelector)) {
    const href = a.getAttribute("href")
    // TODO better. keep absolute urls
    a.setAttribute("href", `${baseUrl}${href}`)
  }
  return results.outerHTML
}
