'use strict'
const Zyre = require('zyre.js')

class Node {
    constructor(name) {
        if(!name) throw "Must pass a name to Node!"
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

    decode(data) {
        try {
            return JSON.parse(data)
        } catch (error) {
            return data
        }
    }

    encode(data) {
        return JSON.stringify(data)
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

    join_all(listener) {
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
        if (typeof listener === 'function' && group === channel) listener(this.decode(message), name)
    }

    /**
     * 
     * @param {string | object} channel name of channel or `{from: ""}` to listen for requests
     * @param {function} listener `(message: string, name?: any)`
     */
    listen(channel, listener) {
        if (typeof channel === 'object' && channel.from) {
            this.core.on("whisper", (id, name, message) => this.listener(message, id, name))
        }
        else {
            if (channel === "*") this.join_all(listener)
            else this.join(channel)
            this.core.on("shout", (id, name, message, group) => this.listening(listener, channel, message, group, name))
        }
    }

    /**
     * 
     * @param {string | object} channel name of channel or `{to: id}`
     * @param {*} message 
     * @param {integer} [timeout] *optional* how long to wait before sending message
     */
    send(channel, message, timeout) {
        if (typeof channel === 'object' && channel.to) this.core.whisper(channel.to, this.encode(message))
        else if (typeof timeout === 'number') setTimeout(() => this.core.shout(channel, this.encode(message)), timeout)
        else this.core.shout(channel, this.encode(message))
    }

}


module.exports = { Node }