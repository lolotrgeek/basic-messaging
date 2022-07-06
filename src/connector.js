
class Connector {
    constructor(name, location, messenger) {
        this.name = name.substring(0, 8) + "_" + location
        this.messenger = messenger
        this.max = 2
        this.channel = ''
        this.nodes = [this.name]
        
        this.messenger.core.on("join", (id, name, channel) => {
            if (channel === this.channel && this.nodes.length < this.max) {
                this.messenger.join(channel)
                this.nodes.push(name)
            }
        })
        this.messenger.core.on("leave", (id, name, channel) => {
            if (channel === this.channel) {
                this.nodes.splice(this.nodes.findIndex(node => node.name === name), 1)
            }
        })
    }

    connect(channel) {
        this.messenger.join(channel)
    }

    disconnect() {
        this.messenger.core.leave(channel)
    }

    listen(listener) {
        this.messenger.listen(this.channel, listener)
    }

    send(message) {
        this.messenger.send(this.channel, message)
    }

}
module.exports = { Connector }