const path = require('path');
const Base = require('./Base');

module.exports = class ReactAdmin extends Base {
    git = 'https://github.com/zkboys/react-admin-webpack5.git';
    name = 'react-admin-webpack5';
    description = '中后台管理框架，基于React + Antd + webpack5，约定路由，约定菜单';
    removeFiles = [
        'docs',
        'build',
    ];

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'src', 'config', 'index.js'),
                replaces: [`APP_NAME = '管理系统架构'`, `APP_NAME = '${chineseName}'`],
            },
        ];
    }
};
