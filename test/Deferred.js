describe('Deferred', function () {
        before(function () {
                this.clock = sinon.useFakeTimers();
        });
        after(function () {
                this.clock && this.clock.restore();
        });

        it('new Deferred', function () {
                var result = false;
                var q = new Deferred().next(function() {
                        result = true;
                });
                expect(result).to.eql(false);
                q.call();
                expect(result).to.eql(true);
        });
        it('Deferred.next', function () {
                var result = false;
                Deferred.next(function() {
                        result = true;
                });
                expect(result).to.eql(false);
                this.clock.tick(100);
                expect(result).to.eql(true);
        });
        it('chained Deferred', function () {
                var result1 = false, result2 = false, hoge;
                Deferred.next(function() {
                        result1 = true;
                        return 'hoge';
                })
                .next(function(arg) {
                        result2 = true;
                        hoge = arg;
                });
                this.clock.tick(100);
                expect(result1 & result2).to.eql(1);
                expect(hoge).to.eql('hoge');
        });
        it('Deferred#error throw', function () {
                expect(function() {
                        new Deferred().next(function() {
                                throw new Error('fail');
                        }).call();
                }).to.throwException(/fail/);
        });
        it('Deferred#error1', function () {
                var result1 = false, result2 = false;
                Deferred.next(function() {
                        return new DeferredStop('fail');
                })
                .next(function() {
                        result1 = true;
                })
                .error(function() {
                        result2 = true;
                });
                this.clock.tick(100);
                expect(result1).to.eql(false);
                expect(result2).to.eql(true);
        });
        it('Deferred#error2', function () {
                var result1 = false, result2 = false;
                Deferred.next(function() {
                        return Deferred.stop('fail');
                })
                .next(function() {
                        result1 = true;
                })
                .error(function() {
                        result2 = true;
                });
                this.clock.tick(100);
                expect(result1).to.eql(false);
                expect(result2).to.eql(true);
        });
        it('async Deferred1', function () {
                var result = false;
                Deferred.next(function() {
                        var q = new Deferred();
                        setTimeout(function() {
                                q.call();
                        }, 100);
                        return q;
                })
                .next(function() {
                        result = true;
                });
                expect(result).to.eql(false);
                this.clock.tick(200);
                expect(result).to.eql(true);
        });
        it('async Deferred2', function () {
                var result1 = false, result2 = false;
                Deferred.next(function() {
                        var q = new Deferred();
                        setTimeout(function() {
                                q.fail();
                        }, 100);
                        return q;
                })
                .next(function() {
                        result1 = false;
                })
                .error(function() {
                        result2 = true;
                });
                expect(result1 | result2).to.eql(0);
                this.clock.tick(200);
                expect(result1).to.eql(false);
                expect(result2).to.eql(true);
        });
        it('parallel Deferred #arrayArgument', function () {
                Deferred.parallel([
                        Deferred.next(function() {
                                return 1;
                        }),
                        Deferred.next(function() {
                                return 2;
                        }),
                        Deferred.next(function() {
                                return 3;
                        })
                ])
                .next(function(arr) {
                        expect(arr).to.eql([ 1, 2, 3 ]);
                });
                this.clock.tick(100);
        });
        it('parallel Deferred #objectArgument', function () {
                Deferred.parallel({
                        one: Deferred.next(function() {
                                return 1;
                        }),
                        two: Deferred.next(function() {
                                return 2;
                        }),
                        three: Deferred.next(function() {
                                return 3;
                        })
                })
                .next(function(obj) {
                        expect(obj).to.eql({ one: 1, two: 2, three: 3 });
                });
                this.clock.tick(100);
        });
        it('parallel Deferred #Error', function () {
                var result = false;
                var c = 0;
                Deferred.parallel([
                        Deferred.next(function() {
                                return new DeferredStop('error1');
                        }),
                        Deferred.next(function() {
                                return new DeferredStop('error2');
                        }),
                        Deferred.next(function() {
                                return 'success';
                        })
                ])
                .next(function(arr) {
                        result = true;
                })
                .error(function(err) {
                        c++;
                        if (!(err instanceof Error) || !(/error\d/.test(err.message))) {
                                return new DeferredStop('');
                        }
                });
                this.clock.tick(100);
                expect(result).to.eql(false);
                expect(c).to.eql(2);
        });
        it('parallel Deferred next base', function () {
                var stub = sinon.stub();
                Deferred.parallel([
                        Deferred.next(function() {
                                var defer = new Deferred();
                                setTimeout(function () {
                                        defer.call();
                                });
                                return defer;
                        }),
                        Deferred.next(function() {
                                var defer = new Deferred();
                                setTimeout(function () {
                                        defer.call();
                                });
                                return defer;
                        })
                ])
                .next(stub);
                this.clock.tick(100);
                expect(stub.callCount).to.eql(1);
        });
        it('parallel Deferred next pure function', function () {
                var stub = sinon.stub();
                Deferred.parallel([
                        function () {
                                var defer = new Deferred();
                                setTimeout(function () {
                                        defer.call();
                                });
                                return defer;
                        },
                        function () {
                                var defer = new Deferred();
                                setTimeout(function () {
                                        defer.call();
                                });
                                return defer;
                        }
                ])
                .next(function () {
                        stub.call();
                });
                this.clock.tick(100);
                expect(stub.callCount).to.eql(1);
        });
        it('parallel Deferred next empty arry', function () {
                var stub = sinon.stub();
                Deferred.parallel([])
                .next(function () {
                        stub.call();
                });
                this.clock.tick(100);
                expect(stub.callCount).to.eql(1);
        });
        it('parallel Deferred next nullable', function () {
                var stub = sinon.stub();
                Deferred.parallel()
                .next(function () {
                        stub.call();
                });
                this.clock.tick(100);
                expect(stub.callCount).to.eql(1);
        });
        it('parallel Deferred next parallel chain', function () {
                var stub = sinon.stub();
                var parallel1 = sinon.stub();
                var parallel2 = sinon.stub();
                Deferred.next(function () {
                        Deferred.parallel([function () {}]).next(parallel1);
                }).next(function () {
                        Deferred.parallel([function () {}]).next(parallel2);
                }).next(function () {
                        stub.call();
                });
                this.clock.tick(100);
                expect(stub.calledBefore(parallel2)).to.ok();
                expect(stub.calledBefore(parallel1)).to.ok();
                expect(stub.callCount).to.eql(1);
        });
});
