import MockAdapter from 'axios-mock-adapter';
import ajax from '../commons/ajax';
import {simplify} from './util';
import mocks from 'src/mock';

const mock = new MockAdapter(ajax.instance);

simplify(mock, [
    ...mocks,
]);
