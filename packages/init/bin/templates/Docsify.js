const path = require('path');
const Base = require('./Base');

module.exports = class Docsify extends Base {
    git = 'https://gitee.com/sxfad/docsify-template.git';
    name = 'docsify';
    description = '文档编写模版，基于Docsify';
    removeFiles = [
        'build',
    ];

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, '_coverpage.md'),
                replaces: ['我是大标题', chineseName],
            },
        ];
    }
};
