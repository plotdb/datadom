window.pug = pug = require("pug")
window.getfs = getfs = -> new Promise (res, rej) ->
  if window.fs => return res fs
  <- (e) BrowserFS.configure( { fs: \InMemery }, _ )
  if e => return rej e
  window.fs = fs = require("fs")
  res fs

window.getfa = getfa = (dir) ->
  getfs!
    .then -> 
      if !fs.exists-sync(dir) => fs.mkdir-sync dir
      fa = new BrowserFS.FileSystem.FolderAdapter dir, fs
      return fa
