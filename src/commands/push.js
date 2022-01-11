const { Command } = require('commander');
const chalk = require('chalk');
const forEachProject = require('../tools/forEachProject');
const getShell = require('../tools/shell');

const program = new Command();

program
    .description('Push all branches that have changes compared to the base branch')
    .option('-d, --dry-run', 'Dry run - shows the commands that would be executed')
    .parse(process.argv);

const { info, error } = console;
const { green } = chalk;
const { execAsync } = getShell(program.opts());

async function run() {
    await forEachProject({
        showMissingWarning: false,
        callback: async ({ repository, repoPath }) => {
            const { path } = repository;

            const branchNameResult = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
            const currentBranch = branchNameResult.trim();

            if (branchNameResult.stderr || !currentBranch) {
                error(`Failed to get current branch for ${path}`);
                process.exit(1);
            }

            const canPushResult = await execAsync(
                `git rev-list --ignore-submodules --count ${repository.branch}...${currentBranch}`,
                { cwd: repoPath },
            );

            const noChanges = canPushResult.trim() === '0';

            if (noChanges) {
                return;
            }

            info(green(`Pushing ${path}...`));
            info(green(`Pushing ${repoPath}...`));

            await execAsync(`git push --set-upstream origin ${currentBranch}`, { cwd: repoPath });
        },
    });
}

run().then().catch(e => { error(e); process.exit(1); });
