const { Command } = require('commander');
const forEachProject = require('./forEachProject');
const getShell = require('./shell');

module.exports = async function runAliasCommand({
    shouldRun = () => true,
    command = () => {},
    description,
    asynchronous = false,
}) {
    const program = new Command();

    program.description(description).allowUnknownOption().parse(process.argv);

    const commandLineOptions = program.opts();
    const { execAsync } = getShell(commandLineOptions);
    let addArgs = program.args;

    addArgs = addArgs.map(arg => {
        if (arg.startsWith('-')) {
            return arg;
        }

        return `"${arg}"`;
    });

    const commandToRun = command(addArgs);

    await forEachProject({
        asynchronous,
        callback: async repository => {
            console.info(`${repository.repoPath} > ${commandToRun}`);

            const isValid = await Promise.resolve(shouldRun(repository));

            if (!isValid || !commandToRun) {
                return;
            }

            await execAsync(commandToRun, { cwd: repository.repoPath });
        },
    });
};
