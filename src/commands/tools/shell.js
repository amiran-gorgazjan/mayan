const chalk = require('chalk');
const shell = require('shelljs');
const util = require('util');
const { exec } = require('child_process');

const { info } = console;
const { green, gray } = chalk;
const execAsync = util.promisify(exec);

module.exports = function getShell(commandLineOptions) {
    return {
        exec(command) {
            if (commandLineOptions.dryRun) {
                info(green('Command to be run:'), command);
            } else {
                shell.exec(command);
            }
        },

        cd(targetPath) {
            if (commandLineOptions.dryRun) {
                info(green('Command to be run:'), 'cd', targetPath);
            } else {
                shell.cd(targetPath);
            }
        },

        async execAsync(command, options) {
            if (commandLineOptions.dryRun) {
                return info(green('Command to be run:'), gray(`${options.cwd} >`), command);
            }

            let result;

            try {
                result = await execAsync(command, options);

                if (result.stderr) {
                    console.error(result.stderr);
                }
            } catch (error) {
                throw new Error(`[mayan:execAsync @ (${options.cwd})] Fatal Error: ${error.message}`);
            }

            return result.stdout;
        },
    };
};
