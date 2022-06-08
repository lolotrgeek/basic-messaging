const { Node } = require("../src/node")

let node = new Node("first")
let node2 = new Node("second")

node.core._name = "rename"

const getPeers = () => {
    let peers = Object.values(node2.core.getPeers()).map(peer => peer.name)
    let test = peers.find(peer => peer === "rename")
    if (peers.length === 0) {
        console.log("retrying...")
        setTimeout(getPeers, 1000)
    }
    else if (test === "rename") {
        console.log("Result:", true, peers)
        process.exit()
    }
    else {
        console.log("Result:", false, peers)
        process.exit()
    }


}

getPeers()