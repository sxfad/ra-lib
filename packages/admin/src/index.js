export ajax from './commons/ajax';
export * from './commons/ajax';
export config from './commons/config-hoc';
export handleError from './commons/handle-error';
export handleSuccess from './commons/handle-success';
export * from './commons';
export * from './commons/util';
export * from './components';
export * from './config';

// export * from '@ra-lib/util';
// export * from '@ra-lib/components';
// export * from '@ra-lib/hoc';
// export * from '@ra-lib/hooks';

// 展开，否则ide无提示
export {
    ComponentContext,
    ComponentProvider,
    ComponentConsumer,
    PageContent,
    Content,
    ModalContent,
    DrawerContent,
    Layout,
    KeepPageAlive,
    LAYOUT_TYPE,
    FullScreen,
    QueryBar,
    ImageCode,
    MessageCode,
    FormItem,
    Table,
    renderTableCheckbox,
    Pagination,
    ToolBar,
    batchDeleteConfirm,
    Operator,
    confirm,
    Loading,
    Error404,
} from '@ra-lib/components';

export {
    Storage,
    validateRules,

    getTreeData,
    convertToTree,
    findParentNodes,
    findNode,
    getFirstNode,
    findNextNode,
    findParentNode,
    filterTree,
    findGenerationNodes,

    loopObject,
    checkSameField,
    sort,
    getQuery,
    queryParse,
    toQuery,
    queryStringify,
    getElementTop,
    getScrollBarWidth,
    hasScrollBar,
    elementIsVisible,
    scrollElement,
    getColor,

} from '@ra-lib/util';

export {
    createConfigHoc,
    modal,
    drawer,
    checkPropsKey,
} from '@ra-lib/hoc';
export {
    useHeight,
    useDebounceValidator,
} from '@ra-lib/hooks';
