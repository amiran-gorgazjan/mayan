const { promisify } = require('util');
const { resolve } = require('path');
const forEachProject = require('./forEachProject');
const getConfig = require('./config');

const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);

module.exports = async function link() {
    const config = await getConfig();
    const paths = await forEachProject({
        asynchronous: true,
        callback: async ({
            repository, exists,
        }) => {
            const { path } = repository;

            if (!exists) {
                return null;
            }

            return path;
        },
    });
    const packageJsonPath = resolve(config.dirname, 'package.json');

    const packageJson = JSON.parse(await readFile(packageJsonPath));

    packageJson.workspaces = paths;

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};
