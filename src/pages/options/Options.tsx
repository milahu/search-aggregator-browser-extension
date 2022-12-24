import logo from "@assets/img/logo.svg";
import "@src/styles/index.css";
import styles from "./Options.module.css";
import {createSignal, onMount, For} from "solid-js"
import formatErrorContext from "./format-error-context.js"

// javascript interpreter
// workaround for CSP (content security policy)
// we cannot use "eval" or "new Function" to run user code
// TODO but maybe we can inject <script> or <iframe>
// https://github.com/milahu/awesome-javascript-interpreters
import Sval from 'sval'

import {documentOfResponse} from "./lib"

import {searchBackendSources} from "./search-backends/index.js"

// TODO store backends in options of browser extension
// allow to modify backends with code editor in browser
// similar to userscripts (tampermonkey, violentmonkey, greasemonkey)
// https://github.com/bvolpato/awesome-userscripts

const Options = () => {

  let searchInput: HTMLInputElement;
  let searchButton: HTMLButtonElement;

  const [getResults, setResults] = createSignal([])

  const [getSearchBackends, setSearchBackends] = createSignal([])

  Promise.all(Object.entries(searchBackendSources).map(async ([name, source]) => {
    function search(searchQuery) {
      return new Promise((resolve, reject) => {
        const interpreter = new Sval({
          ecmaVer: 2019,
          sandBox: true,
        })
        interpreter.import({
          searchQuery,
          resolve,
          reject,
          documentOfResponse,
        })
        const fullSource = (
          source + "\n" +
          "search(searchQuery).then(resolve).catch(reject)" + "\n"
        )
        console.log(`calling backend ${name}`)
        try {
          // source will call resolve or reject
          interpreter.run(fullSource)
        }
        catch (error) {
          reject(new Error(error.message + "\n" + formatErrorContext(fullSource, error.pos)))
        }
      })
    }
    const backend = { name, search }
    console.log(`loaded backend ${name}`)
    return backend
  })).then(setSearchBackends)

  async function startSearch(event: SubmitEvent) {
    event.preventDefault()
    const searchQuery = searchInput.value;
    searchButton.innerHTML = "Searching...";
    searchButton.disabled = true;
    setResults([])
    await Promise.all(getSearchBackends().map(async (backend) => {
      const results = await backend.search(searchQuery)
      const resultsObject = {
        name: backend.name,
        results,
      }
      setResults((last) => last.concat([resultsObject]))
    }))
  }

  return (
    <div>
      <div class={styles.App}>
        <form class={styles.form} onSubmit={startSearch}>
          <input ref={searchInput}/>
          <button ref={searchButton}>Search</button>
        </form>
        <div>
          <For each={getResults()}>
            {(resultsObject) => (
              <div>
                <div>result from {resultsObject.name}</div>
                <RawHtml html={resultsObject.results}/>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

function RawHtml(props) {
  let div: HTMLDivElement
  onMount(() => {
    div.innerHTML = props.html
  })
  return <div ref={div}></div>
}

export default Options;
