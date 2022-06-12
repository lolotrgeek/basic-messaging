const { log, parse } = require('./helpers')

const debug = "state"

const getNeighborId = (node, neighbor_position) => typeof node.chain.current[neighbor_position].node_id === 'string' ? node.chain.current[neighbor_position].node_id : ''

const up = node => {
    try {
        let neighbor_position = parseInt(node.position) + 1
        let neighbor = getNeighborId(node, neighbor_position)
        log(`${node.position} Sending ${node.state} to ${neighbor_position}:${neighbor}`)
        return stateMessage(node, neighbor)
    } catch (error) {
        log(`up ${error}`)
    }

}

const down = node => {
    try {
        let neighbor_position = parseInt(node.position) - 1
        let neighbor = getNeighborId(node, neighbor_position)
        log(`${node.position} Sending ${node.state} to ${neighbor_position}:${neighbor}`)
        return stateMessage(node, neighbor)
    } catch (error) {
        log(`down ${error}`)
    }

}

function preserve(from, node) {
    let name = getPosition(from)
    if (name && name < node.position) up(node)
    if (name && name > node.position) down(node)
}


function getLocation(node) {
    let is_first = node.chain.current.every(peer => parseInt(peer.name) > parseInt(node.position))
    if (is_first) {
        log(`position: ${node.position} | I'm first.`)
        return 1
    }
    let is_last = node.chain.current.every(peer => parseInt(peer.name) < parseInt(node.position))
    if (is_last) {
        log(`position: ${node.position} | I'm last.`)
        return -1
    }
    else return 0
}


function start(node) {
    if (node.chain.current.length > 1) {
        let neighbor_position = parseInt(node.position) + 1
        log(`neighbor: ${JSON.stringify(node.chain.current[neighbor_position])}`)
        let neighbor = getNeighborId(node, neighbor_position)
        if (neighbor_position && neighbor) stateMessage(node, neighbor)
    }
    else setTimeout(() => start(node), 2000)
}

function run(node, state, from) {
    // get location, update state accordingly
    let location = getLocation(node)
    if (debug === "state") log(`location ${location}`)
    if (location === 1) {
        node.state = invert_state(parseInt(state))
        up(node)
    }
    if (location === -1) {
        down(node)
    }
    if (location === 0) {
        node.state = state
        preserve(from, node)
    }
    log(`id: ${node.id} | ${node.state}`)
    return node
}