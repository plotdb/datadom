if module? and require? => require! <[@plotdb/json0]>

find-plugin = (plugins = [], n = '') ->
  n = n.split('@')
  [n,v] = if !n.0 => ["@#{n.1}", n.2] else [n.0,n.1]
  for i from 0 til plugins.length => if n == plugins[i].name => return plugins[i]
  return null

# Attributes, Styles and Classes
asc = (n,node) ->
  if Array.isArray(n.attr) => n.attr.filter(->it and it.0).map (p) -> node.setAttribute p.0, p.1
  if Array.isArray(n.style) => n.style.filter(->it and it.0).map (p) -> node.style[p.0] = p.1
  if Array.isArray(n.cls) => node.classList.add.apply node.classList, n.cls.filter(->it)

/**
 * serialize a DOM tree.
 * @param {Element} node - DOM tree root node.
 * @param {Plugin(s)} plugins - plugin or array of plugins
 * @param {Window} win - window object. default `window`.
 * @return {Promise} - resolving {data, promise} where data is a serialized JSON representing the input DOM, and promise resolves when serializing is done.
 */
serialize = (node, plugins, win = window) ->
  plugins = if Array.isArray(plugins) => plugins else if plugins => [plugins] else []
  queue = []
  Promise.resolve!
    .then ->
      _ = (node) ->
        nodename = node.nodeName.toLowerCase!
        switch nodename
        | \#text => return {type: \text, value: node.nodeValue}
        | \#comment => return {type: \comment, value: node.nodeValue}
        | \#document-fragment =>
          data = {type: \document-fragment, child: []}
          for i from 0 til node.childNodes.length => if ret = _(node.childNodes[i]) => data.child.push ret
          return data
        | otherwise
          style = if !node.style => []
          else [i for i from 0 til node.style.length].map(-> [node.style[it],node.style[node.style[it]]])
          attr = if !node.attributes => []
          else
            [[v.nodeName, v.nodeValue] for v in node.attributes]
              .filter(->!(/^dd-/.exec(it.0) or it.0 in <[style class]>))
          cls = if !node.classList => [] else [v for v in node.classList]
          data = {style, attr, cls, child: [], plug: []}

          # tag
          if !node.hasAttribute(\dd-plugin) =>
            # for custom elements, child and plug are left for plugin to resolve
            for i from 0 til node.childNodes.length => if ret = _(node.childNodes[i]) => data.child.push ret
            return data <<< {type: \tag, name: nodename}

          # custom
          data.type = \custom
          if !(plugin = find-plugin plugins, node.getAttribute(\dd-plugin)) =>
            return data <<< {plugin: "unknown"}
          data.plugin = "#{plugin.name}@#{plugin.version}"

          ret = plugin.serialize({data, node, window, plugins})
          if ret instanceof Promise => queue.push ret

          return data

      _(node)
    .then (data) -> {data, promise: Promise.all(queue)}

/**
 * deserialize a JSON into corresponding DOM tree.
 * @param {json} n - JSON representation of a serialized DOM tree.
 * @param {Functions} plugins - plugin or array of plugins.
 * @return {Promise} - a promise resolving to an object containing following fields:
 *   - node {Element}: deserialized DOM tree or placeholder div for being replaced by instantiated block.
 *   - promise {Promise}: resolve to all pending block retrieval.
 */
deserialize = (n, plugins, win = window) ->
  plugins = if Array.isArray(plugins) => plugins else if plugins => [plugins] else []
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
          for c in (n.child or []) => if ret = _(c) => node.appendChild ret
          return node
        | \tag =>
          node = doc.createElement n.name
          asc n,node
          for c in (n.child or []) => if ret = _(c) => node.appendChild ret
          return node
        | otherwise
          [node,promise] = [doc.createElement(\div), null]
          for c in (n.child or []) => if ret = _(c) => node.appendChild ret
          plugs = for c in (n.plug or []) => _(c)

          if !(plugin = find-plugin plugins, n.plugin) =>
            node.appendChild doc.createTextNode "(unknown)"
            return node

          ret = plugin.deserialize {data: n, node, plugs, window: win, plugins}

          if !ret => node.appendChild doc.createTextNode "(unknown)"
          else if ret instanceof Promise =>
            node.appendChild t = doc.createTextNode "(.. loading ..)"
            promise = ret.then((new-node) ->
              if t.parentNode => t.parentNode.removeChild(t)
              # what if node is not yet appended?
              # we may need to pend with Proxise until datadom parsing is done.
              if node != new-node => node.replaceWith new-node
              new-node.setAttribute \dd-plugin, "#{plugin.name}@#{plugin.version}"
              asc(n,new-node)
              return new-node
            )
          else if ret instanceof win.Element => node = ret
          else {node,promise} = ret
          if promise => queue.push promise
          node.setAttribute \dd-plugin, "#{plugin.name}@#{plugin.version}"
          asc(n,node)
          return node
      _(n)
    .then (node) ->
      return {node, promise: Promise.all(queue)}


/**
 * inject custom object into custom node.
 * @param {Element} node - DOM tree root node.
 * @param {Plugin(s)} plugins - plugin or array of plugins
 * @param {Window} win - window object. default `window`.
 * @return {Promise} - resolving {data, promise} where data is a serialized JSON representing the input DOM, and promise resolves when serializing is done.

 * @param {Window} win - window object. default `window`.
 * @return {Promise} - resolving {data, promise} where data is a serialized JSON representing the input DOM, and promise resolves when serializing is done.
 */
possess = (node, plugins, win = window) ->
  plugins = if Array.isArray(plugins) => plugins else if plugins => [plugins] else []
  queue = []
  Promise.resolve!
    .then ->
      _ = (n) ->
        if !n.hasAttribute(\dd-plugin) =>
          for i from 0 til n.childNodes.length => _ n.childNodes[i]
          return
        if !(plugin = find-plugin(plugins, node.getAttribute(\dd-plugin))) => return
        ret = plugin.possess {node, plugins, window}
        if ret instanceof Promise => queue.push ret
      _(node)
    .then -> Promise.all queue


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
      if !dd.attr[it.name] and !(it.name in <[custom style class]>) => obj.removeAttribute it.name
    dd.attr.map -> obj.setAttribute it.0, it.1
  | \child
    # other case?
    if op.ld => obj.removeChild obj.childNodes[op.p[i + 1]]
    if op.li =>
      deserialize op.li
        .then ({node, promise}) ->
          obj.insertBefore node, obj.childNodes[op.p[i + 1]]

datadom = (opt = {}) ->
  @opt = opt
  @window = if opt.window => that else if window? => window else null
  @plugins = if Array.isArray(opt.plugins) => opt.plugins else if opt.plugins => [opt.plugins] else []
  if opt.data => @data = opt.data
  else if opt.node => @node = opt.node
  @

datadom.prototype = Object.create(Object.prototype) <<< do
  init: ->
    if @data =>
      deserialize(@data, @plugins, @window)
        # node might be a proxy which will be updated once promise is resolved.
        # return promise which is resolved when all pending plugins are processed.
        .then ({node, promise}) ~> @node = node; return {node, promise}
    else
      if !@node => @node = document.createElement \div
      serialize(@node, @plugins, @window)
        .then ({data, promise}) -> @data = data; return {data, promise}
  get-data: -> @data
  get-node: -> @node
  update: (ops = []) ->
    for op in ops =>
      json0.type.apply @data, [op]
      locate op, @data, @node

datadom <<< { serialize, deserialize, possess }

if module? => module.exports = datadom
else if window? => window.datadom = datadom
