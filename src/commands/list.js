const { Command } = require('commander');
const chalk = require('chalk');
const forEachProject = require('./tools/forEachProject');
const getCurrentBranchName = require('./git/getCurrentBranchName');

const program = new Command();

program
    .description('Push all branches that have changes compared to the base branch')
    .option('-d, --dry-run', 'Dry run - shows the commands that would be executed')
    .parse(process.argv);

const { info, error } = console;
const {
    green, yellow, gray,
} = chalk;

async function run() {
    const reports = await forEachProject({
        showMissingWarning: false,
        includeMissing: true,
        asynchronous: true,
        callback: async ({
            repository, repoPath, exists,
        }) => ({
            name: repository.packageJson.name,
            path: repository.path,
            absPath: repoPath,
            branch: await getCurrentBranchName(repoPath),
            exists,
        }),
    });

    reports.forEach(({
        absPath, branch, exists, name,
    }) => {
        info([
            exists ? green('✓') : yellow('✗'),
            name,
            green(`(${branch})`),
            gray(absPath),
        ].join(' '));
    });
}

run().then().catch(e => { error(e); process.exit(1); });
