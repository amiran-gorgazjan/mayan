/* eslint-disable no-console */

const { resolve } = require('path');
const { readFileSync } = require('fs');
const chalk = require('chalk');
const semver = require('semver');
const { Command } = require('commander');
const getConfig = require('./tools/config');

const program = new Command();

program
    .description('Compare versions of packages in repositories defined in .hulky.js')
    .option('-a, --all', 'Shows both matching and mismatching packages')
    .parse(process.argv);

const targetPackages = program.args || [];
const programOpts = program.opts();
const warning = chalk.hex('#CCA500');
const error = chalk.hex('#FF2222');
const { green, gray } = chalk;

const colors = {
    mismatch: error,
    warning,
    match: chalk.green,
};

async function run() {
    const config = await getConfig();

    const projects = config.repositories.map(({ path }) => {
        const repoPath = resolve(config.dirname, path);
        const packageJson = JSON.parse(readFileSync(resolve(repoPath, 'package.json')));

        return {
            path: repoPath,
            packageJson,
        };
    });

    projects.filter(p => p !== null).forEach(project => {
        const dependencyGroups = [
            ['dev-/dependencies', { ...project.packageJson.dependencies, ...project.packageJson.devDependencies }, 'exact'],
            ['peerDependencies', project.packageJson.peerDependencies, 'loose'],
        ];

        const messages = {
            'dev-/dependencies': {
                mismatch: [],
                warning: [],
                match: [],
            },
            peerDependencies: {
                mismatch: [],
                warning: [],
                match: [],
            },
        };

        // Compare dependencies and create messages
        dependencyGroups.forEach(([dgName, dependencyGroup, matchType]) => {
            if (!dependencyGroup) {
                return;
            }

            Object.entries(dependencyGroup)
                .forEach(([name, version]) => {
                    if (targetPackages.length > 0 && !targetPackages.includes(name)) {
                        return true;
                    }

                    const wsProject = projects.find(p => p.packageJson.name === name);

                    if (!wsProject) {
                        return true;
                    }

                    const exactVersion = version.replace(/^[^\d]*/, '');
                    const packageVersion = wsProject.packageJson.version;
                    const isExactMatch = exactVersion === packageVersion;
                    const isLooseMatch = semver.satisfies(packageVersion, version);

                    // Satisfies the version
                    if (matchType === 'exact') {
                        if (isExactMatch) {
                            messages[dgName].match.push(`${name} @ ${exactVersion}`);
                        } else if (isLooseMatch) {
                            messages[dgName].warning.push(`${name} @ ${exactVersion} (current) vs ${packageVersion} (wanted)`);
                        } else {
                            messages[dgName].mismatch.push(`${name} @ ${exactVersion} (current) vs ${packageVersion} (wanted)`);
                        }

                        return true;
                    }

                    if (isLooseMatch) {
                        messages[dgName].match.push(`${name} @ ${exactVersion}`);
                    } else {
                        messages[dgName].mismatch.push(`${name} @ ${exactVersion} (current) vs ${packageVersion} (wanted)`);
                    }

                    return true;
                });
        });

        // Render messages
        const anyMessages = Object.values(messages).some(
            group => Object.entries(group).some(([type, msgs]) => {
                if (!programOpts.all && type === 'match') {
                    return false;
                }

                return msgs.length;
            }),
        );

        if (anyMessages) {
            console.log(green(project.packageJson.name), gray(project.path), '\n');

            Object.entries(messages).forEach(([dgName, group]) => {
                const groupHasAnyMessages = Object.entries(group).some(([type, msgs]) => {
                    if (!programOpts.all && type === 'match') {
                        return false;
                    }

                    return msgs.length;
                });

                if (groupHasAnyMessages) {
                    console.log('\t', gray(dgName));

                    Object.entries(group).forEach(([type, msgs]) => {
                        if (!programOpts.all && type === 'match') {
                            return;
                        }

                        if (msgs.length) {
                            msgs.forEach(msg => console.log('\t\t', colors[type](msg)));
                        }
                    });
                }
            });

            console.log('\n');
        }
    });
}

run().then().catch(e => { console.error(e); process.exit(1); });
