const runAliasCommand = require('./tools/runAliasCommand');
const hasStagedFiles = require('./git/hasStagedFiles');

runAliasCommand({
    description: 'Commit in all repositories, alias of "hulky -- git commit"',
    asynchronous: true,

    async shouldRun({ repoPath }) {
        return await hasStagedFiles(repoPath);
    },

    command(args) {
        return `git commit ${args.join(' ')}`;
    },

}).catch(e => { console.error(e); process.exit(1); });
