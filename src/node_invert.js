const { Child } = require("./child")
const { Node } = require("./node")

const log = message => process.send ? process.send(message) : console.log(message)

function start(node, internal_state) {
    try {
        let id = node.core._name
        let peers = Object.values(node.core.getPeers())
        let neighbor = (parseInt(id) + 1).toString()
        let found = peers.find(peer => peer.name === neighbor)
        if (found) {
            log(`${id} Sending ${internal_state} to ${neighbor}`)
            node.send(neighbor, internal_state)
        }
        else setTimeout(() => start(node, internal_state), 1000)
    } catch (error) {
        log(`start ${error}`)
    }

}

function invert(id) {
    try {
        let node = new Node(id)
        let internal_state = 0
        
        start(node, internal_state)

        const invert_state = state => {
            if(state === 0) return 1
            else return 0
        }

        const up = state => {
            let neighbor = (parseInt(id) + 1).toString()
            log(`${id} Sending ${state} to ${neighbor}`)
            return setTimeout(() => node.send(neighbor, state), 1000)
        }

        node.listen(id, state => {
            internal_state = invert_state(parseInt(state))
            up(internal_state)
            log(`id: ${id} | ${internal_state}`)
        })
    } catch (error) {
        log(`invert ${error}`)
    }

}

Child(invert)