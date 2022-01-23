/* eslint-disable no-console */

const shell = require('shelljs');
const chalk = require('chalk');
const { assertGit } = require('./tools/assertions');
const getConfig = require('./tools/config');

assertGit();

const relativePaths = process.argv.splice(2);
const command = relativePaths.pop();

console.info(chalk.blue('Running command: ') + chalk.green(command));

async function run() {
    const rcConfig = await getConfig();

    rcConfig.repositories.forEach(({ absPath }) => {
        console.info(' ');
        console.info(chalk.underline.green('Workspace:', absPath));
        shell.cd(absPath);
        shell.exec(command);
    });
}

run().then().catch(e => {
    console.error(e);
    process.exit(1);
});
