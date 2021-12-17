#!/usr/bin/env node
const path = require('path');
const program = require('commander');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const spinner = ora();
const clone = require('git-clone');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');

// 命令配置
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


// 模版配置
const templates = {
    'react-admin': {
        // 模版描述
        description: '中后台管理框架，基于React + Antd',
        // 模版对应的git仓库
        git: 'https://gitee.com/sxfad/react-admin.git',
        /**
         * clone下来之后对文件进行处理
         * @param sourceDir
         * @param targetDir
         * @returns {Promise<void>}
         */
        async deal(sourceDir, targetDir) {
            // 删除目录或文件
            await removeDirOrFiles(sourceDir, [
                '.idea',    // webstorm 配置文件
                '.git',     // git配置文件
                'docs',     // 文档目录
                'build',    // 构建文件
            ]);

            // 获取用户输入的中文名和英文名
            const { chineseName, englishName } = await getProjectNames(targetDir);

            // 替换文件内容
            await replaceFileContent(
                path.join(sourceDir, 'src', 'config', 'index.js'),
                [
                    [`'APP_NAME', 'React Admin'`, `'APP_NAME', '${chineseName}'`],
                ],
            );

            // 修改package.json 文件
            await modifyPackageJson(path.join(sourceDir, 'package.json'), {
                name: englishName,
            });
        },
    },
    'docsify': {
        description: '文档编写模版，基于Docsify',
        git: 'https://gitee.com/sxfad/docsify-template.git',
        async deal(sourceDir, targetDir) {
            await removeDirOrFiles(sourceDir, [
                '.idea',    // webstorm 配置文件
                '.git',     // git配置文件
                'build',    // 构建文件
            ]);

            const { chineseName, englishName } = await getProjectNames(targetDir);

            await replaceFileContent(
                path.join(sourceDir, '_coverpage.md'),
                [
                    ['我是大标题', chineseName],
                ],
            );
            await modifyPackageJson(path.join(sourceDir, 'package.json'), {
                name: englishName,
            });
        },
    },
};

(async () => {
    const targetDir = getTargetDir();
    // 目标文件夹存在，并且不为空，是否覆盖？
    const isEmpty = await isDirEmpty(targetDir);

    if (!isEmpty) {
        const { replace } = await inquirer.prompt([
            {
                type: 'confirm',
                message: '目标目录已存在，且不为空，是否覆盖？',
                name: 'replace',
            },
        ]);

        if (replace) {
            // TODO 删除原目标目录文件？但是要保留.git文件夹
        }
        // 用户不覆盖，直接结束
        if (!replace) return;
    }

    // 提示用户选择模版
    const keys = Object.keys(templates);
    const maxLength = Math.max(...(keys.map(item => item.length)));
    const { template } = await inquirer.prompt([{
        type: 'list',
        name: 'template',
        message: '请选择模版:',
        default: 0,
        choices: keys.map(key => {
            const { description } = templates[key];
            const keyStr = key.padEnd(maxLength + 1);

            return `${keyStr} (${description})`;
        }),
    }]);

    const templateKey = template.split(' ')[0];
    const options = templates[templateKey];
    const { git: gitUrl, deal } = options;
    const sourceDir = path.join(__dirname, 'temp', templateKey);

    spinner.start(chalk.yellow(`cloning ${templateKey} ...\n`));
    try {
        await downloadTemplate(templateKey, gitUrl, sourceDir);
        spinner.succeed(chalk.green(`${templateKey} clone success! 👏👏👏`));

        if (deal) await deal(sourceDir, targetDir);

        await fs.copy(sourceDir, targetDir);

        // 是否安装依赖
        await installDependencies(targetDir);

        // 删除临时文件
        await fs.remove(sourceDir);
    } catch (e) {
        spinner.fail(chalk.red(e));
    }
})();

/**
 * 检测是否安装了yarn
 * @returns {boolean}
 */
function hasYarn() {
    try {
        execSync('yarn --version');
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 安装依赖
 * @param targetDir
 * @returns {Promise<unknown>}
 */
async function installDependencies(targetDir) {
    const { yes } = await inquirer.prompt([
        {
            type: 'confirm',
            message: '是否安装依赖？',
            name: 'yes',
        },
    ]);

    if (!yes) return;

    const useYarn = await fs.exists(path.join(targetDir, 'yarn.lock'));

    const command = useYarn && hasYarn() ? 'yarn' : 'npm';

    const args = ['install'];

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit', cwd: targetDir }); // cwd 指定工作目录
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

/**
 * 获取目标目录，基于 cwd 的绝对路径
 * @returns {string}
 */
function getTargetDir() {
    let targetDir;

    // 获取命令行参数
    if (program.args && program.args.length === 1) {
        targetDir = program.args[0];
    }

    // 默认当前目录
    if (targetDir === undefined) {
        targetDir = '.';
    }

    const cwd = process.cwd();
    targetDir = path.join(cwd, targetDir);

    return targetDir;
}

/**
 * 从本机复制，节省模版下载时间
 * @param template
 * @param tempDir
 * @returns {Promise<boolean>}
 */
async function downloadFromLocal(template, tempDir) {
    // 判断是否是我本机，不是不从本机复制
    const cwd = process.cwd();
    if (!cwd.startsWith('/Users/wangshubin')) return false;

    const templateLocalPath = `/Users/wangshubin/workspace/suixingpay/${template}`;

    // 模版不存在，不复制
    const exists = await fs.exists(templateLocalPath);
    if (!exists) return false;

    // 创建临时目录
    await fs.ensureDir(tempDir);

    // 开始复制文件
    await fs.copy(templateLocalPath, tempDir, {
        // 忽略node_modules
        filter: (src) => !src.startsWith(path.join(templateLocalPath, 'node_modules')),
    });

    return true;
}

/**
 * 下载模板
 * @param template
 * @param gitUrl
 * @param tempDir
 * @returns {Promise<void>}
 */
async function downloadTemplate(template, gitUrl, tempDir) {
    // 删除临时文件夹
    await fs.remove(tempDir);

    // 本机复制
    const isLocal = await downloadFromLocal(template, tempDir);
    if (isLocal) return;

    await new Promise((resolve, reject) => {
        clone(gitUrl, tempDir, err => {
            if (err) return reject(err);

            return resolve();
        });
    });
}

/**
 * 判断目录是否为空，隐藏文件除外
 * @param targetDir
 * @returns {Promise<boolean>}
 */
async function isDirEmpty(targetDir) {
    const exists = await fs.pathExists(targetDir);
    if (exists) {
        const files = await fs.readdir(targetDir);
        if (files.length && files.some(item => !item.startsWith('.'))) return false;
    }
    return true;
}

/**
 * 替换文件内容
 * @param filePath
 * @param replaces
 * @returns {Promise<void>}
 */
async function replaceFileContent(filePath, replaces) {
    let content = await fs.readFile(filePath, 'UTF-8');
    replaces.forEach(item => {
        const [oldContent, newContent] = item;
        content = content.replace(oldContent, newContent);
    });

    await fs.writeFile(filePath, content, 'UTF-8');
}

/**
 * 修改package.json文件
 * @param filePath
 * @param data
 * @returns {Promise<void>}
 */
async function modifyPackageJson(filePath, data) {
    let content = await fs.readFile(filePath, 'UTF-8');
    const jsonData = JSON.parse(content);
    const nextJsonData = { ...jsonData, ...data };
    const nextContent = JSON.stringify(nextJsonData, null, 4);
    await fs.writeFile(filePath, nextContent, 'UTF-8');
}

/**
 * 删除目录或者文件夹
 * @param paths 需要删除的文件夹或者文件路径，相对路径
 * @param sourceDir clone 下来的源文件目录，绝对路径
 * @returns {Promise<void>}
 */
async function removeDirOrFiles(sourceDir, paths) {
    for (let p of paths) {
        await fs.remove(path.join(sourceDir, p));
    }
}

/**
 * 获取项目名称，英文名称 中文名称
 * @param targetDir
 * @returns {Promise<{englishName, chineseName}>}
 */
async function getProjectNames(targetDir) {
    // 将目录名作为默认项目名称
    const defaultProjectName = targetDir.split(path.sep).pop();

    return await inquirer.prompt([
        {
            type: 'input',
            message: '项目英文名:',
            name: 'englishName',
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
            message: '项目中文名:',
            name: 'chineseName',
            default: defaultProjectName,
        },
    ]);
}
