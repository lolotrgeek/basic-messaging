const debug = false
/**
 * Convert a function into a subprocess
 * @param {function} service the function to be converted
 */
function Child(service) {
    if (process.send && debug) process.send({ starting: service.name })
    process.on('message', message => {
        if (typeof message.id === "number") {
            try {
                service(message.id.toString())
            } catch (error) {
                process.send(error)
                // process.exit()
            }
        }
    })
}

module.exports = { Child }