require! {fs, jsdom: {JSDOM}}
require! <[debounce.js]>
require! <[@plotdb/block]>
require! <[../dist/datadom-next]>
datadom = datadom-next

dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')

data = JSON.parse(fs.read-file-sync 'data.json' .toString!)

# plugin: ( n = data, p = plugin, w = win )
#   return: 
#     - Promise: pending loading
#     - Element
#     - {node, promise}

p = do
  test: ({data}) -> return true
  handle: ({data, node, window}) ->
    return Promise.resolve!
      .then ->
        ret = window.document.createElement("span")
        ret.textContent = JSON.stringify(data)
        node.appendChild ret
        debounce 1000 .then -> node


dd = new datadom { data, window: dom.window, plugin: p }
dd.init!
  .then -> dd.get-node!
  .then ->
    console.log it.outerHTML
