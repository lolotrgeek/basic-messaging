'use strict'

class Chain {
    constructor() {
        this.current = []
    }

    isChain(data) {
        return Array.isArray(data)
    }

    chooseLongest(chain) {
        if(chain.length > this.current.length) this.current = chain
    }

    update(chain, data) {
        if (chain && this.isChain(chain)) this.chooseLongest(chain)
        if (data) this.current.push(data)
    }
}



module.exports = { Chain }