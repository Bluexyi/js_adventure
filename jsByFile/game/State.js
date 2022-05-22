class State {

    states = {};

    generateState(name, startRowIndex, endRowIndex, colIndex) {
        if (!this.states[name]) {
            this.states[name] = {
                frameIndex: startRowIndex,
                startRowIndex: startRowIndex,
                endRowIndex: endRowIndex,
                colIndex: colIndex
            };
        }
    };

    getByName(name) {
        if (this.states[name]) {
            return this.states[name];
        }
    };

};