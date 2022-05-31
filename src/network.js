const Zyre = require('zyre.js')

const debug = false

const core = new Zyre()
const channels = []
let started = false

function joined(channel) {
    return channels.find(joined_channel => joined_channel === channel)
}

function join(channel) {
    core.join(channel)
    channels.push(channel)
}

function start(channel) {
    join(channel)
    started = true
}

/**
 * 
 * @param {string} channel  name of channel to listen to
 * @param {function} listener handle incoming messages
 */
function listen(channel, listener) {
    if (started === false) core.start().then(() => start(channel))
    if (channel && !joined(channel)) join(channel)
    if (typeof listener === 'function') core.on("shout", (id, name, message, group) => listener(message))
    if (debug) console.log(`Listener "${channel}" Added:`, core.getGroup(channel))
}

/**
 * 
 * @param {string} channel 
 * @param {*} message 
 */
function send(channel, message) {
    core.shout(channel, message)
}

if (debug) this.core.on('disconnect', console.log)

module.exports = { send, listen }