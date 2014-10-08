'use strict';

angular.module('utils.formatters', []).factory('formatUtils', function () {
    return {
        formatDate: function (value) {
            if (_.isUndefined(value) || _.isNull(value) || (_.isString(value) && _.isEmpty(value))) {
                return '';
            } else {
                console.log('formatting date: ' + value);
                var date = new Date(value);
                var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
                return day + '/' + month + '/' + date.getFullYear();
            }
        },

        formatComment: function (value) {
            return (_.isNull(value) ? '' : value);
        }
    };
});
