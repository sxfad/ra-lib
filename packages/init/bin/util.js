const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const clone = require('git-clone');
const fs = require('fs-extra');
const spawn = require('cross-spawn');

const spinner = ora();

/**
 * 脚手架执行入口函数
 * @param TEMPLATES
 * @param program
 * @returns {Promise<void>}
 */
async function run(TEMPLATES, program) {
    try {
        // 获取目标目录
        const targetDir = await getTargetDir(program);

        // 获取模版配置
        const options = await getTemplateOptions(TEMPLATES, program);

        const { git: gitUrl, deal, templateKey } = options;
        const sourceDir = path.join(__dirname, 'temp', templateKey);

        // 复制模版
        spinner.start(chalk.yellow(`cloning ${templateKey} ...\n`));
        await downloadTemplate(templateKey, gitUrl, sourceDir);
        spinner.succeed(chalk.green(`${templateKey} clone success! 👏👏👏`));

        // 处理模版
        if (deal) await deal(sourceDir, targetDir, program);

        // copy 到目标目录
        await fs.copy(sourceDir, targetDir);

        // 是否安装依赖
        await installDependencies(targetDir, program);

        spinner.succeed(chalk.green(`init ${templateKey} to ${path.relative(process.cwd(), targetDir)} success! 👏👏👏`));
    } catch (e) {
        spinner.fail(chalk.red(e));
    } finally {
        // 删除临时文件夹
        await fs.remove(path.join(__dirname, 'temp'));
    }
}

/**
 * 获取模版配置
 * @param TEMPLATES
 * @param program
 * @returns {Promise<*&{templateKey}>}
 */
async function getTemplateOptions(TEMPLATES, program) {
    let { template } = program.opts();

    // 提示用户选择模版
    const keys = Object.keys(TEMPLATES);
    const maxLength = Math.max(...(keys.map(item => item.length)));
    if (!template) {
        const res = await inquirer.prompt([{
            type: 'list',
            name: 'template',
            message: '请选择模版:',
            default: 0,
            choices: keys.map(key => {
                const { description } = TEMPLATES[key];
                const keyStr = key.padEnd(maxLength + 1);

                return `${keyStr} (${description})`;
            }),
        }]);
        template = res.template;
    }

    const templateKey = template.split(' ')[0];
    const options = TEMPLATES[templateKey];

    if (!options) {
        spinner.info(chalk.yellow(`template ${templateKey} is not exist !!!, you can use:
${chalk.green(`   → ${keys.map(item => item.split(' ')[0]).join('\n   → ')}`)}`));

        throw Error(`no such template ${templateKey} !`);
    }

    return {
        ...options,
        templateKey,
    };
}


/**
 * 获取目标目录，基于 cwd 的绝对路径
 * @param program
 * @returns {Promise<string>}
 */
async function getTargetDir(program) {
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

    let { yes } = program.opts();

    // 目标文件夹存在，并且不为空，是否覆盖？
    const isEmpty = await isDirEmpty(targetDir);

    if (!isEmpty && !yes) {
        const { replace } = await inquirer.prompt([
            {
                type: 'confirm',
                message: '目标目录已存在，且不为空，是否覆盖？',
                name: 'replace',
            },
        ]);

        if (replace) {
            // TODO 删除原目标目录文件？但是要保留.git文件夹
            return targetDir;
        }
        // 用户不覆盖，直接结束
        if (!replace) throw Error('no target dir');
    }

    return targetDir;
}

/**
 * 检测是否安装了yarn，如果未安装，执行安装命令
 * @returns {Promise<boolean>}
 */
async function installYarn() {
    try {
        await spawnPromise('yarn', ['--version']);
    } catch (e) {
        await spawnPromise('npm', ['install', 'yarn', '-g', '--registry', 'https://registry.npm.taobao.org']);
    }
}

/**
 * 安装依赖
 * @param targetDir
 * @param program
 * @returns {Promise<unknown>}
 */
async function installDependencies(targetDir, program) {
    let options = program.opts();
    let yes = options.yes !== undefined ? options.yes : undefined;

    if (yes && !options.install) return;

    if (yes === undefined) {
        const res = await inquirer.prompt([
            {
                type: 'confirm',
                message: '是否安装依赖？',
                name: 'yes',
                default: false,
            },
        ]);
        yes = res.yes;
    }

    if (!yes) return;

    const useYarn = await fs.exists(path.join(targetDir, 'yarn.lock'));
    if (useYarn) {
        await installYarn();
    }

    const command = useYarn ? 'yarn' : 'npm';

    const args = ['install'];

    await spawnPromise(command, args, { stdio: 'inherit', cwd: targetDir }); // cwd 指定工作目录
}

/**
 * 执行shell脚本
 * @param command
 * @param args
 * @param options
 * @returns {Promise<unknown>}
 */
async function spawnPromise(command, args, options) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, options);
        child.on('error', err => {
            reject(err);
        });
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
 * * 替换文件内容
 * @param filePath
 * @param replaces [[oldStr, newStr], [oldStr, newStr], ...]
 * @returns {Promise<void>}
 */
async function replaceFileContent(filePath, ...replaces) {
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
 * @param program
 * @returns {Promise<{englishName, chineseName}>}
 */
async function getProjectNames(targetDir, program) {
    // 将目录名作为默认项目名称
    const defaultProjectName = targetDir.split(path.sep).pop();

    let { yes } = program.opts();
    if (yes) {
        return {
            englishName: defaultProjectName,
            chineseName: defaultProjectName,
        };
    }

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

module.exports = {
    run,
    installYarn,
    installDependencies,
    spawnPromise,
    downloadFromLocal,
    isDirEmpty,
    replaceFileContent,
    modifyPackageJson,
    removeDirOrFiles,
    getProjectNames,
};
