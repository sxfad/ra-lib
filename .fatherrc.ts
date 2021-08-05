import path from 'path';
import fs from 'fs';

const packagesPath = path.join(__dirname, 'packages');
let packageNames = fs.readdirSync(packagesPath).filter(item => !item.startsWith('.'));

const ignorePackages = [
    'util',
    'hooks',
    'admin',
    'init',
    'rancher-deploy',
];
packageNames = packageNames.filter(name => !ignorePackages.includes(name));

export default {
    cjs: { type: 'babel', lazy: true },
    esm: {
        type: 'babel',
        importLibToEs: true,
    },
    pkgs: [
        'util',
        'hooks',
        ...packageNames,
        'admin',
    ],
};
