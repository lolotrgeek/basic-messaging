const log = message => process.send ? process.send(message) : console.log(message)



function location(node) {
    try {
        let name = node.core._name
        let peers = Object.values(node.core.getPeers())
        let only_nodes = peers.filter(peer => !isNaN(parseInt(peer.name)))
        let is_first = only_nodes.every(node => parseInt(node.name) < parseInt(name))
        if (is_first) {
            log(`name: ${name} | I'm first.`)
            return is_first
        }
        let is_last = only_nodes.every(node => parseInt(node.name) < parseInt(name))
        if (is_last) {
            log(`name: ${name} | I'm last.`)
            return is_last
        }
    } catch (error) {
        log(`last ${error}`)
    }
}

function start(node) {
    try {
        let name = node.core._name
        let peers = Object.values(node.core.getPeers())
        let neighbor = (parseInt(name) + 1).toString()
        let found = peers.find(peer => peer.name === neighbor)
        if (found) {
            log(`${name} Sending ${node.state} to ${neighbor}`)
            node.send(neighbor, node.state)
        }
        else setTimeout(() => start(node), 1000)
    } catch (error) {
        log(`start ${error}`)
    }

}


module.exports = { up, down, location, start, log }