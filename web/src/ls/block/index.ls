block.plugin.init!
  .then ->
    dd = new datadom {data: sample-data, plugins: [block.plugin]}
    dd.init!
  .then ({node, promise}) ->
    root.appendChild node
    promise
  .then ->
    console.log 'deserialized. now try serializing again ... '
  .then ->
    datadom.serialize root.childNodes.0, [block.plugin], window
  .then ({data, promise}) -> 
    promise.then -> return data
  .then (data) ->
    console.log "serialized data: ", data
    console.log "serialized. deserialize again ..."
    datadom.deserialize(data, [block.plugin], window)
  .then ({node, promise}) ->
    rootalt.appendChild node
    promise
  .then -> console.log "deserialized."
  .catch -> console.log it

