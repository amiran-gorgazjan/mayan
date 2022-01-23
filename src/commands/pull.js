const { Command } = require('commander');
const forEachProject = require('./tools/forEachProject');
const getShell = require('./tools/shell');
const getCurrentBranchName = require('./git/getCurrentBranchName');

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
            await execAsync('git remote prune origin', { cwd: repoPath });

            // Get current branch name
            const currentBranch = await getCurrentBranchName(repoPath);

            // Check if upstream is tracked
            const remoteBranch = await execAsync(`git ls-remote . origin/${currentBranch}`, { cwd: repoPath });
            const remoteTracked = Boolean(remoteBranch.trim());

            // Pull, if it is
            if (remoteTracked) {
                await execAsync('git pull', { cwd: repoPath });
            }
        },
    });
}

run().catch(e => { error(e); process.exit(1); });
