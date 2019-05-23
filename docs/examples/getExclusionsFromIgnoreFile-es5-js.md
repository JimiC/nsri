# API Examples

## `.getExclusionsFromIgnoreFile` (ECMAScript 5)

> Get the exclusions from a `.nsriignore` file

```js
Integrity.getExclusionsFromIgnoreFile()
  .then((excl) => console.log(excl))
  .catch(error => console.error(error))
```
