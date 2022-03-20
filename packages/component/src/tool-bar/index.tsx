import React, { CSSProperties, ReactNode } from 'react';
import { Space } from 'antd';

export interface ToolBarProps {
    style?: CSSProperties,
    children?: ReactNode,
}

export default function ToolBar(props: ToolBarProps) {
    const { children, style = {}, ...others } = props;
    return <Space style={{ marginBottom: 8, ...style }} {...others}>{children}</Space>;
}
