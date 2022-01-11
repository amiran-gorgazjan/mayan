const { Command } = require('commander');
const chalk = require('chalk');
const shell = require('shelljs');
const { resolve } = require('path');
const { existsSync } = require('fs');
const getConfig = require('../tools/config');
const link = require('../tools/link');

const { info, error } = console;
const { green } = chalk;
const program = new Command();

program
    .description('Clone all repositories defined in .legionrc.js and run npm i at the end.');

program.parse(process.argv);

async function run() {
    const config = await getConfig({ includeMissing: true });

    config.repositories.forEach(repository => {
        const { path, branch, url } = repository;

        const repoPath = resolve(config.dirname, path);

        // Skip the repository already exists
        if (existsSync(repoPath)) {
            return;
        }

        info(green(`Initialising ${path}...`));

        shell.cd(config.dirname);

        info(green(`Cloning ${url}...`));
        shell.exec(`git clone ${url} ${repoPath}`);

        shell.cd(repoPath);

        info(green(`Checking out ${branch}...`));
        shell.exec(`git checkout ${branch}`);
    });

    await link();

    info(green('Installing dependencies. This may take a while...'));
    shell.cd(config.dirname);
    shell.exec('npm i');

    info(green('Done! You can now run legion check to compare the versions of the packages in the repositories.'));
}

run().then().catch(e => { error(e); process.exit(1); });
