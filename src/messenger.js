const Zyre = require('zyre.js')

class Messenger {
    constructor(name) {
        this.debug = false
        this.core = new Zyre({ name })
        this.started = this.core.start()
        this.channels = []
        this.core.setEncoding('utf8')
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

    /**
     * 
     * @param {function} listener 
     * @param {string} channel 
     * @param {*} message 
     * @param {string} group 
     * @param {string} name  name of node that sent the message
     */
    listening(listener, channel, message, group, name) {
        if (typeof listener === 'function' && group === channel) listener(message, name)
    }

    /**
     * 
     * @param {*} channel 
     * @param {function} listener `(message: string, name?: any)`
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


module.exports = { Messenger }