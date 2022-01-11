const runAliasCommand = require('../tools/runAliasCommand');
const hasStagedFiles = require('../tools/hasStagedFiles');

runAliasCommand({
    description: 'Commit in all repositories, alias of "legion -- git commit"',

    async shouldRun({ repoPath }) {
        return await hasStagedFiles(repoPath);
    },

    command(args) {
        return `git commit ${args.join(' ')}`;
    },

}).catch(e => { console.error(e); process.exit(1); });
