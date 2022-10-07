'use strict'
const Zyre = require('zyre.js')

class Node {
    constructor(name) {
        if (!name) throw "Must pass a name to Node!"
        this.debug = false
        this.core = new Zyre({ name })
        this.started = this.core.start()
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
        try { return JSON.parse(data) } catch (error) { return data }
    }

    encode(data) {
        return JSON.stringify(data)
    }

    joined(channel) {
        return new Promise(resolve => {
            this.started.then(() => {
                let found = this.core.getGroup(channel)
                resolve(found)
            })
        })
    }

    join(channel) {
        return new Promise(resolve => {
            this.started.then(async () => {
                console.log("joining", channel)
                this.core.join(channel)
                try {
                    let confirmed = await this.joined(channel)
                    if (confirmed) resolve(confirmed)
                    else setTimeout(async () => resolve(await this.join(channel)), 1000)
                } catch (error) {
                    resolve(error)
                }
            })
        })
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
     * @param {function} listener `(message: string, name?: any)` - `name` is used to identify sender
     */
    listen(channel, listener) {
        return new Promise(resolve => {
            this.started.then(async () => {
                if (typeof channel === 'object' && channel.from) {
                    this.core.on("whisper", (id, name, message) => listener(message, id, name))
                    resolve(true)
                }
                else {
                    await this.join(channel)
                    this.core.on("shout", (id, name, message, group) => this.listening(listener, channel, message, group, name))
                    resolve(true)
                }

            }).catch(() => resolve(false))
        })

    }

    /**
     * 
     * @param {string | object} channel name of channel or `{to: id}`
     * @param {*} message 
     * @param {integer} [timeout] *optional* how long to wait before sending message
     */
    send(channel, message, timeout) {
        return new Promise(resolve => {
            this.started.then(async () => {
                await this.join(channel)
                if (typeof channel === 'object' && channel.to) this.core.whisper(channel.to, this.encode(message))
                else if (typeof timeout === 'number') setTimeout(() => this.core.shout(channel, this.encode(message)), timeout)
                else this.core.shout(channel, this.encode(message))
                resolve(message)
            })
        })
    }

}


module.exports = { Node }