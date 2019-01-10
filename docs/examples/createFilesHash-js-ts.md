# API Examples

## `.createFilesHash` (ECMAScript 6+, TypeScript)

> Create a verbosely integrity object of a list of files

`ES6+`

```js
const listOfFiles = ['/path/to/file1.txt', './path/to/file2.txt']
const hashes = await Integrity.createFilesHash(listOfFiles)

// Do something with the hashes here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const listOfFiles = ['/path/to/file1.txt', './path/to/file2.txt'];
const hashes: IHashObject = await Integrity.createFilesHash(listOfFiles);

// Do something with the hashes here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```
