export function compose(functions) {
    if (functions.length === 0) {
        return arg => arg;
    }

    if (functions.length === 1) {
        return functions[0];
    }

    return functions.reduce((a, b) => (...args) => a(b(...args)));
}
