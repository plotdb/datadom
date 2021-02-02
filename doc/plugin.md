# Plugins

When Datadom transforms between DOM and JSON, it can also (de)serialize more than a ordinary node - a custom node. Detail of the custom node is beyond Datadom's scope, but Datadom provides an interface for user-defined `plugins` to extend Datadom.

Basically speaking, plugins do following:
 - recognize if a given JSON/DOM node is supported, and once recognized:
   - deserialize a custom JSON node to DOM node ( asynchronously )
   - serialize a DOM node to JSON node ( asynchronously )
 
Plugins may involve actions such as querying a remote registry, thus Datadom expects plugins to be asynchronous.


## Workflow

 - deserializing
   - datadom worker
     - detecting `custom` node type `D`.
     ? create a placeholder node `N`
     - deserialize `D.child`, append them into `N`.
     - deserialize `D.plug` to a list of node `PS`.
       - `plug` serves the purpose similar to `slot` in HTML5's Custom Element.
     - find matched plugin `P` based on plugin's `name` / `version` and JSON's `plugin` field.
     - deserialize `D` with `P.deserialize`, with following input:
       - `N` - root of the priori-deserialized children.
       - `D` - current data node
       - `PS` - list of plugs
   - plugin deserializer
     - prepare DOM. If need, link it with a helper object for storing in-element data.
       - it depends on plugin about how `N`, `PS` is handled, and how `D` is stored.
     - return value:
       - return Element - synchronously return an element `N'` representing current data node.
         - `N` is then replaced by `N'` in DOM tree if `N` != `N'`
       - return Promise - asynchronously return an element `N'` representing current data node.
         - `N` then be replaced by `N'` in the DOM tree, if `N` != `N'`
         - `.. loading ..` shown in `N` before promise resolved.
       - return Object - expect both an element and a promise is returned in object like `{node, promise}`.
       - otherwise - error.
   - datadom worker 
     - add attr `dd-plugin` to Node ( `N` & `N'` ) with value `plugin.name`@`plugin.version` 
       - for identifying custom Node
       - it depends on plugins how to keep additional data for, such as, `data` field or other information.
       - this also means that plugin must return a node supporting `setAttribute` method.


## Specification

A typical plugin contains following fields:

 - `name`: plugin name, follow npm package name convention.
 - `version`: plugin version, in `semver` format.
 - `serialize({data, node, plugins, window})`: serialize a give node into data.
   - should always serialize into the given `data` object.
   - need to help serialize corresponding nodes into plugs and child.
 - `deserialize({data, node, plugs, plugins, window})`: deserialize a give datadom node from data.
   - if there are any returned DOM constructed locally, it should help create custom object for any custom elements.
   - should help integrate DOM from child and plug.


## Wrapping Object

When JSON is converting to DOM node, we may have additional data to store somewhere with the DOM node. Plugins should take care of this, and make sure the stored data will be correctly serialized when necessary.

The suggested way is to link an intermediate object with DOM node by `WeakMap`:

    wm = new WeakMap!
    deserialize = ({node, data}) ->
      obj = create-obj(data{data})
      wm.set(node, obj)
    serialize = ({node, data}) ->
      obj = wm.get(node)
      data.data <<< obj.serialize() 

