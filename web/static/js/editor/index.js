(function(){
  var lc, sdb, watch;
  lc = {};
  sdb = new sharedbWrapper();
  watch = function(ops, source){
    var remote;
    json0.type.apply(lc.data, ops);
    remote = ld$.find('[ld=remote]', 0);
    remote.innerHTML = "";
    return datadom.deserialize(lc.data).then(function(arg$){
      var node, promise;
      node = arg$.node, promise = arg$.promise;
      remote.appendChild(node);
      return console.log(ops, source);
    });
  };
  return sdb.get({
    id: 'sample',
    watch: watch,
    create: function(){
      return {};
    }
  }).then(function(doc){
    lc.doc = doc;
    lc.data = JSON.parse(JSON.stringify(doc.data));
    return getfa('sample').then(function(fs){
      var renderDatadom, ed;
      fs.writeFileSync('blank', "//- pug\ndoctype html\nhtml\n  head\n  body\n    h1 hello world!");
      renderDatadom = function(code){
        var div, json, node, domroot, ops;
        div = document.createElement("div");
        div.innerHTML = code;
        json = datadom.serialize(div);
        node = ld$.find('[ld=json]', 0);
        node.innerText = JSON.stringify(json, null, 2);
        domroot = ld$.find('[ld=dom]', 0);
        datadom.deserialize(json).then(function(arg$){
          var node, promise;
          node = arg$.node, promise = arg$.promise;
          domroot.innerHTML = "";
          return domroot.appendChild(node);
        });
        console.log(json);
        ops = json0.diff(doc.data, json);
        return doc.submitOp(ops);
      };
      ed = new Editor({
        node: {
          edit: '[ld=editor]',
          view: '[ld=viewer]'
        },
        editlet: {},
        renderer: function(arg$){
          var fs, payload, k, v, ret;
          fs = arg$.fs;
          if (!fs) {
            return;
          }
          payload = {
            html: fs.readFileSync('blank').toString()
          };
          for (k in payload) {
            v = payload[k];
            ret = transpiler.detect(v);
            if (ret.mod && ret.mod.transform) {
              payload[k] = ret.mod.transform(v);
            }
            renderDatadom(payload.html);
          }
          return payload;
        }
      });
      ed.setFiles(fs);
      return ed.open('blank');
    });
  });
})();