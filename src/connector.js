
class Connector {
    constructor(channel, messenger) {
        this.channel = channel
        this.messenger = messenger
        this.max = 2
        this.nodes = []
        
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
        this.messenger.listen(this.channel, (message, name) => {
            let found = this.nodes.find(node => node.name === name)
            if(found) listener(message)
        })
    }

    send(message) {
        this.messenger.send(this.channel, message)
    }

}
module.exports = { Connector }