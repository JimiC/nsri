# API Examples

## `.createDirHash` (ECMAScript 5)

>Create a verbosely integrity object of the root directory, using the default `md5` algorithm and `hex` encoding

```js
Integrity.createDirHash('./')
  .then(hashes => {
    // Do something with the hashes here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a verbosely integrity object of the root directory, using the `sha1` algorithm and `base64` encoding

```js
var options = { cryptoOptions: { algorithm: 'sha1', encoding: 'base64' } }
Integrity.createDirHash('./', options)
  .then(hashes => {
    // Do something with the hashes here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```

---

> Create a verbosely integrity object of a subdirectory

```js
Integrity.createDirHash('./sub')
  .then(hashes => {
    // Do something with the hashes here
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
Integrity.createDirHash('./dir', options)
  .then(hashes => {
    // Do something with the hashes here
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
Integrity.createDirHash('./dir', options)
  .then(hashes => {
    // Do something with the hashes here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error))
```
