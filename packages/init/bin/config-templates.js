const path = require('path');
const {
    removeDirOrFiles,
    getProjectNames,
    replaceFileContent,
    modifyPackageJson,
} = require('./util');

module.exports = {
    'react-admin': {
        // 模版描述
        description: '中后台管理框架，基于React + Antd',
        // 模版对应的git仓库
        git: 'https://gitee.com/sxfad/react-admin.git',
        /**
         * clone下来之后对文件进行处理
         * @param sourceDir
         * @param targetDir
         * @param program
         * @returns {Promise<void>}
         */
        async beforeCopy(sourceDir, targetDir, program) {
            // 删除目录或文件
            await removeDirOrFiles(sourceDir, [
                'docs',     // 文档目录
                'build',    // 构建文件
            ]);

            // 获取用户输入的中文名和英文名
            const { chineseName, englishName } = await getProjectNames(targetDir, program);

            // 替换文件内容
            await replaceFileContent(
                path.join(sourceDir, 'src', 'config', 'index.js'),
                [`'APP_NAME', 'React Admin'`, `'APP_NAME', '${chineseName}'`],
            );

            // 修改package.json 文件
            await modifyPackageJson(path.join(sourceDir, 'package.json'), {
                name: englishName,
            });
        },
    },

    'docsify': {
        description: '文档编写模版，基于Docsify',
        git: 'https://gitee.com/sxfad/docsify-template.git',
        async beforeCopy(sourceDir, targetDir, program) {
            await removeDirOrFiles(sourceDir, [
                'build',    // 构建文件
            ]);

            const { chineseName, englishName } = await getProjectNames(targetDir, program);

            await replaceFileContent(path.join(sourceDir, '_coverpage.md'), ['我是大标题', chineseName],
            );
            await modifyPackageJson(path.join(sourceDir, 'package.json'), {
                name: englishName,
            });
        },
    },
    'eggjs-ts': {
        description: 'NodeJS 后端模板，基于eggjs、TypeScript',
        git: 'https://gitee.com/zkboys/eggjs-ts-template.git',
        async beforeCopy(sourceDir, targetDir, program) {
            await removeDirOrFiles(sourceDir, [
                'build',    // 构建文件
                'run',      // 临时文件
                'logs',     // 日志文件
            ]);

            const { chineseName, englishName } = await getProjectNames(targetDir, program);

            await replaceFileContent(path.join(sourceDir, 'README.md'), ['# NodeJS 后端模板', `# ${chineseName}`]);
            await modifyPackageJson(path.join(sourceDir, 'package.json'), {
                name: englishName,
            });
        },
    },
    'nextjs': {
        description: '服务端渲染，需要SEO的项目使用，基于nextjs、Antd、sqlite3',
        git: 'https://gitee.com/zkboys/nextjs-template.git',
        async beforeCopy(sourceDir, targetDir, program) {
            await removeDirOrFiles(sourceDir, [
                '.next',    // 构建文件
            ]);

            const { chineseName, englishName } = await getProjectNames(targetDir, program);

            await replaceFileContent(path.join(sourceDir, 'README.md'), ['# nextjs 模版', `# ${chineseName}`]);
            await modifyPackageJson(path.join(sourceDir, 'package.json'), {
                name: englishName,
            });
        },
    },
};
