const Zyre = require('zyre.js')
const { Encode, Decode } = require('./parse')

class Node {
    constructor(callback) {
        this.callback = callback
        this.identifier = message => console.log(message)
        this.removed = message => message
        this.core = new Zyre()
        this.distances = {} // {id: sent: timestamp, received: timestamp distance: ms}
        this.heartbeat = 2000
        this.peers = {}
        this.core.start().then(() => this.core.join(this.core.getIdentity()))
        this.core.on('connect', (id, name, headers) => this.hear_connect(id))
        this.core.on("whisper", (id, name, message) => this.hear_whisper(id, message))
        this.core.on("shout", (id, name, message, group) => this.hear_shout(id, message))
        this.core.on('disconnect', (id, name) => this.hear_removed(id))
        this.core.on('expired', (id, name) => this.hear_removed(id))
    }

    /**
     * When a peer connects, join their channel and ping them
     * @param {string} peer id of peer connecting
     */
    hear_connect(peer) {
        this.core.join(peer)
        this.distances[peer] = {}
        // this.distances[peer].distance = []
        this.ping(peer)
    }

    /**
     * 
     * @param {string} peer id of peer that whispered
     * @param {*} message 
     */
    hear_whisper(peer, message) {
        if (message === "ping") this.pong(peer)
        if (message === "pong") this.received(peer)
        if (message === "identify") this.identify_self(peer)
        else {
            message = Decode(message)
            if (typeof message === 'object' && message.id && message.distances) this.identifier(message)
        }
    }
    /**
     * 
     * @param {string} peer id of peer that shouted
     * @param {*} message 
     */
    hear_shout(peer, message) {
        this.next(peer)
        if (typeof this.callback === 'function') this.callback(message)
    }

    hear_removed(peer) {
        delete this.distances[peer]
        this.removed(peer)
    }

    send(message) {
        let channel = this.core.getIdentity()
        console.log(`message on ${channel}: `, message)
        this.core.shout(channel, message)
    }

    pong(peer) {
        this.core.whisper(peer, "pong")
        // this.distances[id].received = 0
        // this.distances[id].sent = Date.now()
    }

    ping(peer) {
        if(!peer || !this.distances[peer]) return
        this.core.whisper(peer, "ping")
        this.distances[peer].sent = Date.now()
    }

    received(peer) {
        this.distances[peer].received = Date.now()
        let distance = this.distances[peer].received - this.distances[peer].sent
        // this.distances[peer].distance = [...this.distances[peer].distance, distance]
        this.distances[peer].distance = distance
        console.log("distances", this.distances)
    }
    next(peer) {
        this.ping(peer)
    }
    ping_all() {
        this.peers = this.core.getPeers()
        for (let peer in this.peers) {
            this.ping(peer)
        }
    }

    identify_self(to) {
        this.core.whisper(to, Encode({ id: this.core.getIdentity(), distances: this.distances }))
    }

    identify(peer) {
        this.core.whisper(peer, "identify")
    }
    identify_all() {
        let peers = this.core.getPeers()
        for (let peer in peers) this.identify(peer)
    }


}


module.exports = { Node }