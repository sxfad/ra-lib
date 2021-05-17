import {useState} from 'react';

function useTest(initialState) {
    const [test, setTest] = useState(initialState);

    return [test, setTest];
}

export default useTest;
