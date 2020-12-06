require! <[fs jsdom ../src/datadom]>

data = fs.read-file-sync 0 .toString!
root = jsdom.JSDOM.fragment(data).childNodes.0
ret = datadom.serialize root
console.log JSON.stringify(ret)
