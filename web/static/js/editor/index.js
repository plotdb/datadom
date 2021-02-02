(function(it){
  return it();
})(function(){
  var lc, sdb, watch, pluginTest, plugins, view;
  lc = {};
  sdb = new sharedbWrapper();
  watch = function(ops, source){
    var remote;
    json0.type.apply(lc.data, ops);
    remote = ld$.find('[ld=remote]', 0);
    remote.innerHTML = "";
    return datadom.deserialize(lc.data, plugins).then(function(arg$){
      var node, promise, pug, pugNode;
      node = arg$.node, promise = arg$.promise;
      remote.appendChild(node);
      pug = "//- pug\n" + html2pug(remote.innerHTML, {
        fragment: true
      });
      pugNode = ld$.find('[ld=pug]', 0);
      return pugNode.innerText = pug;
    });
  };
  pluginTest = {
    name: "plugin-test",
    version: "0.0.1",
    serialize: function(arg$){
      var rootData, node, plugins, window;
      rootData = arg$.data, node = arg$.node, plugins = arg$.plugins, window = arg$.window;
      return Promise.all(Array.from(node.childNodes).map(function(n, i){
        return datadom.serialize(n, plugins);
      })).then(function(list){
        rootData.child = rootData.child.concat(list.map(function(it){
          return it.data;
        }));
        return Promise.all(list.map(function(it){
          return it.promise;
        }));
      });
    },
    deserialize: function(arg$){
      var data, node, plugs, plugins, window;
      data = arg$.data, node = arg$.node, plugs = arg$.plugs, plugins = arg$.plugins, window = arg$.window;
      return node;
    },
    create: function(){
      return console.log('create');
    }
  };
  plugins = [pluginTest];
  view = new ldView({
    root: document.body,
    action: {
      click: {
        "load-ce": function(){
          fs.writeFileSync('blank', "//- pug\ndiv(dd-plugin=\"plugin-test@0.0.1\") hi");
          lc.ed.setFiles(fs);
          lc.ed.open('blank');
          return lc.ed.render();
        }
      }
    }
  });
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
      lc.fs = fs;
      fs.writeFileSync('blank', "//- pug\nh1 hello world!");
      renderDatadom = function(code){
        var div;
        div = document.createElement("div");
        div.innerHTML = code;
        return datadom.serialize(div, plugins).then(function(arg$){
          var data, promise;
          data = arg$.data, promise = arg$.promise;
          return promise.then(function(){
            return data;
          });
        }).then(function(json){
          var node, domroot, ops;
          node = ld$.find('[ld=json]', 0);
          node.innerText = JSON.stringify(json, null, 2);
          domroot = ld$.find('[ld=dom]', 0);
          datadom.deserialize(json, plugins).then(function(arg$){
            var node, promise;
            node = arg$.node, promise = arg$.promise;
            domroot.innerHTML = "";
            return domroot.appendChild(node);
          });
          ops = json0.diff(doc.data, json);
          return doc.submitOp(ops);
        });
      };
      lc.ed = ed = new Editor({
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
});