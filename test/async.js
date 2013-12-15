describe('async', function () {
	it('Deferred1', function () {
		var stub = sinon.stub();

		Deferred.next(function() {
			var q = new Deferred();
			setTimeout(function() {
				q.call();
			}, 100);
			return q;
		}).next(stub);

		expect(stub.called).to.not.be.ok();

		clock.tick(200);

		expect(stub.called).to.be.ok();
	});
	it('Deferred2', function () {
		var next = sinon.stub();
		var error = sinon.stub();

		Deferred.next(function() {
			var q = new Deferred();
			setTimeout(function() {
				q.fail();
			}, 100);
			return q;
		}).next(next).error(error);

		expect(next.called).to.not.be.ok();
		expect(error.called).to.not.be.ok();

		clock.tick(200);

		expect(next.called).to.not.be.ok();
		expect(error.called).to.be.ok();
	});
});
