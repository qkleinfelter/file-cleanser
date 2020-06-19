let fs = require('fs');
const config = require('config');
let numFiles = 0;
let fileSize = 0;

let getFileModTime = (path) => {
    const stats = fs.statSync(path);
    return stats.mtime;
};

function cleanFiles(dir, timepassed) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        for (const file of files) {
            const filePath = dir + "\\" + file;
            const time = new Date(getFileModTime(filePath)).getTime();
            if (Date.now() - time > timepassed) {
                numFiles++;
                fileSize += fs.statSync(filePath).size;
                if (config.get('mode') == 'log') {
                    console.log(filePath + " is older than the configured timepassed")
                }
                else if (config.get('mode') == 'deletion') {
                    fs.unlink(filePath);
                    console.log(filePath +" was deleted because it was older than the configured timepassed")
                }
            }
            
        }
    })
    printStats()
}

let printStats = () => {
    console.log(`We encountered ${numFiles} files that were passed the specified time limit`);
    console.log(`Those files used ${fileSize / 1024 / 1024 / 1024} Gigabytes of storage`);
}

let directory = config.get('directory');
let timepassed = config.get('timepassed');
cleanFiles(directory, timepassed);
setTimeout(printStats, 1000);
