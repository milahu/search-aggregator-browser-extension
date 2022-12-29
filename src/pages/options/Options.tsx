import logo from "@assets/img/logo.svg";
import "@src/styles/index.css";
import styles from "./Options.module.css";
import {createSignal, onMount, For} from "solid-js"
import formatErrorContext from "./format-error-context.js"

import IconSearchImage from "feathericon/build/svg/search.svg"

const IconSearch = () => <img class="darkmode-invert" src={IconSearchImage}/>

import "bootstrap/dist/css/bootstrap.min.css"
import {
  Tabs,
  Tab,
  Button,
  InputGroup,
  FormControl
} from "solid-bootstrap"

// javascript interpreter
// workaround for CSP (content security policy)
// we cannot run user code with "eval" or "new Function" or <script> or <iframe>
// https://github.com/milahu/awesome-javascript-interpreters
//import Sval from 'sval'
// fix: import esm module
import Sval from '@src/sval/dist'

import {documentOfResponse} from "./lib"

import {searchBackendSources} from "./search-backends/index.js"

// TODO store backends in options of browser extension
// allow to modify backends with code editor in browser
// similar to userscripts (tampermonkey, violentmonkey, greasemonkey)
// https://github.com/bvolpato/awesome-userscripts

const Options = () => {

  let searchButton: HTMLButtonElement;

  const [getQuery, setQuery] = createSignal("")
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

  async function startSearch(event: SubmitEvent | MouseEvent) {
    event.preventDefault()
    const searchQuery = getQuery();
    searchButton.innerHTML = "Searching...";
    searchButton.disabled = true;
    setResults([])
    await Promise.all(getSearchBackends().map(async (backend) => {
      const results = await backend.search(searchQuery)
      const resultsObject = {
        name: backend.name,
        results,
      }
      console.log("resultsObject", resultsObject)
      setResults((last) => last.concat([resultsObject]))
    }))
  }

  return (
    <div class={styles.App}>
      <form class={styles.form} onSubmit={startSearch}>
        <InputGroup>
          <FormControl
            value={getQuery()}
            // Property 'value' does not exist on type 'EventTarget & Element'.ts(2339)
            //onInput={({target}) => setQuery(target.value)}
            onInput={({target}) => setQuery((target as HTMLInputElement).value)}
            //placeholder="Here is a sample placeholder"
            //size="sm"
          />
          <Button
            ref={searchButton}
            onClick={startSearch}
          >Search <IconSearch/></Button>
        </InputGroup>
      </form>
      <Tabs
        //style="width:100%"
        //alignment="center"
      >
        <For each={getResults()}>{(resultsObject) => (
          <Tab title={resultsObject.name} eventKey={resultsObject.name}>
            <RawHtml html={resultsObject.results}/>
          </Tab>
        )}</For>
      </Tabs>
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
