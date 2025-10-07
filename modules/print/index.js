import chalk from 'chalk';

let print = [];

print.info = function(message) {
    console.log(`${chalk.blue('[INFO]')} ${message}`);
};

print.error = function(message) {
    console.log(`${chalk.red('[ERROR]')} ${message}`);
};

print.success = function(message) {
    console.log(`${chalk.green('[SUCCESS]')} ${message}`);
};

export default print;