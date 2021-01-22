## datadom spec

`datadom` is a JSON object which can be converted to from a DOM tree. Following is the member of each node in json:

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
 - `id` - unique representation of this node with suuid.
 - `link` - connection to other node. a list of node `id`.

