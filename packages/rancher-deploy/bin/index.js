#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const __cwd = process.cwd();

const appName = require(path.join(__cwd, 'package.json')).name;
const execSync = require('child_process').execSync; // 同步子进程

const JENKINS_BASE_URL = process.env.JENKINS_BASE_URL || 'http://wang_sb:wang2018@172.16.175.93:8080/jenkins';
const JENKINS_JOB_NAME = process.env.JENKINS_JOB_NAME || appName;
const GIT_URL = process.env.GIT_URL || getGitUrl(); // 'https://gitee.com/sxfad/react-admin.git';
const GIT_BRANCH = process.env.GIT_BRANCH || getGitBranch(); // 'master';
const RANCHER_NAME_SPACE = process.env.RANCHER_NAME_SPACE || 'front-center';
const FRONT_FOLDER = process.env.FRONT_FOLDER || getFrontFolder();
const BUILD_PATH = process.env.BUILD_PATH || 'build';

const jenkins = require('jenkins')({
    baseUrl: JENKINS_BASE_URL,
    crumbIssuer: true,
    promisify: true,
});

(async () => {
    // 不存在，创建任务
    const exist = await jenkins.job.exists(JENKINS_JOB_NAME);
    const options = {
        jobName: JENKINS_JOB_NAME,
        gitUrl: GIT_URL,
        branch: GIT_BRANCH,
        nameSpace: RANCHER_NAME_SPACE,
        fontFolder: FRONT_FOLDER,
        buildPath: BUILD_PATH,
    };

    if (!exist) {
        await createJob(options);
        console.log('create job', JENKINS_JOB_NAME);
    } else {
        // 存在，修改项目配置
        await modifyJobConfig(options);
    }

    // 构建并输出日志
    const queueNumber = await jenkins.job.build(JENKINS_JOB_NAME);
    const buildNumber = await getBuildNumber(queueNumber);

    console.log('build number', buildNumber);

    showLog(JENKINS_JOB_NAME, buildNumber);
})();

/**
 * 获取构建序号
 * @param queueNumber
 * @returns {Promise<unknown>}
 */
async function getBuildNumber(queueNumber) {
    return new Promise((resolve, reject) => {
        const si = setInterval(async () => {
            const res = await jenkins.queue.item(queueNumber);
            if (!res.executable) {
                console.log(res.why);
            } else {
                resolve(res.executable.number);
                clearInterval(si);
            }
        }, 2000);
    });
}

/**
 * 显示日志
 * @param jobName
 * @param buildNumber
 */
function showLog(jobName, buildNumber) {
    const log = jenkins.build.logStream(jobName, buildNumber);

    log.on('data', function(text) {
        process.stdout.write(text);
    });

    log.on('error', function(err) {
        console.log('error', err);
    });

    log.on('end', function() {
        console.log('end');
    });
}

// 获取配置xml
// async function getConfig(jobName) {
//     const res = await jenkins.job.config(jobName);
//
//     return res;
// }

/**
 * 获取任务配置文件
 * @param options
 * @returns {*}
 */
function getConfigXml(options = {}) {
    const {
        gitUrl,
        branch,
        nameSpace,
        fontFolder,
        buildPath,
    } = options;

    if (!gitUrl) throw Error('git 地址不能为空！');

    const xmlTemplate = fs.readFileSync(path.join(__dirname, 'job.xml'), 'UTF-8');

    return xmlTemplate
        // 替换git仓库地址
        .replace('<url>https://gitee.com/sxfad/react-admin.git</url>', `<url>${gitUrl}</url>`)
        // 替换分支
        .replace('<name>*/master</name>', `<name>*/${branch}</name>`)
        // 替换前端构建目录
        .replace('rm -rf deploy/rancher/build', `rm -rf deploy/rancher/${buildPath}`)
        .replace('cp -r build/ deploy/rancher/build', `cp -r ${buildPath}/ deploy/rancher/${buildPath}`)
        // 替换rancher命名空间
        .replace('/NAMESPACE_NAME/front-center', `/NAMESPACE_NAME/${nameSpace}`)
        // 替换前端目录
        .replace('cd .', `cd ${fontFolder}`);
}

/**
 * 创建任务
 * @param options
 * @returns {Promise<jobName>}
 */
async function createJob(options) {
    const {jobName, ...others} = options;

    const xml = getConfigXml(others);

    return jenkins.job.create(jobName, xml);
}

/**
 * 修改任务配置
 * @param options
 * @returns {Promise<*>}
 */
async function modifyJobConfig(options) {
    const {jobName, ...others} = options;

    const xml = getConfigXml(others);

    return jenkins.job.config(jobName, xml);
}

/**
 * 获取当前项目的git仓库地址
 * @returns {*}
 */
function getGitUrl() {
    let gitConfigPath;
    if (fs.existsSync(path.join(__cwd, '.git'))) {
        gitConfigPath = path.join(__cwd, '.git', 'config');
    } else {
        gitConfigPath = path.join(__cwd, '..', '.git', 'config');
    }
    const configContent = fs.readFileSync(gitConfigPath, 'UTF-8');

    const arr = configContent.split('\n\t');
    const url = arr.find(item => item.startsWith('url = '));
    return url.replace('url = ', '');
}

/**
 * 获取前端在仓库中的文件夹
 */
function getFrontFolder() {
    let currentPath = __cwd;

    while (currentPath) {
        if (fs.existsSync(path.join(currentPath, '.git'))) {
            break;
        }
        const paths = currentPath.split(path.sep);
        currentPath = paths.slice(0, paths.length - 1).join(path.sep);
    }

    if (currentPath === __cwd) return '.';

    if (currentPath) {
        return path.relative(currentPath, __cwd).split(path.sep).join('/'); // 服务器是linux，直接改成 '/'
    }

    throw new Error('非git仓库，或 非仓库中直接子文件夹');
}

function getGitBranch() {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}
