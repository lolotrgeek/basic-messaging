const { Subscriber, Publisher } = require('cote')
const { randomUUID } = require('crypto')

class Node {
    constructor(name) {
        this.debug = false
        this.name = name ? name : randomUUID()
        this.core = new Publisher({ name: this.name }, { log: this.debug })
        this.channels = []
    }

    joined(channel) {
        return this.channels.find(joined_channel => joined_channel === channel)
    }

    join(channel) {
        if (typeof channel !== "string") return false
        if (!this.joined(channel)) {
            if (this.debug) console.log(`Joining Channel: ${typeof channel}::${channel}`)
            this.channels.push(channel)
        }

    }

    listen(channel, listener) {
        this.join(channel)
        let listening = new Subscriber({ name: `${this.name}` }, { log: this.debug })
        listening.on(channel, listener)
    }

    send(channel, message) {
        this.core.publish(channel, message)
    }

}


module.exports = { Node }