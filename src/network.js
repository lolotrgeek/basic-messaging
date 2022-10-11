const { Subscriber, Publisher } = require('cote')
const { randomUUID } = require('crypto')

class Node {
    constructor(name) {
        this.debug = false
        this.name = name ? name : randomUUID()
        this.config = { log: this.debug, helloLogsEnabled: this.debug, statusLogsEnabled: this.debug, logUnknownEvents: this.debug }
        this.core = new Publisher({ name: this.name }, this.config )
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
        let listening = new Subscriber({ name: `${this.name}` }, this.config)
        listening.on(channel, listener)
    }

    send(channel, message) {
        this.core.publish(channel, message)
    }

}


module.exports = { Node }