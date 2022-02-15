const path = require('path');
const Base = require('./Base');

module.exports = class Nextjs extends Base {
    git = 'https://gitee.com/zkboys/nextjs-template.git';
    name = 'nextjs';
    description = '服务端渲染，需要SEO的项目使用，基于nextjs、Antd、sqlite3';
    removeFiles = [
        '.next',    // 构建文件
    ];

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'README.md'),
                replaces: ['# nextjs 模版', `# ${chineseName}`],
            },
        ];
    }
};
