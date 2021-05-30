import React, { forwardRef, useContext } from 'react';
import Content, { ContentProps } from '../content';
import ComponentContext from '../component-context';
import classNames from 'classnames';
import './style.less';

const PageContent = forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
    const context = useContext(ComponentContext);

    let {
        isRoot = true,
        // @ts-ignore
        prefixCls = context.prefixCls,
        className,
        fitHeight,
        ...others
    } = props;

    prefixCls = `${prefixCls}-content-page`;
    const rootClass = classNames(`${prefixCls}`, className);
    return (
        <Content
            className={rootClass}
            fitHeight={fitHeight}
            isRoot={isRoot}
            {...others}
            ref={ref}
        />
    );
});

export default PageContent;
