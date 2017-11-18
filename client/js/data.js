var Data = function() {
    this.finalText = "";
    this.lastSaved = "";
};

Data.prototype.setFinalText = function(text) {
    this.finalText = text;
};
Data.prototype.setLastSaved = function(text) {
    this.lastSaved = text;
};

Data.prototype.getFinalText = function(text) {
    return this.finalText;
};
Data.prototype.getLastSaved = function(text) {
    return this.lastSaved;
};