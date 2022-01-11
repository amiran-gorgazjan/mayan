const { Command } = require('commander');
const chalk = require('chalk');
const getShell = require('../tools/shell');
const getConfig = require('../tools/config');

const program = new Command();

program
    .description('Upgrade the provided dependency to the latest version in all applicable projects')
    .option('-d, --dry-run', 'Dry run - shows the commands that would be executed')
    .parse(process.argv);

const { error, info } = console;
const { green } = chalk;
const commandLineOptions = program.opts();
const { execAsync } = getShell(commandLineOptions);
const targetPackages = program.args;

function hasPackage(name, packageJson) {
    return Boolean(
        (packageJson.dependencies && packageJson.dependencies[name])
        || (packageJson.devDependencies && packageJson.devDependencies[name])
        || (packageJson.peerDependencies && packageJson.peerDependencies[name]),
    );
}

function getVersionByName(name, repositories) {
    const repository = repositories.find(repo => repo.packageJson.name === name);

    if (!repository) {
        throw new Error(`Repository ${name} not found`);
    }

    return repository.packageJson.version;
}

async function run() {
    const { repositories, dirname } = await getConfig();

    for (const targetPackage of targetPackages) {
        await Promise.all(repositories.map(async repository => {
            const isPresent = hasPackage(targetPackage, repository.packageJson);

            if (!isPresent) {
                return;
            }

            const targetVersion = getVersionByName(targetPackage, repositories);
            info(green(repository.absPath));
            await execAsync(`npm i ${targetPackage}@${targetVersion}`, { cwd: repository.absPath });
        }));
    }

    info(green('Finalising...'));
    // Run `npm i` in the workspace root directory
    await execAsync('npm i', { cwd: dirname });
    info(green('Done!'));
}

run().then().catch(e => { error(e); process.exit(1); });
