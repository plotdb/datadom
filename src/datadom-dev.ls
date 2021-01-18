if module? and require? => require! <[@plotdb/json0]>

/**
 * convert a DOM Node into JSON.
 * @param {Element} n - DOM node.
 * @return {json} a json object containing information of the input DOM Node.
 */
wrap = (n) ->
  name = n.nodeName.toLowerCase!
  if name == \#text => return {type: \text, value: n.nodeValue}
  if name == \#comment => return {type: \comment, value: n.nodeValue}
  if name == \#document-fragment => return {type: \document-fragment}

  style = if n.style => [i for i from 0 til n.style.length].map(-> [n.style[it],n.style[n.style[it]]]) else []
  attr = if n.attributes =>
    [[v.nodeName, v.nodeValue] for v in n.attributes].filter(->!(it.0 in <[style class]>))
  else []
  cls = if n.classList => [v for v in n.classList] else []
  return {type: \tag, name: name, style, attr, cls}

/**
 * serialize a DOM tree.
 * @param {Element} n - DOM tree root node.
 * @return {json} a serialized JSON representing the input DOM.
 */
serialize = (n, plugin) ->
  node = wrap n
  child = []
  if !n.childNodes => return
  for i from 0 til n.childNodes.length =>
    ret = serialize(n.childNodes[i], plugin)
    child.push ret
  node.child = child
  node

serialize-general = (n) ->
  name = n.nodeName.toLowerCase!
  if name == \#text => return {type: \text, value: n.nodeValue}
  if name == \#comment => return {type: \comment, value: n.nodeValue}
  if name == \#document-fragment => return {type: \document-fragment}
  style = if n.style =>
    [i for i from 0 til n.style.length].map(-> [n.style[it],n.style[n.style[it]]])
  else []
  attr = if n.attributes =>
    [[v.nodeName, v.nodeValue] for v in n.attributes].filter(->!(it.0 in <[style class]>))
  else []
  cls = if n.classList => [v for v in n.classList] else []
  node = {type: \tag, name: name, style, attr, cls}

serialize-recurse = (n, plugin) ->
  if is-block(n) => node = serialize-plugin(n, plugin)
  else node = serialize-general n
  child = []
  if !n.childNodes => return
  for i from 0 til n.childNodes.length =>
    ret = serialize(n.childNodes[i], plugin)
    child.push ret
  node.child = child
  node

serialize-plugin = (n, plugin) ->

/**
 * deserialize a JSON into corresponding DOM tree.
 * @param {json} n - JSON representation of a serialized DOM tree.
 * @param {Function} plugin - optional plugin function to handle custom type DOM Node.
 * @return {Promise} - a promise resolving to an object containing following fields:
 *   - node {Element}: deserialized DOM tree or placeholder div for being replaced by instantiated block.
 *   - promise {Promise}: resolve to all pending block retrieval.
 */
deserialize = (n, plugin, win = window) ->
  doc = win.document
  queue = []
  Promise.resolve!
    .then ->
      _ = (n) ->
        switch n.type
        | \text => return doc.createTextNode n.value
        | \comment => return doc.createComment n.value
        | \document-fragment =>
          node = doc.createDocumentFragment!
          for c in (n.child or []) =>
            ret = _ c
            if ret => node.appendChild ret
          return node
        | \tag =>
          node = doc.createElement n.name
          if Array.isArray(n.attr) => n.attr.filter(->it and it.0).map (p) -> node.setAttribute p.0, p.1
          if Array.isArray(n.style) => n.style.filter(->it and it.0).map (p) -> node.style[p.0] = p.1
          if Array.isArray(n.cls) => node.classList.add.apply node.classList, n.cls.filter(->it)
          for c in (n.child or []) =>
            ret = _ c
            if ret => node.appendChild ret
          return node
        | otherwise

          node = doc.createElement \div
          node.setAttribute \block, ""
          if Array.isArray(n.attr) => n.attr.filter(->it and it.0).map (p) -> node.setAttribute p.0, p.1
          if Array.isArray(n.style) => n.style.filter(->it and it.0).map (p) -> node.style[p.0] = p.1
          if Array.isArray(n.cls) => node.classList.add.apply node.classList, n.cls.filter(->it)
          for c in (n.child or []) =>
            ret = _ c
            if ret => node.appendChild ret

          plugs = []
          for c in (n.plugs or []) => plugs.push _(c)

          if !plugin =>
            node.appendChild doc.createTextNode "(unknown node)"
            return node

          ret = plugin {data: n, node: node, window: win}

          if !ret => 
            node.appendChild doc.createTextNode "(unknown node)"
            return node
          else if ret instanceof Promise =>
            [promise] = [ret]
            node.appendChild t = doc.createTextNode "(loading ... )"
            promise = promise.then(->
              if t.parentNode => t.parentNode.removeChild(t)
              if node != it => node.replaceWith it
              return it
            )
          else if ret instanceof win.Element =>
            [node, promise] = [ret, null]
          else {node,promise} = (ret or {})
          if promise => queue.push promise
          return node
      _(n)
    .then (node) ->
      return {node, promise: Promise.all(queue)}

/**
 * apply op based on a data / root pair.
 * @param {json} op - operational transformation
 * @param {json} data - serialized DOM tree
 * @param {Element} root - root of the corresponding DOM tree
 */
locate = (op, data, root) ->
  n = obj = root
  dd = data
  for i from op.p.length - 1 to 0 by -1 =>
    if op.p[i] in <[attr style cls child name value type]> => break
  for j from 0 til i - 1 =>
    p = op.p[i]
    obj = if p == \child => obj.childNodes else obj
    dd = dd[p]

  switch op.p[i]
  | <[name value type]>
    deserialize dd
      .then ({node, promise}) ->
        obj.parentNode.insertBefore node, obj
        obj.parentNode.removeChild obj
  | \style
    obj.setAttribute \style, ''
    dd.style.map -> obj.style[it.0] = it.1
  | \cls
    obj.setAttribute \class, dd.cls.join(' ')
  | \attr
    Array.from(obj.attributes).map ->
      if !dd.attr[it.name] and !(it.name in <[block style class]>) => obj.removeAttribute it.name
    dd.attr.map -> obj.setAttribute it.0, it.1
  | \child
    # other case?
    if op.ld => obj.removeChild obj.childNodes[op.p[i + 1]]
    if op.li =>
      deserialize op.li
        .then ({node, promise}) ->
          obj.insertBefore node, obj.childNodes[op.p[i + 1]]

main = (opt = {}) ->
  @opt = opt
  @window = if opt.window => that else if window? => window else null
  @plugins = if Array.isArray(opt.plugin) => that else if opt.plugin => [opt.plugin] else []
  if opt.data => @data = opt.data
  else if opt.node => @node = opt.node
  @

main.prototype = Object.create(Object.prototype) <<< do
  plugin: ({data, node, window}) ->
    for i from 0 til @plugins.length =>
      p = @plugins[i]
      if p.test(data) => return p.handle({data, node, window})
    return null
  init: ->
    if @node =>
      Promise.resolve!then ~> @data = serialize(@node, ((o) ~> @plugin o))
    else
      deserialize(@data, ((o) ~> @plugin o), @window)
        # node might be a proxy which will be updated once promise is resolved.
        # return promise which is resolved when all pending plugins are processed.
        .then ({node, promise}) ~> @node = node; return {node, promise}
  get-data: -> @data
  get-node: -> @node
  update: (ops = []) ->
    for op in ops =>
      json0.type.apply @data, [op]
      locate op, @data, @node

main <<< { serialize, deserialize }

if module? => module.exports = main
if window? => window.datadom = main
