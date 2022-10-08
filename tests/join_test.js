const { Node } = require("../main")
const node = new Node("joiner")
const node2 = new Node("joiner2")

node.debug = 'join'

node.join("test").then(console.log)
node2.join("test").then(console.log)
