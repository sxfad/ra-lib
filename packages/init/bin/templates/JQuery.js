const path = require('path');
const Base = require('./Base');

module.exports = class JQuery extends Base {
    git = 'https://gitee.com/zkboys/jquery-template.git';
    name = 'jQuery';
    description = 'jQuery模版，通过bower下载依赖';

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'README.md'),
                replaces: ['# jQuery 模版', `# ${chineseName}`],
            },
        ];
    }
};
