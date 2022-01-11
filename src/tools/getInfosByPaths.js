const fs = require('fs');

// Use fs to read the package.json file
async function getPackageInfo(packagePath) {
    return JSON.parse(
        await new Promise((resolve, reject) => {
            fs.readFile(`${packagePath}/package.json`, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        }),
    );
}

module.exports = async function getInfosByPaths(paths) {
    const packageVersions = await Promise.all(paths.map(getPackageInfo));
    return packageVersions;
};
