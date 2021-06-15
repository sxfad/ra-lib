import React, { forwardRef, useImperativeHandle, useContext, useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input, Spin } from 'antd';
import classNames from 'classnames';
// @ts-ignore
import defaultErrorImage from './defaultErrorImage.png';
import ComponentContext from '../component-context';
import './style.less';


export interface ImageCodeProps {
    className?: string,
    prefixCls?: string,
    value?: string | [ any, any ],
    onChange?: (value: ChangeEvent<HTMLInputElement>) => void,
    // src: string类型时，直接作为图片的src input value 为 string
    //      func  类型时，返回值，直接作为图片src
    src?: () => string,
    placeholder?: string,
    // 出错时站位图片
    errorImage?: string,
    imageWidth?: number | string,
}

export interface refProps {
    refresh: () => void,
}

const ImageCode = forwardRef<refProps, ImageCodeProps>((props, ref) => {
    const context = useContext(ComponentContext);
    let {
        placeholder = '请输入图片验证码',
        errorImage = defaultErrorImage,
        imageWidth = 90,

        className,
        prefixCls = context.prefixCls,
        src,
        onChange,
        value,
        ...others
    } = props;

    useImperativeHandle(ref, () => {
        return {
            refresh: handleClick,
        };
    });

    const imgRef = useRef(null);

    const [ url, setUrl ] = useState(errorImage);
    const [ loading, setLoading ] = useState(false);

    async function handleClick() {
        // 后端地址可直接作为src的情况
        if (typeof src === 'string') {
            setUrl(`${src}?t=${Date.now()}`);
        }

        if (typeof src === 'function') {
            setLoading(true);
            try {
                const result = await src();
                setUrl(result || errorImage);
            } finally {
                setLoading(false);
            }
        }
    }

    function handleError() {
        setUrl(errorImage);
    }

    useEffect(() => {
        (async () => {
            await handleClick();
        })();
    }, []);

    prefixCls = `${prefixCls}-image-code`;
    const rootClass = classNames(prefixCls, className);
    const inputClass = `${prefixCls}-input`;
    const imgClass = `${prefixCls}-img`;

    return (
        <Spin spinning={loading} size="small">
            <div className={rootClass}>
                <Input
                    className={inputClass}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    {...others}
                />
                <img
                    ref={imgRef}
                    className={imgClass}
                    style={{ width: imageWidth }}
                    src={url}
                    alt="图片验证码"
                    onClick={handleClick}
                    onError={handleError}
                />
            </div>
        </Spin>
    );
});

export default ImageCode;

