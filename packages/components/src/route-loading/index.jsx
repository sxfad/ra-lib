import {Component} from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default class RouteLoading extends Component {
    constructor(...props) {
        super(...props);
        NProgress.start();
    }

    componentWillUnmount() {
        NProgress.done();
    }

    render() {
        return null;
    }
}
