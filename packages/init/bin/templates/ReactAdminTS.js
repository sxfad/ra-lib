const path = require('path');
const Base = require('./Base');

module.exports = class ReactAdminTS extends Base {
    git = 'https://github.com/zkboys/react-admin-ts.git';
    name = 'react-admin-ts';
    description = '中后台管理框架，基于React + Antd + TypeScript';
    removeFiles = [
        'docs',
        'build',
    ];

    replaceFiles() {
        const { chineseName } = this.answers;

        return [
            {
                filePath: path.join(this.sourceDir, 'src', 'config', 'index.ts'),
                replaces: [`'APP_NAME', 'React Admin'`, `'APP_NAME', '${chineseName}'`],
            },
        ];
    }
};
