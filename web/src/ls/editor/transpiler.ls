(->
  transpiler = do
    detect: (c) ->
      for k,v of transpiler.mod =>
        if v.test c => return {name: k, mod: v}
      return {}

    mod: do
      lsc: do
        destype: \js
        test: (v = '') -> lsc? and v.startsWith '#- lsc'
        transform: (v = '') -> lsc.compile(v,{bare: true, header: false}).replace(/^\(/,'').replace(/\);$/,'')
      pug: do
        destype: \html
        test: (v = '') -> pug? and v.startsWith '//- pug'
        transform: (v = '') -> pug.render v, {filename: 'index.pug', basedir: '.'}
      md: do
        destype: \html
        test: (v = '') -> marked? and v.startsWith '<!-- md -->'
        transform: (v = '') -> marked v
      styl: do
        destype: \css
        test: (v = '') -> stylus? and v.startsWith '//- stylus'
        transform: (v = '') -> stylus.render v
      xml: do
        test: (v = '') -> v.startsWith '<?xml'

  if window? => window.transpiler = transpiler
  if module? => module.exports = transpiler
)!
