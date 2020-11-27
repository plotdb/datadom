editlet = (opt = {}) -> @
editlet.prototype = Object.create(Object.prototype) <<< do
  on: (n, cb) -> (if !@evt-handler => @evt-handler = {} else @evt-handler)[][n].push cb
  fire: (n, ...v) -> for cb in ((@evt-handler or {})[n] or []) => cb.apply @, v
  set: ({content, type, name}) ->
  get: ->
  config: ->

editlet.cm = (opt = {}) ->
  @lc = {}
  @opt = opt
  @root = if typeof(opt.root) == \string => document.querySelector(opt.root) else opt.root
  @cm = cm = CodeMirror(
    @root, ({
      mode: \htmlmixed
      lineNumbers: true
      theme: \ayu-mirage
      lineWrapping: true
      keyMap: "default" # or, vim
      showCursorWhenSelecting: true
      viewportMargin: Infinity
    } <<< (opt.cm or {}))
  )
  bbox = @root.getBoundingClientRect!
  cm.setSize bbox.width, bbox.height
  cm.setValue ''
  modes = html: \htmlmixed, styl: \stylus, js: \javascript
  cm.on \change, debounce ~>
    if !@lc.type =>
      ret = transpiler.detect cm.getValue!
      if ret.name => cm.setOption \mode, (modes[ret.name] or ret.name)
  cm.on \change, ~> @fire \change 
  @

editlet.cm.prototype = Object.create(editlet.prototype) <<< do
  set: ({content,type,name}) ->
    @cm.setValue content
    if type? => @lc.type = type
    if name? => @lc.name = name
  get: -> @cm.getValue!
  config: -> 

