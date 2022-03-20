import { useContext } from 'react';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import {ComponentContext} from '../../component-context';
import './style.less';

function Header(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        style = {},

        height,
        width,
        logo,
        title,
        sideCollapsed,
        showSide,
        theme = 'dark',
    } = props;

    function handleLogoClick() {
        props.history.push('/');
    }

    prefixCls = `${prefixCls}-layout-logo`;
    const rootClass = classNames(
        prefixCls,
        className,
        {
            collapsed: sideCollapsed,
            'no-side': !showSide,
            dark: theme === 'dark',
        },
    );

    return (
        <div
            className={rootClass}
            style={{ width, flex: `0 0 ${width}px`, ...style }}
            onClick={handleLogoClick}
        >
            {typeof logo === 'string' ? (
                <img
                    className={`${prefixCls}-image`}
                    style={{ height: height - 16 }}
                    src={logo}
                    alt='logo'
                />
            ) : logo}
            {sideCollapsed ? null : <h1 className={`${prefixCls}-title`}>{title}</h1>}
        </div>
    );
}

export default withRouter(Header);
