# basic-messaging
Simple node based networking.

## Usage

```
const {Node} = require('basic-messaging')

const node = new Node("new_node")
node.listen("hi", (message, name) => console.log(message, name))
node.send("hi", "world")

```

## Branches

- `master` stable implementation
- `process` implements low level emergent computational engine

- all other branches are experimental

## Tests
- case 1 - start send node, then start listen node --> works
- case 2 - start listen node, start send node --> works
- case 3 - send node running, stop listen node, restart listen node --> works
- case 4 - listen node running, stop send node, restart send node --> works
- case 5 - 2 or more listener nodes, stop and restart one listener node, reconnects to other listener node before others --> works

## Todo


## Credits
- Based on https://github.com/dashersw/cote
