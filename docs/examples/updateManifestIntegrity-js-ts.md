# API Examples

## `.updateManifestIntegrity` (ECMAScript 6+, TypeScript)

> Update the integrity object on the manifest file

`ES6+`

```js
// Assuming you have previously created an integrity object

// Persist it on the manifest file
await Integrity.updateManifestIntegrity(intObj)
console.log('Integrity hash created -> Manifest updated')
```

`TypeScript`

```ts
// Assuming you have previously created an integrity object

// Persist it on the manifest file
await Integrity.updateManifestIntegrity(intObj);
console.log('Integrity hash created -> Manifest updated');
```
