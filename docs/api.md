# API

All `API` calls are `static` members of the `Integrity` class.

---

>## CurrentSchemaVersion

`Description`: Constant value of the current schema version used.

`Return Type`: `string`

---

>## check

`Description`: Checks the integrity of a directory or a file.

`Info`: The `fileOrDirPath` can be an absolute or relative path.

`Return Type`: `Promise<boolean>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|fileOrDirPath|string|||the path of the file or directory to check|
|integrity|string|||the path of the directory containing the integrity file or the path to the integrity file or a stringified integrity JSON or a hash string, to check against|
|options|IntegrityOptions|optional|see [options](#options) section|the `integrity` options to use|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/check-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/check-js-ts.md)

---

>## create

`Description`: Creates an integrity object of a directory or file.

`Info`: `create` is a top-level helper function designed to internally determine whether to use `createDirHash` or `createFileHash`, saving you the coding hassle. Usually, `create` will be the function you are going to use, when you want to create an `integrity` object. The `fileOrDirPath` can be an absolute or relative path.

`Return Type`: `Promise<IntegrityObject>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|fileOrDirPath|string|||the path of the file or directory to hash|
|options|IntegrityOptions|optional|see [options](#options) section|the `integrity` options to use|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/create-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/create-js-ts.md)

---

>## createDirHash

`Description`: Creates a hash object of a directory.

`Info`: `createDirHash` is a function designed to create an `integrity` object for a directory. The `dirPath` can be an absolute or relative path. Creating a non-verbosely `integrity` object will compute all contents hashes combined.

`Return Type`: `Promise<HashObject>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|dirPath|string|||the path of the directory to hash|
|options|IntegrityOptions|optional|see [options](#options) section|the `integrity` options to use|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/check-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/check-js-ts.md)

---

>## createFileHash

`Description`: Creates a hash object of a file.

`Info`: `createFileHash` is a function designed to create an `integrity` object for a file. The `filePath` can be an absolute or relative path.

`Return Type`: `Promise<HashObject>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|filePath|string|||the path of the file to hash|
|options|CryptoOptions|optional|see [options](#options) section|the `crypto` options to use|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/createFileHash-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/createFileHash-js-ts.md)

---

>## createFilesHash

`Description`: Creates a hash object of a list of files.

`Info`: `createFilesHash` is a function designed to create an `integrity` object for a list of files. The `filenames` can be absolute or relative paths.

`Return Type`: `Promise<HashObject>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|filenames|string[]|||the list of the file paths to hash|
|options|CryptoOptions|optional|see [options](#options) section|the `crypto` options to use|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/createFilesHash-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/createFilesHash-js-ts.md)

---

>## persist

`Description`: Persists the integrity object on disk.

`Info`: `persist` is a function designed to persist the created integrity object on disk. Usually, you will use `persist` whenever you create an `integrity` object. If the `dirPath` parameter is omitted, the `integrity` object will be persisted at the root directory, from where the function gets called. The `dirPath` can be an absolute or relative path.

`Return Type`: `Promise<void>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|intObj|IntegrityObject|||the integrity object to persist|
|dirPath|string|optional|`./`|the path of the directory to persist the data to|
|prettify|boolean|optional|false|data are formatted with indentation|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/persist-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/persist-js-ts.md)

---

>## getManifestIntegrity

`Description`: Gets the integrity object from the manifest file.

`Info`: `getManifestIntegrity` is a function designed to retrieve a stringified version of the integrity object from the project's manifest file (`project.json`).

`Return Type`: `Promise<string>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|dirPath|string|optional|`./`|the path of the directory to the manifest file|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/getManifestIntegrity-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/getManifestIntegrity-js-ts.md)

---

>## updateManifestIntegrity

`Description`: Updates the manifest file (`project.json`) with the integrity object.

`Info`: `updateManifestIntegrity` is a function designed to update the project's manifest file (`project.json`) with the integrity object.

`Return Type`: `Promise<void>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|intObj|IntegrityObject|||the integrity object to persist|
|dirPath|string|optional|`./`|the path of the directory to the manifest file|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/updateManifestIntegrity-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/updateManifestIntegrity-js-ts.md)

---

>## getIntegrityOptionsFromConfig

`Description`:

`Info`: `getIntegrityOptionsFromConfig` is a function designed to retrieve the integrity options from a `cosmiconfig` compatible configuration section.

`Return Type`: `Promise<IntegrityOptions>`

`Parameters`: None

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/getIntegrityOptionsFromConfig-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/getIntegrityOptionsFromConfig-js-ts.md)

---

>## getExclusionsFromIgnoreFile

`Description`:

`Info`: `getExclusionsFromIgnoreFile` is a function designed to retrieve the exclusions from a `.nsriignore` file.

`Return Type`: `Promise<string[]>`

`Parameters`:

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|dirPath|string|optional|`./`|the path of the directory to the ignore file|

`Examples`

- [ES5](https://github.com/JimiC/nsri/blob/main/docs/examples/getExclusionsFromIgnoreFile-es5-js.md)
- [ES6+, Typescript](https://github.com/JimiC/nsri/blob/main/docs/examples/getExclusionsFromIgnoreFile-js-ts.md)

---

## Options

### IntegrityOptions

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|cryptoOptions|CryptoOptions|optional|see `CryptoOptions` |the `crypto` options to use|
|strict|boolean|optional|false|whether the computed hashes are strictly using the directory name|
|verbose|boolean|optional|false|whether the computed hashes are returned in a verbosely or non-verbosely structure|
|exclude|string[]|optional|[]|the paths to be excluded, supports also `glob` expressions (positive & negative)|

### CryptoOptions

|Name|Type|Attribute|Default|Description|
|:---:|:---:|:---:|:---:|:---:|
|dirAlgorithm|string|optional|`sha512`|the `crypto` algorithm to use for directories|
|encoding|BinaryToTextEncoding|optional|`base64`|the `crypto` encoding to use|
|fileAlgorithm|string|optional|`sha1`|the `crypto` algorithm to use for files|

---

## Importation

See [here](https://github.com/JimiC/nsri/blob/main/docs/importation.md) how to import the library.
