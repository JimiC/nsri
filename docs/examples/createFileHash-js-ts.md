# API Examples

## `.createFileHash` (ECMAScript 6+, TypeScript)

> Create a verbosely integrity object of a file

`ES6+`

```js
const hashes = await Integrity.createFileHash('/path/to/fileToHash.txt')

// Do something with the hashes here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const hashes: IHashObject = await Integrity.createFileHash('/path/to/fileToHash.txt');

// Do something with the hashes here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```
