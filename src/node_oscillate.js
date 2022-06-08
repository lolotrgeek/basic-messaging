const { Child } = require("./child")
const { Node } = require("./node")
const { Chain } = require("./chain")
const { log } = require('./rules')

const invert_state = state => {
    if (state === 0) return 1
    else return 0
}

const up = node => {
    try {
        let name = node.core._name
        let neighbor_name = (parseInt(name) + 1).toString()
        let neighbor = node.chain.current[neighbor_name]        
        log(`${name} Sending ${node.state} to ${neighbor}`)
        return setTimeout(() => node.send(neighbor, node.state), 1000)
    } catch (error) {
        log(`up ${error}`)
    }

}

const down = node => {
    try {
        let name = node.core._name
        let neighbor_name = (parseInt(name) - 1).toString()
        let neighbor = node.chain.current[neighbor_name]
        log(`${name} Sending ${node.state} to ${neighbor_name}:${neighbor}`)
        return setTimeout(() => node.send(neighbor, node.state), 1000)
    } catch (error) {
        log(`down ${error}`)
    }

}


function preserve(state, node) {
    node.state = state
    if (position) down(node)
    else if (parseInt(from) > parseInt(id)) down(node)
    else up(node)

}

function isBlock(data) {
    if (typeof data === 'object' && data.chain_id && data.node_id) return true
    return false
}

function isChain(data) {
    if (Array.isArray(data) && isBlock(data[0])) return true
    return false
}

function sameChain(block, node) {
    if (block.chain_id === node.chain_id) return true
    return false
}

function getName(node) {
    return node.chain.current.findIndex(block => block.node_id === node.core._id)
}

function getLocation(node) {
    let is_first = node.chain.current.every(peer => parseInt(peer.name) > parseInt(node.name))
    if (is_first) {
        log(`name: ${node.name} | I'm first.`)
        return 1
    }
    let is_last = node.chain.current.every(peer => parseInt(peer.name) < parseInt(node.name))
    if (is_last) {
        log(`name: ${node.name} | I'm last.`)
        return -1
    }
    else return 0
}

function ToBlock(node, peer) {
    return { chain_id: node.core._id, id: peer.id}
}

function buildChain(node) {
    let peers = Object.values(node.core.getPeers())
    let self = { chain_id: node.core._id, id: node.core._id}
    return [self, ...peers.map(peer => ToBlock(node, peer))]
}

function isState(data){
    if(typeof data === "string" && !isNaN(parseInt(data))) return true
    else return false
}

function oscillate() {
    try {
        let node = new Node()
        node.chain = new Chain()
        node.chain_id = node.core._id
        node.chain.current = buildChain(node)
        node.name = getName(node.chain.current)
        // each node builds its own chain, which will be replaced by the 'longest' later
        node.state = -1

        // initialize the node when first joining the network by sending chain... should begin chain resolution phase...
        if(node.state === -1) {
            peers.map(peer => send(peer.id,node.chain.current))
        }

        node.listen(node.core._id, (data, from) => {
            // updates chain if it receives a longer one 
            if (isChain(data) && data.length > node.chain.current.length) {
                node.chain.update(data)
                node.chain_id = from
                node.name = getName(node.chain.current)
            }
            // updates chain when a new peer connects
            else if (isBlock(data)) {
                node.chain.update(node.chain.current, data)
                if (!sameChain(data, node)) node.send(from, node.chain.current)
            }
            // sends states
            else if(isState(data)) {
                // get location, update state accordingly
                let location = getLocation(node)
                if(location === 1) {
                    node.state = invert_state(parseInt(state))
                    up(node)
                }
                if(location === -1) {
                    down(node)
                }
                if(location === 0) {
                    up(node)
                }
            }

            log(`id: ${node.core._id} | ${node.state}`)
        })



    } catch (error) {
        log(`invert ${error}`)
    }
}

Child(oscillate)