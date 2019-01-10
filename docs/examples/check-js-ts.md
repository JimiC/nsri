# API Examples

## `.check` (ECMAScript 6+, TypeScript)

> Check the integrity of the root directory, using a root 'integrity' file

`ES6+`

```js
const pass = await Integrity.check('./', './.integrity.json')
```

`TypeScript`

```ts
const pass: boolean = await Integrity.check('./', './.integrity.json');
```

---

> Check the integrity of a subdirectory, using a subdirectory 'integrity' file.

`ES6+`

```js
const pass = await Integrity.check('./sub', './sub/.integrity.json')
```

`TypeScript`

```ts
const pass: boolean = await Integrity.check('./sub', './sub/.integrity.json');
```

---

> Check the integrity of a root directory file, using a root 'integrity' file

`ES6+`

```js
const pass = await Integrity.check('./fileToCheck.txt', './.integrity.json')
```

`TypeScript`

```ts
const pass: boolean = await Integrity.check('./fileToCheck.txt', './.integrity.json');
```

---

> Check the integrity of a subdirectory file, using a root 'integrity' file.

`ES6+`

```js
const pass = await Integrity.check('./sub/fileToCheck.txt', './.integrity.json')
```

`TypeScript`

```ts
const pass: boolean = await Integrity.check('./sub/fileToCheck.txt', './.integrity.json');
```

---

> Check the integrity of a subdirectory file, using a subdirectory 'integrity' file.

`ES6+`

```js
const pass = await Integrity.check('./sub/fileToCheck.txt', './sub/.integrity.json')
```

`TypeScript`

```ts
const pass: boolean = await Integrity.check('./sub/fileToCheck.txt', './sub/.integrity.json');
```
