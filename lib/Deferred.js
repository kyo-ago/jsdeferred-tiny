(function (global) {
        "use strict";
        var klass = function () {
                this._succ = this._fail = this._next = this._id = null;
                this._tail = this;
        };

        var prop = klass.prototype;

        function DeferredStop (message) {
                this.message = message;
        }

        prop.next = function (func) {
                var q = new Deferred();
                q._succ = func;
                return this._add(q);
        };
        prop.error = function (func) {
                var q = new Deferred();
                q._fail = func;
                return this._add(q);
        };
        prop._add = function (queue) {
                this._tail._next = queue;
                this._tail = queue;
                return this;
        };
        prop.call = function (arg) {
                var received;
                var queue = this;
                while (queue && !queue._succ) {
                        queue = queue._next;
                }
                if (!(queue instanceof Deferred)) {
                        return;
                }
                received = queue._succ(arg);
                if (queue._fail_flag) {
                        return;
                } else if (received instanceof DeferredStop) {
                        return queue.fail(received);
                } else if (received instanceof Deferred) {
                        if (!received._fail_flag) {
                                Deferred._insert(queue, received);
                        } else {
                                while (queue && !queue._fail) {
                                        queue = queue._next;
                                }
                                return queue.fail(received._fail_arg);
                        }
                } else if (queue._next instanceof Deferred) {
                        queue._next.call(received);
                }
        };
        prop.fail = function (arg) {
                var result, err,
                        queue = this;
                while (queue && !queue._fail) {
                        queue = queue._next;
                }
                this._fail_flag = true;
                this._fail_arg = arg;
                if (queue instanceof Deferred) {
                        result = queue._fail(arg);
                        queue.call(result);
                } else if (arg instanceof Error) {
                        throw arg;
                }
        };
        klass._insert = function(queue, ins) {
                if (queue._next instanceof Deferred) {
                        ins._next = queue._next;
                }
                queue._next = ins;
        };
        klass.stop = function (message) {
                return new DeferredStop(message);
        };
        klass.next = function(func) {
                var q = new Deferred().next(func);
                q._id = setTimeout(function() { q.call(); }, 0);
                return q;
        };
        klass.parallel = function(arg) {
                var p = new Deferred();
                if (!arg) {
                        Deferred.next(function () { p.call(); });
                        return p;
                }
                var ret = (arg instanceof Array) ? [] : {};
                var progress = 0;
                for (var prop in arg) {
                        if (arg.hasOwnProperty(prop)) {
                                /*jshint loopfunc:true */
                                (function(queue, name) {
                                        if (typeof queue === 'function') {
                                                queue = Deferred.next(queue);
                                        }
                                        queue.next(function(arg) {
                                                progress--;
                                                ret[name] = arg;
                                                if (progress === 0) {
                                                        p.call(ret);
                                                }
                                        })
                                        .error(function(err) { p.fail(err); });
                                        if (typeof queue._id === 'number') {
                                                clearTimeout(queue._id);
                                        }
                                        queue._id = setTimeout(function() {
                                                queue.call();
                                        }, 0);
                                        progress++;
                                }(arg[prop], prop));
                        }
                }
                if (!progress) {
                        Deferred.next(function () { p.call(); });
                }
                return p;
        };

        global['Deferred'] = klass;
        global['DeferredStop'] = DeferredStop;
})(this);
