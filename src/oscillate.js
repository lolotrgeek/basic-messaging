const { randomUUID } = require('crypto')
const { Child } = require("./child")
const { Node } = require("./node")
const { Chain } = require("basic-chain")
const { decode, encode, log } = require("./helpers")


class Oscillate {
    constructor() {
        try {
            this.name = `o_${Date.now()}_${randomUUID().substring(0, 8)}`
            this.node = new Node(this.name)
            this.chain = new Chain()
            this.chain.debug = false
            this.chain.put(this.name)
            this.state = -1
            this.interval = 5000
            this.debug = false
            this.location
            this.direction
            this.position
            this.spinner = spin => setInterval(spin, this.interval)
            this.isState = data => typeof data === "object" && data.state && !isNaN(data.state) && typeof data.chain_id === 'string'
            this.invert_state = state => state === 0 ? 1 : 0
        } catch (error) {
            log(`constructor: ${error}`)
        }
    }

    buildState() {
        try { return encode({ chain_id: this.chain.id, state: this.state, location: this.location, direction: this.direction }) } catch (error) { log(`buildState ${error}`) }
    }

    sendState(to) {
        try { setTimeout(() => this.node.send(to, this.buildState()), 1000) } catch (error) { log(`sendState ${error}`) }
    }

    sayState(state, name) {
        try { log(`Heard: state ${state} from ${name}`) } catch (error) { log(`sayState ${error}`) }
    }

    isValidNeighbor(neighbor_block) {
        try { return neighbor_block && typeof neighbor_block.data === 'string' } catch (error) { log(`isValidNeighbor ${error}`) }
    }

    getNeighborName(neighbor) {
        try {
            return neighbor.data
        } catch (error) { log(`getNeighborName ${error}`) }
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
        } catch (error) { log(`selectNeighborAbove ${error}`) }
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
        } catch (error) { log(`selectNeighborBelow ${error}`) }
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
        } catch (error) { log(`selectNeighbor ${error}`) }
    }

    /**
     * The index of a block is a node's location
     * @returns 
     */
    getLocation(name) {
        try {
            let location = this.chain.blocks.findIndex(block => block.data === name)
            return location > -1 ? location : null
        } catch (error) { log(`getLocation: ${error}`) }
    }

    /**
     * The position 
     * @returns
     */
    getPosition(location) {
        try {
            if (typeof location === 'number' && location === 0) return 'first'
            if (typeof location === 'number' && location === this.chain.blocks.length - 1) return 'last'
            return 'middle'
        } catch (error) { log(`getPosition: ${error}`) }
    }

    isNameValid(name) {
        return typeof name === 'string' && name[0] === 'o' && name[1] === "_"
    }

    /**
     * Adds a block to the local chain with the block data being the given node's name
     * @param {string} name is from node.core, and defined as `this.name` but to invoke peers this method allows for passing a `name`
     */
    update(name) {
        try {
            if (this.isNameValid(name)) {
                this.chain.put(name)
                this.node.send(name, encode(this.chain))
            }
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
                // log(this.chain.blocks)
            }
            else if (this.isState(data)) {
                if (data.chain_id === this.chain.id) {
                    if (data.state) {
                        this.location = this.getLocation(this.name)
                        if (this.location === null) return
                        this.position = this.getPosition(this.location)

                        if (this.position === 'first') {
                            // log(`${this.name} | I'm first.`)
                            this.state = this.invert_state(this.state)
                            this.recpient = this.selectNeighborAbove(this.location)
                            this.direction = 'up'
                        }

                        if (this.position === 'middle') {
                            let sender_location = this.getLocation(name)
                            this.state = data.state
                            if (sender_location > this.location) {
                                this.recpient = this.selectNeighborBelow(this.location)
                                this.direction = 'down'
                            }
                            if (sender_location < this.location) {
                                this.recpient = this.selectNeighborAbove(this.location)
                                this.direction = 'up'
                            }
                        }

                        if (this.position === 'last') {
                            // log(`${this.name} | I'm last.`)
                            this.state = data.state
                            this.recpient = this.selectNeighborBelow(this.location)
                            this.direction = 'down'
                        }
                        // log(`${this.name} location ${this.location} -> chain ${this.chain.id}`)
                        if (typeof this.recpient === 'string') {
                            log(`LOCATION ${this.location} | ${this.position} | ${this.name} | [${this.direction} ${this.state}] --> ${this.recpient}`)
                            this.sendState(this.recpient)
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
                    this.location = this.getLocation(this.name)
                    if (this.location === null) return

                    this.position = this.getPosition(this.location)
                    // if (position === 1) this.state = this.invert_state(this.state)

                    if (this.debug === 'location') {
                        if (this.position === 'first') log(`location : ${this.location} | I'm first.`)
                        log(`${this.name} location ${this.location} -> chain ${this.chain.id}`)
                        if (this.position === 'last') log(`location : ${this.location} | I'm last.`)
                    }

                    this.recpient = this.selectNeighbor(this.location)
                    if (typeof this.recpient === 'string') {
                        log(`LOCATION ${this.location} | ${this.position} | ${this.name} | [${this.direction} ${this.state}] --> ${this.recpient}`)
                        this.sendState(this.recpient)
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