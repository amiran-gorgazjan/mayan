const { Command } = require('commander');
const forEachProject = require('../tools/forEachProject');
const getShell = require('../tools/shell');

const program = new Command();

program
    .description('Runs \'git push\' for all projects')
    .option('-d, --dry-run', 'Dry run - shows the commands that would be executed')
    .parse(process.argv);

const { error } = console;
const { execAsync } = getShell(program.opts());

async function run() {
    await forEachProject({
        showMissingWarning: false,
        asynchronous: true,
        callback: async ({ repoPath }) => {
            await execAsync('git pull', { cwd: repoPath });
        },
    });
}

run().catch(e => { error(e); process.exit(1); });
