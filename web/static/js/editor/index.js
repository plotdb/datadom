(function(){
  return getfa('sample').then(function(fs){
    var ed;
    fs.writeFileSync('blank', 'hello index.html!');
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
        }
        return payload;
      }
    });
    ed.setFiles(fs);
    return ed.open('blank');
  });
})();