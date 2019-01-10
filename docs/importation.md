# Importation

## ES5

**Import as a `Class`**

```js
var Integrity = require('nsri').Integrity;
```

**Import as a `Namespace`**

```js
var nsri = require('nsri');

// and use as
nsri.Integrity. ...
```

## ES6+, Typescript

**Import as a `Class`**

All examples require to import the `Integrity` class before you will be able to use them.

Additionally `ICryptoOptions`, `IntegrityObject` and `IntegrityOptions` are also available types.

```ts
import { Integrity } from 'nsri';
```

**Import as a `Namespace`**

You can also import it as a namespace.

```ts
import * as nsri from 'nsri';
```

In that case, all function calls should be modified to use `nsri` before the classes or types.

```ts
nsri.Integrity. ...

nsri.ICryptoOptions. ...

nsri.IntegrityObject. ...

nsri.IntegrityOptions. ...
```
