var editlet;
editlet = function(opt){
  opt == null && (opt = {});
  return this;
};
editlet.prototype = import$(Object.create(Object.prototype), {
  on: function(n, cb){
    var ref$;
    return ((ref$ = !this.evtHandler
      ? this.evtHandler = {}
      : this.evtHandler)[n] || (ref$[n] = [])).push(cb);
  },
  fire: function(n){
    var v, res$, i$, to$, ref$, len$, cb, results$ = [];
    res$ = [];
    for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
      res$.push(arguments[i$]);
    }
    v = res$;
    for (i$ = 0, len$ = (ref$ = (this.evtHandler || {})[n] || []).length; i$ < len$; ++i$) {
      cb = ref$[i$];
      results$.push(cb.apply(this, v));
    }
    return results$;
  },
  set: function(arg$){
    var content, type, name;
    content = arg$.content, type = arg$.type, name = arg$.name;
  },
  get: function(){},
  config: function(){}
});
editlet.cm = function(opt){
  var cm, bbox, modes, this$ = this;
  opt == null && (opt = {});
  this.lc = {};
  this.opt = opt;
  this.root = typeof opt.root === 'string'
    ? document.querySelector(opt.root)
    : opt.root;
  this.cm = cm = CodeMirror(this.root, import$({
    mode: 'htmlmixed',
    lineNumbers: true,
    theme: 'ayu-mirage',
    lineWrapping: true,
    keyMap: "default",
    showCursorWhenSelecting: true,
    viewportMargin: Infinity
  }, opt.cm || {}));
  bbox = this.root.getBoundingClientRect();
  cm.setSize(bbox.width, bbox.height);
  cm.setValue('');
  modes = {
    html: 'htmlmixed',
    styl: 'stylus',
    js: 'javascript'
  };
  cm.on('change', debounce(function(){
    var ret;
    if (!this$.lc.type) {
      ret = transpiler.detect(cm.getValue());
      if (ret.name) {
        return cm.setOption('mode', modes[ret.name] || ret.name);
      }
    }
  }));
  cm.on('change', function(){
    return this$.fire('change');
  });
  return this;
};
editlet.cm.prototype = import$(Object.create(editlet.prototype), {
  set: function(arg$){
    var content, type, name;
    content = arg$.content, type = arg$.type, name = arg$.name;
    this.cm.setValue(content);
    if (type != null) {
      this.lc.type = type;
    }
    if (name != null) {
      return this.lc.name = name;
    }
  },
  get: function(){
    return this.cm.getValue();
  },
  config: function(){}
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}