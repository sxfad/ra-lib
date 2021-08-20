/**
 * 扩展三个Promise方法：
 * <br/>
 * finally：
 * Promise对象的回调链，不管以then方法或catch方法结尾，要是最后一个方法抛出错误，都有可能无法捕捉到
 * （因为Promise内部的错误不会冒泡到全局）。
 * 因此，我们可以提供一个done方法，总是处于回调链的尾端，保证抛出任何可能出现的错误。
 * <br/>
 * <br/>
 * done：
 * finally方法用于指定不管Promise对象最后状态如何，都会执行的操作。
 * 它与done方法的最大区别，它接受一个普通的回调函数作为参数，该函数不管怎样都必须执行。
 * <br/>
 * <br/>
 * allSettled：
 * 该Promise.allSettled()方法返回一个在所有给定的promise都已经fulfilled或rejected后的promise，
 * 并带有一个对象数组，每个对象表示对应的promise结果。
 * 当您有多个彼此不依赖的异步任务成功完成时，或者您总是想知道每个promise的结果时，通常使用它。
 * 相比之下，Promise.all() 更适合彼此相互依赖或者在其中任何一个reject时立即结束。
 * @module 三个Promise扩展方法
 */

/* eslint-disable */
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function(callback) {
        let P = this.constructor;
        return this.then(
            value => P.resolve(callback()).then(() => value),
            reason => P.resolve(callback()).then(() => {
                throw reason;
            }),
        );
    };
}

if (!Promise.prototype.done) {
    Promise.prototype.done = function(onFulfilled, onRejected) {
        this.then(onFulfilled, onRejected)
            .catch(function(reason) {
                // 抛出一个全局错误
                setTimeout(() => {
                    throw reason;
                }, 0);
            });
    };
}

if (!Promise.prototype.allSettled) {
    Promise.allSettled = function(promises) {
        return new Promise(function(resolve, reject) {
            if (!Array.isArray(promises)) {
                return reject(
                    new TypeError("arguments must be an array")
                );
            }
            var resolvedCounter = 0;
            var promiseNum = promises.length;
            var resolvedValues = new Array(promiseNum);
            for (var i = 0; i < promiseNum; i++) {
                (function(i) {
                    Promise.resolve(promises[i]).then(
                        function(value) {
                            resolvedCounter++;
                            resolvedValues[i] = value;
                            if (resolvedCounter == promiseNum) {
                                return resolve(resolvedValues);
                            }
                        },
                        function(reason) {
                            resolvedCounter++;
                            resolvedValues[i] = reason;
                            if (resolvedCounter == promiseNum) {
                                return reject(reason);
                            }
                        }
                    );
                })(i);
            }
        });
    };
}
