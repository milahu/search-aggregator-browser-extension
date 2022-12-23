import logo from "@assets/img/logo.svg";
import "@src/styles/index.css";
import styles from "./Popup.module.css";

const Popup = () => {
  function onSubmit() {
    alert("asdf")
  }
  return (
    <div class={styles.Popup}>
      <form onSubmit={onSubmit}>
        <input/>
        <button>Search</button>
      </form>
    </div>
  );
};

export default Popup;
