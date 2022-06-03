const { Child } = require("./child")
const { Node } = require("./node")

const log = message => process.send ? process.send(message) : console.log(message)

function last(node) {
    try {
        let id = node.core._name
        let peers = Object.values(node.core.getPeers())
        let is_last = peers.every(peer => parseInt(peer.name) < parseInt(id))
        if (is_last) log(`id: ${id} | I'm last.`)
        return is_last
    } catch (error) {
        log(`last ${error}`)
    }
}

function preserve(id) {
    try {
        let node = new Node(id)
        node.state = 0

        const up = node => {
            let neighbor = (parseInt(id) + 1).toString()
            log(`${id} Sending ${node.state} to ${neighbor}`)
            return setTimeout(() => node.send(neighbor, node.state), 1000)
        }

        const down = node => {
            let neighbor = (parseInt(id) - 1).toString()
            log(`${id} Sending ${node.state} to ${neighbor}`)
            return setTimeout(() => node.send(neighbor, node.state), 1000)
        }

        node.listen(id, (state, from) => {
            node.state = state
            let is_last = last(node)
            if (is_last) down(node)
            else if (parseInt(from) > parseInt(id)) down(node)
            else up(node)
            log(`id: ${id} | ${node.state}`)
        })
    } catch (error) {
        log(`preserve ${error}`)
    }
}

Child(preserve)