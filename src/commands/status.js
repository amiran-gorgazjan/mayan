const { Command } = require('commander');
const chalk = require('chalk');
const forEachProject = require('./tools/forEachProject');
const getShell = require('./tools/shell');

const program = new Command();

program
    .description('Push all branches that have changes compared to the base branch')
    .option('-d, --dry-run', 'Dry run - shows the commands that would be executed')
    .parse(process.argv);

const { info, error } = console;
const {
    green, yellow, bold, underline,
} = chalk;
const { execAsync } = getShell(program.opts());
const tab = '    ';

async function run() {
    const reports = await forEachProject({
        showMissingWarning: false,
        includeMissing: true,
        asynchronous: true,
        callback: async ({
            repository, repoPath, exists,
        }) => {
            const { path } = repository;

            if (!exists) {
                return {
                    name: path,
                    branch: '',
                    exists,
                    changes: [],
                    isActive: false,
                    behind: 0,
                    ahead: 0,
                    unpulled: 0,
                    unpushed: 0,
                };
            }

            const branchNameResult = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
            const currentBranch = branchNameResult.trim();

            const mainDiff = await execAsync(`git rev-list --left-right --count origin/${repository.branch}...${currentBranch}`, { cwd: repoPath });
            const [behind, ahead] = mainDiff.trim().split('\t').map(strNumber => Number(strNumber));

            const changesString = await execAsync('git status -s', { cwd: repoPath });
            const changes = changesString.split('\n').filter(line => !!line);

            const isChanged = (
                changes.length
                || behind || ahead
            );

            return {
                name: path,
                branch: currentBranch,
                exists,
                changes,
                isActive: process.cwd().startsWith(repoPath),
                behind,
                ahead,
                isChanged,
            };
        },
    });

    for (const {
        name, branch, exists, changes, isActive, isChanged, behind, ahead,
    } of reports) {
        if (!exists) {
            info(yellow(`${name} does not exist. Run 'hulky init' to initialize uncloned repositories.`));
            continue;
        }

        if (!isChanged) {
            continue;
        }

        let title = [
            isActive ? green('‣') : ' ',
            isActive ? underline(green(name)) : green(name),
            `(${branch})`,
            `${behind ? yellow(behind) : behind}|${ahead ? green(ahead) : ahead}`,
        ].join(' ');

        if (isActive) {
            title = bold(title);
        }

        info(title);

        if (changes.length) {
            info(yellow(changes.map(line => `${tab}${line}`).join('\n')));
        }
    }
}

run().then().catch(e => { error(e); process.exit(1); });
