(->
  getfa 'sample'
    .then (fs) ->
      fs.write-file-sync 'blank', 'hello index.html!'
      ed = new Editor do
        node: do
          edit: '[ld=editor]'
          view: '[ld=viewer]'
        editlet: {}
        renderer: ({fs}) ->
          if !fs => return
          payload = html: (fs.read-file-sync 'blank' .toString!)
          for k,v of payload =>
            ret = transpiler.detect(v)
            if ret.mod and ret.mod.transform => payload[k] = ret.mod.transform v
          return payload
      ed.set-files fs
      ed.open \blank
)!
