# API Examples

## `.persist` (ECMAScript 5)

> Persist the integrity object on the current working directory

```js
// Assuming you have previously created an integrity object

// Persist it on disk
Integrity.persist(intObj)
  .then(() => console.log('Integrity file saved'))
  .catch(error => console.error(error))
```

---

> Persist the integrity object on a specific directory (absolute path)

```js
// Assuming you have previously created an integrity object

// Persist it on disk
Integrity.persist(intObj, '/dir/to/persist/the/integrity/object')
  .then(() => console.log('Integrity file saved'))
  .catch(error => console.error(error))
```

---

> Persist the integrity object on a specific directory (relative path)

```js
// Assuming you have previously created an integrity object

// Persist it on disk
Integrity.persist(intObj, './dir/to/persist/the/integrity/object')
  .then(() => console.log('Integrity file saved'))
  .catch(error => console.error(error))
```
