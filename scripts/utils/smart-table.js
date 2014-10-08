'use strict';

angular.module('utils.smartTable', []).factory('smartTableUtils', function () {
    return {
        prepareArray: function (array) {
            if (array.length > 0) {
                if (!_.has(array[0], '_added')) {
                    console.log('preparing array for use in a smart table');
                    angular.forEach(array, function (value) {
                        value._mayDelete = true;
                        value._deleted = false;
                        value._edited = false;
                        value._added = false;
                    });
                }
            }
            return array;
        },
        prepareObject: function (obj, deleted, edited, added, mayDelete) {
            obj._deleted = deleted;
            obj._edited = edited;
            obj._added = added;
            obj._mayDelete =  (typeof mayDelete === 'undefined') ? true : mayDelete;
            return obj;
        },
        stripArray: function (array) {
            angular.forEach(array, function (value) {
                delete value['_added'];
                delete value['_deleted'];
                delete value['_edited'];
                delete value['_mayDelete'];
                delete value['isSelected'];
            });
            return array;
        },
        stripObject: function (obj) {
            delete obj['_added'];
            delete obj['_deleted'];
            delete obj['_edited'];
            delete obj['_mayDelete'];
            delete obj['isSelected'];
            return obj;
        },
        filter: function (array, expression) {
            if (!angular.isArray(array)) return array;
                var predicates = [];
                predicates.check = function(value) {
                for (var j = 0; j < predicates.length; j++) {
                    if(!predicates[j](value)) {
                        return false;
                    }
                }
                return true;
            };
            var search = function(obj, text){
                if (text.charAt(0) === '!') {
                    return !search(obj, text.substr(1));
                }
                switch (typeof obj) {
                    case 'boolean':
                    case 'number':
                    case 'string':
                        return ('' + obj).toLowerCase().indexOf(text) > -1;
                    case 'object':
                        for ( var objKey in obj) {
                            if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
                                return true;
                            }
                        }
                        return false;
                    case 'array':
                        for ( var i = 0; i < obj.length; i++) {
                            if (search(obj[i], text)) {
                                return true;
                            }
                        }
                        return false;
                    default:
                        return false;
                }
            };
            switch (typeof expression) {
                case 'boolean':
                case 'number':
                case 'string':
                    expression = {$:expression};
                    break;
                case 'object':
                    for (var key in expression) {
                        if (key === '$') {
                            (function() {
                                var text = (''+expression[key]).toLowerCase();
                                if (!text) return;
                                predicates.push(function(value) {
                                    return search(value, text);
                                });
                            })();
                        } else {
                            (function() {
                                var path = key;
                                var text = (''+expression[key]).toLowerCase();
                                if (!text) return;
                                predicates.push(function(value) {
                                    return search(getter(value, path), text);
                                });
                            })();
                        }
                    }
                    break;
                case 'function':
                    predicates.push(expression);
                    break;
                default:
                    return array;
            }
            var filtered = [];
            for ( var j = 0; j < array.length; j++) {
                var value = array[j];
                if (predicates.check(value)) {
                    filtered.push(value);
                }
            }
            return filtered;

        }
    };
});