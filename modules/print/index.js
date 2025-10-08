import chalk from "chalk";

class Logger {
	static info(message) {
		console.log(`${chalk.blue("[INFO]")} ${message}`);
	}

	static error(message) {
		console.log(`${chalk.red("[ERROR]")} ${message}`);
	}

	static success(message) {
		console.log(`${chalk.green("[SUCCESS]")} ${message}`);
	}
}

export default Logger;
