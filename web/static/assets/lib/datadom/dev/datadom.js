// Generated by LiveScript 1.6.0
(function(){
  var samplePlugin, wrap, serialize, deserialize, locate, main;
  samplePlugin = function(n, plugin){
    var node, promise;
    node = document.createElement('div');
    node.textContent = "loading...";
    promise = Promise.resolve().then(function(){
      return blockManager.get({
        name: n.name,
        version: n.version
      });
    }).then(function(b){
      return b.instantiate().then(function(ret){
        var that, x$;
        if (that = node.parentNode) {
          x$ = that;
          x$.insertBefore(ret.node, node);
          x$.removeChild(node);
          return x$;
        } else {
          return ret;
        }
      });
    })['catch'](function(){
      console.log("block-manager.get failed in deserialize ( " + n.name + "@" + n.version + " )");
      return node.innerText = "load fail.";
    });
    return {
      node: node,
      promise: promise
    };
  };
  /**
   * convert a DOM Node into JSON.
   * @param {Element} n - DOM node.
   * @return {json} a json object containing information of the input DOM Node.
   */
  wrap = function(n){
    var name, style, i, attr, v, cls;
    name = n.nodeName.toLowerCase();
    if (name === '#text') {
      return {
        type: 'text',
        value: n.nodeValue
      };
    }
    if (name === '#comment') {
      return {
        type: 'comment',
        value: n.nodeValue
      };
    }
    if (name === '#document-fragment') {
      return {
        type: 'document-fragment'
      };
    }
    style = n.style
      ? (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = n.style.length; i$ < to$; ++i$) {
          i = i$;
          results$.push(i);
        }
        return results$;
      }()).map(function(it){
        return [n.style[it], n.style[n.style[it]]];
      })
      : [];
    attr = n.attributes
      ? (function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = n.attributes).length; i$ < len$; ++i$) {
          v = ref$[i$];
          results$.push([v.nodeName, v.nodeValue]);
        }
        return results$;
      }()).filter(function(it){
        var ref$;
        return !((ref$ = it[0]) === 'style' || ref$ === 'class');
      })
      : [];
    cls = n.classList
      ? (function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = n.classList).length; i$ < len$; ++i$) {
          v = ref$[i$];
          results$.push(v);
        }
        return results$;
      }())
      : [];
    return {
      type: 'tag',
      name: name,
      style: style,
      attr: attr,
      cls: cls
    };
  };
  /**
   * serialize a DOM tree.
   * @param {Element} n - DOM tree root node.
   * @return {json} a serialized JSON representing the input DOM.
   */
  serialize = function(n, plugin){
    var node, child, i$, to$, i, ret;
    node = wrap(n);
    child = [];
    if (!n.childNodes) {
      return;
    }
    for (i$ = 0, to$ = n.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      ret = serialize(n.childNodes[i], plugin);
      child.push(ret);
    }
    node.child = child;
    return node;
  };
  /**
   * deserialize a JSON into corresponding DOM tree.
   * @param {json} n - JSON representation of a serialized DOM tree.
   * @param {Function} plugin - optional plugin function to handle custom type DOM Node.
   * @return {Promise} - a promise resolving to an object containing following fields:
   *   - node {Element}: deserialized DOM tree or placeholder div for being replaced by instantiated block.
   *   - promise {Promise}: resolve to all pending block retrieval.
   */
  deserialize = function(n, plugin){
    var queue;
    queue = [];
    return Promise.resolve().then(function(){
      var _;
      _ = function(n){
        var node, i$, ref$, len$, c, ret, promise;
        switch (n.type) {
        case 'text':
          return document.createTextNode(n.value);
        case 'comment':
          return document.createComment(n.value);
        case 'document-fragment':
          node = document.createDocumentFragment();
          for (i$ = 0, len$ = (ref$ = n.child || []).length; i$ < len$; ++i$) {
            c = ref$[i$];
            ret = _(c);
            if (ret) {
              node.appendChild(ret);
            }
          }
          return node;
        case 'tag':
          node = document.createElement(n.name);
          n.attr.filter(function(it){
            return it && it[0];
          }).map(function(p){
            return node.setAttribute(p[0], p[1]);
          });
          n.style.filter(function(it){
            return it && it[0];
          }).map(function(p){
            return node.style[p[0]] = p[1];
          });
          if (n.cls && n.cls.length) {
            node.classList.add.apply(node.classList, n.cls.filter(function(it){
              return it;
            }));
          }
          for (i$ = 0, len$ = (ref$ = n.child || []).length; i$ < len$; ++i$) {
            c = ref$[i$];
            ret = _(c);
            if (ret) {
              node.appendChild(ret);
            }
          }
          return node;
        default:
          if (!plugin) {
            node = document.createElement('div');
            node.textContent = "(unknown)";
            return node;
          } else {
            ret = plugin(n, plugin);
          }
          if (ret instanceof Promise) {
            ref$ = [document.createElement('div'), ret], node = ref$[0], promise = ref$[1];
            node.textContent = "loading...";
          } else if (ret instanceof Element) {
            ref$ = [ret, null], node = ref$[0], promise = ref$[1];
          } else {
            node = ret.node, promise = ret.promise;
          }
          if (promise) {
            queue.push(promise);
          }
          return node;
        }
      };
      return _(n);
    }).then(function(node){
      return {
        node: node,
        promise: Promise.all(queue)
      };
    });
  };
  /**
   * apply op based on a data / root pair.
   * @param {json} op - operational transformation
   * @param {json} data - serialized DOM tree
   * @param {Element} root - root of the corresponding DOM tree
   */
  locate = function(op, data, root){
    var n, obj, dd, i$, i, ref$, to$, j, p;
    n = obj = root;
    dd = data;
    for (i$ = op.p.length - 1; i$ >= 0; --i$) {
      i = i$;
      if ((ref$ = op.p[i]) === 'attr' || ref$ === 'style' || ref$ === 'cls' || ref$ === 'child' || ref$ === 'name' || ref$ === 'value' || ref$ === 'type') {
        break;
      }
    }
    for (i$ = 0, to$ = i - 1; i$ < to$; ++i$) {
      j = i$;
      p = op.p[i];
      obj = p === 'child' ? obj.childNodes : obj;
      dd = dd[p];
    }
    switch (op.p[i]) {
    case 'name':
    case 'value':
    case 'type':
      return deserialize(dd).then(function(arg$){
        var node, promise;
        node = arg$.node, promise = arg$.promise;
        obj.parentNode.insertBefore(node, obj);
        return obj.parentNode.removeChild(obj);
      });
    case 'style':
      obj.setAttribute('style', '');
      return dd.style.map(function(it){
        return obj.style[it[0]] = it[1];
      });
    case 'cls':
      return obj.setAttribute('class', dd.cls.join(' '));
    case 'attr':
      Array.from(obj.attributes).map(function(it){
        var ref$;
        if (!dd.attr[it.name] && !((ref$ = it.name) === 'block' || ref$ === 'style' || ref$ === 'class')) {
          return obj.removeAttribute(it.name);
        }
      });
      return dd.attr.map(function(it){
        return obj.setAttribute(it[0], it[1]);
      });
    case 'child':
      if (op.ld) {
        obj.removeChild(obj.childNodes[op.p[i + 1]]);
      }
      if (op.li) {
        return deserialize(op.li).then(function(arg$){
          var node, promise;
          node = arg$.node, promise = arg$.promise;
          return obj.insertBefore(node, obj.childNodes[op.p[i + 1]]);
        });
      }
    }
  };
  main = function(opt){
    var that;
    opt == null && (opt = {});
    this.opt = opt;
    this.plugins = (that = Array.isArray(opt.plugin))
      ? that
      : opt.plugin
        ? [opt.plugin]
        : [];
    if (opt.data) {
      this.data = opt.data;
    } else if (opt.node) {
      this.node = opt.node;
    }
    return this;
  };
  main.prototype = import$(Object.create(Object.prototype), {
    plugin: function(o, p){
      if (this.plugins.length) {
        return this.plugins.map(function(it){
          return it(o, p);
        });
      } else {
        return o;
      }
    },
    init: function(){
      var this$ = this;
      if (this.node) {
        return Promise.resolve().then(function(){
          return this$.data = serialize(this$.node, function(o, p){
            return this$.plugin(o, p);
          });
        });
      } else {
        return deserialize(this.data, function(o, p){
          return this$.plugin(o, p);
        }).then(function(arg$){
          var node, promise;
          node = arg$.node, promise = arg$.promise;
          this$.node = node;
          return promise;
        });
      }
    },
    getData: function(){
      return this.data;
    },
    getNode: function(){
      return this.node;
    },
    update: function(ops){
      var i$, len$, op, results$ = [];
      ops == null && (ops = []);
      for (i$ = 0, len$ = ops.length; i$ < len$; ++i$) {
        op = ops[i$];
        json0.type.apply(this.data, [op]);
        results$.push(locate(op, this.data, this.node));
      }
      return results$;
    }
  });
  main.serialize = serialize;
  main.deserialize = deserialize;
  if (typeof module != 'undefined' && module !== null) {
    module.exports = main;
  }
  if (typeof window != 'undefined' && window !== null) {
    window.datadom = main;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
