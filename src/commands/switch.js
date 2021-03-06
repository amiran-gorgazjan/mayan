const runAliasCommand = require('./tools/runAliasCommand');

runAliasCommand({
    command: args => `git switch ${args.join(' ')}`,
    description: 'Switch to branch. Alias of "mayan -- git switch"',
}).then().catch(e => { console.error(e); process.exit(1); });
