import * as regexps from './regexp';

/**
 * 获取字符串字节长度，中文占两个字节
 * @param {String} value
 * @returns {number}
 */
function getStringByteLength(value) {
    if (!value) return 0;
    const s = typeof value !== 'string' ? `${value}` : value;
    let { length } = s;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) > 127) {
            // eslint-disable-next-line no-plusplus
            length++;
        }
    }

    return length;
}

/**
 * 格式化字符串
 * @example
 * stringFormat('H{0}llo W{1}rld!', 'e', 'o');
 * stringFormat('H{eKey}llo W{oKey}rld!', {eKey: 'e', oKey: 'o'});
 * @param {String} value 需要格式化的字符串
 * @param {*} args 对象或者多个参数
 * @returns {*}
 */
function stringFormat(value, ...args) {
    if (!value) return value;
    if (typeof value !== 'string') return value;
    if (!args || !args.length) return value;

    if (args.length === 1 && typeof (args[0]) === 'object') {
        const arg = args[0];
        Object.keys(arg).forEach(key => {
            if (arg[key] !== undefined) {
                const reg = new RegExp(`({${key}})`, 'g');
                // eslint-disable-next-line no-param-reassign
                value = value.replace(reg, arg[key]);
            }
        });
        return value;
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < args.length; i++) {
        if (args[i] !== undefined) {
            let reg = new RegExp(`({)${i}(})`, 'g');
            // eslint-disable-next-line no-param-reassign
            value = value.replace(reg, args[i]);
        }
    }
    return value;
}


export function ip(message = '请输入正确的IP地址！') {
    return {
        pattern: regexps.ip,
        message,
    };
}

export function port(message = '请输入正确的端口号！') {
    return {
        pattern: regexps.port,
        message,
    };
}

export function noSpace(message = '不能含有空格！') {
    return {
        validator: (rule, value) => {
            if (/\s/g.test(value)) return Promise.reject(message);
            return Promise.resolve();
        },
    };
}

export function mobile(message = '请输入正确的手机号！') { // 手机号
    return {
        pattern: regexps.mobile,
        message,
    };
}

export function landline(message = '请输入正确的座机号！') { // 座机
    return {
        pattern: regexps.landLine,
        message,
    };
}

export function qq(message = '请输入正确的qq号！') { // qq号
    return {
        pattern: regexps.qq,
        message,
    };
}

export function cardNumber(message = '请输入正确的身份证号！') { // 身份证号十五位十八位最后X的校验
    return {
        pattern: regexps.cardNumber,
        message,
    };
}

export function email(message = '请输入正确的邮箱！') {
    return {
        type: 'email',
        message,
    };
}

export function number(message = '请输入数字.') { // 纯数字，不包括 + -
    return {
        pattern: regexps.number,
        message,
    };
}

export function integer(message = '请输入整数！') { // 整数
    return {
        pattern: regexps.integer,
        message,
    };
}

export function positiveInteger(message = '请输入正整数！') { // 正整数 = 不按包含0
    return {
        pattern: regexps.positiveInteger,
        message,
    };
}

export function numberWithTwoDecimal(message = '请输入数字，保存两位小数.') {
    return {
        pattern: regexps.numberWithTwoDecimal,
        message,
    };
}

export function numberRange(min, max, message = '请输入{min}到{max}之间的值.') {
    return {
        validator(rule, value) {
            if (!value) return Promise.resolve();

            // eslint-disable-next-line no-param-reassign
            value = Number(value);

            if (!value && value !== 0) return Promise.resolve();

            if ((value < min || value > max)) {
                Promise.reject(stringFormat(message, { min, max }));
            } else {
                Promise.resolve();
            }
        },
    };
}

export function numberMaxRange(max, message = '不能大于{max}') {
    return {
        validator(rule, value) {
            if (!value) return Promise.resolve();

            // eslint-disable-next-line no-param-reassign
            value = Number(value);

            if (!value && value !== 0) return Promise.resolve();

            if (value > max) {
                Promise.reject(stringFormat(message, { max }));
            } else {
                Promise.resolve();
            }
        },
    };
}

export function numberMinRange(min, message = '不能小于{min}') {
    return {
        validator(rule, value) {
            if (!value) return Promise.resolve();

            // eslint-disable-next-line no-param-reassign
            value = Number(value);

            if (!value && value !== 0) return Promise.resolve();

            if (value < min) {
                Promise.reject(stringFormat(message, { min }));
            } else {
                Promise.resolve();
            }
        },
    };
}

export function stringByteRangeLength(min, max, message = '请输入 {min}-{max} 个字符(汉字算2个字符).') {
    return {
        validator(rule, value) {
            if (!value) return Promise.resolve();

            let length = getStringByteLength(value);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (length < min || length > max) ? Promise.reject(stringFormat(message, { min, max })) : Promise.resolve();
        },
    };
}

export function stringByteMinLength(min, message = '最少输入{min}个字符(汉字算2个字符).') {
    return {
        validator(rule, value) {
            if (!value) return Promise.resolve();
            let length = getStringByteLength(value);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            length < min ? Promise.reject(stringFormat(message, { min })) : Promise.resolve();
        },
    };
}

export function stringByteMaxLength(max, message = '最多输入{max}个字符(汉字算2个字符).') {
    return {
        validator(rule, value) {
            if (!value) return Promise.resolve();
            let length = getStringByteLength(value);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            length > max ? Promise.reject(stringFormat(message, { max })) : Promise.resolve();
        },
    };
}

export function arrayMaxLength(max, message = '最多{max}个值') {
    return {
        validator(rule, value) {
            if (!value || !Array.isArray(value)) return Promise.resolve();
            let { length } = value;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            length > max ? Promise.reject(stringFormat(message, { max })) : Promise.resolve();
        },
    };
}
