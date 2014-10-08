'use strict';

angular.module('services.filterPackages', []).service('filterPackagesService', ['$http', '$q', function ($http, $q) {

    console.log('create filter packages service');

    this.initViewFilterPackages = function (elementId, qedUniqueId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/policy/packages/init/' + elementId + '/' + qedUniqueId).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.searchFilterPackages = function (filterPackageSearchRequest) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/policy/packages/search/', filterPackageSearchRequest).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.initSelectFilterPackageTemplate = function (elementId, qedUniqueId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/policy/packages/new/init/elementId/' + elementId + '/qedUniqueId/' + qedUniqueId).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
            console.log('failed to make remote call: ' + JSON.stringify(data));
            deferred.reject();
        });
        return deferred.promise;
    };

    this.initSelectExternalListForPackage = function (typeId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/policy/packages/new/lists/' + typeId).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
            console.log('failed to make remote call: ' + JSON.stringify(data));
            deferred.reject();
        });
        return deferred.promise;
    };

    this.initEditFilterPackage = function (filterPackageId, qedUniqueId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/policy/packages/edit/id/' + filterPackageId + '/qedUniqueId/' + qedUniqueId).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.initPackageTemplates = function () {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/policy/packagetemplates/init').success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.saveTemplateUpdates = function (updates) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/policy/packagetemplates/update', updates).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.savePackageUpdates = function (updates, elementId, qedUniqueId) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/policy/packages/update/' + elementId + '/' + qedUniqueId, updates).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.generateReport = function (elementId, centreCode, email, qedUniqueId) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/policy/packages/report/' + qedUniqueId, {hierarchyElementId:elementId, centreCode:centreCode, email:email}).success(
            function () {
                deferred.resolve();
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.getFilterPackageReportData = function (elementId, qedUniqueId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/policy/packages/getfilterpackagereport/' + elementId + '/' + qedUniqueId).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

}]);