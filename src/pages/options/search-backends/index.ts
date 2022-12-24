// https://vitejs.dev/guide/assets.html#importing-asset-as-string
import MygullyCom from "./mygully.com.js?raw"

export const searchBackendSources: Record<string, string> = {
  "mygully.com": MygullyCom,
}
