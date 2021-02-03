var loadSample, manager, wm;
loadSample = function(arg$){
  var name;
  name = arg$.name;
  return manager.get({
    name: name,
    version: "0.0.1"
  }).then(function(it){
    return it.create();
  }).then(function(it){
    return it.attach({
      root: document.getElementById('container')
    });
  })['catch'](function(it){
    return console.log("failed to load block " + name, it);
  });
};
manager = new block.manager({
  registry: function(arg$){
    var name, version;
    name = arg$.name, version = arg$.version;
    return "/block/" + name + "/" + version + "/index.html";
  }
});
wm = new WeakMap();
block.from = function(node){
  return wm.get(node);
};
block.set = function(node, obj){
  return wm.set(node, obj);
};
block.plugin = {
  name: "@plotdb/block",
  version: "0.0.1",
  possess: function(o){
    var obj;
    obj = {
      name: o.node.getAttribute('name'),
      version: o.node.getAttribute('version')
    };
    return wm.set(o.node, obj);
  },
  serialize: function(o){
    var p;
    p = !block.from(o.node)
      ? datadom.possess(o.node, o.plugins)
      : Promise.resolve();
    return p.then(function(){
      var obj, ref$;
      if (!(obj = block.from(o.node))) {
        return;
      }
      ref$ = o.data;
      ref$.name = obj.name;
      ref$.version = obj.version;
      return o.data.child = [];
    });
  },
  deserialize: function(o){
    return Promise.resolve().then(function(){
      return manager.get({
        name: o.data.name,
        version: "0.0.1"
      });
    }).then(function(ret){
      return debounce(2000).then(function(){
        return ret;
      });
    }).then(function(it){
      return it.create();
    }).then(function(it){
      o.node.block = it;
      return it.attach({
        root: o.node
      });
    }).then(function(){
      return o.node;
    });
  },
  init: function(){
    return manager.init();
  }
};