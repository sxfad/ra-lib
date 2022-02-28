import React, { useContext, useCallback, useRef } from 'react';
import classnames from 'classnames';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import './index.less';
import ComponentContext from '../component-context';

let RowElement = SortableElement((props) => {
    return props.children;
});

let BodyContainer = SortableContainer(props => {
    const {
        children,
        ...others
    } = props;
    const children2 = props.children.flat(4).filter(item => !!item);

    return (
        <tbody {...others}>{children2.map((item, index) => {
            const { key } = item;

            return (
                <RowElement
                    key={key || index}
                    index={index}
                >
                    {item}
                </RowElement>
            );
        })}</tbody>
    );
});

function getCss(element, attr) {
    if (element.currentStyle) return element.currentStyle[attr];
    return window.getComputedStyle(element)[attr];
}

export default function DragRow(OriTable) {

    function DragRowTable(props) {
        const context = useContext(ComponentContext);

        const {
            prefixCls = context.prefixCls,
            helperClass,
            onSortStart,
            onSortEnd,
            components,
            className,
            ...others
        } = props;

        const bodyRef = useRef(null);

        const handleSortStart = useCallback((...args) => {
            if (onSortStart) onSortStart(...args);

            // 保持tr样式
            const helperTds = document.querySelectorAll('.helper-element > td');
            const tr = bodyRef.current.container.querySelector('tr');
            const tds = tr.querySelectorAll('td');

            tds.forEach((item, index) => {
                if (!helperTds[index]) return;

                helperTds[index].style.width = getCss(item, 'width');
                helperTds[index].style.height = getCss(item, 'height');
            });
        }, [onSortStart]);

        const handleSortEnd = useCallback((sortProps) => {
            let { oldIndex, newIndex } = sortProps;
            if (oldIndex === newIndex) return;
            if (bodyRef.current.container.querySelector(`.${prefixCls}-table-measure-row`)) {
                newIndex = (newIndex - 1) < 0 ? 0 : newIndex - 1;
                oldIndex -= 1;
            }

            onSortEnd({ ...sortProps, oldIndex, newIndex });
        }, [onSortEnd, prefixCls]);

        let BodyWrapper = useCallback((bodyProps) => {
            const injectProps = {
                onSortEnd: handleSortEnd,
                onSortStart: handleSortStart,
                helperClass: classnames(helperClass, 'helper-element'),
            };
            return <BodyContainer ref={bodyRef} {...injectProps} {...bodyProps} />;
        }, [handleSortEnd, handleSortStart, helperClass]);

        const body = components?.body || {};

        const tableComponents = {
            body: {
                ...body,
                wrapper: BodyWrapper,
            },
        };

        const classNames = classnames(className, 'sxTableRowDraggable');

        return (
            <OriTable
                {...others}
                className={classNames}
                components={tableComponents}
            />
        );
    }

    return (props) => {
        if (!props.dataSource?.length) return <OriTable {...props} />;

        return <DragRowTable {...props} />;
    };
}

