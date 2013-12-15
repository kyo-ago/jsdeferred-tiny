if (!this.clock) {
	this.clock = sinon.useFakeTimers();
} else {
	this.clock.restore();
}
