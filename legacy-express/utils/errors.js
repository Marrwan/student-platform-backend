class ValidationError extends Error {
    constructor(message, type = 'validation') {
        super(message);
        this.name = 'ValidationError';
        this.status = 400;
        this.type = type;
    }
}

module.exports = ValidationError;
