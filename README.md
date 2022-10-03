# Basic
Simple node based networking.

## Usage

```
const {Node} = require('basic')

const node = new Node()
node.listen("hi")
node.send("hi", "world")

```

## Branches

- `master` more robust stable implementation
- `basic` simple, stable implementation
- `process` implements low level emergent computational engine

- all other branches are experimental