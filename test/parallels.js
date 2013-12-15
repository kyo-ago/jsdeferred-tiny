describe('parallel', function () {
	it('#arrayArgument', function () {
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
		clock.tick(100);
	});
	it('#objectArgument', function () {
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
		clock.tick(100);
	});
	it('#Error', function () {
		var stub = sinon.stub();
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
		.next(stub)
		.error(function(err) {
			c++;
			if (!(err instanceof Error) || !(/error\d/.test(err.message))) {
				return new DeferredStop('');
			}
		});
		clock.tick(100);
		expect(stub.called).to.not.be.ok();
		expect(c).to.eql(2);
	});
	it('next base', function () {
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
		clock.tick(100);
		expect(stub.callCount).to.eql(1);
	});
	it('next pure function', function () {
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
		.next(stub);
		clock.tick(100);
		expect(stub.callCount).to.eql(1);
	});
	it('next empty arry', function () {
		var stub = sinon.stub();
		Deferred.parallel([]).next(stub);
		clock.tick(100);
		expect(stub.callCount).to.eql(1);
	});
	it('next nullable', function () {
		var stub = sinon.stub();
		Deferred.parallel().next(stub);
		clock.tick(100);
		expect(stub.callCount).to.eql(1);
	});
	it('next chain', function () {
		var stub = sinon.stub();
		var parallel1 = sinon.stub();
		var parallel2 = sinon.stub();
		Deferred.next(function () {
			Deferred.parallel([function () {}]).next(parallel1);
		}).next(function () {
			Deferred.parallel([function () {}]).next(parallel2);
		}).next(stub);
		clock.tick(100);
		expect(stub.calledBefore(parallel2)).to.ok();
		expect(stub.calledBefore(parallel1)).to.ok();
		expect(stub.callCount).to.eql(1);
	});
});
