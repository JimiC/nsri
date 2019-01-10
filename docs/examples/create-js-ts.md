# API Examples

## `.create` (ECMAScript 6+, TypeScript)

## Using with `async/await`

> Create a verbosely integrity object of the root directory, using the default `sha1` and `sha512` algorithm and `base64` encoding

`ES6+`

```js
const intObj = await Integrity.create('./')

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const intObj: IntegrityObject = await Integrity.create('./');

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

---

> Create a verbosely integrity object of the root directory, using the `sha256` algorithm and `base64` encoding

`ES6+`

```js
const options = { cryptoOptions: { dirAlgorithm: 'sha256', encoding: 'base64', fileAlgorithm: 'sha256' } }
const intObj = await Integrity.create('./', options)

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const options: IntegrityOptions = { cryptoOptions: { dirAlgorithm: 'sha256', encoding: 'base64', fileAlgorithm: 'sha256' } };
const intObj: IntegrityObject = await Integrity.create('./', options);

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

---

> Create a verbosely integrity object of a subdirectory

`ES6+`

```ts
const intObj = await Integrity.create('./sub')

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const intObj: IntegrityObject = await Integrity.create('./sub');

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

---

> Create a non-verbosely integrity object of a file

`ES6+`

```js
const options = { verbose: false }
const intObj = await Integrity.create('./fileToHash.txt', options)

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const options: IntegrityOptions = { verbose: false };
const intObj: IntegrityObject = await Integrity.create('./fileToHash.txt', options);

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

---

> Create a verbosely integrity object of a subdirectory file

`ES6+`

```js
const intObj = await Integrity.create('./sub/fileToHash.txt')

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const intObj: IntegrityObject = await Integrity.create('./sub/fileToHash.txt');

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

---

> Create a verbosely integrity object of a directory excluding a file

`ES6+`

```js
const options = { exclude: ['fileToExclude.txt'] }
const intObj = await Integrity.create('./dir', options)

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const options: IntegrityOptions = { exclude: ['fileToExclude.txt'] };
const intObj: IntegrityObject = await Integrity.create('./dir', options);

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

---

> Create a verbosely integrity object of a directory excluding a subdirectory

`ES6+`

```js
const options = { exclude: ['sub'] }
const intObj = await Integrity.create('./dir', options)

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

`TypeScript`

```ts
const options: IntegrityOptions = { exclude: ['sub'] };
const intObj: IntegrityObject = await Integrity.create('./dir', options);

// Do something with the integrity object here
// It's advised not to modify them
// as it will certainly lead to integrity check failure
// when you'll try to check against them
```

---

## Using with `then/catch`

All above examples can be also used with the `then/catch` coding pattern.

Here is how the first example will look like:

>Create a verbosely integrity object of the root directory, using the default `sha1` and `sha512` algorithm and `base64` encoding

`ES6+`

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

`TypeScript`

```ts
Integrity.create('./')
  .then(intObj => {
    // Do something with the integrity object here
    // It's advised not to modify them
    // as it will certainly lead to integrity check failure
    // when you'll try to check against them
  })
  .catch(error => console.error(error));
```
