load-sample = ({name}) ->
  manager.get {name, version: "0.0.1"}
    .then -> it.create!
    .then -> it.attach {root: document.getElementById(\container)}
    .catch -> console.log "failed to load block #name", it

manager = new block.manager registry: ({name, version}) -> "/block/#name/#version/index.html"

block.plugin = do
  name: "@plotdb/block"
  version: "0.0.1"
  possess: (o) ->
  serialize: (o) ->
    o.data <<< {name: o.node.block.name, version: o.node.block.version}
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
