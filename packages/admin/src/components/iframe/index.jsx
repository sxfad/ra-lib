import {Result} from 'antd';
import {PageContent} from '@ra-lib/components';

export default function IFrame(props) {
    let {src} = props?.match?.params || {};

    src = window.decodeURIComponent(src);

    return (
        <PageContent
            fitHeight
            style={{
                padding: 0,
                display: 'flex',
            }}
        >
            {src && src !== 'undefined' ? (
                <iframe
                    key={src}
                    allowFullScreen
                    title={src}
                    src={src}
                    style={{
                        border: 0,
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                    }}
                />
            ) : (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Result
                        status="error"
                        title="页面加载失败"
                        subTitle={`传递正确的 src，当前获取到「${src}」`}
                    />
                </div>
            )}
        </PageContent>
    );
};
