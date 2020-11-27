# datadom api

class method:
 - datadom.serialize(root, plugin) - transform DOM tree to datadom ( JSON ) with optional plugin function.
 - datadom.deserialize(json, plugin) - transform datadom ( JSON ) to DOM tree. return a promise that resolves to:
   - node - root of DOM tree, or a placeholder element, replaced when the real DOM is prepared..
   - promise - resolve when all pending deserializes are done.
 
constructor to create a datadom object:
 - datadom(opt)
   - plugin: function or array of function
   - node: root of dom tree. ignore data if node is set
   - data: datadom json.
   - root: container

object method:
 - serialize(): return serialized json result.
 - deserialize(): return deserialized DOM tree root.
 - update(ops): transform current node and data by `ops`
   - ops: array of ot ( operational transformation )
