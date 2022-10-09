'use strict'
const Zyre = require('zyre.js')

class Node {
    constructor(name) {
        if (!name) throw "Must pass a name to Node!"
        this.debug = false
        this.core = new Zyre({ name, evasive: 2000, expired: 5000 })
        this.started = this.core.start()
        this.core.setEncoding('utf8')
        this.last_message
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
                if (this.debug === 'join') console.log("joined", found)
                if (typeof found === 'object' && Object.values(found).length > 0) resolve(found)
                else resolve(false)
            })
        })
    }

    join(channel) {
        return new Promise(resolve => {
            this.started.then(async () => {
                try {
                    let joined = await this.joined(channel)
                    if (joined) return resolve(joined)
                    else {
                        if (this.debug === 'join') console.log("joining", channel)
                        this.core.join(channel)
                        return setTimeout(async () => resolve(await this.join(channel)), 1000)
                    }
                } catch (error) {
                    resolve(error)
                }
            })
        })
    }

    shouldSend(peer) {
        if (typeof peer !== 'object') return false
        if (typeof peer.evasive !== 'boolean') return false
        if (peer.evasive === true) return false
        return true
    }

    send(channel, message) {
        return new Promise(async resolve => {
            this.started.then(async () => {
                if (typeof channel === 'object' && channel.to) this.core.whisper(channel.to, this.encode(message))
                let joined_peers = await this.join(channel)
                if (typeof joined_peers === 'object' && Object.values(joined_peers).length > 0) {
                    let peers = Object.values(joined_peers)
                    let noSend = false
                    for (var i = 0; i < peers.length; i++) {
                        if (this.shouldSend(peers[i]) === false) {
                            noSend = true
                            break
                        }
                    }
                    if (noSend === true) resolve(setTimeout(async () => await this.send(channel, message), 2000))
                    else resolve(await this.sender(channel, message))
                }
                else resolve(await this.sender(channel, message))
            })
        })
    }

    /**
     * 
     * @param {string | object} channel name of channel or `{to: id}`
     * @param {*} message 
     * @param {integer} [timeout] *optional* how long to wait before sending message
     */
    sender(channel, message, timeout) {
        return new Promise(resolve => {
            if (this.debug) console.log('sending...')
            if (typeof timeout === 'number') setTimeout(() => this.core.shout(channel, this.encode(message)), timeout)
            else this.core.shout(channel, this.encode(message))
            resolve(message)
        })
    }

    isTooOld(time) {
        return Date.now() - time > 10000
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
        this.last_message = Date.now()
        if (this.debug) console.log("hears", message, group)
        if (typeof listener === 'function' && group === channel) listener(this.decode(message), name)
    }

    listens(channel) {
        return new Promise(async resolve => {
            if (!this.last_message || this.isTooOld(this.last_message)) {
                resolve(await this.sender(channel, "ready"))
            }
            setTimeout(async () => resolve(await this.listens(channel)), 5000)
        })

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
                    let listens = this.core.on("whisper", (id, name, message) => listener(message, id, name))
                    resolve(listens)
                }
                else {
                    await this.join(channel)
                    let listens = this.core.on("shout", (id, name, message, group) => this.listening(listener, channel, message, group, name))
                    await this.listens(channel)
                    resolve(listens)
                }
            }).catch(() => resolve(false))
        })
    }

}


module.exports = { Node }