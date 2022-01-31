const { resolve, dirname } = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

// Recursively find the .hulkyrc.js file in the current directory or its parents
function findHulkyRc(dir) {
    const filePath = resolve(dir, '.hulkyrc.js');

    if (fs.existsSync(filePath)) {
        return filePath;
    }

    const parentDir = resolve(dir, '..');

    if (parentDir === dir) {
        return null;
    }

    return findHulkyRc(parentDir);
}

const filePath = findHulkyRc(process.cwd());

if (!filePath) {
    // eslint-disable-next-line no-console
    console.error('No .hulkyrc.js file found in the current directory or its parents');
    process.exit(1);
}

const configCache = null;

module.exports = async function getConfig({ includeMissing = false } = {}) {
    if (configCache) {
        return configCache;
    }

    const rc = await import(filePath);

    rc.default.repositories = await Promise.all(
        rc.default.repositories.map(async repo => {
            const { path } = repo;
            const absPath = resolve(dirname(filePath), path);
            const packageJsonPath = resolve(absPath, 'package.json');

            if (!fs.existsSync(packageJsonPath)) {
                if (includeMissing) {
                    return {
                        ...repo,
                        absPath,
                        missing: true,
                    };
                }
                return null;
            }

            const packageJson = JSON.parse(await readFile(resolve(absPath, 'package.json')));

            return {
                ...repo,
                absPath,
                packageJson,
            };
        }),
    );

    rc.default.repositories = rc.default.repositories.filter(repository => repository !== null);

    const config = {
        filePath,
        dirname: dirname(filePath),
        ...rc.default,
    };

    return config;
};
