import { useState, useEffect } from 'react';

export default (options = {}) => (WrappedComponent) => {
    const { commonProps: _commonProps = {} } = options;
    return props => {
        const { visible, onCancel, onClose } = props;
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
            onClose,
        };

        return <WrappedComponent {...props} commonProps={commonProps} />;
    };
}
