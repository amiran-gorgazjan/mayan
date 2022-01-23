const { Command } = require('commander');
const chalk = require('chalk');
const forEachProject = require('./tools/forEachProject');
const getShell = require('./tools/shell');
const getConfig = require('./tools/config');

const program = new Command();

program
    .description('Discard all changes and reset the repositories to the base branches')
    .option('-d, --dry-run', 'Dry run - shows the commands that would be executed')
    .parse(process.argv);

const { info, error } = console;
const { green } = chalk;
const commandLineOptions = program.opts();
const { execAsync } = getShell(commandLineOptions);

async function run() {
    const config = await getConfig();

    await forEachProject({
        asynchronous: true,
        callback: async ({ repository, repoPath }) => {
            const { path, branch } = repository;

            info(green(`Resetting ${path}...`));

            const branchNameResult = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
            const currentBranch = branchNameResult.trim();

            await execAsync('git reset --hard', { cwd: repoPath });
            await execAsync('git clean -fd', { cwd: repoPath });

            if (currentBranch !== branch) {
                await execAsync(`git checkout ${branch}`, { cwd: repoPath });
            }

            await execAsync('git pull', { cwd: repoPath });
        },
    });

    info(green('Installing dependencies...'));

    await execAsync('npm i', { cwd: config.dirname });
}

run().then().catch(e => { error(e); process.exit(1); });
