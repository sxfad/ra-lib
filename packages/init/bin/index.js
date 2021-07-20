#!/usr/bin/env node
const path = require('path');
const program = require('commander');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const spinner = ora();
const clone = require('git-clone');
const fs = require('fs-extra');

const templates = {
    'react-admin': {
        git: 'https://gitee.com/sxfad/react-admin.git',
        async deal(tempDir, targetDir) {
            const deleteDirs = [
                '.git',
                'docs',
                'docs-template',
            ];

            for (let p of deleteDirs) {
                await fs.remove(path.join(tempDir, p));
            }

            const defaultProjectName = targetDir.split(path.sep).pop();

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    message: '项目名称(英文):',
                    name: 'name',
                    default: defaultProjectName,
                    validate: function(val) {
                        if (val.match(/^[A-Za-z0-9_-]+$/)) {
                            return true;
                        }
                        return '只能输入字母、数字、下划线、连字符';
                    },
                },
                {
                    type: 'input',
                    message: '项目名称(中文):',
                    name: 'projectName',
                    default: defaultProjectName,
                },
            ]);

            const configPath = path.join(tempDir, 'src', 'config', 'index.js');
            let content = await fs.readFile(configPath, 'UTF-8');
            content = content.replace(`'APP_NAME', 'React Admin'`, `'APP_NAME', '${answers.projectName}'`);
            await fs.writeFile(configPath, content, 'UTF-8');

        },
    },
};


program
    .version(require('../package').version)
    .option('-v, --version', 'output the version number')
    .on('--help', function() {
        console.log('  Examples:');
        console.log();
        console.log('    $ ra-init [dir]      default init to current dir');
        console.log();
    })
    .parse(process.argv);

// 目标目录
let targetDir;
if (program.args && program.args.length === 1) {
    targetDir = program.args[0];
}
if (targetDir === undefined) {
    targetDir = '.';
}
const cwd = process.cwd();
targetDir = path.join(cwd, targetDir);

(async () => {
    // 目标文件夹存在，并且不为空，是否覆盖？
    const exists = await fs.pathExists(targetDir);
    if (exists) {
        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                message: '目标目录已存在，是否覆盖？',
                name: 'replace',
            },
        ]);
        if (answers.replace) {
            await fs.remove(targetDir);
        } else {
            return;
        }
    }

    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'template',
        message: '请选择模版:',
        choices: [
            'react-admin',
        ],
        default: 0,
    }]);
    const {template} = answers;
    const options = templates[template];
    const {git: gitUrl, deal} = options;
    const tempDir = path.join(__dirname, 'temp', template);

    spinner.start(chalk.yellow(`cloning ${template} ...\n`));
    try {
        await downloadTemplate(template, gitUrl, tempDir);
        spinner.succeed(chalk.green(`${template} clone success! 👏👏👏`));

        if (deal) {
            await deal(tempDir, targetDir);
        }

        await fs.emptyDir(targetDir);

        await fs.copy(tempDir, targetDir);

        // 删除临时文件
        await fs.remove(tempDir);
    } catch (e) {
        spinner.fail(chalk.red(e));
    }
})();

async function downloadTemplate(template, gitUrl, tempDir) {
    // 删除临时文件夹
    await fs.remove(tempDir);
    const cwd = process.cwd();

    // 我本机
    if (cwd.startsWith('/Users/wangshubin/workspace') && template === 'react-admin') {
        const templateLocalPath = '/Users/wangshubin/workspace/suixingpay/react-admin';
        await fs.ensureDir(tempDir);
        await fs.copy(templateLocalPath, tempDir, {
            filter: (src) => {
                const ignoreDirs = ['node_modules', '.git', '.idea'];
                for (let p of ignoreDirs) {
                    if (src.startsWith(path.join(templateLocalPath, p))) return false;
                }
                return true;
            },
        });
        return;
    }
    await new Promise((resolve, reject) => {
        clone(gitUrl, tempDir, err => {
            if(err) return reject(err);

            return resolve();
        })
    })
}
