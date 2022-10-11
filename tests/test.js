const { Node } = require("../main")

const node  = new Node()
const node2  = new Node()

const heard = message => console.log(`Heard: ${message}`)

node.listen("hello", heard)

setTimeout(() => node2.send("hello", "world"), 500)