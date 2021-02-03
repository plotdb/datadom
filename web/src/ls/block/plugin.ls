load-sample = ({name}) ->
  manager.get {name, version: "0.0.1"}
    .then -> it.create!
    .then -> it.attach {root: document.getElementById(\container)}
    .catch -> console.log "failed to load block #name", it

manager = new block.manager registry: ({name, version}) -> "/block/#name/#version/index.html"

wm = new WeakMap!
block.from = (node) -> wm.get node
block.set = (node, obj) -> wm.set node, obj

block.plugin = do
  name: "@plotdb/block"
  version: "0.0.1"
  possess: (o) ->
    obj = {name: o.node.getAttribute(\name), version: o.node.getAttribute(\version)}
    wm.set o.node, obj

  serialize: (o) ->
    p = if !block.from(o.node) => datadom.possess o.node, o.plugins else Promise.resolve!
    p.then ->
      if !(obj = block.from(o.node)) => return
      o.data <<< {name: obj.name, version: obj.version}
      # in our test case, child should always load from block class.
      o.data.child = []

  deserialize: (o) ->
    return Promise.resolve!
      .then -> manager.get {name: o.data.name, version: "0.0.1"}
      .then (ret) -> debounce 2000 .then -> ret
      .then -> it.create!
      .then ->
        o.node.block = it
        it.attach root: o.node
      .then -> o.node
  init: -> manager.init!
