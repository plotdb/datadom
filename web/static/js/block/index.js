block.plugin.init().then(function(){
  var dd;
  dd = new datadom({
    data: sampleData,
    plugins: [block.plugin]
  });
  return dd.init();
}).then(function(arg$){
  var node, promise;
  node = arg$.node, promise = arg$.promise;
  root.appendChild(node);
  return promise;
}).then(function(){
  return console.log('deserialized. now try serializing again ... ');
}).then(function(){
  return datadom.serialize(root.childNodes[0], [block.plugin], window);
}).then(function(arg$){
  var data, promise;
  data = arg$.data, promise = arg$.promise;
  return promise.then(function(){
    return data;
  });
}).then(function(data){
  console.log("serialized data: ", data);
  console.log("serialized. deserialize again ...");
  return datadom.deserialize(data, [block.plugin], window);
}).then(function(arg$){
  var node, promise;
  node = arg$.node, promise = arg$.promise;
  rootalt.appendChild(node);
  return promise;
}).then(function(){
  return console.log("deserialized.");
})['catch'](function(it){
  return console.log(it);
});