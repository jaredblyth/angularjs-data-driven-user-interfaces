'use strict';

angular.module('utils.date', []).factory('dateUtils', function () {
    return {
        // converts a dd/mm/yyyy date into an integer representation
        convertDate: function (date) {
            if (_.isNull(date) || _.isEmpty(date)) {
                return null;
            }
            var parts = date.split('/');
            var newDate = new Date(parts[1] + '/' + parts[0] + '/' + parts[2]);
            return newDate.getTime();
        }
    }
    ;
});



