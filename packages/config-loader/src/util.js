const fs = require('fs');
const path = require('path');

/**
 * 删除注释
 * @param codes
 * @returns {*|string}
 */
function removeComments(codes) {
    let {replacedCodes, matchedObj} = replaceQuotationMarksWithForwardSlash(codes);

    replacedCodes = replacedCodes.replace(/(\s*(?<!\\)\/\/.*$)|(\s*(?<!\\)\/\*[\s\S]*?(?<!\\)\*\/)/mg, '');
    Object.keys(matchedObj).forEach(k => {
        replacedCodes = replacedCodes.replace(k, matchedObj[k]);
    });

    return replacedCodes;

    function replaceQuotationMarksWithForwardSlash(codes) {
        let matchedObj = {};
        let replacedCodes = '';

        let regQuotation = /(?<!\\)('|"|`).*?(?<!\\)\1/mg;
        let uniqueStr = 'QUOTATIONMARKS' + Math.floor(Math.random() * 10000);

        let index = 0;
        replacedCodes = codes.replace(regQuotation, function(match) {
            let s = uniqueStr + (index++);
            matchedObj[s] = match;
            return s;
        });

        return {replacedCodes, matchedObj};
    }
}

/**
 * 获取 () 内的内容
 * @param content
 * @returns {string}
 */
function getCurlyBracketContent(content) {
    const stack = [];
    const left = '(';
    const right = ')';

    const strFlags = ['\'', '"', '`'];
    const strStack = [];

    const startIndex = content.indexOf(left);
    if (startIndex === -1) return '';

    content = content.substring(startIndex);

    for (let i = 0; i < content.length; i++) {
        let s = content[i];
        if (strFlags.includes(s)) {
            if (strStack[0] === s) {
                strStack.shift();
            } else {
                strStack.unshift(s);
            }
        }
        if (left === s) {
            stack.push(s);
        }
        if (right === s) {
            stack.pop();
            if (stack.length === 0 && strStack.length === 0) {
                return content.substring(1, i).trim();
            }
        }
    }

    return '';
}

function getConfig(content, configName = 'config') {
    let config = '{}';

    content = content.trim();
    content = removeComments(content);

    if (!content) return config;

    const configReg = new RegExp(`${configName}\\s*\\(`);

    const execResult = configReg.exec(content);

    if (!execResult) return config;

    const startIndex = execResult.index;
    content = content.substring(startIndex);
    content = getCurlyBracketContent(content);

    if (!content) return config;

    return content;
}


function getFiles(rootPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    const result = [];
    if (!fs.existsSync(rootPath)) throw Error(`${rootPath} not existed!`);
    const loop = (pathName, fileName = '') => {
        const filePath = path.join(pathName, fileName);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            const dirs = fs.readdirSync(filePath);
            dirs.forEach(file => loop(filePath, file));
        } else {
            const extname = path.extname(filePath);
            if (extensions.includes(extname)) {
                // 解决windows兼容性问题
                result.push(filePath.replace(/\\/g, '/'));
            }
        }
    };

    loop(rootPath);

    return result;
}

module.exports = {
    getConfig,
    getFiles,
};
