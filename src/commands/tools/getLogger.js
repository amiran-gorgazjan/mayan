module.exports = function getLogger(level, options) {
    if (!['log', 'info', 'error', 'warn'].includes(level)) {
        throw new Error(`Invalid level for getLogger: ${level}`);
    }

    const shouldLog = level !== 'log' || options.verbose;

    return function logger(...args) {
        if (shouldLog) {
            // eslint-disable-next-line no-console
            console[level](...args);
        }
    };
};
