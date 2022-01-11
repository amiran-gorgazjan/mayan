const runAliasCommand = require('../tools/runAliasCommand');

runAliasCommand({
    command: args => `git checkout ${args.join(' ')}`,
    description: 'Alias of "legion -- git checkout"',
}).then().catch(e => { console.error(e); process.exit(1); });
