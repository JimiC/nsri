<!-- markdownlint-disable MD033-->
# nsri (NodeJS Subresource Integrity) <img src="https://raw.githubusercontent.com/jimic/nsri/main/media/nsri-logo.png" width="50" align="left">

### General Info

[![License](https://img.shields.io/github/license/jimic/nsri)](https://raw.githubusercontent.com/jimic/nsri/main/LICENSE)
![Semantic Version](https://img.shields.io/badge/semver-2.0.0-green)
![npm type definitions](https://img.shields.io/npm/types/nsri)

### Release Info

![GitHub release (latest by date)](https://img.shields.io/github/v/release/jimic/nsri)
![node-current](https://img.shields.io/node/v/nsri?label=supported%20node%20versions)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/nsri)

### Development Info

![GitHub package.json version](https://img.shields.io/github/package-json/v/jimic/nsri)
![node-dev](https://img.shields.io/badge/dynamic/json?color=brightgreen&label=supported%20node%20versions&query=engines.node&url=https%3A%2F%2Fraw.githubusercontent.com%2FJimiC%2Fnsri%2Fmaster%2Fpackage.json)

![Build Status](https://github.com/JimiC/nsri/actions/workflows/build.yml/badge.svg)

[![Maintainability](https://api.codeclimate.com/v1/badges/77bea27f9bd1906ac525/maintainability)](https://codeclimate.com/github/jimic/nsri/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/77bea27f9bd1906ac525/test_coverage)](https://codeclimate.com/github/jimic/nsri/test_coverage)

[![Known Vulnerabilities](https://snyk.io/test/github/jimic/nsri/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jimic/nsri?targetFile=package.json)

---

A [Node.js](https://nodejs.org) utility tool that creates an integrity object containing the hash checksums of a file or a directory structure, that can be saved to an `.integrity.json` file [<img src="https://raw.githubusercontent.com/jimic/nsri/main/media/integrity_file.png" width="16" />], or put inside the project's manifest file (`project.json`).

The hashes are computed using, by default, the `sha1` algorithm for files and `sha512` algorithm for directories, with `base64` encoding, complying to [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) spec, but other [Node.js crypto](https://nodejs.org/api/crypto.html) supported [algorithms](https://nodejs.org/api/crypto.html#cryptogethashes) and [encodings](https://nodejs.org/api/crypto.html#hashdigestencoding) can be used.

## Instalation

To install as a dependency, simply type:

```sh
npm i nsri --save
```

To install for global use, simply type:

```sh
npm i nsri -g
```

## Behavior

**NOTE:**

- The `.integrity.json` file itself is being excluded in all computations.
- The `node_modules`, `.git*`, `.svn*`, `.hg*` directories are excluded by default.

### Files

**Hashes are the same when:**

- File names and contents are the same

**Hashes are different when:**

- File names are different and contents are the same
- File contents are different and names are the same

### Directories

Contents: The file names (and their data contents) and subdirectories names (with their contents) of the directory

**Hashes are the same when:**

- Directory names and contents are the same `(strict: true)`
- Only root directory names are different and subdirectory names and all contents are the same `(strict: false)`

**Hashes are different when:**

- Directory names are different and contents are the same `(strict: true)`
- Directory contents are different and names are the same

## Usage

### CLI

`nsri` has a built-in command-line inteface.

```sh
nsri <command> [options]
```

To see the available `commands` type:

```sh
nsri -h
```

and for available `command` options type:

```sh
nsri <command> -h
```

More info an be found at the [CLI](https://github.com/JimiC/nsri/blob/main/docs/cli.md) section.

### API

`nsri` can also be used programatically ([TypeScript](https://www.typescriptlang.org/) types are included).

More info can be found at the [API](https://github.com/JimiC/nsri/blob/main/docs/api.md) section.

### Configuration

#### Config File

`nsri` supports [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) configuration.

Valid config filenames are: `.nsrirc`, `.nsrirc.js`, `.nsrirc.json`, `.nsrirc.yaml`, `.nsrirc.yml`, `.nsrirc.config.js`. In `package.json` the property name MUST be `nsri`.

**NOTE:**  Configurations set via `CLI` are overriding configurations set via `cosmiconfig`. To avoid confusion use one or the other.

#### Ignore File

Exclusions also can be set via an ignore file (`.nsriignore`), which supports the [gitignore](https://git-scm.com/docs/gitignore#_pattern_format) pattern format.

**NOTE:** ExclusionsExclutionsExclutions set via `CLI` or `cosmiconfig` are getting merged with those in the ignore file and from those only unique entries are assigned.

### Integrity object schema

```json
{
  "version": ... schema version,
  "hashes": ... verbosely or non-verbosely computed hashes
}
```

More info on the used schema can be found [here](https://github.com/JimiC/nsri/blob/main/src/schemas).

#### Verbosely hashes schema

```json
{
  "directoryName": {
    "contents": {
      "aFileName":  ... file computed hash string,
      "anotherFileName":  ... file computed hash string
    },
    "hash": ... directory computed hash string
  }
}
```

Examples of a verbosely computed hash integrity file can be found [here](https://github.com/JimiC/nsri/blob/main/test/fixtures).

#### Non-verbosely hashes schema

```json
{
  "fileOrDirectoryName": ... file or directory computed hash string
}
```

### Examples

Examples on how to use `nsri`, via `CLI` or `API`, can be found at the [examples](https://github.com/JimiC/nsri/blob/main/docs/examples) section.

If you believe that the examples are incomplete or incorrect, please submit an issue or better yet a PR.

## Contributing

If you like to contribute make sure to check-out the [Contribution Guidelines](https://github.com/JimiC/nsri/blob/main/.github/CONTRIBUTING.md) section.

## License

This project is licensed under the [MIT](https://github.com/JimiC/nsri/blob/main/LICENSE) license.

## Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org).
