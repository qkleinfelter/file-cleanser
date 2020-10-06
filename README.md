# File Cleanser
File Cleanser is a simple utility that will loop through a specified set of runtimes, each of which contians a `directory`, `timepassed`, and `mode`. The program will process each runtime individually and sequentially, for each runtime, the program will loop through all of the files contained in `directory`, and check if they were last updated within the `timepassed`, (which is a number of milliseconds, i.e. 30 days = 30 days * 24 hrs * 60 minutes * 60 seconds * 1000 milliseconds to get 2592000000 milliseconds, so if that is the specified timepassed, we will only work on files older than 30 days). At this moment there are only 2 `mode`s allowed by the program, those are `log` and `deletion`. If the mode specified is `log`, it will ONLY log information about the files that haven't been worked on recently to the current directory/app.log, if the mode specified is `deletion` it will log information to app.log AND PERMANENTLY DELETE files older than timepassed.

## Usage
Make sure you have the latest version of [Node](https://nodejs.org/en/), I am using v12.11.1 for development.

Clone or download the repository to your local machine.

Run `npm install` in the directory you downloaded, this will grab our dependencies `config` for configuration, and `winston` for logging.

Open `config/` and create a file called `default.json` (you may also use other file names listed [here](https://github.com/lorenwest/node-config/wiki/Configuration-Files), just ensure they are a .json file), and fill it out with your desired runtimes (see `config/example.json` for examples).

**IMPORTANT:** I HIGHLY RECOMMEND YOU RUN THE PROGRAM IN `log` MODE BEFORE RUNNING IT IN `deletion` MODE TO ENSURE YOU DON'T DELETE ANY OTHER FILES THAT YOU DON'T INTEND.
When you are ready to try it out use `npm run start` to run the program. 