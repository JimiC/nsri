# CLI

## Commands

---

>## create

`Description`: Creates integrity hash from the provided source.

---

>## check

`Description`: Checks integrity hash against the provided source.

---

## Options

---

>## --diralgorithm

`Alias`: -da

`Description`: The algorithm to use for directory hashing.

`Default`: sha512

`Type`: string

---

>## --encoding

`Alias`: -e

`Description`: The encoding to use for hashing.

`Default`: base64

`Type`: string

---

>## --exclude

`Alias`: -x

`Description`: Files and/or directories paths to exclude.

`Default`: []

`Type`: array

---

>## --filealgorithm

`Alias`: -fa

`Description`: The algorithm to use for file hashing.

`Default`: sha1

`Type`: string

---

>## --integrity

`Alias`: -i

`Description`: The integrity hash, JSON, file or directory path, to check against ([required] when 'manifest' option not specified).

`Type`: string

---

>## --manifest

`Alias`: -m

`Description`: The integrity hash gets persisted to, or read from, the project's manifest (package.json).

`Default`: undefined

`Type`: boolean

---

>## --output

`Alias`: -o

`Description`: The directory path where to persist the created integrity file (ignored when 'manifest' option specified).

`Type`: string

---

>## --source

`Alias`: -s

`Description`: The path to the file or directory to hash.

`Mandatory`: true

`Type`: string

---

>## --verbose

`Alias`: -v

`Description`: Verbosely create hashes of a directory.

`Default`: false

`Type`: boolean

---

>## --strict

`Alias`: -st

`Description`: Strictly compares names and contents.

`Default`: false

`Type`: boolean

---

>## --help

`Alias`: -h

`Description`: Show help.

---

>## --version

`Alias`: -V

`Description`: Show version number.

---
