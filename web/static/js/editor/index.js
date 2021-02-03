(function(it){
  return it();
})(function(){
  var lc, sdb, watch, pluginTestObj, pluginTest, plugins;
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
  pluginTestObj = function(opt){
    var ref$;
    opt == null && (opt = {});
    this.data = {
      data: (ref$ = opt.data || {}).data,
      dev: ref$.dev
    };
    this.data.dev = true;
    return this;
  };
  pluginTestObj.prototype = import$(Object.create(Object.prototype), {
    serialize: function(){
      var ref$;
      return {
        data: (ref$ = this.data).data,
        dev: ref$.dev
      };
    }
  });
  window.pt = pluginTest = {
    name: "plugin-test",
    version: "0.0.1",
    map: {
      set: function(node, obj){
        console.log(node);
        if (!pluginTest.map.wm) {
          pluginTest.map.wm = new WeakMap();
        }
        return pluginTest.map.wm.set(node, obj);
      },
      get: function(node){
        if (!pluginTest.map.wm) {
          pluginTest.map.wm = new WeakMap();
        }
        return pluginTest.map.wm.get(node);
      }
    },
    serialize: function(arg$){
      var rootData, node, plugins, window, obj;
      rootData = arg$.data, node = arg$.node, plugins = arg$.plugins, window = arg$.window;
      console.log("serialize ", node);
      obj = pluginTest.map.get(node);
      if (obj) {
        import$(rootData, obj.serialize());
      }
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
      console.log("deserialize", node);
      pluginTest.map.set(node, new pluginTestObj({
        data: data
      }));
      console.log("reget", pluginTest.map.get(node));
      return node;
    }
  };
  plugins = [block.plugin, pluginTest];
  return block.plugin.init().then(function(){
    var view;
    view = new ldView({
      root: document.body,
      action: {
        click: {
          "load-ce": function(){
            fs.writeFileSync('blank', "//- pug\ndiv(dd-plugin=\"plugin-test@0.0.1\") hi");
            lc.ed.setFiles(fs);
            lc.ed.open('blank');
            return lc.ed.render();
          },
          "load-block": function(){
            fs.writeFileSync('blank', "//- pug\ndiv(dd-plugin=\"@plotdb/block@0.0.1\",name=\"long-answer\")");
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
              domroot.appendChild(node);
              return promise.then(function(){
                return datadom.serialize(node, plugins);
              });
            }).then(function(arg$){
              var data, promise;
              data = arg$.data, promise = arg$.promise;
              return promise.then(function(){
                return console.log(data);
              });
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
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}