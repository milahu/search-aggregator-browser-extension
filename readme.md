# search-aggregator-web-extension

browser extension to search with many search engines in parallel

## install

```sh
cd $(mktemp -d)
git clone --depth 1 --recurse-submodules --shallow-submodules \
  https://github.com/milahu/search-aggregator-browser-extension
cd search-aggregator-browser-extension
pnpm install
mkdir dist/
readlink -f dist/ # load this path as "unpacked extension" in chrome
npm run dev
```

## similar projects

- https://github.com/rafket/metasearch - search engine aggregator browser extension, GPL license. written in JavaScript
- https://github.com/MichaelCurrin/search-dragon - search aggregator as a web page that will open multiple tabs with search results
- https://github.com/duolingo/metasearch - Search aggregator for Slack, Google Docs, GitHub, and more. written in JavaScript (TypeScript)
- boardreader.com - search many forums. closed source

## based on

package.json, vite.config.ts, ...

- https://github.com/antfu/vitesse-webext
- https://github.com/xiaoluoboding/chrome-ext-mv3-starter

## see also

- https://github.com/ayakashi-io/ayakashi - web scraping framework, domQL, scrape Single Page Apps, based on jsdom, for node.js
- https://github.com/topics/web-scraping?l=typescript
- https://github.com/topics/web-scraping?l=javascript
- https://github.com/lorien/awesome-web-scraping/blob/master/javascript.md#browser-automation-and-emulation
- https://github.com/lorien/awesome-web-scraping/blob/master/javascript.md#web-scraping-frameworks
- https://github.com/thecount2a/webhelperextension - Chrome extension that allows you to automate clicking, typing, and entering data into websites
- visual scraping
- https://github.com/crisdosyago/BrowserBox - remote browser isolation, providing a browser within a browser
