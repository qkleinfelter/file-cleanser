let fs = require('fs');
const config = require('config');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'app.log' })
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

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
                    logger.info(filePath + " is older than the configured timepassed")
                }
                else if (config.get('mode') == 'deletion') {
                    fs.unlink(filePath);
                    logger.info(filePath +" was deleted because it was older than the configured timepassed")
                }
            }
            
        }
    })
}

let printStats = () => {
    logger.info(`We encountered ${numFiles} files that were passed the specified time limit`);
    logger.info(`Those files used ${fileSize / 1024 / 1024 / 1024} Gigabytes of storage`);
}

let directory = config.get('directory');
let timepassed = config.get('timepassed');
logger.log('warn', `BEGIN RUN: MODE=${config.get('mode')}, DIRECTORY=${directory}, TIMEPASSED=${timepassed}`)
cleanFiles(directory, timepassed);
setTimeout(printStats, 1000);
