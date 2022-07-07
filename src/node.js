const { randomUUID } = require('crypto')
const { Connector } = require('./connector')
const { Messenger } = require('./messenger')

global.randint = function randint(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

class Node {
    constructor() {
        this.name = `n_${randomUUID().substring(0, 8)}`
        this.state = -1

        this.request_threshold = 3000
        this.time_since_last_request = 0

        this.waiting_threshold = 1000
        this.waiting = 0
        this.waiting_for_id = ''
        this.reserved_connector = -1

        this.messenger = new Messenger(this.name)

        this.connectors = [
            { up: null },
            { down: null },
            { left: null },
            { right: null },
        ]
    }

    find_open() {
        let potentially_open = this.connectors.findIndex(connector => !Object.values(connector)[0])
        if (potentially_open === this.reserved_connector) return -1
        return potentially_open
    }

    connector_name(connector_position) {
        return Object.keys(this.connectors[connector_position])[0]
    }

    request() {
        this.reserved_connector = this.find_open()
        if (this.reserved_connector > -1) {
            let peers = this.messenger.core.getPeers()
            let selected_peer = peers[randint(0, peers.length)]
            let message = { request: "connect", connector: this.connector_name(this.reserved_connector) }
            this.messenger.send({ to: selected_peer.id }, message)
            this.waiting_for_id = selected_peer.id
            this.time_since_last_request = 0
        }
    }
    create_Connector(channel, connector) {
        let new_connector = {}
        new_connector[connector] = new Connector(channel, this.messenger)
        new_connector[connector].connect(channel)
        new_connector[connector].listen(connector_listener)
        this.connectors[this.reserved_connector] = new_connector
    }

    connector_listener(message) {
        if (this.is_state(message)) this.hears_state(message)
    }

    is_state(message) {
        return typeof message === "number"
    }

    hears_state(message, name) {
        this.state = message
        console.log(`state: ${message}`)
    }

    hears_response(message, name) {
        let connector = this.connector_name(this.reserved_connector)
        // let channel = `${connector}>${this.name}+${message.connector}<${name}`
        this.create_Connector(message.channel, connector)
        this.reserved_connector = -1
        this.waiting_for_id = ''
    }


    hears_request(message, name) {
        let open_connector = this.find_open()
        if (open_connector > -1) {
            this.reserved_connector = this.connectors[open_connector]
            let connector = this.connector_name(this.reserved_connector)
            let channel = `${message.connector}>${name}+${connector}<${this.name}`
            this.create_Connector(channel, connector)
            this.respond(connector, channel)
            this.reserved_connector = -1
            this.waiting_for_id = ''
        }
    }
    is_response(message) {
        return id === this.waiting_for_id && typeof message === 'object' && typeof message.connector === 'string' && typeof message.channel === 'string'
    }
    
    is_request(message) {
        return typeof message === 'object' && message.request === 'connect'
    }

    listen() {
        this.messenger.core.on("whisper", (id, message, name) => {
            if (this.time_since_last_request >= this.request_threshold) this.reset_waiting()
            if (this.is_response) this.hears_response(message, name)
            if (this.is_request) this.hears_request(message, name)
        })
    }

    respond(connector, channel) {
        let message = { response: "connect", connector, channel }
        this.messenger.send({ to: selected_peer.id }, message)
    }

    reset_waiting() {
        this.waiting = 0
        this.waiting_for_id = ''
        this.reserved_connector = -1
    }

    is_waiting() {
        return this.waiting_for_id.length > 0
    }

    is_requestReady() {
        return this.time_since_last_request >= this.request_threshold
    }

    is_doneWaiting() {
        return this.waiting >= this.waiting_threshold
    }

    get_Connector(connector) {
        return Object.values(connector)[0]
    }

    sendState() {
        this.connectors.forEach(connector => {
            let Connector = get_Connector(connector)
            if (Connector) {
                Connector.send(this.state)
            }
        })
    }

    step() {
        if (this.is_requestReady) this.request()
        if (this.is_waiting()) this.waiting++
        if (this.is_doneWaiting()) this.reset_waiting()
        this.time_since_last_request++
    }

    start() {
        this.listen()
        setInterval(this.step, 2000)
    }
}


module.exports = { Node }