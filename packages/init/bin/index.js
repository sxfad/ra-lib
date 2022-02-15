#!/usr/bin/env node
const program = require('commander');
const templates = require('./templates');
const path = require('path');
const { getTargetDir, getTemplate } = require('./utils');

// 命令配置
program
    .version(require('../package').version)
    .option('-v, --version', 'output the version number')
    .option('-y, --yes', 'use default config, skip prompt')
    .option('-t, --template <type>', 'template name')
    .option('-i, --install', 'install dependencies')
    .on('--help', function() {
        console.log();
        console.log('Examples:');
        console.log('   $ ra-init [dir]      default init to current dir');
        console.log();
    })
    .parse(process.argv);

(async () => {
    // 获取目标目录
    const targetDir = await getTargetDir(program);

    if (!targetDir) return;

    // 获取模版
    const temps = templates.map(Item => {
        const sourceDir = path.join(__dirname, 'temp');
        return new Item(sourceDir, targetDir, program);
    });
    const temp = await getTemplate(temps, program);

    // 执行模版方法
    temp.run();
})();

