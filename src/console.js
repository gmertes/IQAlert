const prefix = 'IQ Alert>';
const console = {
    log: (...args) => window.console.log(prefix, ...args),
    debug: (...args) => {if(DEBUG) window.console.log(prefix + "debug>", ...args)},
    warn: (...args) => window.console.warn(prefix, ...args),
    error: (...args) => window.console.error(prefix, ...args),
};

module.exports = console;