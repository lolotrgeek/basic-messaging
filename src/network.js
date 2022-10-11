<<<<<<< HEAD
'use strict'
const zmq = require("zeromq")

class Node {
    constructor(name) {
        if (!name) throw "Must pass a name to Node!"
        this.debug = false
        this.port = 3000
        this.base = "tcp://127.0.0.1:"
        this.address = this.base + this.port
        this.publisher
        this.subscriber = new zmq.Subscriber
    }

    decode(data) {
        try { return JSON.parse(data) } catch (error) { return data }
    }

    encode(data) {
        return JSON.stringify(data)
    }

    /**
     * 
     * @param {string | object} channel name of channel or `{to: id}`
     * @param {*} message 
     */
    send(channel, message, options) {
        return new Promise(async resolve => {
            try {
                if(!this.publisher) {
                    this.publisher = new zmq.Publisher
                    await this.publisher.bind(this.address)
                }
                console.log("sending", message)
                return resolve(await this.publisher.send([channel, this.encode(message)]))
            } catch (error) {
                console.log("Caught:" , error)
                this.port+1
                resolve(await this.send(channel, message, options))
            }
        })
    }

    /**
     * 
     * @param {string} channel 
     * @param {function} listener `(msg: string)`
     */
    async listen(channel, listener) {

        this.subscriber.connect(this.address)
        this.subscriber.subscribe(channel)

        for await (const [topic, msg] of this.subscriber) {
            listener(this.decode(msg))
            // console.log("received a message related to:", topic, "containing message:", msg)
        }

    }
=======
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

>>>>>>> basic-cote
}


module.exports = { Node }