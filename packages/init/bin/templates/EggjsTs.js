const path = require('path');
const Base = require('./Base');

module.exports = class EggjsTs extends Base {
    git = 'https://gitee.com/zkboys/eggjs-ts-template.git';
    name = 'eggjs-ts';
    description = 'NodeJS 后端模板，基于eggjs、TypeScript';
    removeFiles = [
        'build',    // 构建文件
        'run',      // 临时文件
        'logs',     // 日志文件
    ];

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'README.md'),
                replaces: ['# NodeJS 后端模板', `# ${chineseName}`],
            },
        ];
    }
};
