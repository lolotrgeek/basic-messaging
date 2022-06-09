const { Child } = require("./child")
const { Node } = require("./node")
const { Chain } = require("./chain")

const debug = "state"

const log = message => process.send ? process.send(message) : console.log(message)

const invert_state = state => {
    if (state === 0) return 1
    else return 0
}

const getNeighborId = (node, neighbor_name) => typeof node.chain.current[neighbor_name].node_id === 'string' ? node.chain.current[neighbor_name].node_id : ''

const up = node => {
    try {
        let neighbor_name = parseInt(node.name) + 1
        let neighbor = getNeighborId(node, neighbor_name)
        log(`${node.name} Sending ${node.state} to ${neighbor_name}:${neighbor}`)
        return stateMessage(node, neighbor)
    } catch (error) {
        log(`up ${error}`)
    }

}

const down = node => {
    try {
        let neighbor_name = parseInt(node.name) - 1
        let neighbor = getNeighborId(node, neighbor_name)
        log(`${node.name} Sending ${node.state} to ${neighbor_name}:${neighbor}`)
        return stateMessage(node, neighbor)
    } catch (error) {
        log(`down ${error}`)
    }

}

function stateMessage(node, to) {
    return setTimeout(() => node.send(to, JSON.stringify({ chain_id: node.chain_id, state: node.state })), 1000)
}

function preserve(from, node) {
    let name = getName(from)
    if (name && name < node.name) up(node)
    if (name && name > node.name) down(node)
}

function isBlock(data) {
    return typeof data === 'object' && data.chain_id && data.node_id && data.time
}

function isChain(data) {
    return Array.isArray(data) && data.every(datum => isBlock(datum))
}

/**
 * Checks if the block is in the same chain as the node
 * @param {*} block 
 * @param {*} node 
 * @returns 
 */
function sameChain(block, node) {
    return block.chain_id === node.chain_id
}

/**
 * A node's name is it's index in the blockchain
 * @param {*} chain 
 * @param {*} id 
 * @returns 
 */
function getName(chain, id) {
    return chain.findIndex(block => block.node_id === id)
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

function createBlock(chain_id, node_id) {
    return { chain_id, node_id, time: Date.now() }
}

function startChain(node) {
    let self = createBlock(node.chain_id, node.id)
    return [self]
}

function isState(data) {
    return typeof data === "object" && data.state && !isNaN(data.state)
}

function parse(data) {
    try {
        return JSON.parse(data)
    } catch (error) {
        return data
    }
}

/**
 * Compare node's chain against given chain
 * @param {*} node 
 * @param {*} chain 
 * @returns `false` if node has the longest chain, `true` if peer has longest chain 
 */
function shouldUpdate(node, chain) {
    if (chain.length < node.chain.current.length) return false
    else if (chain[chain.length - 1].time > node.chain.current[node.chain.current.length - 1].time) return true
    else return true
}

function updateChain(node) {
    return node.chain.current.map((block, index) => {
        block.chain_id = node.chain_id
        block.name = index
        return block
    })
}

function start(node) {
    if (node.chain.current.length > 1) {
        let neighbor_name = parseInt(node.name) + 1
        log(`neighbor: ${JSON.stringify(node.chain.current[neighbor_name])}`)
        let neighbor = getNeighborId(node, neighbor_name)        
        if (neighbor_name && neighbor) stateMessage(node, neighbor)
    }
    else setTimeout(() => start(node), 2000)
}

function oscillate() {
    try {
        let node = new Node()
        node.chain = new Chain()
        node.id = node.core._name // node.id = core name
        node.chain_id = node.id + Date.now()
        node.chain.current = startChain(node)
        node.name = getName(node.chain.current, node.id) // node.name = index of chain 

        node.state = -1

        node.core.on("connect", (id, name) => {
            node.chain_id = node.id + Date.now()
            node.chain.update(createBlock(node.chain_id, name))
            node.chain.current = updateChain(node)
            node.send(name, JSON.stringify(node.chain.current))
        })

        node.listen(node.id, (data, from) => {
            // log(`from: ${from} : ${typeof data} ${data}`)
            let message = parse(data)
            // updates chain if it receives a longer one             
            if (isChain(message) && shouldUpdate(node, message)) {
                node.chain.current = message
                node.chain_id = from
                node.name = getName(node.chain.current, node.id)
                let validate = node.chain.current.map(block => block.chain_id)
                if (debug === "chain") log(`${node.name} Received from ${getName(node.chain.current, from)} | Updated ${node.chain.current.length} -> ${JSON.stringify(validate)}`)
            }
            log(`Samechain? ${sameChain(message, node)}`)
            if (sameChain(message, node) && isState(message)) {
                // get location, update state accordingly
                let location = getLocation(node)
                if(debug === "state") log(`location ${location}`)
                if (location === 1) {
                    node.state = invert_state(parseInt(message.state))
                    up(node)
                }
                if (location === -1) {
                    down(node)
                }
                if (location === 0) {
                    node.state = message.state
                    preserve(from, node)
                }
            }

            log(`id: ${node.id} | ${node.state}`)
        })

        start(node)
    } catch (error) {
        log(`error ${error}`)
    }
}

Child(oscillate)