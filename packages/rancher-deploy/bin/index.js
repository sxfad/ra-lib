#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const __cwd = process.cwd();

// 读取配置
const configPath = path.join(__cwd, 'deploy', 'rancher', 'config.json');
const config = fs.existsSync(configPath) ? require(configPath) : {};

// 从package.json中读取项目名称
const appName = require(path.join(__cwd, 'package.json')).name;
// 子进程，同步方式
const execSync = require('child_process').execSync;

// jenkins路径，带用户名密码
const JENKINS_BASE_URL = process.env.JENKINS_BASE_URL || config.JENKINS_BASE_URL || 'http://wang_sb:wang2018@172.16.175.93:8080/jenkins';
// jenkins任务名
const JENKINS_JOB_NAME = process.env.JENKINS_JOB_NAME || config.JENKINS_JOB_NAME || appName;
// git仓库地址，默认本地项目地址
const GIT_URL = process.env.GIT_URL || config.GIT_URL || getGitUrl();
// git分支，默认本地项目分支
const GIT_BRANCH = process.env.GIT_BRANCH || config.GIT_BRANCH || getCurrentGitBranch();
// rancher 命名空间
const RANCHER_NAME_SPACE = process.env.RANCHER_NAME_SPACE || config.RANCHER_NAME_SPACE || 'front-center';
// 前端目录文件夹，默认.git所在目录
const FRONT_FOLDER = process.env.FRONT_FOLDER || config.FRONT_FOLDER || getFrontFolder();
// 构建命令
const BUILD_COMMAND = process.env.BUILD_COMMAND || config.BUILD_COMMAND || 'build';
// 构建生成文件路径
const BUILD_PATH = process.env.BUILD_PATH || config.BUILD_PATH || 'build';
// 是否安装依赖，有些项目不需要安装依赖，直接复制到docker中，在docker镜像中安装依赖。
const INSTALL = process.env.INSTALL !== 'false';
// 是否构建
const BUILD = process.env.BUILD !== 'false';
// 是否使用yarn，否则使用npm
const USE_YARN = fs.existsSync(path.join(__cwd, 'yarn.lock'));
// 是否复制文件到RANCHER目录
const COPY_TO_RANCHER = process.env.COPY_TO_RANCHER !== 'false';
const RANCHER_BEARER_TOKEN = process.env.RANCHER_BEARER_TOKEN || config.RANCHER_BEARER_TOKEN;
const RANCHER_URL = process.env.RANCHER_URL || config.RANCHER_URL;

const jenkins = require('jenkins')({
    baseUrl: JENKINS_BASE_URL,
    crumbIssuer: true,
    promisify: true,
});

(async () => {
    const url = new URL(JENKINS_BASE_URL);
    console.log(`jenkins job: ${url.origin}${url.pathname}/job/${JENKINS_JOB_NAME}`);
    // 不存在，创建任务
    const exist = await jenkins.job.exists(JENKINS_JOB_NAME);
    const options = {
        jobName: JENKINS_JOB_NAME,
        gitUrl: GIT_URL,
        branch: GIT_BRANCH,
        nameSpace: RANCHER_NAME_SPACE,
        fontFolder: FRONT_FOLDER,
        buildPath: BUILD_PATH,
        buildCommand: BUILD_COMMAND,
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

async function getWebAddress() {
    if (!RANCHER_URL || !RANCHER_BEARER_TOKEN) return;
    const url = `${RANCHER_URL}/project/c-bv4qc:p-sbjrp/workloads/deployment:${RANCHER_NAME_SPACE}:${JENKINS_JOB_NAME}`;
    const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${RANCHER_BEARER_TOKEN}`,
        },
    });

    if (res.data && res.data.publicEndpoints && res.data.publicEndpoints.length) {
        const info = res.data.publicEndpoints[0];
        const { addresses = [], port } = info;
        if (addresses.length && port) {
            const ip = addresses[0];
            return `http://${ip}:${port}`;
        }
    }
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

    log.on('end', async function() {
        console.log('end');
        const address = await getWebAddress();
        console.log(`web address: ${address}`);
    });
}

// 获取配置xml
// async function getConfig(jobName) {
//     return await jenkins.job.config(jobName);
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
        buildCommand,
    } = options;

    if (!gitUrl) throw Error('git 地址不能为空！');

    // 读取jenkins配置模版
    let xmlTemplate = fs.readFileSync(path.join(__dirname, 'job.xml'), 'UTF-8') || '';

    // 不安装依赖
    if (!INSTALL) xmlTemplate = xmlTemplate.replace('yarn install', '');
    // 不构建
    if (!BUILD) xmlTemplate = xmlTemplate.replace('yarn build', '');
    // 不复制文件
    if (!COPY_TO_RANCHER) xmlTemplate = xmlTemplate.replace('rm -rf deploy/rancher/build', '# rm -rf deploy/rancher/build');

    return xmlTemplate
        // 替换git仓库地址
        .replace('<url>https://gitee.com/sxfad/react-admin.git</url>', `<url>${gitUrl}</url>`)
        // 替换分支
        .replace('<name>*/master</name>', `<name>*/${branch}</name>`)
        // 替换前端目录
        .replace('cd .', `cd ${fontFolder}`)
        // 替换安装命令
        .replace('yarn install', USE_YARN ? 'yarn install' : 'npm i ')
        // 替换构建命令
        .replace('yarn build', `${USE_YARN ? 'yarn' : 'npm run'} ${buildCommand}`)
        // 替换前端构建目录，将构建生成的目录复制到rancher目录中，提升docker构建速度
        .replace('rm -rf deploy/rancher/build', `rm -rf deploy/rancher/${buildPath}`)
        .replace('rsync -rv --exclude=deploy build/ deploy/rancher/build', `rsync -rv --exclude=deploy ${buildPath}/ deploy/rancher/${buildPath}`)
        // 替换rancher命名空间
        .replace('/NAMESPACE_NAME/front-center', `/NAMESPACE_NAME/${nameSpace}`);
}

/**
 * 创建任务
 * @param options
 * @returns {Promise<jobName>}
 */
async function createJob(options) {
    const { jobName, ...others } = options;

    const xml = getConfigXml(others);

    return jenkins.job.create(jobName, xml);
}

/**
 * 修改任务配置
 * @param options
 * @returns {Promise<*>}
 */
async function modifyJobConfig(options) {
    const { jobName, ...others } = options;

    const xml = getConfigXml(others);

    return jenkins.job.config(jobName, xml);
}

/**
 * 获取当前项目的git仓库地址
 * @returns {*}
 */
function getGitUrl() {
    const gitRoot = getGitRoot();
    const gitConfigPath = path.join(gitRoot, '.git', 'config');
    const configContent = fs.readFileSync(gitConfigPath, 'UTF-8');

    const arr = configContent.split('\n\t');
    const url = arr.find(item => item.startsWith('url = '));
    return url.replace('url = ', '');
}

/**
 * 获取git根目录
 * @returns {string}
 */
function getGitRoot() {
    let rootPath = __cwd;

    while (rootPath) {
        if (fs.existsSync(path.join(rootPath, '.git'))) {
            break;
        }
        const paths = rootPath.split(path.sep);
        rootPath = paths.slice(0, paths.length - 1).join(path.sep);
    }

    if (rootPath) return rootPath;

    throw new Error('非git仓库，或 非仓库中子文件夹');
}

/**
 * 获取前端在仓库中的文件夹
 */
function getFrontFolder() {
    const gitRoot = getGitRoot();

    if (gitRoot === __cwd) return '.';

    if (gitRoot) {
        return path.relative(gitRoot, __cwd).split(path.sep).join('/'); // 服务器是linux，直接改成 '/'
    }
}

/**
 * 获取git当前分支
 * @return {string} 当前git分支
 */
function getCurrentGitBranch() {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}
