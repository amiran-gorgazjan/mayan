const { Command } = require('commander');
const { resolve } = require('path');

const resolveRelative = path => resolve(__dirname, path);
const program = new Command();

program
    .version('0.0.1')

    .command('init', 'Initialise repositories defined in the rc file', {
        executableFile: resolveRelative('commands/init.js'),
    })

    .command('run', 'Run a command in every repository', {
        executableFile: resolveRelative('commands/run.js'),
    })

    .command('check', 'Compare the versions of the packages in the repositories', {
        executableFile: resolveRelative('commands/check.js'),
    })

    .command('reset', 'Discard all changes and reset all repositories to their base branch', {
        executableFile: resolveRelative('commands/reset.js'),
    })

    .command('push', 'Push all branches that have changes compared to the base branch', {
        executableFile: resolveRelative('commands/push.js'),
    })

    .command('add', 'Adds all files to staging. Alias of "mayan -- git add ..."', {
        executableFile: resolveRelative('commands/add.js'),
    })

    .command('commit', 'Commits in all repositories. Alias of "mayan -- git commit ..."', {
        executableFile: resolveRelative('commands/commit.js'),
    })

    .command('status', 'Get a simple overview of all the repository git statuses', {
        executableFile: resolveRelative('commands/status.js'),
    })

    .command('link', 'Update package.json workspaces based on .mayan.js', {
        executableFile: resolveRelative('commands/link.js'),
    })

    .command(
        'upgrade',
        'upgrade the dependencies to the exact version of the packages in the workspace',
        { executableFile: resolveRelative('commands/upgrade.js') },
    )

    .command('checkout', 'Alias of "mayan -- git checkout"', {
        executableFile: resolveRelative('commands/checkout.js'),
    })

    .command('pull', 'Pulls all repositories. Alias of "mayan -- git pull"', {
        executableFile: resolveRelative('commands/pull.js'),
    })

    .command('list', 'Lists all repositories.', {
        executableFile: resolveRelative('commands/list.js'),
    })

    .command('switch', 'Switch to branch in all repositories.', {
        executableFile: resolveRelative('commands/switch.js'),
    })

    .command('snap', 'Create a snapshot of the current branch state of the repositories.', {
        executableFile: resolveRelative('commands/list.js'),
    });

// eslint-disable-next-line import/prefer-default-export
module.exports = function cli(argv) {
    program.parse(argv);
};
