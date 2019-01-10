# API Examples

## `.updateManifestIntegrity` (ECMAScript 5)

> Update the integrity object on the manifest file

```js
// Assuming you have previously created an integrity object

// Persist it on the manifest file
Integrity.updateManifestIntegrity(intObj)
  .then(() => console.log('Integrity hash created -> Manifest updated'))
  .catch(error => console.error(error))
```
