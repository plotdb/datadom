var loadSample, manager;
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
block.plugin = {
  name: "@plotdb/block",
  version: "0.0.1",
  possess: function(o){},
  serialize: function(o){
    var ref$;
    ref$ = o.data;
    ref$.name = o.node.block.name;
    ref$.version = o.node.block.version;
    return o.data.child = [];
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