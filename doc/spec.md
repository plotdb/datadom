# datadom spec

`datadom` is a JSON / DOM pair that can be converted from one to each other.

For basic DOM elements, this is trivial. Yet we added the concept of `custom element` and thus additional care must be taken to implement it.

While it's possible to simply let web component to handle custom element concept, it brings some limitation about DOM hierarchy and global CSS. Thus datadom defines its own spec about custom element, and handle it manually.


## data part 

JSON object which can be converted to / from a DOM tree. Following is the member of each node in json:

 - `type` - node type. such as `tag`, `custom`, `text`
    - `tag` - markup language tags
    - `text` - plain text
    - `comment` - comment
    - `document-fragment` - document fragment
    - `custom` - custom node type. should be processed with plugin, otherwise discarded.
 - `plugin` - plugin name. only applicable when `type` is `custom`.
    - in package name format. ( name@semver, github:name@semver, @scope/name@semver, ... etc )
    - inherited from ancestor when omitted.
 - `name` - node name. ( optional, dependning on type )
    - such as `div` for tags, or `my-list` for block
    - case sensitive. custom rule enforced for different custom node type by plugin.
 - `version` - version.
 - `attr` - node attributes, exclude `class`, `id` and `style`.
 - `style` - node styles
 - `cls` - node classes
 - `data` - node data. ( optional, depending on type )
   - for `text` type: string for `textContent`
   - for `comment` type: string for comment content.
   - for `tag` type: data for accessing programmatically through this tag.
   - for `custom` type: custom data following corresponding plugin spec.
 - `child` - array of child nodes. not applicable for `text` and `comment` node type.
 - `plug` - array of plug nodes. only feasible for `custom` type.
 - `id` - unique representation of this node with suuid.
 - `link` - connection to other node. a list of node `id`.

----
下面還在想
----

## dom part

DOM part of `datadom` simply follows the W3C DOM Spec - however we still have to handle `custom element` part.

Custom elements are defined as:

 - element name: either a `div`, or a custom element named `custom-datadom`
 - attribute:
   `dd-plugin`: with value from plugin `name@version` pair ( plugin id ). inherited from closest parent, if omitted

There may be more attributes depending on the plugin. For example, `@plotdb/block` may use following attribute:
 - `name`: block name
 - `version`: block version

And some additional requirement:

 - `datadom.get-object(element)` always return corresponding object for element.
   - if it's not yet inited or there is no such object existed, datadom is responsible for creating an empty one.
   - 可能需要 init state 傳入. 該怎麼處理? 還是說, 只要是靠 datadom 建立的, 就全都預設空?
 - `datadom.get-plugin-name(element)` return plugin id



## Convert from custom DOM to custom data

This only happens when parser finds an element `N` with `dd-plugin` attribute.

    plugin = datadom.get-plugin(N)
    obj = datadom.get-object(N)
    data = {type: 'custom', plugin: datadom.get-plugin-name(N)} <<< obj{name, version}
    data <<< get-basic-attributes(N){attr, style, class}
    # plugin should setup `data`, `child` and `plugs` fields
    plugin.serialize({data: data, node: N})
      .then -> data

## Convert from custom data tom custom DOM

When a data node `D` with `custom` name found, it should be converted to custom DOM as below:

    plugin = datadom.get-plugin(D)
    dom = deserialize(D.child)
    plugs = D.[]plugins.map -> deserialize it
    node = datadom.create-pleaceholder() # 是否有可能不要抽換?
    node.appendChild(dom)
    # plugin should prepare obj and subtree based on `data`, `child` and `plugs` fields.
    plugin.deserialize({data: D, node: node})
      .then ({node, obj}) ->
        datadom.set-object(node, obj)
        node


## Custom Object - Custom DOM Manipulaion Object

All custom DOM have an internal object - called `Custom Object` - created using `plugin.create(node)`. datadom always ensure an object returned when `get-object` is called:

    datadom.get-object = (n,p) ->
      if datadom.wm.get(n) => return that
      p = datadom.get-plugin(n,p)
      datadom.wm.set n, (obj = p.create(n))
      return n
      
However creation of this object may involve the initialization of DOM, so it should always be called once a custom DOM node is available in DOM:

    # when deserializing is done:
    datadom.prepare-object = (root,p) ->
      Array.from(root.querySelectorAll('*[dd-plugin]')).map (n) -> datadom.get-object(n,p)

    # within plugin.deserialize:
    plugin.deserialize = (obj,p) ->
      # this should return the corresponding node. They are 
      some-internal-work(obj)
        .then (node) ->
          datadom.prepare-object(node,p)

As shown above, plugin may create DOM elements directly ( in some-interal-work ) without datadom's help. In this case, `custom object` for custom elements in the returned DOM may not yet be created. Plugin is responsible for initializing these object by calling `datadom.prepare-object` ( or something like that, TBD. )
