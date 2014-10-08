'use strict';

angular.module('services.schoolSmartSearch', []).service('schoolSmartSearchService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

    console.log('create smart search service');

    this.searchSchool = function (misid, searchValue) {
        var deferred = $q.defer();
		console.log('/intadmin/edge/v1/smartsearch/searchSchool/' + misid + '/' + searchValue);
        $http.get('/intadmin/edge/v1/smartsearch/searchSchool/' + misid + '/' + searchValue).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
                $rootScope.messageError = 'Unable to connect to the server at this time';
                $rootScope.$broadcast('toastMessageUpdateError');
            });
        return deferred.promise;
    };

}]);