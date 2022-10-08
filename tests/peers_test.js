const { Node } = require("../main")
const node = new Node("peers-test")

setTimeout(() => console.log(node.core.getPeers()), 2000)