const runAliasCommand = require('./tools/runAliasCommand');

runAliasCommand({
    description: 'Alias of "mayan -- git checkout"',
    asynchronous: true,
    command: args => `git checkout ${args.join(' ')}`,
}).then().catch(e => { console.error(e); process.exit(1); });
