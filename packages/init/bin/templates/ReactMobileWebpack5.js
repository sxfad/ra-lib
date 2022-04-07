const path = require('path');
const Base = require('./Base');

module.exports = class ReactAdmin extends Base {
    git = 'https://github.com/zkboys/react-mobile-webpack5.git';
    name = 'react-mobile-webpack5';
    description = '移动端框架，基于React + Antd mobile + webpack5，约定路由，约定菜单';
    removeFiles = [
        'docs',
        'build',
    ];

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'src', 'config', 'index.js'),
                replaces: [`APP_NAME = 'react-mobil-webpack5'`, `APP_NAME = '${chineseName}'`],
            },
        ];
    }
};
