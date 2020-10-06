const fs = require('fs');
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

function getFileModTime(path) {
    const stats = fs.statSync(path);
    return stats.mtime;
};

function cleanFiles(dir, timepassed, mode) {
    if (mode !== "log" && mode !== "deletion") {
        logger.error('A valid mode is not specified in the configuration. Valid modes: deletion, log')
        return;
    }

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
                if (mode == 'log') {
                    logger.info(filePath + " is older than the configured timepassed")
                }
                else if (mode == 'deletion') {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            logger.error(err);
                            return;
                        }
                    });
                    logger.info(filePath + " was deleted because it was older than the configured timepassed")
                }
            }

        }
    })
}

let printStats = () => {
    logger.info(`We encountered ${numFiles} files that were passed the specified time limit`);
    logger.info(`Those files used ${fileSize / 1024 / 1024 / 1024} Gigabytes of storage`);
}

let runtimes = config.get('runtimes');
for (const runtime of runtimes) {
    logger.log('warn', `BEGIN RUN: MODE=${runtime.mode}, DIRECTORY=${runtime.directory}, TIMEPASSED=${runtime.timepassed}`)
    cleanFiles(runtime.directory, runtime.timepassed, runtime.mode);
}
setTimeout(printStats, 1000);

