// https://vitejs.dev/guide/assets.html#importing-asset-as-string
import MygullyCom from "./mygully.com.js?raw"
import MyboerseBz from "./myboerse.bz.js?raw"

export const searchBackendSources: Record<string, string> = {
  "mygully.com": MygullyCom,
  "myboerse.bz": MyboerseBz,
}
