import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Spin} from 'antd';
import ComponentContext from '../component-context';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default class Loading extends Component {
    constructor(...props) {
        super(...props);
        const {progress} = props;
        if (progress) NProgress.start();
    }

    static contextType = ComponentContext;
    static propTypes = {
        spin: PropTypes.bool,
        progress: PropTypes.bool,
        tip: PropTypes.any,
    };
    static defaultProps = {
        progress: true,
        spin: false,
    };

    componentWillUnmount() {
        const {progress} = this.props;
        if (progress) NProgress.done();
    }

    render() {
        let {
            spin,
            progress,
            style = {},
            tip,
            ...others
        } = this.props;

        if (!tip && this.context) tip = this.context.loadingTip;

        if (!spin) return null;

        const wrapperStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            cursor: 'not-allowed',
            ...style,
        };
        return (
            <div style={wrapperStyle} {...others}>
                <Spin spinning tip={tip}/>
            </div>
        );
    }
}
