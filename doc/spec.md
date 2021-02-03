# Datadom Specification

`Datadom` is a JSON / DOM pair that can be converted from one to each other.


## Definition

For basic DOM elements, this is trivial. Yet we added the concept of `custom element` and thus additional care must be taken to implement it.

While it's possible to simply let web component to handle custom element concept, it brings some limitation about DOM hierarchy and global CSS. Thus datadom defines its own spec about custom element, and handle it manually.


### Data Part 

Data part of Datadom is a JSON object which can be converted to / from a DOM tree. Following are all fields of it:

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


### DOM part

DOM part of `datadom` simply follows the W3C DOM Spec - except the `custom element` part.

For distinguishing, we name this `custom element` concept as `custom node`, in case of confusion. And its counter part - the converted data - is called `custom data`.

A custom node is defined as an plain DOM element with:

 - element name: either a `div`, or a custom element with not-yet-specified name, may be defined in the future.
 - attribute: `dd-plugin`: with value from plugin `name@version` pair.

Depending on plugin itself, there may be additional requirements, such as:
 - `@plotdb/block` may need additional attributes, such as:
   - `name`: block name
   - `version`: block version
 - A custom node DOM will have to somehow keep its data object, named `custom object` ( discussed below ). This is beyond scope of this spec, and left for plugins to implement.


## Conversion

After data and node are defined, we still have to know how to convert between them. There are 3 types of conversion:

 - Node to Data
 - Data to Node
 - Node to Node ( uninitialized to initialized one )


### custom node → custom data

When a custom node is found ( an element `N` with `dd-plugin` attribute ):

    if !(plugin = find-plugin-for(N)) => return
    data = {type: "custom", plugin: makeName(plugin)}
    # plugin fills `data`, `child` and `plugs` and other fields if necessary.
    # it may recursively call `datadom.serialize` for doing this job.
    plugin.serialize({data, node: N, plugins})


## Convert from custom data tom custom node

When a custom data is found ( a data node `D` with type `custom` ):

    if !(plugin = find-plugin-for(D,plugins)) => return
    node = domtree-from(D.child)
    plugs = D.plugs.map (it) -> domtree-from(it)
    # plugin prepare internal object with `data`, and DOM with `child` and `plugs` fields.
    plugin.deserialize({node, plugs, data: D, pluings})


## wild node → custom node

When a DOM with `custom node` is given directly, it may not yet initialized by plugins. We will need to initialize them ( not deserialize ). This can be done by:

    datadom.possess = (node) ->
      for n in node.childNodes => if !is-custom-node(n) => datadom.possess n 
      if !is-custom-node(node) => return
      if !(plugin = find-plugin-for(node,plugins)) => return
      # plugin can recursively init its subtree with `datadom.possess`
      plugin.possess(node, plugins)
  

## custom object - data for custom node

All custom nodes keep their internal state / data in an object - called `custom object`. The underlying mechanism is defined and managed by plugins.

Generally speaking, a `custom object` should be created once a corresponding `custom node` is available, usually in the process of deserialization.

If, instead of construct DOM tree from `deserialize`, somehow plugin prepare DOM tree directly ( for example, from HTML code ), plugins are responsible to call `datadom.possess` for initializing `custom object` for all `custom node` in the sub DOM tree.
