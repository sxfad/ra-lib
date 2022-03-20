import { useState, useEffect } from 'react';

export default ({ commonProps: _commonProps = {} }) => (WrappedComponent) => {
    return props => {
        const { visible, onCancel } = props;
        const [destroyed, setDestroyed] = useState(true);

        useEffect(() => {
            if (visible) {
                setDestroyed(false);
            } else {
                // 等待动画
                const st = setTimeout(() => setDestroyed(true), 500);
                return () => clearTimeout(st);
            }
        }, [visible]);

        if (destroyed) return null;

        const commonProps = {
            // width: 1000,
            // bodyStyle: { padding: 0 },
            // style: { top: 50 },
            maskClosable: false,
            ..._commonProps,
            visible,
            onCancel,
        };

        return <WrappedComponent {...props} commonProps={commonProps} />;
    };
}
