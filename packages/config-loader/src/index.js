import fs from 'fs';
import loaderUtils from 'loader-utils';
import {getConfig, getFiles} from './util';

export default function routerLoader() {
    const options = loaderUtils.getOptions(this) || {};
    // 路由文件所在目录
    const {
        configName = 'config',
        pagesPath,
        extensions = ['.js', '.jsx', '.ts', '.tsx'],
    } = options;

    // 将路由页面所在目录添加到依赖当中，当有文件变化，会触发这个loader
    this.addContextDependency(pagesPath);

    // 获取所有的文件名
    const fileNames = getFiles(pagesPath, extensions);

    const result = [];

    fileNames.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'UTF-8');
        let config = getConfig(content, configName);

        let component = '';
        if (config.indexOf('path:') !== -1) {
            component = `component: ()=> import('${filePath}'),`;
        }
        // 拼接额外的数据
        config = `{
            filePath: '${filePath}',
            ${component}
            pagesPath: '${pagesPath.replace(/\\/g, '/')}',
        ` + config.replace('{', '');
        result.push(config);
    });

    return `
        export default [${result.join(',')}]
    `;
};
