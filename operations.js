'use strict'

module.exports = {
    sampleOperation: function (res, data, parameters) {
        res.send(new responseModel('OK', "Sample result", data, null));
    },
    check: function (syntax, res, data) {
        res.status(200).json(new responseModel('OK', null, null, null));
    },
    checkConsistency: function (syntax, res, data) {
        res.status(200).json(new responseModel('OK', null, null, null));
    },
    translate: function (syntaxSrc, syntaxDes, res, data) {
        res.status(200).json(new responseModel('OK', "Nothing to translate", null, []));
    }
}

function translateCombinationError(res, syntaxDes) {
    res.status(200).json(new responseModel("ERROR", "It is not possible to translate from yaml to " + syntaxDes, null, []));
}

function responseModel(status, message, data, annotations) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.annotations = annotations;
}

function annotation(type, row, column, text) {
    this.type = type;
    this.row = row;
    this.column = column;
    this.text = text;
}