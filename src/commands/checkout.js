const runAliasCommand = require('./tools/runAliasCommand');

runAliasCommand({
    description: 'Alias of "legion -- git checkout"',
    asynchronous: true,
    command: args => `git checkout ${args.join(' ')}`,
}).then().catch(e => { console.error(e); process.exit(1); });
