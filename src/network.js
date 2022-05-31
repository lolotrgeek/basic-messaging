const Zyre = require('zyre.js')

class Node {
    /**
     * 
     * @param {function} channel name of channel to join
     */
    constructor(channel) {
        this.debug = true
        this.core = new Zyre()
        this.started = this.core.start()
        this.channels = []
        if (this.debug === "network") {
            console.log(`Core:`, this.core)
            this.core.on('disconnect', console.log)
            this.core.on('expired', console.log)
            this.core.on('leave', console.log)
            this.core.on('connect', console.log)
            this.core.on('join', console.log)
        }
    }

    joined(channel) {
        return this.channels.find(joined_channel => joined_channel === channel)
    }

    join(channel) {
        if (typeof channel !== "string") return false
        this.started.then(() => {
            if (!this.joined(channel)) {
                if (this.debug) console.log(`Joining Channel: ${typeof channel}::${channel}`)
                this.core.join(channel)
                this.channels.push(channel)
            }
        })
    }

    listening(listener, channel, message, group) {
        if (typeof listener === 'function' && group === channel) listener(message)
    }

    listen(channel, listener) {
        this.join(channel)
        this.core.on("shout", (id, name, message, group) => this.listening(listener, channel, message, group))
    }

    send(channel, message) {
        this.core.shout(channel, message)
    }

}


module.exports = { Node }