describe('fail', function () {
	it('this', function () {
		var next = sinon.stub();
		var error = sinon.stub();
		Deferred.next(function hoge () {
			this.fail('hoge');
		}).next(next).error(error);
		clock.tick(100);
		expect(next.called).to.not.be.ok();
		expect(error.called).to.be.ok();
		expect(error.args[0][0]).to.eql('hoge');
	});
	it('instance', function () {
		var next = sinon.stub();
		var error = sinon.stub();
		Deferred.next(function () {
			var defer = new Deferred();
			defer.fail('hoge');
			return defer;
		}).next(next).error(error);
		clock.tick(100);
		expect(next.called).to.not.be.ok();
		expect(error.called).to.be.ok();
		expect(error.args[0][0]).to.eql('hoge');
	});
});
