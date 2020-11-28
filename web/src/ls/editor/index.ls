(->
  lc = {}
  sdb = new sharedb-wrapper!
  watch = (ops, source) ->
    json0.type.apply lc.data, ops
    remote = ld$.find '[ld=remote]', 0
    remote.innerHTML = ""
    datadom.deserialize lc.data
      .then ({node, promise}) ->
        remote.appendChild node
        pug = "//- pug\n" + html2pug(remote.innerHTML, {fragment: true})
        pug-node = ld$.find '[ld=pug]', 0
        pug-node.innerText = pug
        console.log ops, source

  sdb.get {id: \sample, watch: watch, create: -> {} }
    .then (doc) ->
      lc.doc = doc
      lc.data = JSON.parse(JSON.stringify(doc.data))

      getfa 'sample'
        .then (fs) ->
          fs.write-file-sync(
            \blank,
            """
            //- pug
            h1 hello world!
            """
          )
          render-datadom = (code) ->
            div = document.createElement("div")
            div.innerHTML = code
            json = datadom.serialize(div)
            node = ld$.find '[ld=json]', 0
            node.innerText = JSON.stringify(json, null, 2)

            domroot = ld$.find '[ld=dom]', 0
            datadom.deserialize(json)
              .then ({node, promise}) ->
                domroot.innerHTML = ""
                domroot.appendChild node
            console.log json
            ops = json0.diff doc.data, json
            doc.submitOp ops


          lc.ed = ed = new Editor do
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
                render-datadom(payload.html)
              return payload
          ed.set-files fs
          ed.open \blank

)!
