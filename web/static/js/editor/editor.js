(function(){
  var Editor;
  Editor = function(opt){
    var ref$, el, ref1$, sb;
    opt == null && (opt = {});
    this.opt = opt;
    this.fs = {
      openedFile: null,
      content: {
        old: '',
        cur: ''
      }
    };
    this.ed = {};
    this.el = el = (ref1$ = {}, ref1$.edit = (ref$ = opt.node).edit, ref1$.view = ref$.view, ref1$);
    ['edit', 'view'].map(function(n){
      return el[n] = typeof el[n] === 'string'
        ? ld$.find(el[n], 0)
        : el[n];
    });
    this.addEditlet('cm');
    this.sandbox = sb = new sandbox(import$({
      container: el.view,
      className: 'w-100 h-100 border-0'
    }, opt.sandbox));
    return this;
  };
  Editor.prototype = import$(Object.create(Object.prototype), {
    addEditlet: function(name){
      var root, ref$, this$ = this;
      root = ld$.create({
        name: 'div'
      });
      this.el.edit.appendChild(root);
      this.ed[name] = new editlet[name]({
        root: root,
        opt: ((ref$ = this.opt).editlet || (ref$.editlet = {}))[name] || {}
      });
      return this.ed[name].on('change', function(){
        this$.fs.content.cur = this$.ed[name].get();
        if (this$.fs.content.old !== this$.fs.content.cur) {
          this$.update();
        }
        return this$.fs.content.old = this$.fs.content.cur;
      });
    },
    sync: function(){
      return this.render();
    },
    update: function(){
      this.fs.fs.writeFileSync(this.fs.openedFile, this.ed.cm.get());
      return this.render();
    },
    open: function(name){
      var content, e, ref$, type, that;
      try {
        content = this.fs.fs.readFileSync(name).toString();
      } catch (e$) {
        e = e$;
        console.log("file not found: ", e);
        return;
      }
      this.fs.openedFile = name;
      ref$ = this.fs.content;
      ref$.cur = content;
      ref$.old = content;
      type = (that = /\.([a-zA-Z]+)$/.exec(name)) ? that[1] : null;
      return this.ed.cm.set({
        content: content,
        name: name,
        type: type
      });
    },
    render: debounce(function(){
      var payload;
      payload = this.opt.renderer(this.fs);
      return this.sandbox.load(payload);
    }),
    setFiles: function(fs, list){
      var ref$, _;
      list == null && (list = []);
      ref$ = this.fs;
      ref$.fs = fs;
      ref$.list = list;
      if (list.length) {
        return;
      }
      _ = function(f){
        var files, i$, len$, file, results$ = [];
        files = fs.readdirSync(f).map(function(it){
          return f + "/" + it;
        });
        for (i$ = 0, len$ = files.length; i$ < len$; ++i$) {
          file = files[i$];
          if (fs.statSync(file).isDirectory()) {
            results$.push(_(file));
          } else {
            results$.push(list.push(file));
          }
        }
        return results$;
      };
      _('.');
      return this.render();
    }
  });
  if (typeof window != 'undefined' && window !== null) {
    window.Editor = Editor;
  }
  if (typeof module != 'undefined' && module !== null) {
    return module.exports = Editor;
  }
})();
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}