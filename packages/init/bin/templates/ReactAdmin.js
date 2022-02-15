const path = require('path');
const Base = require('./Base');

module.exports = class ReactAdmin extends Base {
    git = 'https://gitee.com/sxfad/react-admin.git';
    name = 'react-admin';
    description = '中后台管理框架，基于React + Antd';
    removeFiles = [
        'docs',
        'build',
    ];

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'src', 'config', 'index.js'),
                replaces: [`'APP_NAME', 'React Admin'`, `'APP_NAME', '${chineseName}'`],
            },
        ];
    }
};
