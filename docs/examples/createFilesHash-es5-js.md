# API Examples

## `.createFilesHash` (ECMAScript 5)

> Create a verbosely integrity object of a list of files

```js
const listOfFiles = ['/path/to/file1.txt', './path/to/file2.txt']
Integrity.createFilesHash(listOfFiles)
  .then(hashes => {
    // Do something with the hashes here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```
