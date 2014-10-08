'use strict';

angular.module('services.reports', []).service('reportService', ['$http', '$q', function ($http, $q) {

    console.log('create report service');

    this.displayCategorisationReport = function (searchCriteria) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/ducta/reports/url/categorisation', searchCriteria).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.generateCategorisationReport = function (searchCriteria) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/ducta/reports/url/generatecategorisationreport', searchCriteria).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.generateUnblockReport = function (searchCriteria) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/ducta/reports/url/generateunblock', searchCriteria).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.displayUnblockReport = function (searchCriteria) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/ducta/reports/url/unblock', searchCriteria).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.initialiseViewActiveModules = function () {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/reports/modules/init/').success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.initialiseSchoolActiveModules = function (eqSchoolId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/reports/modules/school/init/' + eqSchoolId).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.generateSchoolModulesReport = function (emailAddress) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/modules/schoolmodulesreport',{emailAddress:emailAddress}).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };



}]);