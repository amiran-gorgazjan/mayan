const { resolve } = require('path');
const { existsSync } = require('fs');
const chalk = require('chalk');
const getConfig = require('./config');

const { warn } = console;
const { bgYellow, black } = chalk;

let config;

function warnMissing(path) {
    warn(bgYellow(black('WARN')), `${path} does not exist. Run 'hulky init' to initialize uncloned repositories.`);
}

module.exports = async function forEachProject({
    showMissingWarning = false,
    includeMissing = false,
    asynchronous = false,
    callback = async () => {},
}) {
    config = config || await getConfig({ includeMissing });

    const { repositories } = config;

    const results = [];

    for (const repository of repositories) {
        const { path } = repository;

        const repoPath = resolve(config.dirname, path);
        const exists = existsSync(repoPath);

        // Skip the repository if it doesn't exist
        if (!exists) {
            if (showMissingWarning) warnMissing(path);
            if (!includeMissing) continue;
        }

        const promise = callback({
            repository, repoPath, config, exists,
        });

        results.push(asynchronous ? promise : await promise);
    }

    return asynchronous ? await Promise.all(results) : results;
};
