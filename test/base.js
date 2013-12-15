describe('base', function () {
	it('new Deferred', function () {
		var stub = sinon.stub();

		var q = new Deferred().next(stub);

		expect(stub.called).to.not.be.ok();

		q.call();

		expect(stub.called).to.be.ok();
	});
	it('Deferred.next', function () {
		var stub = sinon.stub();

		Deferred.next(stub);

		expect(stub.called).to.not.be.ok();

		clock.tick(100);

		expect(stub.called).to.be.ok();
	});
	it('chained Deferred', function () {
		var first = sinon.stub().returns('hoge');
		var second = sinon.stub();

		Deferred.next(first).next(second);

		clock.tick(100);

		expect(first.called).to.be.ok();
		expect(second.called).to.be.ok();
		expect(second.args[0][0]).to.eql('hoge');
	});
	it('Deferred#error throw', function () {
		expect(function() {
			new Deferred().next(function() {
				throw new Error('fail');
			}).call();
		}).to.throwException(/fail/);
	});
	it('Deferred#error1', function () {
		var next = sinon.stub();
		var error = sinon.stub();

		Deferred.next(function() {
			return new DeferredStop('fail');
		}).next(next).error(error);

		clock.tick(100);

		expect(next.called).to.not.be.ok();
		expect(error.called).to.be.ok();
	});
	it('Deferred#error2', function () {
		var next = sinon.stub();
		var error = sinon.stub();

		Deferred.next(function() {
			return Deferred.stop('fail');
		}).next(next).error(error);

		clock.tick(100);

		expect(next.called).to.not.be.ok();
		expect(error.called).to.be.ok();
	});
});
