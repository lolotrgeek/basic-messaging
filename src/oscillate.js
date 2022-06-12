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
            this.chain.debug = true
            this.name = this.node.core._name
            this.chain.put(this.name)
            this.state = -1
            this.interval = 5000
            this.spinner = spin => setInterval(spin, this.interval)
        } catch (error) {
            log(`constructor: ${error}`)
        }
    }

    sendState(to) {
        try {
            setTimeout(() => this.node.send(to, encode({ chain_id: this.chain.id, state: this.node.state })), 1000)
        } catch (error) {
            log(`sendState ${error}`)
        }

    }

    sayState(state, name) {
        try {
            let neighbor_position = this.chain.blocks.findIndex(block => block.data === name)
            if (neighbor_position > -1) log(`neighbor position: ${neighbor_position}`)
            else log(`neighbor${name} not found`)
        } catch (error) {
            log(`sayState ${error}`)
        }

    }

    isValidNeighbor(neighbor_block) {
        try {
            return neighbor_block && typeof neighbor_block.data === 'object'
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

    selectNeighbor(self_location) {
        try {
            let neighbor_up = this.chain.blocks[self_location + 1]
            let neighbor_down = this.chain.blocks[self_location - 1]
            if (this.isValidNeighbor(neighbor_up)) return this.getNeighborName(neighbor_up)
            else if (this.isValidNeighbor(neighbor_down)) return this.getNeighborName(neighbor_down)
            else return null
        } catch (error) {
            log(`selectNeighbor ${error}`)
        }
    }

    getSelfLocation() {
        try {
            // the index of a block is a node's location
            let location = this.chain.blocks.findIndex(block => block.data === this.name)
            return location > -1 ? location : null
        } catch (error) {
            log(`getSelfLocation: ${error}`)
        }

    }

    update(name) {
        try {
            // the data of a block is the this.node's name
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
                log(this.chain ? `Merged ${this.chain}` : "broken chain...")
                // log(`${this.name} : ${this.chain.blocks.length}`)
            }
            else if (isState(data)) {
                if (data.chain_id === this.chain.id) sayState(data, name)
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
            if (this.chain && this.chain.isValid(this.chain)) setInterval(() => {
                try {
                    let self_location = this.getSelfLocation()
                    log(`${this.name} location ${self_location} -> chain ${this.chain.id}`)
                    if (self_location) {
                        let neighbor_name = this.selectNeighbor(self_location)
                        if (neighbor_name) sendState(neighbor_name)
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