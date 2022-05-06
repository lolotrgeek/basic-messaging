const { Node } = require("../src/network")
new Node()
new Node()

const node1 = new Node()


function identify() {
    let peers = node1.core.getPeers()
    for (let peer in peers) node1.identify(peer)
    console.log("---------------------------------------------------------------")
}
setInterval(identify, 2000)