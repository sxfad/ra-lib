const path = require('path');
const Base = require('./Base');

module.exports = class JQuery extends Base {
    git = 'https://github.com/zkboys/react-simple.git';
    name = 'react-simple';
    description = 'react antd react-router 简单模版';

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'README.md'),
                replaces: ['# react-simple', `# ${chineseName}`],
            },
        ];
    }
};
