#!/usr/bin/env node
const program = require('commander');
const { run } = require('./util');
const TEMPLATES = require('./config-templates');

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
    await run(TEMPLATES, program);
})();
