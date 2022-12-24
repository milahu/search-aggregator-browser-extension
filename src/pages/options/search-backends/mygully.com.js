// mygully.com is a forum, based on vBulletin

const specialCharMap = {
  "ä": "ae",
  "ö": "oe",
  "ü": "ue",
  "Ä": "Ae",
  "Ö": "Oe",
  "Ü": "Ue",
  "ß": "sz",
}

async function search(searchQuery) {
  // get hidden form values
  var response = await fetch("https://mygully.com/")
  var doc = await documentOfResponse(response)
  /** @type {HTMLFormElement} */
  var form = doc.querySelector(`form[action="search.php?do=process"]`)
  //console.log("search form", form)
  var method = form.getAttribute("method"); // post
  var action = form.getAttribute("action"); // search.php?do=process
  /** @type {NodeListOf<HTMLInputElement>} */
  var inputs = form.querySelectorAll("input[name]")
  var data = Object.fromEntries(Array.from(inputs).map(
    (input) => [input.getAttribute("name"), input.getAttribute("value")]));
  data.query = searchQuery;
  // fix special chars
  data.query = data.query.replace(
    new RegExp(Object.keys(specialCharMap).join("|"), "g"),
    (char) => specialCharMap[char])
  var body = new URLSearchParams(data).toString()
  var headers = {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'};
  // get search results
  var response = await fetch(`https://mygully.com/${action}`, {method, body, headers});
  var doc = await documentOfResponse(response)
  var table = doc.querySelector("table#threadslist")
  if (!table) {
    // possible reason: no results
    if (doc._source.match(/Deine Suchanfrage erzielte keine Treffer. Bitte versuche es mit anderen Suchbegriffen./)) {
      return ""
    }
    // possible reason: Bad gateway Error code 502 -> TODO wait and retry
    console.log("results doc", doc)
    return "<div>error: no table</div>" + doc.body.innerHTML;
  }
  // fix relative urls
  for (const a of table.querySelectorAll("a")) {
    const href = a.getAttribute("href")
    // TODO better. keep absolute urls
    a.setAttribute("href", `https://mygully.com/${href}`)
  }
  return table.outerHTML
}
