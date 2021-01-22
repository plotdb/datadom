
 - block obj
   - how do them communicate?
   - where can we keep them?
   - can we query and get them?


think about this:
 - datadom parse the whole tree then apply plugin
 - plugin can decide whether to parse datadom or not ( by datadom )
 - plugin
   - .serialize
   - .deserialize

需要的條件

 - 方便解析 ( parse datadom 本來就是 datadom 的工作 )
 - 選擇性解析 ( 可選擇是否由 datadom 解析. 有些 plugin 內部自有運作方式, 就不該由 datadom 來做 )
   - datadom 重點在保存 dom 架構, 為的是提供編輯性.
     - 不供編輯的東西, 其實不需要進 datadom.
     - 由 plugin 自定義的東西, 應方在 datadom 的自訂義欄位中.
 - 支援 slot
   - 有可能 plugin dom 骨架是固定的, 但允許外插 datadom. 這種情況下, 讓 datadom 幫忙解析會比較方便.
   - 會需要分支?
     - child ( real dom )
     - plugs ( shadow dom )

可能的做法

 1. 遇到時立刻處理
    - 整個 subtree 塞給 plugin, 由 plugin 自行解析
    - 整個 subtree 塞給 plugin, plugin resolve 後, datadom 繼續解析
    - 只塞 block 節點給 plugin.
 2. 全 parse 完再處理.
    - 

datadom 如何與 plugin 溝通?

 - plugin 提供額外資訊.
   - 最簡單仍可以是一個函式, 但這樣的話就依最簡單的形式處理.
   - 進階情況, 可以是一個物件. 提供額外資訊:
     - 需不需要 datadom 幫忙 (de)serialize dom? ( 或者, plugin 有能力提供 (de)serialized dom 嗎? )
     - plug 如何處置?



plugin = do
  parse-down: true / false ( datadom will parse the whole datadomtree if true )
  serialize: ->
  deserialize: ->
    if parse-down is false, datadom will ask plugin to serialize/deserialize
  handler: ({node, data}) ->


node = placeholder = document.createElement(\div)
plugin({data}).then ({obj}) ->
  if obj.parse-down? => 
    datadom(data)
      .then (node) ->
        obj.handler {node, data}
  else
    obj.deserialize {data}
      .then (node) ->
        placeholder.replaceWith node

serializer = ->
  if ...
  else if some-way-to-identify-a-block(n) =>
    obj = some-way-to-get-obj(n)
    if obj.parse-down => ...?
    else
      obj.serialize ...



plugin = do
  test: -> # check if given datadom is supported by this plugin.




plugin
  return (true / false) or (resolving true / false) -> support or not.
  allow dom parse or not ( if child? )



