const { Node } = require("../src/node")
const { table } = require('table')
const node = new Node("state_test")

let headers = ["Chain", "Peer", "State", "Location"]
let peers = [headers]

console.clear()
console.log(table(peers))

function listener(message, from) {
    try {
        let data = JSON.parse(message)
        if (data.state) {
            let found = peers.findIndex(peer => peer[1] === from)
            peers[found] = [data.chain_id, from, data.state, parseInt(data.location)]
            peers.sort((a,b) => a[0] === "Chain" ? 1 : a[3] - b[3])
            console.clear()
            console.log(table(peers))
        }
    } catch (error) {

    }
}

function addPeer(name) {
    let found = peers.find(peer => peer[1] === name)
    console.clear()
    console.log(table(peers))
    if (!found) {
        let row = ["", name, -1, -1]
        peers.push(row)
        node.listen(name, listener)
    }
}

function removePeer(name) {
    try {
        // node.core.removeListener(name)
        let found = peers.findIndex(peer => peer[1] === name)
        peers.splice(found, 1)
        console.clear()
        console.log(table(peers))
    } catch (error) {

    }
}

node.core.on("connect", (id, name) => addPeer(name))
node.core.on("disconnect", (id, name) => removePeer(name))
