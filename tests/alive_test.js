const { Node } = require("../src/node")

const node = new Node("alive_test")

let peers = []

function listener() {
    let new_peers = Object.values(node.core.getPeers()).map(peer => peer.name).filter(peer => peer)
    if (new_peers.length > peers) {
        console.log("New Peers", new_peers)
        peers = new_peers
    }
}
setInterval(listener, 2000)