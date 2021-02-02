# Plugins

this document defines how plugins work in datadom.

## Purpose

When datadom serializes DOM into data representation ( or vice versa ),  it's possible to also serialize/deserialize something powerful than just a simple DOM node. Defining such things is beyond datadom's purpose, so datadom provides an interface for user-defined *plugins* to extend datadom.

Basically speaking, plugins does following:
 - recognize if a given data or DOM node is supported
 - (asynchronously) deserialize a recognized custom datadom node to DOM node
 - (asynchronously) serialize a recognized DOM node to custom datadom node
 
It may involve actions like querying a remote registry thus datadom expects plugins to be asynchronous, as described below.


## Workflow

 - datadom worker
   - detecting `custom` node type `D`.
   - create a placeholder node `N`
   - deserialize `D.child`, append them into `N`.
   - deserialize `D.plug` to a list of node `PS`.
     - `plug` serves the purpose similar to `slot` in HTML5's Custom Element.
   - based on plugins' `test` method, find the first matched plugins, say `P`.
   - deserialize `D` with `P.deserialize`, with following input:
     - `N` - root of the priori-deserialized children.
     - `D` - current data node
     - `PS` - list of plugs
     - a window object, for working in nodejs.
 - plugin deserializer
   - return Element - synchronously return an element `N'` representing current data node.
     - `N` then be replaced by `N'` in the DOM tree, if `N` != `N'`
   - return Promise - asynchronously return an element `N'` representing current data node.
     - `N` then be replaced by `N'` in the DOM tree, if `N` != `N'`
     - `.. loading ..` shown in `N` before promise resolved.
   - return Object - expect both an element and a promise is returned in object like `{node, promise}`.
   - otherwise - error.
 - datadom worker 
   - add attr `dd-plugin` to Node ( `N` & `N'` ) with value `plugin.id` 
     - for identifying custom Node
     - it depends on plugins how to keep additional data for, such as, `data` field or other information.
     - this also means that plugin must return a node supporting `setAttribute` method.

## Spec

 - `name`: plugin name, follow npm package name convention.
 - `version`: plugin version, in `semver` format.
 - `serialize({data, node, plugins, window})`: serialize a give node into data.
   - should always serialize into the given `data` object.
   - need to help serialize corresponding nodes into plugs and child.
 - `deserialize({data, node, plugs, plugins, window})`: deserialize a give datadom node from data.
   - if there are any returned DOM constructed locally, it should help create custom object for any custom elements.
   - should help integrate DOM from child and plug.
 - `create(node)`: create an object for this node.

