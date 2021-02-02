# Datadom API

## Class Method

access directly via `datadom` object.

 - `datadom.serialize(node, plugins, window)` - transform DOM tree to JSON tree 
   - `node`: root of the DOM tree to transform.
   - `plugins`: array of plugins. see `plugin.md` for more information. default `[]`.
   - `window`: window object. default `window`. for running in NodeJS.
   - return a promise that resolves to `{data, promise}`:
     - `data`: converted result. may not yet ready before accompanied promise resolved.
     - `promise`: resolve when data is ready.
 - `datadom.deserialize(json, plugins, window)` - transform datadom ( JSON ) to DOM tree
   - `json` - root of a JSON tree.
   - `plugins`: array of plugins. see `plugin.md` for more information. default `[]`.
   - `window`: window object. default `window`. for running in NodeJS.
   - return a promise that resolves to `{node, promise}`:
     - `node`: converted result. may not yet ready before accompanied promise resolved.
     - `promise`: resolve when data is ready.


## Datadom Object Constructor

create a `datadom` object with:

    var obj = new datadom(opt);

where opt contains following options:

   - `plugins`: Array of plugin object. see `plugin.md` for more information. default `[]`
   - `node`: DOM tree root to parse. `data` option will be ignored if `node` is set
   - `data`: JSON in datadom format. convert to `node` if `node` is omitted.
   - `root`: container to inject generated `node`.
   - `window`: window object. default `window`. for running in NodeJS.


## Object Methods

access via `datadom` instance after created with `new data()`.

 - `init()`: create `data` / `node` from their counterpart.
 - `getData()`: get JSON object from current datadom.
 - `getNode()`: get HTML node as DOM tree root for current datadom.
 - `update(ops)`: transform current node and data by `ops`
   - `ops`: array of ot ( operational transformation )
