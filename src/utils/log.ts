import chalk from "chalk"

export default {
  error: (...args: unknown[]) => console.error(chalk.bold.red(...args)),
  info: (...args: unknown[]) => console.info(chalk.bold.blue(...args)),
  success: (...args: unknown[]) => console.info(chalk.bold.green(...args)),
}
