let fs = require('fs');
const config = require('config');

let getFileModTime = (path) => {
    const stats = fs.statSync(path);
    return stats.mtime;
};

let cleanFiles = (dir, timepassed) => {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        files.forEach((file, index) => {
            const filePath = dir + "\\" + file;
            const time = new Date(getFileModTime(filePath)).getTime();
            if (Date.now() - time > timepassed) {
                console.log(filePath + " is older than the configured timepassed, it would be deleted if running in deletion mode")
            }
            
        })
    })
}

let directory = config.get('directory');
let timepassed = config.get('timepassed');
cleanFiles(directory, timepassed);