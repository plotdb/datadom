(function(){
  var transpiler;
  transpiler = {
    detect: function(c){
      var k, ref$, v;
      for (k in ref$ = transpiler.mod) {
        v = ref$[k];
        if (v.test(c)) {
          return {
            name: k,
            mod: v
          };
        }
      }
      return {};
    },
    mod: {
      lsc: {
        destype: 'js',
        test: function(v){
          v == null && (v = '');
          return (typeof lsc != 'undefined' && lsc !== null) && v.startsWith('#- lsc');
        },
        transform: function(v){
          v == null && (v = '');
          return lsc.compile(v, {
            bare: true,
            header: false
          }).replace(/^\(/, '').replace(/\);$/, '');
        }
      },
      pug: {
        destype: 'html',
        test: function(v){
          v == null && (v = '');
          return (typeof pug != 'undefined' && pug !== null) && v.startsWith('//- pug');
        },
        transform: function(v){
          v == null && (v = '');
          return pug.render(v, {
            filename: 'index.pug',
            basedir: '.'
          });
        }
      },
      md: {
        destype: 'html',
        test: function(v){
          v == null && (v = '');
          return (typeof marked != 'undefined' && marked !== null) && v.startsWith('<!-- md -->');
        },
        transform: function(v){
          v == null && (v = '');
          return marked(v);
        }
      },
      styl: {
        destype: 'css',
        test: function(v){
          v == null && (v = '');
          return (typeof stylus != 'undefined' && stylus !== null) && v.startsWith('//- stylus');
        },
        transform: function(v){
          v == null && (v = '');
          return stylus.render(v);
        }
      },
      xml: {
        test: function(v){
          v == null && (v = '');
          return v.startsWith('<?xml');
        }
      }
    }
  };
  if (typeof window != 'undefined' && window !== null) {
    window.transpiler = transpiler;
  }
  if (typeof module != 'undefined' && module !== null) {
    return module.exports = transpiler;
  }
})();