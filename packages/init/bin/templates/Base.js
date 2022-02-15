const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const ora = require('ora');
const {
    removeDirOrFiles,
    replaceFileContent,
    modifyPackageJson,
    downloadTemplate,
    installDependencies,
} = require('../utils');

const spinner = ora();

module.exports = class Base {
    program;
    // clone下来之后的模版文件夹
    sourceDir;
    // 需要复制到的目标文件夹
    targetDir;
    // 将目录名作为默认项目名称
    defaultProjectName;
    // git地址
    git;
    // 模版名称
    name;
    // 模版描述
    description;
    // 需要删除的文件或者文件夹
    removeFiles = [];
    // 通用需要删除的文件
    commonRemoveFiles = [
        '.idea',        // webstorm 配置文件
        '.vscode',      // vscode 配置文件
        '.git',         // git配置文件
        'node_modules', // 依赖文件
    ];


    constructor(sourceDir, targetDir, program) {
        this.sourceDir = sourceDir;
        this.targetDir = targetDir;
        this.program = program;
        this.defaultProjectName = targetDir.split(path.sep).pop();
    }

    replaceFiles() {
        return [];
    }

    promptEnglishName() {
        return {
            type: 'input',
            message: '项目英文名:',
            name: 'englishName',
            default: this.defaultProjectName,
            validate: function(val) {
                if (val.match(/^[A-Za-z0-9_-]+$/)) {
                    return true;
                }
                return '只能输入字母、数字、下划线、连字符';
            },
        };
    };

    promptChineseName() {
        return {
            type: 'input',
            message: '项目中文名:',
            name: 'chineseName',
            default: this.defaultProjectName,
        };
    };

    // 修改package.json
    packageJson() {
        return { name: this.answers.englishName };
    }

    // 用户命令行输入信息
    async prompt(options) {
        // 用户全部使用默认选项
        let { yes } = this.program.opts();
        if (yes) {
            this.answers = options.reduce((prev, curr) => {
                const { name, default: defaultValue } = curr;
                return {
                    ...prev,
                    [name]: defaultValue,
                };
            }, {});
        } else {
            this.answers = await inquirer.prompt(options);
        }
        return this.answers;
    }

    async prompting() {
        return await this.prompt([
            this.promptEnglishName(),
            this.promptChineseName(),
        ]);
    }

    // 执行
    async run() {
        // 收集用户输入信息
        await this.prompting();

        // 复制模版
        await downloadTemplate(this.name, this.git, this.sourceDir);

        // 删除目录或文件
        await removeDirOrFiles(this.sourceDir, [
            ...this.commonRemoveFiles,
            ...this.removeFiles,
        ]);

        // 替换文件内容
        const files = this.replaceFiles();
        for (let item of files) {
            const { filePath, replaces } = item;
            await replaceFileContent(filePath, replaces);
        }

        // 修改package.json
        const data = this.packageJson();
        await modifyPackageJson(path.join(this.sourceDir, 'package.json'), data);

        // copy 到目标目录
        await fs.copy(this.sourceDir, this.targetDir);

        // 是否安装依赖
        await installDependencies(this.targetDir, this.program);

        spinner.succeed(chalk.green(`init ${this.name} to ${path.relative(process.cwd(), this.targetDir)} success! 👏👏👏`));

        // 删除临时文件夹
        await fs.remove(this.sourceDir);
    }
};
