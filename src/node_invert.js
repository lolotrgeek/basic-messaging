const { Child } = require("./child")
const { Node } = require("./node")

const log = message => process.send ? process.send(message) : console.log(message)

function start(node) {
    try {
        let id = node.core._name
        let peers = Object.values(node.core.getPeers())
        let neighbor = (parseInt(id) + 1).toString()
        let found = peers.find(peer => peer.name === neighbor)
        if (found) {
            log(`${id} Sending ${node.state} to ${neighbor}`)
            node.send(neighbor, node.state)
        }
        else setTimeout(() => start(node), 1000)
    } catch (error) {
        log(`start ${error}`)
    }

}

function invert(id) {
    try {
        let node = new Node(id)
        node.state = 0
        start(node)

        const invert_state = state => {
            if(state === 0) return 1
            else return 0
        }

        const up = node => {
            let neighbor = (parseInt(id) + 1).toString()
            log(`${id} Sending ${node.state} to ${neighbor}`)
            return setTimeout(() => node.send(neighbor, node.state), 1000)
        }

        node.listen(id, state => {
            node.state = invert_state(parseInt(state))
            up(node)
            log(`id: ${id} | ${node.state}`)
        })
    } catch (error) {
        log(`invert ${error}`)
    }

}

Child(invert)