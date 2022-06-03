const log = message => process.send ? process.send(message) : console.log(message)

const up = node => {
    try {
        let id = node.core._name
        let neighbor = (parseInt(id) + 1).toString()
        log(`${id} Sending ${node.state} to ${neighbor}`)
        return setTimeout(() => node.send(neighbor, node.state), 1000)
    } catch (error) {
        log(`up ${error}`)
    }

}


const down = node => {
    try {
        let id = node.core._name
        let neighbor = (parseInt(id) - 1).toString()
        log(`${id} Sending ${node.state} to ${neighbor}`)
        return setTimeout(() => node.send(neighbor, node.state), 1000)
    } catch (error) {
        log(`down ${error}`)
    }

}

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


module.exports = { up, down, last, start, log }