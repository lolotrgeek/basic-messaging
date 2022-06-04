const Zyre = require('zyre.js')

class Node {
    constructor(name) {
        this.debug = false
        this.core = new Zyre({ name })
        this.started = this.core.start()
        this.state = 0
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

    joining(channel) {
        if (this.debug) console.log(`Joining Channel: ${typeof channel}::${channel}`)
        this.core.join(channel)
        this.channels.push(channel)
    }

    join(channel) {
        if (typeof channel !== "string") return false
        this.started.then(() => {
            if (!this.joined(channel)) this.joining(channel)
        })
    }

    join_all(listener){
        let groups = this.core.getGroups()
        for (let channel in groups) {
            this.join(channel)
            this.core.on("shout", (id, name, message, group) => this.listening(listener, channel, message, group, name))
        }
    }

    listening(listener, channel, message, group, from) {
        if (typeof listener === 'function' && group === channel) listener(message, from)
    }

    /**
     * 
     * @param {*} channel 
     * @param {function} listener `(message: string, from?: any)`
     */
    listen(channel, listener) {
        if(channel === "*") this.join_all(listener)
        else this.join(channel)
        this.core.on("shout", (id, name, message, group) => this.listening(listener, channel, message, group, name))        
    }

    send(channel, message) {
        this.core.shout(channel, message)
    }

}


module.exports = { Node }