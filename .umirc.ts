import { defineConfig } from 'dumi';
import { resolve } from 'path';

export default defineConfig({
    title: 'ra-lib',
    favicon:
        'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
    logo:
        'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
    outputPath: 'docs',
    mode: 'site',
    resolve: {
        includes: [
            'docs-src',
            'packages',
        ],
    },
    base: '/ra-lib',
    publicPath: '/ra-lib/',
    locales: [ [ 'zh-CN', '中文' ] ],
    navs: {
        'zh-CN': [
            {
                title: '组件',
                path: '/component',
            },
            {
                title: 'Hooks',
                path: '/hooks',
            },
            {
                title: 'Ajax',
                path: '/ajax',
            },
            {
                title: 'Model',
                path: '/model',
            },
            {
                title: 'Github',
                path: 'https://github.com/zkboys/ra-lib',
            },
        ],
        'en-US': [
            {
                title: 'Github',
                path: 'https://github.com/zkboys/ra-lib',
            },
        ],
    },
    // more config: https://d.umijs.org/config
    extraBabelPlugins: [
        [
            'babel-plugin-import',
            {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: true,
            },
            'antd',
        ],
    ],
});
