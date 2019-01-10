# API Examples

## `.createFileHash` (ECMAScript 5)

> Create a verbosely integrity object of a file

```js
Integrity.createFileHash('/path/to/fileToHash.txt')
  .then(hashes => {
    // Do something with the hashes here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```
