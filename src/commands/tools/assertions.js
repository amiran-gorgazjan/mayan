const shell = require('shelljs');

module.exports = {
    assertGit() {
        if (!shell.which('git')) {
            shell.echo('Sorry, this script requires git');
            shell.exit(1);
        }
    },

    assertWorkspaces(workspacePatterns) {
        if (!workspacePatterns || workspacePatterns.length === 0) {
            shell.echo('Sorry, this script requires a package.json with workspaces');
            shell.exit(1);
        }
    },
};
