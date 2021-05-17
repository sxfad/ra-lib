const chokidar = require('chokidar');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const {exec} = require('child_process');

const PACKAGES_PATH = path.join(__dirname, '../', 'packages');
const WATCH_PATH = path.join(PACKAGES_PATH, '*', 'src', '**');

const watchOptions = {
    ignorePermissionErrors: true,
    usePolling: false,
};

let watchReady = false;
let childProcess;
const spinner = ora();

chokidar.watch(WATCH_PATH, watchOptions)
    .on('all', (event, filePath) => {
        if (watchReady) {
            const packageFilePath = filePath.replace(PACKAGES_PATH, '');
            const packageName = packageFilePath.split(path.sep)[1];

            console.log(chalk.blue(`${event} ${packageFilePath}`));

            const command = `PACKAGE=${packageName} father build`;

            // 频繁保存，终止上次未完成命令
            if (childProcess) {
                childProcess.kill(2);
            }
            // 等待上一个进程被杀死之后，重新启动loading
            setTimeout(() => {
                spinner.start(chalk.yellow(`build package ${packageName}...\n`));
            }, 200);
            childProcess = exec(command, (error, stdout, stderr) => {
                childProcess = null;
                if (error) {
                    spinner.fail(chalk.red(error));
                    return;
                }

                // 输出执行日志到控制台
                console.log(stdout);
                // (stdout || '').split('\n').forEach(str => {
                //     str && console.log(`${chalk.red(packageName)}: ${str}`);
                // });
                spinner.succeed(chalk.green(`package ${packageName} build success! 👏👏👏`));
            });
        }
    })
    .on('ready', function() {
        watchReady = true;
        // console.log(chalk.blue('build watch ready'));
        buildAll();
    });

function buildAll() {
    const spinner = ora(chalk.yellow(`build all packages...\n`)).start();

    const command = 'npm run build';
    exec(command, (error, stdout, stderr) => {
        if (error) {
            spinner.fail(chalk.red(`build all packages error: ${error}`));
            return;
        }
        (stdout || '').split('\n').forEach(str => {
            str && console.log(`${str}`);
        });
        spinner.succeed(chalk.green(`all packages build success! 🎉🎉🎉`));
        console.log(chalk.blue('build watch ready'));
    });
}

