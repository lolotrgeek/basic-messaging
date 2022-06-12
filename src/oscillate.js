const { Child } = require("./child")
const { Node } = require("./node")
const { Chain } = require("basic-chain")
const { decode, encode, log } = require("./helpers")

const isState = data => typeof data === "object" && data.state && !isNaN(data.state) && typeof data.chain_id === 'string'
const invert_state = state => state === 0 ? 1 : 0

class Oscillate {
    constructor() {
        try {
            this.node = new Node()
            this.chain = new Chain()
            this.chain.debug = false
            this.name = this.node.core._name
            this.chain.put(this.name)
            this.state = -1
            this.interval = 5000
            this.spinner = spin => setInterval(spin, this.interval)
            this.debug = false
        } catch (error) {
            log(`constructor: ${error}`)
        }
    }

    sendState(to) {
        try {
            setTimeout(() => this.node.send(to, encode({ chain_id: this.chain.id, state: this.state })), 1000)
        } catch (error) {
            log(`sendState ${error}`)
        }

    }

    sayState(state, name) {
        try {
            log(`Heard: state ${state} from ${name}`)
        } catch (error) {
            log(`sayState ${error}`)
        }

    }

    isValidNeighbor(neighbor_block) {
        try {
            // log(`isValidNeighbor? ${neighbor_block.data}`)
            return neighbor_block && typeof neighbor_block.data === 'string'
        } catch (error) {
            log(`isValidNeighbor ${error}`)
        }

    }

    getNeighborName(neighbor) {
        try {
            return neighbor.data
        } catch (error) {
            log(`getNeighborName ${error}`)
        }
    }

    /**
     * Selects a the above neighbor node
     * @param {*} self_location 
     * @returns 
     */
    selectNeighborAbove(self_location) {
        try {
            let neighbor_up = this.chain.blocks[self_location + 1]
            if (this.isValidNeighbor(neighbor_up)) return this.getNeighborName(neighbor_up)
            else return null
        } catch (error) {
            log(`selectNeighborAbove ${error}`)
        }
    }

    /**
     * Selects a the below neighbor node
     * @param {*} self_location 
     * @returns 
     */
    selectNeighborBelow(self_location) {
        try {
            let neighbor_down = this.chain.blocks[self_location - 1]
            if (this.isValidNeighbor(neighbor_down)) return this.getNeighborName(neighbor_down)
            else return null
        } catch (error) {
            log(`selectNeighborBelow ${error}`)
        }
    }

    /**
     * Selects a the neighbor node, first looking above then below
     * @param {*} self_location 
     * @returns 
     */
    selectNeighbor(self_location) {
        try {
            let neighbor_above = this.selectNeighborAbove(self_location)
            if (neighbor_above) return neighbor_above
            let neighbor_below = this.selectNeighborBelow(self_location)
            if (neighbor_below) return neighbor_below
            return null
        } catch (error) {
            log(`selectNeighbor ${error}`)
        }
    }

    /**
     * The index of a block is a node's location
     * @returns 
     */
    getLocation(name) {
        try {
            let location = this.chain.blocks.findIndex(block => block.data === name)
            return location > -1 ? location : null
        } catch (error) {
            log(`getSelfLocation: ${error}`)
        }
    }

    /**
     * The position 
     * @returns first `1` , last `-1` or inbetween `0`
     */
    getPosition(location) {
        try {
            if (typeof location === 'number' && location === 0) return 1
            if (typeof location === 'number' && location === this.chain.blocks.length - 1) return -1
            return 0
        } catch (error) {
            log(`getPosition: ${error}`)
        }
    }

    /**
     * Adds a block to the local chain with the block data being the given node's name
     * @param {string} name is from node.core, and defined as `this.name` but to invoke peers this method allows for passing a `name`
     */
    update(name) {
        try {
            this.chain.put(name)
            this.node.send(name, encode(this.chain))
        } catch (error) {
            log(`update: ${error}`)
        }

    }

    listener(message, name) {
        try {
            let data = decode(message)
            if (this.chain.isValid(data)) {
                // log(data.blocks)
                this.chain.merge(data)
                if (this.debug === 'chain') log(this.chain ? `Merged ${this.chain}` : "broken chain...")
                // log(`${this.name} : ${this.chain.blocks.length}`)
            }
            else if (isState(data)) {
                if (data.chain_id === this.chain.id) {
                    if (data.state) {
                        // this.sayState(data.state, name)
                        let self_location = this.getLocation(this.name)
                        if (self_location === null) return

                        let position = this.getPosition(self_location)

                        let recpient
                        if (position === 1) {
                            log(`${this.name} | I'm first.`)
                            this.state = invert_state(this.state)
                            recpient = this.selectNeighborAbove(self_location)
                        }

                        if (position === 0) {
                            let sender_location = this.getLocation(name)
                            this.state = data.state
                            if (sender_location > self_location) recpient = this.selectNeighborBelow(self_location)
                            if (sender_location < self_location) recpient = this.selectNeighborAbove(self_location)
                        }

                        if (position === -1) {
                            log(`${this.name} | I'm last.`)
                            this.state = data.state
                            recpient = this.selectNeighborBelow(self_location)
                        }
                        // log(`${this.name} location ${self_location} -> chain ${this.chain.id}`)
                        if (typeof recpient === 'string') {
                            log(`${this.name} sending state ${this.state} to ${recpient}`)
                            this.sendState(recpient)
                        }
                    }
                }
                else this.node.send(name, encode(this.chain))
            }
        } catch (error) {
            log(`listener: ${error}`)
        }

    }

    test() {
        if (this.chain && this.chain.isValid(this.chain)) setInterval(() => {
            try { log(this.chain.blocks.length) }
            catch (error) { log(`test: ${error}`) }
        }, 5000)
    }

    run() {
        try {
            if (this.chain && this.chain.isValid(this.chain)) setTimeout(() => {
                try {
                    let self_location = this.getLocation(this.name)
                    if (self_location === null) return

                    let position = this.getPosition(self_location)
                    if (position === 1) this.state = invert_state(this.state)

                    if (this.debug === 'location') {
                        if (position === 1) log(`location : ${self_location} | I'm first.`)
                        log(`${this.name} location ${self_location} -> chain ${this.chain.id}`)
                        if (position === -1) log(`location : ${self_location} | I'm last.`)
                    }

                    let neighbor_name = this.selectNeighbor(self_location)
                    log(`Neighbor name: ${neighbor_name}`)
                    if (typeof neighbor_name === 'string') {
                        log(`${this.name} sending state to ${neighbor_name}`)
                        this.sendState(neighbor_name)
                    }

                } catch (error) {
                    log(`spin: ${error}`)
                }
            }, 5000)
            this.node.listen(this.name, (message, name) => this.listener(message, name))
            this.node.core.on("connect", (id, name) => this.update(name))
        } catch (error) {
            log(`run: ${error}`)
        }
    }
}

let service = () => {
    const oscillate = new Oscillate()
    oscillate.run()
}
Child(service)