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
        let internal_state = 0

        const up = state => {
            let neighbor = (parseInt(id) + 1).toString()
            log(`${id} Sending ${state} to ${neighbor}`)
            return setTimeout(() => node.send(neighbor, state), 1000)
        }

        const down = state => {
            let neighbor = (parseInt(id) - 1).toString()
            log(`${id} Sending ${state} to ${neighbor}`)
            return setTimeout(() => node.send(neighbor, state), 1000)}

        node.listen(id, (state, from) => {
            internal_state = state
            let is_last = last(node)
            if (is_last) down(internal_state)
            else if (parseInt(from) > parseInt(id)) down(internal_state)
            else up(internal_state)
            log(`id: ${id} | ${internal_state}`)
        })
    } catch (error) {
        log(`preserve ${error}`)
    }
}

Child(preserve)