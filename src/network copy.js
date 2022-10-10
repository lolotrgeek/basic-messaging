'use strict'
const zmq = require("zeromq")

class Node {
    constructor(name) {
        if (!name) throw "Must pass a name to Node!"
        this.debug = false
        this.port = 3000
        this.base = "tcp://127.0.0.1:"
        this.address = this.base + this.port
        this.publisher = new zmq.Publisher
        this.subscriber = new zmq.Subscriber
        this.publisher_started
        this.subscriber_started
        this.publisher.bind(this.address).then(() => this.publisher_started = true)
    }

    decode(data) {
        try { return JSON.parse(data) } catch (error) { return data }
    }

    encode(data) {
        return JSON.stringify(data)
    }

    joined(channel) {

    }

    join(channel) {

    }

    /**
     * 
     * @param {string | object} channel name of channel or `{to: id}`
     * @param {*} message 
     */
    send(channel, message, options) {
        return new Promise(async resolve => {
            if (this.publisher_started) return await this.publisher.send([channel, this.encode(message)])
            else setTimeout(async () => resolve(await this.send(channel, message, options)), 1000)
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
}


module.exports = { Node }