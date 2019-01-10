# CLI Examples

## `check`

> Check the integrity of the root directory, using a root 'integrity' file

```sh
nsri check -s ./ -i ./.integrity.json

```
> Check the integrity of the root directory, using the 'integrity' from a manifest file

```sh
nsri check -m -s ./
```

---

## `create`

> Create a non-verbosely integrity file of the root directory

```sh
nsri create -s ./
```

---

> Create a verbosely integrity file of the root directory

```sh
nsri create -v -s ./
```

---

> Create a non-verbosely integrity file of a sub directory and persist it on the subdirectory

```sh
nsri create -s ./sub -o ./sub
```
---

> Create a non-verbosely integrity file of the root directory and persist it on the manifest file

```sh
nsri create -m -s ./
```
