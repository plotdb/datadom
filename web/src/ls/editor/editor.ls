(->
  Editor = (opt = {}) ->
    @opt = opt

    # File System
    @fs = { opened-file: null, content: {old: '', cur: ''} }

    # Editlets
    @ed = {}

    # Elements
    @el = el = {} <<< opt.node{edit, view}
    <[edit view]>.map (n) -> el[n] = if typeof(el[n]) == \string => ld$.find(el[n],0) else el[n]

    # Default Editlet
    @add-editlet \cm

    @sandbox = sb = new sandbox({
      container: el.view
      className: 'w-100 h-100 border-0'
    } <<< opt.sandbox)

    @

  Editor.prototype = Object.create(Object.prototype) <<< do
    add-editlet: (name) ->
      root = ld$.create(name: 'div')
      @el.edit.appendChild root
      @ed[name] = new editlet[name] {root, opt: (@opt.{}editlet[name] or {})}
      @ed[name].on \change, ~>
        @fs.content.cur = @ed[name].get!
        if @fs.content.old != @fs.content.cur => @update!
        @fs.content.old = @fs.content.cur

    sync: ->
      # TODO - integrate changes from remote
      @render!

    update: ->
      # TODO - broadcast changes to remote
      @fs.fs.write-file-sync @fs.opened-file, @ed.cm.get!
      @render!

    open: (name) ->
      try
        content = (@fs.fs.read-file-sync name .toString!)
      catch e
        console.log "file not found: ", e
        return
      @fs.opened-file = name
      @fs.content <<< {cur: content, old: content}
      type = if /\.([a-zA-Z]+)$/.exec(name) => that.1 else null
      @ed.cm.set {content, name, type}

    render: debounce ->
      payload = @opt.renderer @fs
      @sandbox.load payload

    set-files: (fs, list = []) ->
      @fs <<< {fs, list}
      if list.length => return
      _ = (f) ->
        files = fs.readdir-sync f .map -> "#f/#it"
        for file in files => if fs.stat-sync file .is-directory! => _(file) else list.push file
      _ '.'
      @render!

  if window? => window.Editor = Editor
  if module? => module.exports = Editor
)!
