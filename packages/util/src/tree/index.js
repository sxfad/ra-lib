/**
 * 获取树状结构，如果已经是树状结构，直接返回
 * @param dataSource
 * @returns {*[]|*}
 */
export function getTreeData(dataSource) {
    if (!dataSource) return [];

    if (!Array.isArray(dataSource)) dataSource = [dataSource];

    // 含有children属性，已经是树状结构
    if (dataSource.find(item => !!item.children)) return dataSource;

    return convertToTree(dataSource);
}

/**
 * 转换为树状结构
 * @param rows
 * @param keyField
 * @param parentKeyField
 * @returns {*[]|*}
 */
export function convertToTree(rows, keyField = 'id', parentKeyField = 'parentId') {
    if (!rows) return [];

    // 拷贝，多次执行修改原始的rows会出问题，指定id，parentId
    rows = rows.map(item => ({id: item[keyField], parentId: item[parentKeyField], ...item}));

    // 获取所有的顶级节点
    let nodes = rows.filter(item => !rows.find(r => r.id === item.parentId));

    // 存放要处理的节点
    let toDo = [...nodes];

    while (toDo.length) {
        // 处理一个，头部弹出一个。
        let node = toDo.shift();
        // 获取子节点。
        rows.forEach(child => {
            if (child.parentId === node.id) {

                if (node.children) {
                    node.children.push(child);
                } else {
                    node.children = [child];
                }
                // child加入toDo，继续处理
                toDo.push(child);
            }
        });
    }
    return nodes;
}

/**
 * 获取所有的父节点
 * @param treeData 树状结构数据
 * @param fieldValue 用于查找的值
 * @param field 用户查找的键，默认 id
 * @returns {*|[]}
 */
export function findParentNodes(treeData, fieldValue, field = 'id') {
    treeData = Array.isArray(treeData) ? treeData : [treeData];

    // 深度遍历查找
    function dfs(data, fieldValue, parents) {
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            // 找到id则返回父级id
            if (item[field] === fieldValue) return parents;
            // children不存在或为空则不递归
            if (!item.children || !item.children.length) continue;
            // 往下查找时将当前id入栈
            parents.push(item);

            if (dfs(item.children, fieldValue, parents).length) return parents;
            // 深度遍历查找未找到时当前id 出栈
            parents.pop();
        }
        // 未找到时返回空数组
        return [];
    }

    return dfs(treeData, fieldValue, []);
}

/**
 * 根据指定数据的键值对，查找node，默认基于id查找，比如根据path查找： getNode(treeData, 'path', '/user/list')
 * @param {Array} treeData 树状结构数据
 * @param {String} field key值，比如 'path'，'text' 等节点数据属性，默认id
 * @param {*} fieldValue 节点属性所对应的数据
 * @param {Function} [compare] 节点属性所对应的数据比较方式， 默认 === 比对
 * @returns {object} 返回根据 key value查找到的节点
 */
export function findNode(treeData, fieldValue, field = 'id', compare) {
    treeData = Array.isArray(treeData) ? treeData : [treeData];

    if (!treeData || !treeData.length) return null;
    if (!compare) compare = (a, b) => a === b;
    let node = null;
    const loop = (data) => {
        for (let item of data) {
            if (compare(item[field], fieldValue, item)) {
                node = {...item};
                break;
            }
            if (item.children && item.children.length) {
                loop(item.children);
            }
        }
    };
    loop(treeData);
    return node;
}


/**
 * 查找给定节点，及其后代节点property属性，第一个不为空的值
 * @param {Array} treeData 节点数据，树状结构
 * @param {String} field 属性，比如 key， path等
 * @returns {*}
 */
export function getFirstNode(treeData, field) {
    if (!Array.isArray(treeData)) treeData = [treeData];

    const loop = nodes => {
        for (let node of nodes) {
            if (node[field]) return node;

            const result = loop(node.children || []);
            if (result) return result;
        }
    };

    return loop(treeData);
}


/**
 * 过滤树
 * @param treeData
 * @param filter 过滤函数
 * @returns {*[]|*}
 */
export function filterTree(treeData, filter = node => true) {
    if (!treeData) return [];

    if (!Array.isArray(treeData)) treeData = [treeData];

    const getNodes = (result, node) => {
        if (filter(node)) {
            result.push(node);
            return result;
        }
        if (Array.isArray(node.children)) {
            const children = node.children.reduce(getNodes, []);
            if (children.length) result.push({...node, children});
        }
        return result;
    };

    return treeData.reduce(getNodes, []);
}


/**
 * 获取所有后代节点
 * @param treeData
 * @param fieldValue
 * @param field
 * @returns {*[]}
 */
export function findGenerationNodes(treeData, fieldValue, field = 'id') {
    const node = findNode(treeData, fieldValue, field);

    if (!node) return [];

    if (!node.children || !node.children.length) return [];

    const results = [];
    const loop = nodes => nodes.forEach(node => {
        results.push(node);
        if (node.children && node.children.length) loop(node.children);
    });

    loop(node.children);

    return results;
}
