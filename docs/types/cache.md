# Cache

Class definition for a custom cache. This cache must implement a two-level key system. When getting/setting values, both `path` and `params` (level 1 and level 2 keys, respectively) will be included. However, when deleting values, only a list of `paths` will be included. Thus, it is advantageous to create a cache that can quickly and easily delete all (`path`, `params`) key pairs that match a specific `path`. 

## Summary

Pass an instance of this class into CACCL functions to replace the built-in memory or session-based cache functionality.

## Properties

All instances of cache must have a `storePromises` property (boolean).

If the cache can store `Promise` objects, `storePromises` must equal `true`.

## Methods

### get(path, params)

Argument | Type | Description
:--- | :--- | :---
path | string | the url path that is to be cached
params | object | the get parameters for the cached object

Returns:  
`Promise.<object>` Promise that resolves with the cached value.

### set(path, params, value)

Argument | Type | Description
:--- | :--- | :---
path | string | the url path that is to be cached
params | object | the get parameters for the cached object
value | object | the value to save in the cache

Returns:  
`Promise` Promise that resolves when the set is complete, rejects if failed.

### deletePaths(paths)

Deletes all entries with keys: (`path`, `params`), where `path` is in the list of `paths`. This is independent of `params`.

Argument | Type | Description
:--- | :--- | :---
paths | string[] | a list of paths to remove from the cache (independent of params)

Returns:  
`Promise` Promise that resolves when the paths are deleted, rejects if failed.

### getAllPaths()

Returns:  
`Promise.<string[]>` Promise that resolves with the list of all paths, rejects if failed.

### deleteAllPaths()

Clears the entire cache.

Returns:  
`Promise` Promise that resolves when delete is complete, rejects if failed.