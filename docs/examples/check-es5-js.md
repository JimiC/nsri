# API Examples

## `.check` (ECMAScript 5)

> Check the integrity of the root directory, using a root 'integrity' file

```js
Integrity.check('./', './.integrity.json')
  .then(pass => console.info('Integrity check ' + pass ? 'passed': 'failed'))
  .catch(error => console.error(error))
```

---

> Check the integrity of a subdirectory, using a subdirectory 'integrity' file.

```js
Integrity.check('./sub', './sub/.integrity.json')
  .then(pass => console.info('Integrity check ' + pass ? 'passed': 'failed'))
  .catch(error => console.error(error))
```

---

> Check the integrity of a root directory file, using a root 'integrity' file

```js
Integrity.check('./fileToCheck.txt', './.integrity.json')
  .then(pass => console.info('Integrity check ' + pass ? 'passed': 'failed'))
  .catch(error => console.error(error))
```

---

> Check the integrity of a subdirectory file, using a root 'integrity' file.

```js
Integrity.check('./sub/fileToCheck.txt', './.integrity.json')
  .then(pass => console.info('Integrity check ' + pass ? 'passed': 'failed'))
  .catch(error => console.error(error))
```

---

> Check the integrity of a subdirectory file, using a subdirectory 'integrity' file.

```js
Integrity.check('./sub/fileToCheck.txt', './sub/.integrity.json')
  .then(pass => console.info('Integrity check ' + pass ? 'passed': 'failed'))
  .catch(error => console.error(error))
```
