const { existsSync, readdirSync, statSync } = require('fs');
const { basename, extname, join, relative } = require('path');
const assert = require('assert');

const RE_DYNAMIC_ROUTE = /^\[(.+?)\]/;

/**
 * 获取文件
 * @param root
 * @returns {*[]|*}
 */
function getFiles(root) {
    // 目标目录不存在
    if (!existsSync(root)) return [];

    return readdirSync(root).filter((file) => {
        const absFile = join(root, file);
        const fileStat = statSync(absFile);
        const isDirectory = fileStat.isDirectory();
        const isFile = fileStat.isFile();

        // 忽略目录
        if (isDirectory && ['components', 'component', 'utils', 'util'].includes(file)) return false;

        // . 开头的文件忽略
        if (file.charAt(0) === '.') return false;
        // _ 开头的文件忽略
        if (file.charAt(0) === '_') return false;
        // 测试文件忽略
        if (/\.(test|spec|e2e)\.(j|t)sx?$/.test(file)) return false;
        // 类型文件忽略
        if (/\.d\.ts$/.test(file)) return false;
        // 弹框文件
        if (/Modal\.(j|t)sx$/.test(file)) return false;

        if (isFile) {
            if (!/\.(j|t)sx$/.test(file)) return false;
        }

        return true;
    });
}

/**
 * 处理windows路径
 * @param path
 * @returns {*}
 */
function winPath(path) {
    const isExtendedLengthPath = /^\\\\\?\\/.test(path);
    if (isExtendedLengthPath) {
        return path;
    }

    return path.replace(/\\/g, '/');
}

/**
 * 处理windows路径兼容，并添加前缀，默认 @/ 需要webpack设置 alias
 * @param route
 * @param opts
 * @returns {*}
 */
function normalizeRoute(route, opts) {
    if (route.component) {
        route.absComponent = winPath(route.component);
        route.component = winPath(relative(join(opts.root, '..'), route.component));
        route.component = `${opts.componentPrefix || '@/'}${route.component}`;
    }
    return {
        ...route,
    };
}


function normalizeRoutes(routes) {
    const paramsRoutes = [];
    const exactRoutes = [];
    const layoutRoutes = [];

    routes.forEach((route) => {
        const { __isDynamic, exact } = route;
        delete route.__isDynamic;
        if (__isDynamic) {
            paramsRoutes.push(route);
        } else if (exact) {
            exactRoutes.push(route);
        } else {
            layoutRoutes.push(route);
        }
    });

    assert(
        paramsRoutes.length <= 1,
        `We should not have multiple dynamic routes under a directory.`,
    );

    return [...exactRoutes, ...layoutRoutes, ...paramsRoutes].reduce((memo, route) => {
        if (route.__toMerge && route.routes) {
            memo = memo.concat(route.routes);
        } else {
            memo.push(route);
        }
        return memo;
    }, []);
}

function normalizePath(path, opts) {
    path = winPath(path)
        .split('/')
        .map((p) => {
            // dynamic route
            p = p.replace(RE_DYNAMIC_ROUTE, ':$1');

            // :post$ => :post?
            if (p.endsWith('$')) {
                p = p.slice(0, -1) + '?';
            }
            return p;
        })
        .join('/');

    path = `/${path}`;

    // /index/index -> /
    if (path === '/index/index') {
        path = '/';
    }

    // /xxxx/index -> /xxxx/
    path = path.replace(/\/index$/, '/');

    // remove the last slash
    // e.g. /abc/ -> /abc
    if (path !== '/' && path.slice(-1) === '/') {
        path = path.slice(0, -1);
    }

    return path;
}


const extsMap = {
    javascript: ['.ts', '.tsx', '.js', '.jsx'],
    css: ['.less', '.sass', '.scss', '.stylus', '.css'],
};

/**
 * Try to match the exact extname of the file in a specific directory.
 * @returns
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */
function getFile(opts) {
    const exts = extsMap[opts.type];
    for (const ext of exts) {
        const filename = `${opts.fileNameWithoutExt}${ext}`;
        const path = winPath(join(opts.base, filename));
        if (existsSync(path)) {
            return {
                path,
                filename,
            };
        }
    }
    return null;
}


function fileToRouteReducer(opts, memo, file) {
    const { root, relDir = '' } = opts;
    const absFile = join(root, relDir, file);
    const stats = statSync(absFile);
    const __isDynamic = RE_DYNAMIC_ROUTE.test(file);

    if (stats.isDirectory()) {
        const relFile = join(relDir, file);
        const layoutFile = getFile({
            base: join(root, relFile),
            fileNameWithoutExt: '_layout',
            type: 'javascript',
        });
        const route = {
            path: normalizePath(relFile, opts),
            routes: getRoutes({
                ...opts,
                relDir: join(relFile),
            }),
            __isDynamic,
            ...(layoutFile
                ? {
                    component: layoutFile.path,
                }
                : {
                    exact: true,
                    __toMerge: true,
                }),
        };
        memo.push(normalizeRoute(route, opts));
    } else {
        const bName = basename(file, extname(file));
        memo.push(
            normalizeRoute(
                {
                    path: normalizePath(join(relDir, bName), opts),
                    exact: true,
                    component: absFile,
                    __isDynamic,
                },
                opts,
            ),
        );
    }
    return memo;
}

function getRoutes(opts) {
    const { root, relDir = '', config } = opts;
    const files = getFiles(join(root, relDir));
    const routes = normalizeRoutes(files.reduce(fileToRouteReducer.bind(null, opts), []));

    if (!relDir) {
        const globalLayoutFile = getFile({
            base: root,
            fileNameWithoutExt: `../${config.singular ? 'layout' : 'layouts'}/index`,
            type: 'javascript',
        });
        if (globalLayoutFile) {
            return [
                normalizeRoute(
                    {
                        path: '/',
                        component: globalLayoutFile.path,
                        routes,
                    },
                    opts,
                ),
            ];
        }
    }

    return routes;
}

module.exports = {
    getFiles,
    getRoutes,
};
