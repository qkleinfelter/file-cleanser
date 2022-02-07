import fs from "fs";
import config from "config";
import winston from "winston";
import logger from "./logger.js";
import Duration from "duration-js";

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

let numFiles = 0;
let fileSize = 0;

let getFileModTime = (path) => {
  const stats = fs.statSync(path);
  return stats.mtime;
};

let cleanFiles = (dir, timePassed, mode) => {
  if (mode !== "log" && mode !== "deletion") {
    logger.error(
      "A valid mode is not specified in the configuration. Valid modes: deletion, log"
    );
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
      if (Date.now() - time > timePassed) {
        numFiles++;
        fileSize += fs.statSync(filePath).size;
        if (mode == "log") {
          logger.info(filePath + " is older than the configured timePassed");
        } else if (mode == "deletion") {
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error(err);
              return;
            }
          });
          logger.info(
            filePath +
              " was deleted because it was older than the configured timePassed"
          );
        }
      }
    }
  });
};

let printStats = () => {
  logger.info(
    `We encountered ${numFiles} files that were passed the specified time limit`
  );
  logger.info(`Those files used ${toGB(fileSize)} Gigabytes of storage`);
};

let toGB = (size) => {
  return size / 1024 / 1024 / 1024;
};

let runtimes = config.get("runtimes");
for (const runtime of runtimes) {
  const timePassed = runtime.timePassed;
  const duration = new Duration(timePassed);
  logger.log(
    "warn",
    `${new Date().toLocaleString()}: BEGIN RUN: MODE=${
      runtime.mode
    }, DIRECTORY=${runtime.directory}, TIMEPASSED=${duration}`
  );
  cleanFiles(runtime.directory, duration.milliseconds(), runtime.mode);
}
setTimeout(printStats, 1000);
