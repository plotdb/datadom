# 0.1.0

 - adding support to `comment` and `document-fragment`.
 - add plugin specification, and refactor code following plugin sepc.
 - make `serialize` asynchronous and process custom type correctly.
 - add `possess` to inject `custom object` into `custom node`.
 - tweak naming and update documentation.


# 0.0.4

 - return Promise in init if datadom is inited with node to unify init return value in different cases.


# 0.0.3

 - fix bug: update with ops should wrap ops in Array when applying.


# 0.0.2

 - fix bug - we don't need additional `then` statement in datadom init.
 - add default fallback for plugin if there is no plugin available.
