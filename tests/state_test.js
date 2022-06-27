const { Node } = require("../src/node")
const { table } = require('table')
const node = new Node("state_test")

let headers = ["Chain", "Peer", "State", "Type"]
let peers = [headers]

console.clear()
console.log(table(peers))

function listener(message, from) {
    try {
        let data = JSON.parse(message)
        if (data.state) {
            let found = peers.findIndex(peer => peer[1] === from)
            peers[found] = [data.chain_id, from, data.state, typeof data.state]
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
        let row = ["", name, -1, 'number']
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
