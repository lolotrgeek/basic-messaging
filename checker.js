const { Node } = require("./src/node")
const node = new Node("checker")

console.log(node.core._name)

let peers = []

setInterval(() => {
    let new_peers = Object.values(node.core.getPeers())
    if(new_peers.length > peers) {
        console.log(new_peers)
        node.core.removeAllListeners()
        node.listen("*", (message, from) => console.log(`Heard: ${message}, From: ${from}`))
        peers = new_peers
    }
}, 2000)


