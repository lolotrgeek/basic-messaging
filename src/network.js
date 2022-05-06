const Zyre = require('zyre.js')
const ping = require('ping')
class Node {
    constructor(callback) {
        this.callback = callback
        this.core = new Zyre()
        this.distances = {} // {id: sent: timestamp, received: timestamp distance: ms}
        this.heartbeat = 2000
        this.peers = {}
        this.core.start().then(() => {
            this.core.join(this.core.getIdentity())
        })

        this.core.on('connect', (id, name, headers) => {
            this.core.join(id)
            this.distances[id] = {}
            // this.distances[id].distance = []
            this.ping(id)
        })

        this.core.on("whisper", (id, name, message) => {
            if (message === "ping") this.pong(id)
            if (message === "pong") this.received(id)
        })

        this.core.on("shout", (id, name, message, group) => {
            this.next(id)
            if (typeof this.callback === 'function') this.callback(message)
        })

        this.core.on('disconnect', (id, name) => { delete this.distances[id] })
        this.core.on('expired', (id, name) => { delete this.distances[id] })
    }

    send(message) {
        let channel = this.core.getIdentity()
        console.log(`message on ${channel}: `, message)
        this.core.shout(channel, message)
    }

    pong(id) {
        this.core.whisper(id, "pong")
        // this.distances[id].received = 0
        // this.distances[id].sent = Date.now()
    }
    ping(id) {
        this.core.whisper(id, "ping")
        this.distances[id].sent = Date.now()
    }
    received(id) {
        this.distances[id].received = Date.now()
        let distance = this.distances[id].received - this.distances[id].sent
        // this.distances[id].distance = [...this.distances[id].distance, distance]
        this.distances[id].distance = distance
        console.log("distances", this.distances)
    }
    next(id) {
        this.ping(id)
    }
    ping_all() {
        this.peers = this.core.getPeers()
        for (let peer in this.peers) {
            this.ping(peer)
        }
    }
}


module.exports = { Node }