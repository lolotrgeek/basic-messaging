const { Connector } = require('./connector')
const { Messenger } = require('./messenger')

class Node {
    constructor() {
        this.name = `n_${randomUUID()}`
        this.state = -1

        this.messenger = new Messenger(this.name)
        this.up = new Connector(this.name, "up", this.messenger)            
        this.down = new Connector(this.name, "down", this.messenger)            
    }

    //TODO: connection contract
    // Hears request to connect
    // request: "I connect my 'down' connector to any open connector of yours"
    // check for open slot: a slot is open
    // make channel, join channel, send channel to 
    // hears state from requestor -> contract fulfilled
    // assume connection, until no state after timeout

    // Send request to connect
    // if last request longer than request threshold, send a request
    // reserve open connector: 'down'
    // choose a peer
    // send: I connect my 'down' connector to any open connector of yours
    // wait for channel creation
    // on creation, connect and send state

    // TODO exponential pullback on requests:
    // make lots of requests early, then make less as we age
    // use recursive vars...
    
    // Broken contract
    // on leaving group, destroy group

}


module.exports = { Node }