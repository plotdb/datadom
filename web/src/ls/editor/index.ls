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

plugin-test-obj = (opt = {}) ->
  @data = (opt.data or {}){data,dev}
  @data.dev = true
  @

plugin-test-obj.prototype = Object.create(Object.prototype) <<< do
  serialize: -> return @data{data,dev}

window.pt = plugin-test = do
  name: "plugin-test",
  version: "0.0.1",
  map: do
    set: (node, obj) ->
      console.log node
      if !plugin-test.map.wm => plugin-test.map.wm = new WeakMap!
      plugin-test.map.wm.set node, obj
    get: (node) ->
      if !plugin-test.map.wm => plugin-test.map.wm = new WeakMap!
      plugin-test.map.wm.get node


  # Data from DOM directly. No plugs mechanism.
  serialize: ({data: root-data, node, plugins, window}) ->
    console.log "serialize ", node
    obj = plugin-test.map.get node
    if obj => root-data <<< obj.serialize!
    Promise.all(Array.from(node.childNodes).map (n,i) -> datadom.serialize n, plugins )
      .then (list) ->
        root-data.child ++= list.map(->it.data)
        Promise.all list.map(->it.promise)
  # DOM from node. No plugs mechanism.
  deserialize: ({data,node,plugs,plugins,window}) ->
    console.log "deserialize", node
    plugin-test.map.set node, (new plugin-test-obj {data})
    console.log "reget",plugin-test.map.get node
    return node

plugins = [block.plugin, plugin-test]

<- block.plugin.init!then _

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
    "load-block": ->
      fs.write-file-sync \blank, """
      //- pug
      div(dd-plugin="@plotdb/block@0.0.1",name="long-answer")
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
                  promise.then ->
                    datadom.serialize(node, plugins)
                .then ({data, promise}) -> promise.then ->  console.log data
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
