const { Node } = require("./src/node")
const node = new Node("checker")
const listen = () => node.listen
const send = () => node.send

console.log(node.core._name)

listen("*", console.log)

// setInterval(() => console.log(node.core.getPeers()), 2000)
