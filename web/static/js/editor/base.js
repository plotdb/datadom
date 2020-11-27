var pug, getfs, getfa, slice$ = [].slice;
window.pug = pug = require("pug");
window.getfs = getfs = function(){
  return new Promise(function(res, rej){
    if (window.fs) {
      return res(fs);
    }
    return e(partialize$.apply(BrowserFS, [
      BrowserFS.configure, [
        {
          fs: 'InMemery'
        }, void 8
      ], [1]
    ]), function(){
      var fs;
      if (e) {
        return rej(e);
      }
      window.fs = fs = require("fs");
      return res(fs);
    });
  });
};
window.getfa = getfa = function(dir){
  return getfs().then(function(){
    var fa;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fa = new BrowserFS.FileSystem.FolderAdapter(dir, fs);
    return fa;
  });
};
function partialize$(f, args, where){
  var context = this;
  return function(){
    var params = slice$.call(arguments), i,
        len = params.length, wlen = where.length,
        ta = args ? args.concat() : [], tw = where ? where.concat() : [];
    for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
    return len < wlen && len ?
      partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
  };
}