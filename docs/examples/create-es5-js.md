# API Examples

## `.create` (ECMAScript 5)

>Create a verbosely integrity object of the root directory, using the default `sha1` and `sha512` algorithm and `hex` encoding

```js
Integrity.create('./')
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a verbosely integrity object of the root directory, using the `sha256` algorithm and `base64` encoding

```js
var options = { cryptoOptions: { dirAlgorithm: 'sha256', encoding: 'base64', fileAlgorithm: "sha256" } }
Integrity.create('./', options)
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a verbosely integrity object of a subdirectory

```js
Integrity.create('./sub')
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a non-verbosely integrity object of a file

```js
var options = { verbose: false }
Integrity.create('./fileToHash.txt', options)
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a verbosely integrity object of a subdirectory file

```js
Integrity.create('./sub/fileToHash.txt')
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a verbosely integrity object of a directory excluding a file

```js
var options = { exclude: ['fileToExclude.txt'] }
Integrity.create('./dir', options)
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a verbosely integrity object of a directory excluding a subdirectory

```js
var options = { exclude: ['sub'] }
Integrity.create('./dir', options)
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```
