const runAliasCommand = require('./tools/runAliasCommand');

runAliasCommand({
    command: args => `git add ${args.join(' ')}`,
    description: 'Add all changes to the staging area. Alias of "mayan -- git add"',
}).then().catch(e => { console.error(e); process.exit(1); });
