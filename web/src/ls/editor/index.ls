<-(->it!) _
lc = {}
sdb = new sharedb-wrapper!
watch = (ops, source) ->
  json0.type.apply lc.data, ops
  remote = ld$.find '[ld=remote]', 0
  remote.innerHTML = ""
  datadom.deserialize lc.data, plugins
    .then ({node, promise}) ->
      remote.appendChild node
      pug = "//- pug\n" + html2pug(remote.innerHTML, {fragment: true})
      pug-node = ld$.find '[ld=pug]', 0
      pug-node.innerText = pug

plugin-test = do
  name: "plugin-test",
  version: "0.0.1",
  # Data from DOM directly. No plugs mechanism.
  serialize: ({data: root-data, node, plugins, window}) ->
    Promise.all(Array.from(node.childNodes).map (n,i) -> datadom.serialize n, plugins )
      .then (list) -> 
        root-data.child ++= list.map(->it.data)
        Promise.all list.map(->it.promise)
  # DOM from node. No plugs mechanism.
  deserialize: ({data,node,plugs,plugins,window}) -> return node
  create: -> console.log 'create'

plugins = [plugin-test]

view = new ldView do
  root: document.body
  action: click:
    "load-ce": -> 
      fs.write-file-sync \blank, """
      //- pug
      div(dd-plugin="plugin-test@0.0.1") hi
      """
      lc.ed.set-files fs
      lc.ed.open \blank
      lc.ed.render!

sdb.get {id: \sample, watch: watch, create: -> {} }
  .then (doc) ->
    lc.doc = doc
    lc.data = JSON.parse(JSON.stringify(doc.data))

    getfa 'sample'
      .then (fs) ->
        lc.fs = fs
        fs.write-file-sync(
          \blank,
          """
          //- pug
          h1 hello world!
          """
        )
        render-datadom = (code) ->
          div = document.createElement("div")
          div.innerHTML = code
          datadom.serialize(div, plugins)
            .then ({data, promise}) -> promise.then -> data
            .then (json) ->
              node = ld$.find '[ld=json]', 0
              node.innerText = JSON.stringify(json, null, 2)
              domroot = ld$.find '[ld=dom]', 0
              datadom.deserialize(json, plugins)
                .then ({node, promise}) ->
                  domroot.innerHTML = ""
                  domroot.appendChild node
              ops = json0.diff doc.data, json
              doc.submitOp ops


        lc.ed = ed = new Editor do
          node: do
            edit: '[ld=editor]'
            view: '[ld=viewer]'
          editlet: {}
          renderer: ({fs}) ->
            if !fs => return
            payload = html: (fs.read-file-sync 'blank' .toString!)
            for k,v of payload =>
              ret = transpiler.detect(v)
              if ret.mod and ret.mod.transform => payload[k] = ret.mod.transform v
              render-datadom(payload.html)
            return payload
        ed.set-files fs
        ed.open \blank
