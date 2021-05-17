import {Space} from 'antd';

export default function ToolBar(props) {
    const {children, style = {}, ...others} = props;
    return <Space style={{marginBottom: 8, ...style}} {...others}>{children}</Space>;
}
