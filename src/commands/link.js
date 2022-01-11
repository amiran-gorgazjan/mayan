const { Command } = require('commander');
const link = require('../tools/link');
const getShell = require('../tools/shell');
const getConfig = require('../tools/config');

const program = new Command();

program
    .description('Update package.json workspaces')
    .option('-d, --dry-run', 'Dry run - shows the commands that would be executed')
    .parse(process.argv);

const { execAsync } = getShell(program.opts());

async function run() {
    const config = await getConfig();

    await link();
    await execAsync('npm install', { cwd: config.dirname });
}

run().catch(e => { console.error(e); process.exit(1); });
