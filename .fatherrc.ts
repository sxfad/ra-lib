import path from 'path';
import fs from 'fs';

const packagesPath = path.join(__dirname, 'packages');
let packageNames = fs.readdirSync(packagesPath).filter(item => !item.startsWith('.'));

const ignorePackages = [
    'util',
    'hooks',
    'admin',
    'adm',
    'init', // 不需要构建
    'rancher-deploy', // 不需要构建
    'options',
    'admin-util',
];
packageNames = packageNames.filter(name => !ignorePackages.includes(name));

export default {
    cjs: { type: 'babel', lazy: true },
    esm: {
        type: 'babel',
        importLibToEs: true,
    },
    // 由于包之间有依赖关系，需要指定包构建顺序
    pkgs: [
        'util',
        'hooks',
        'options',
        'admin-util',
        ...packageNames,
        'admin',
        'adm',
    ],
};
