# API Examples

## `.persist` (ECMAScript 6+, TypeScript)

> Persist the integrity object on the current working directory

`ES6+`

```js
// Assuming you have previously created an integrity object

// Persist it on disk
await Integrity.persist(intObj)
console.log('Integrity file saved')
```

`TypeScript`

```ts
// Assuming you have previously created an integrity object

// Persist it on disk
await Integrity.persist(intObj);
console.log('Integrity file saved');
```

---

`ES6+`

> Persist the integrity object on a specific directory (absolute path)

```js
// Assuming you have previously created an integrity object

// Persist it on disk
await Integrity.persist(intObj, '/dir/to/persist/the/integrity/object')
console.log('Integrity file saved')
```

`TypeScript`

```ts
// Assuming you have previously created an integrity object

// Persist it on disk
await Integrity.persist(intObj, '/dir/to/persist/the/integrity/object');
console.log('Integrity file saved');
```

---

> Persist the integrity object on a specific directory (relative path)

`ES6+`

```js
// Assuming you have previously created an integrity object

// Persist it on disk
await Integrity.persist(intObj, './dir/to/persist/the/integrity/object')
console.log('Integrity file saved')
```

`TypeScript`

```ts
// Assuming you have previously created an integrity object

// Persist it on disk
await Integrity.persist(intObj, './dir/to/persist/the/integrity/object');
console.log('Integrity file saved');
```
