# API Examples

## `.getExclusionsFromIgnoreFile` (ECMAScript 6+, TypeScript)

> Get the exclusions from a `.nsriignore` file

`ES6+`

```js
const exclusions = await Integrity.getExclusionsFromIgnoreFile()
console.log(exclusions)
```

`TypeScript`

```ts
const exclusions: string[] = await Integrity.getExclusionsFromIgnoreFile();
console.log(exclusions);
```
