import logo from "@assets/img/logo.svg";
import "@src/styles/index.css";
import styles from "./Options.module.css";
import {createSignal} from "solid-js"
import {For} from "solid-js"

const Options = () => {
  let searchButton;
  const [getResults, setResults] = createSignal([
    "result0",
    "result0",
  ])
  function startSearch(event) {
    event.preventDefault()
    //console.log("submit")
    searchButton.innerHTML = "Searching...";
    searchButton.disabled = true;
    // clear results
    //console.log("clear")
    setResults([])
    // update results
    //console.log("update")
    setResults((old) => old.concat(["result1"]))
    setResults((old) => old.concat(["result2"]))
  }
  return (
    <div class={styles.App}>
      <form class={styles.form} onSubmit={startSearch}>
        <input/>
        <button ref={searchButton}>Search</button>
      </form>
      <ol class={styles.results}>
        <For each={getResults()}>
          {result => (
            <li>result: {JSON.stringify(result, null, 2)}</li>
          )}
        </For>
      </ol>
      <pre>{JSON.stringify(getResults(), null, 2)}</pre>
    </div>
  );
};

export default Options;
