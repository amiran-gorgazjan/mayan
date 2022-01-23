const simpleGit = require('simple-git');

module.exports = async function hasStagedFiles(absPath) {
    const git = simpleGit({
        baseDir: absPath,
        binary: 'git',
    });

    const { files } = await git.status();

    return files.filter(file => file.index === 'M').length > 0;
};
