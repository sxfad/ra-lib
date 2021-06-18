import path from 'path';
import fs from 'fs';

const packagesPath = path.join(__dirname, 'packages');
let packageNames = fs.readdirSync(packagesPath).filter(item => !item.startsWith('.'));

const pkgs = [
    'util',
    'hooks',
    'admin',
];
packageNames = packageNames.filter(name => !pkgs.includes(name));


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
