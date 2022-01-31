const { Command } = require('commander');
const chalk = require('chalk');
const shell = require('shelljs');
const getConfig = require('./tools/config');
const link = require('./tools/link');
const getShell = require('./tools/shell');
const forEachProject = require('./tools/forEachProject');

const { info, error } = console;
const { green } = chalk;
const program = new Command();

program
    .description('Clone all repositories defined in .hulkyrc.js and run npm i at the end.');

program.parse(process.argv);
const { execAsync } = getShell(program.opts());

async function run() {
    const config = await getConfig({ includeMissing: true });

    await forEachProject({
        showMissingWarning: false,
        includeMissing: true,
        asynchronous: true,
        callback: async ({
            repository, repoPath, exists,
        }) => {
            const { path, branch, url } = repository;

            // Skip the repository already exists
            if (exists) {
                return;
            }

            info(path, green(`Cloning ${url}...`));
            await execAsync(`git clone ${url} ${repoPath}`, { cwd: config.dirname });

            info(path, green(`Checking out ${branch}...`));
            await execAsync(`git checkout ${branch}`, { cwd: repoPath });

            info(path, green('Running the first time local installation...'));
            await execAsync('npm i', { cwd: repoPath });
        },
    });

    await link();

    info(green('Installing dependencies. This may take a while...'));
    shell.cd(config.dirname);
    shell.exec('npm i');

    info(green('Done! You can now run hulky check to compare the versions of the packages in the repositories.'));
}

run().then().catch(e => { error(e); process.exit(1); });
