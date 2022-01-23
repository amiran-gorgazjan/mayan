const simpleGit = require('simple-git');

module.exports = async function getCurrentBranchName(absPath) {
    const git = simpleGit({
        baseDir: absPath,
        binary: 'git',
    });

    const { current } = await git.branch();

    return current;
};
