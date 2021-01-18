// Generated by LiveScript 1.6.0
(function(){
  var rescope, sanitize, pubsub, block;
  rescope = typeof window != 'undefined' && window !== null
    ? window.rescope
    : (typeof module != 'undefined' && module !== null) && (typeof require != 'undefined' && require !== null) ? require("@plotdb/rescope") : null;
  sanitize = function(code){
    return code || '';
  };
  pubsub = function(){
    this.subs = {};
    return this;
  };
  pubsub.prototype = import$(Object.create(Object.prototype), {
    fire: function(name){
      var args, res$, i$, to$, ref$;
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      args = res$;
      return ((ref$ = this.subs)[name] || (ref$[name] = [])).map(function(it){
        return it.apply(null, args);
      });
    },
    on: function(name, cb){
      var ref$;
      return ((ref$ = this.subs)[name] || (ref$[name] = [])).push(cb);
    }
  });
  block = {};
  block.scope = new rescope({
    global: window
  });
  block.manager = function(opt){
    opt == null && (opt = {});
    this.hash = {};
    this.setRegistry(opt.registry);
    return this;
  };
  block.manager.prototype = import$(Object.create(Object.prototype), {
    init: function(){
      return block.scope.init();
    },
    setRegistry: function(it){
      var ref$;
      this.reg = it || '';
      if (typeof this.reg === 'string') {
        if (this.reg && (ref$ = this.reg)[ref$.length - 1] !== '/') {
          return this.reg += '/';
        }
      }
    },
    set: function(opt){
      var opts, this$ = this;
      opt == null && (opt = {});
      opts = Array.isArray(opt)
        ? opt
        : [opt];
      return Promise.all(opts.map(function(obj){
        var name, version, b, ref$;
        name = obj.name, version = obj.version;
        b = obj instanceof block['class']
          ? obj
          : obj.block;
        ((ref$ = this$.hash)[name] || (ref$[name] = {}))[version] = b;
        return b.init();
      }));
    },
    getUrl: function(arg$){
      var name, version;
      name = arg$.name, version = arg$.version;
      if (typeof this.reg === 'function') {
        return this.reg({
          name: name,
          version: version
        });
      } else {
        return (this.reg || '') + "/block/" + name + "/" + version;
      }
    },
    get: function(opt){
      var opts, this$ = this;
      opt == null && (opt = {});
      opts = Array.isArray(opt)
        ? opt
        : [opt];
      return Promise.all(opts.map(function(opt){
        var ref$, n, v;
        opt == null && (opt = {});
        console.log(">>>", opt);
        ref$ = [opt.name, opt.version || 'latest'], n = ref$[0], v = ref$[1];
        if (!(n && v)) {
          return Promise.reject((ref$ = new Error(), ref$.name = "ldError", ref$.id = 1015, ref$));
        }
        if (((ref$ = this$.hash)[n] || (ref$[n] = {}))[v] != null && !opt.force) {
          return this$.hash[n][v]
            ? Promise.resolve(this$.hash[n][v])
            : Promise.reject((ref$ = new Error(), ref$.name = "ldError", ref$.id = 404, ref$));
        }
        return ld$.fetch(this$.getUrl({
          name: opt.name,
          version: opt.version
        }), {
          method: 'GET'
        }, {
          type: 'text'
        }).then(function(ret){
          var obj, b;
          ret == null && (ret = {});
          this$.set(obj = {
            name: n,
            version: v,
            block: b = new block['class']({
              code: ret,
              name: n,
              version: v
            })
          });
          if (ret.version && ret.version !== v) {
            this$.set((obj.version = ret.version, obj));
          }
          return b.init().then(function(){
            return b;
          });
        });
      })).then(function(it){
        if (Array.isArray(opt)) {
          return it;
        } else {
          return it[0];
        }
      });
    }
  });
  block['class'] = function(opt){
    var code, div, node, this$ = this;
    opt == null && (opt = {});
    this.opt = opt;
    this.scope = "_" + Math.random().toString(36).substring(2);
    this.inited = false;
    this.initing = false;
    this.name = opt.name;
    this.version = opt.version;
    this.extend = opt.extend;
    code = opt.code;
    if (opt.root) {
      code = opt.root.innerHTML;
    }
    if (typeof code === 'function') {
      code = code();
    }
    if (typeof code === 'string') {
      this.code = sanitize(code);
      div = document.createElement("div");
      div.innerHTML = this.code;
      if (div.childNodes.length > 1) {
        console.warn("DOM definition of a block should contain only one root.");
      }
      node = div.childNodes[0];
    } else if (typeof code === 'object') {
      this.script = code.script;
      this.style = code.style;
      code = code.dom instanceof Function
        ? code.dom()
        : code.dom;
      this.code = sanitize(code);
      div = document.createElement("div");
      div.innerHTML = this.code;
      if (div.childNodes.length > 1) {
        console.warn("DOM definition of a block should contain only one root.");
      }
      node = div.childNodes[0];
    }
    if (!node) {
      node = document.createElement('div');
    }
    ['script', 'style', 'link'].map(function(n){
      var v;
      v = Array.from(node.querySelectorAll(n)).map(function(it){
        it.parentNode.removeChild(it);
        return it.textContent;
      }).join('\n');
      return this$[n] = v != null && v
        ? v
        : this$[n] || "";
    });
    this.datadom = new datadom({
      node: node
    });
    this.init = proxise(function(){
      if (this$.inited) {
        return Promise.resolve();
      } else if (!this$.initing) {
        return this$._init();
      }
    });
    return this;
  };
  block['class'].prototype = import$(Object.create(Object.prototype), {
    _init: function(){
      var this$ = this;
      if (this.inited) {
        return Promise.resolve();
      }
      this.initing = true;
      return this.datadom.init().then(function(){
        var ret, ref$, k, v;
        this$['interface'] = (this$.script instanceof Function
          ? this$.script()
          : typeof this$.script === 'object'
            ? this$.script
            : eval(this$.script || '')) || {};
        document.body.appendChild(this$.styleNode = document.createElement("style"));
        this$.styleNode.setAttribute('type', 'text/css');
        this$.styleNode.textContent = ret = csscope({
          scope: "*[scope=" + this$.scope + "]",
          css: this$.style,
          scopeTest: "[scope]"
        });
        this$.factory = function(){
          var args, res$, i$, to$;
          res$ = [];
          for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
            res$.push(arguments[i$]);
          }
          args = res$;
          if (this.init) {
            this.init.apply(this, args);
          }
          return this;
        };
        this$.factory.prototype = import$((ref$ = Object.create(Object.prototype), ref$.init = function(){}, ref$.destroy = function(){}, ref$), this$['interface']);
        this$.dependencies = Array.isArray(((ref$ = this$['interface']).pkg || (ref$.pkg = {})).dependencies)
          ? ((ref$ = this$['interface']).pkg || (ref$.pkg = {})).dependencies
          : (function(){
            var ref$, ref1$, results$ = [];
            for (k in ref$ = ((ref1$ = this['interface']).pkg || (ref1$.pkg = {})).dependencies || {}) {
              v = ref$[k];
              results$.push(v);
            }
            return results$;
          }.call(this$));
        return block.scope.load(this$.dependencies);
      }).then(function(){
        return this$.inited = true, this$.initing = false, this$;
      }).then(function(){
        return this$.init.resolve();
      })['catch'](function(e){
        var node;
        console.error(e);
        node = document.createElement("div");
        node.innerText = "failed";
        this$.datadom = new datadom({
          node: node
        });
        return this$.datadom.init().then(function(){
          this$['interface'] = {};
          this$.styleNode = {};
          this$.factory = function(){
            return this;
          };
          this$.dependencies = [];
          this$.inited = true;
          this$.initing = false;
          return this$.init.resolve();
        });
      })['catch'](function(){
        return this$.init.reject();
      });
    },
    getDomNode: function(){
      return this.datadom.getNode();
    },
    getDatadom: function(){
      return this.datadom;
    },
    getDomData: function(){
      return this.datadom.getData();
    },
    create: function(){
      var ret;
      ret = new block.instance({
        block: this
      });
      return ret.init().then(function(){
        return ret;
      });
    },
    resolvePlugAndCloneNode: function(child){
      var node;
      node = this.getDomNode().cloneNode(true);
      if (child) {
        Array.from(node.querySelectorAll('plug')).map(function(it){
          var name, n;
          name = it.getAttribute('name');
          n = child.querySelector(":scope :not([plug]) [plug=" + name + "], :scope > [plug=" + name + "]");
          if (n) {
            return it.replaceWith(n);
          }
        });
      }
      return this.extend ? this.extend.resolvePlugAndCloneNode(node) : node;
    }
  });
  block.instance = function(opt){
    var this$ = this;
    opt == null && (opt = {});
    this.block = opt.block;
    this.datadom = new datadom({
      data: JSON.parse(JSON.stringify(this.block.getDomData()))
    });
    this.inited = false;
    this.initing = false;
    this.init = proxise(function(){
      if (this$.inited) {
        return Promise.resolve();
      } else if (!this$.initing) {
        return this$._init();
      }
    });
    return this;
  };
  block.instance.prototype = import$(Object.create(Object.prototype), {
    _init: function(){
      var this$ = this;
      if (this.inited) {
        return Promise.resolve();
      }
      return this.datadom.init().then(function(){
        this$.inited = true;
        this$.initing = false;
        return this$.init.resolve();
      });
    },
    attach: function(arg$){
      var root, this$ = this;
      root = arg$.root;
      return this.getDomNode().then(function(node){
        var _root;
        node.setAttribute('scope', this$.block.scope);
        _root = typeof root === 'string' ? document.querySelector(root) : root;
        _root.appendChild(node);
        return this$.run({
          node: node,
          type: 'init'
        });
      });
    },
    detach: function(){
      var this$ = this;
      return this.getDomNode().then(function(node){
        node.parentNode.removeChild(node);
        return this$.run({
          node: node,
          type: 'destroy'
        });
      });
    },
    update: function(ops){
      return this.datadom.update(ops);
    },
    getDatadom: function(){
      return this.datadom;
    },
    getDomNode: function(){
      var that;
      return Promise.resolve((that = this.node)
        ? that
        : this.node = this.block.resolvePlugAndCloneNode());
    },
    getDomData: function(){
      return Promise.resolve(this.datadom.getData());
    },
    run: function(arg$){
      var node, type, cs, c, _, this$ = this;
      node = arg$.node, type = arg$.type;
      cs = [];
      c = this.block;
      if (!this.obj) {
        this.obj = [];
      }
      if (!this.pubsub) {
        this.pubsub = new pubsub();
      }
      while (c) {
        cs = [c].concat(cs);
        c = c.extend;
      }
      _ = function(list, idx, gtx, parent){
        var b;
        list == null && (list = []);
        idx == null && (idx = 0);
        gtx == null && (gtx = {});
        if (list.length <= idx) {
          return;
        }
        b = list[idx];
        return block.scope.context(b.dependencies || [], function(ctx){
          var payload, o;
          import$(gtx, ctx);
          payload = {
            root: node,
            context: gtx,
            parent: parent,
            pubsub: this$.pubsub
          };
          if (type === 'init') {
            this$.obj.push(o = new b.factory(payload));
          } else if (o = this$.obj[it]) {
            this$.obj[it](payload);
          }
          return _(list, idx + 1, gtx, o);
        });
      };
      return _(cs, 0, {});
    }
  });
  if (typeof module != 'undefined' && module !== null) {
    module.exports = block;
  }
  if (typeof window != 'undefined' && window !== null) {
    window.block = block;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
