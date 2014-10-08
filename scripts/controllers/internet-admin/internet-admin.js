'use strict';

angular.module('controller.internetadmin', ['ui.bootstrap']).controller('InternetAdminCtrl', ['$scope', '$modal', 'internetAdminService', 'smartTableUtils', 'shellService', 'groupSearchService', 'userSearchService', '$rootScope', '$http',
        function ($scope, $modal, internetAdminService, smartTableUtils, shellService, groupSearchService, userSearchService, $rootScope, $http) {

            console.log('created internet admin controller');



            // INITIAL VALUES
            $scope.model = {
                initialised: false,
                saveAttempted: false,
                centreCode: '',
                smartSearchPhrase: '',
                smartSearchResults: [],
                smartSearchType: '',
                smartSearchValidationTimer: '',
                userType: '',
                internetAccessCurrent: '',
                downloadQuotaAsMBCurrent: '',
                temporaryFilteringAccessCurrent: '',
                filteringLevelAsStringCurrent: '',
                smartTableUsersRows: [],
                smartTableUsersColumns: [
                    {'label':'User Name','map':'displayName', isSortable:false},
                    {'label':'MIS ID','map':'misId', isSortable:false},
                    {'label':'Type','map':'userType', isSortable:false},
                    //{'label':'Internet Access','map':'internetAccess', isSortable:false},
                    //{'label':'Current Quota (MB)','map':'downloadLimit', isSortable:false},
                    //{'label':'Content Filtering Temporary Access','map':'tempAllow', isSortable:false},
                    //{'label':'Proxy Client Filter Level','map':'proxyClientFilterLevel', isSortable:false},
                    {'label':'Remove','cellTemplateUrl':'views/templates/smarttable-delete-row.html', 'isEditable': true, isSortable:false}
                ],
                smartTableUsersConfig: {
                    isPaginationEnabled: false,
                    defaultSortColumn: 0
                },
                smartTableGroupRows: [],
                smartTableGroupColumns: [
                    {'label':'Group Name','map':'cn', isSortable:false},
                    {'label':'Remove','cellTemplateUrl':'views/templates/smarttable-delete-row.html', 'isEditable': true, isSortable:false}
                ],
                smartTableGroupConfig: {
                    isPaginationEnabled: false,
                    defaultSortColumn: 0
                },
                userDNList: [],
                groupDN: '',
                groupCN: '',
                downloadQuotaChanged: false,
                downloadQuotaAsMB: 0,
                filteringLevelChanged: false,
                filteringLevelAsString: '',
                temporaryFilteringAccessChanged: false,
                temporaryFilteringAccess: false,
                internetAccessChanged: false,
                internetAccess: false,
                useSchoolDefault: false,
                updates: {}
            };



            // FUNCTION THAT RUNS ON INITIALISATION
            $scope.init = function () {
                $rootScope.$broadcast('workingStart');

                $scope.model.misId = shellService.getCurrentUser().misId;
                $scope.model.centreCode = $rootScope.currentSchoolCentreCode;
                console.log('Current CentreCode ' + $rootScope.currentSchoolCentreCode);
                searchBoxButton.disabled = true;
                $scope.smartTableUsers = true;
                $scope.smartTableGroup = false;
                $scope.model.initialised = true;

                console.log('internet admin controller initialised');
                $rootScope.$broadcast('workingStop');
                $('.panel').css('overflow','visible');
            };
            $scope.init();



            // VALIDATION FUNCTION
            $scope.showError = function (ngModelController, error) {
                if (ngModelController === undefined) {
                    return false;
                }
                return ngModelController.$error[error] && $scope.model.saveAttempted;
            };



            // FUNCTION THAT ASYNCHRONOUSLY LOADS DATA AS USER TYPES INTO THE SMART SEARCH INPUT BOX
            $scope.model.smartSearchResults = function(val) {
                return $http.get('/edge/v1/smartsearch/searchUserOrGroup/' + $scope.model.misId + '/' + val + '/' + $rootScope.currentSchoolCentreCode, {
                }).then(function(res){
                    $rootScope.$broadcast('workingStart');

                    // Notify user that there is no data returned for search
                    if (res.data.length == 0)
                    {$rootScope.messageInfo = 'No data available for your search';
                        $rootScope.$broadcast('toastMessageUpdateInfo');}

                    var results = [];

                    $.each(res.data, function(idx, obj) {

                        results.push({"displayName":obj.displayName,"misId":obj.misId,"type":obj.type,"centreCode":obj.centreCode,"qedUniqueId":obj.qedUniqueId,"matchingAttribute":obj.matchingAttribute});
                    });

                    $rootScope.$broadcast('workingStop');

                    return results;
                });
            };



            // FUNCTION TO VALIDATE NUMBER OF CHARACTERS TYPED INTO SEARCH BOX
            $scope.validate = function () {
                searchBoxButton.disabled = true;
                $('#smartSearchValidationError').css('display','none');
                clearTimeout($scope.model.smartSearchValidationTimer);
                if ($scope.model.smartSearchPhrase.length < 2)
                {
                    $scope.model.smartSearchValidationTimer = setTimeout(function(){$('#smartSearchValidationError').css('display','block');}, 2000);
                }
            };



            // FUNCTION THAT RUNS WHEN USER SELECTS FROM SMART SEARCH RESULTS
            $scope.onSelect = function ($item, $model, $label) {
                searchBoxButton.disabled = false;
                $('#smartSearchValidationError').css('display','none');
                clearTimeout($scope.model.smartSearchValidationTimer);
                $scope.model.smartSearchPhrase = '';
                $scope.$item = $item;
                $scope.$model = $model;
                $scope.$label = $label;

                console.log(JSON.stringify($scope.$item));
                $scope.model.smartSearchType = $scope.$item.type;
                $scope.model.searchType = $scope.$item.type;

                console.log('Smart search type = ' + $scope.model.smartSearchType);

                if ($scope.model.smartSearchType == 'GROUP')
                {$scope.model.smartSearchSelection = $scope.$item.displayName;}
                else {$scope.model.smartSearchSelection = $scope.$item.misId;}

                console.log('Smart search selection = ' + $scope.model.smartSearchSelection);

                $scope.smartSearchProcess();
            };



            // FUNCTION THAT RUNS WHEN USER SEARCHES WITH SMART SEARCH SELECTION
            $scope.smartSearchProcess = function () {
                if ($scope.model.smartSearchType == 'GROUP')
                {
                    $scope.model.groupCN = $scope.model.smartSearchSelection;
                    $scope.updateSelectedGroup();
                }
                else {
                    $scope.model.misId = $scope.model.smartSearchSelection;
                    $scope.getUserByMisId();
                }
            };



            // FUNCTION THAT RUNS WHEN USER SELECTS A 'USER' FROM SMART SEARCH LIST
            $scope.getUserByMisId = function (misIdForm) {

                $rootScope.$broadcast('workingStart');
                userSearchService.getUserByMisId($scope.model.misId).then(function (data) {
                    console.log('Returned data = ' + JSON.stringify(data));

                    // Catch null error
                    if (data.proxyClientFilterLevel == null)
                    {data.proxyClientFilterLevel = "Not Set";}

                    // Catch duplicates & remove
                    var duplicate = JSON.stringify($scope.model.smartTableUsersRows).search(data.misId);
                    if (duplicate == -1)
                    {
                        $scope.model.smartTableUsersRows.push({'dn':(data.dn),'displayName':(data.displayName),'misId':(data.misId),'internetAccess':(data.internetAccess),'downloadLimit':(data.downloadLimit),'tempAllow':(data.tempAllow),'proxyClientFilterLevel':(data.proxyClientFilterLevel),'userType':(data.userType)})
                    }
                    else {console.log('duplicate found & removed');}

                    if (JSON.stringify(data) !== '""') {$scope.updateSmartTable();}
                    $scope.updateChangeDetails();

                }, function () {
                });

                //}// End else
            };



            // FUNCTION THAT PROCESSES RETURNED DATA & UPDATES SMART TABLE
            $scope.updateSmartTable = function () {
                $scope.model.smartTableGroupRows = [];
                if ($scope.model.searchType == "GROUP")
                {
                    $scope.smartTableGroup = true;
                    $scope.smartTableUsers = false;
                    $scope.changeDetails = true;
                }
                else
                {
                    $scope.smartTableGroup = false;
                    $scope.smartTableUsers = true;
                    $scope.changeDetails = true;
                    $scope.tempAccessShow = false;
                }
            };



            // FUNCTION THAT RUNS WHEN USER DELETES A USER FROM THE USERS SMART TABLE
            $scope.$on('delete', function (event, data) {
                data._deleted = true;
                var index = $scope.model.smartTableUsersRows.indexOf(data);
                $scope.model.smartTableUsersRows.splice(index, 1);
                $scope.updateSmartTable();
                $scope.updateChangeDetails();
            });



            // FUNCTION THAT POPULATES CHANGE DETAILS SECTION (but only when there is one user maximum in Smart Table)
            $scope.updateChangeDetails = function () {
                var count = Object.keys($scope.model.smartTableUsersRows).length;
                var countGroup = Object.keys($scope.model.smartTableGroupRows).length;
                if (count == 1)
                {
                    $.each($scope.model.smartTableUsersRows, function(idx, obj) {
                        $scope.model.internetAccessCurrent = obj.internetAccess;
                        $scope.model.downloadQuotaAsMBCurrent = obj.downloadLimit;
                        $scope.downloadQuotaPlaceholder = obj.downloadLimit;
                        $scope.model.temporaryFilteringAccessCurrent = obj.tempAllow;
                        if ($scope.model.smartTableUsersRows[0].userType == "STAFF") {$scope.tempAccessShow = true;} else {$scope.tempAccessShow = false;}
                        $scope.model.filteringLevelAsStringCurrent = obj.proxyClientFilterLevel;
                        $scope.model.groupDN = obj.dn;
                        $scope.groupDownloadLimitShow = false;
                    });
                }

                else if (countGroup == 1)

                {
                    $.each($scope.model.smartTableGroupRows, function(idx, obj) {
                        $scope.model.internetAccessCurrent = obj.internetAccess;
                        $scope.model.useSchoolDefault = obj.schoolDefault;
                        $scope.model.downloadQuotaAsMBCurrent = obj.downloadLimit;
                        $scope.downloadQuotaPlaceholder = obj.downloadLimit;
                        $scope.model.temporaryFilteringAccessCurrent = '';
                        $scope.model.filteringLevelAsStringCurrent = '';
                        $scope.groupDownloadLimitShow = true;
                    });
                }

                else
                {
                    $scope.model.internetAccessCurrent = '';
                    $scope.model.downloadQuotaAsMBCurrent = '';
                    $scope.downloadQuotaPlaceholder = '';
                    $scope.model.temporaryFilteringAccessCurrent = '';
                    $scope.model.filteringLevelAsStringCurrent = '';
                    $scope.groupDownloadLimitShow = false;
                }
                $rootScope.$broadcast('workingStop');
            };



            // FUNCTION THAT RUNS WHEN USER SELECTS A 'GROUP' FROM SMARTSEARCH LIST
            $scope.updateSelectedGroup = function () {
                $scope.model.smartTableUsersRows = []; // Clears user smart table
                $scope.updateSmartTable(); // Hides user smart table
                $scope.tempAccessShow = false; // Hide tempAccess checkbox as not needed in this context
                $scope.model.smartTableGroupRows = []; // Clear current group (as we only want to show one at a time)
                $scope.getGroupData();
                $scope.groupDownloadLimitShow = true;
                $scope.smartTableGroup = true;
                $scope.changeDetails = true;
            };



            // FUNCTION THAT GETS GROUP DATA
            $scope.getGroupData = function () {
                groupSearchService.getGroupByCN($rootScope.currentSchoolCentreCode, $scope.model.groupCN).then(function (data) {
                    console.log('Returned data = ' + JSON.stringify(data));
                    $scope.groupDownloadLimit = data.downloadLimit;
                    $scope.model.smartTableGroupRows.push({'cn':(data.cn),'dn':(data.dn),'internetAccess':(data.internetAccess),'downloadLimit':(data.downloadLimit),'schoolDefault':(data.schoolDefault)})
                    console.log('$scope.model.smartTableGroupRows = ' + JSON.stringify($scope.model.smartTableGroupRows));
                    $scope.model.groupDN = data.dn;
                    $scope.updateChangeDetails();
                }, function () {
                });
            };



            // FUNCTION THAT RUNS WHEN USER CHANGES INTERNET ACCESS CHECKBOX
            $scope.changeInternetAccess = function () {
                $scope.model.internetAccessChanged = true;
                $scope.model.internetAccess = $scope.model.internetAccessCurrent;
            };



            // FUNCTION THAT RUNS WHEN USER CHANGES DOWNLOAD QUOTA FIELD
            $scope.changeDownloadQuota = function () {
                $scope.model.downloadQuotaChanged = true;
                $scope.model.downloadQuotaAsMB = $scope.model.downloadQuotaAsMBCurrent;
            };



            // FUNCTION THAT RUNS WHEN USER CHANGES TEMP FILTER ACCESS CHECKBOX
            $scope.changeTemporaryFilteringAccess = function () {
                $scope.model.temporaryFilteringAccessChanged = true;
                $scope.model.temporaryFilteringAccess = $scope.model.temporaryFilteringAccessCurrent;
            };



            // FUNCTION THAT RUNS WHEN USER CHANGES FILTERING LEVEL RADIO BUTTON
            $scope.changeFilteringLevel = function () {
                $scope.model.filteringLevelChanged = true;
                $scope.model.filteringLevelAsString = $scope.model.filteringLevelAsStringCurrent;
            };



            // FUNCTION THAT RUNS WHEN USER CLICKS 'SAVE UPDATES' BUTTON
            $scope.saveUpdates = function () {

                if ($scope.model.searchType == 'GROUP')

                {
                    $scope.model.updates = {
                        downloadQuotaChanged: $scope.model.downloadQuotaChanged,
                        downloadQuotaAsMB: $scope.model.downloadQuotaAsMB,
                        filteringLevelChanged: $scope.model.filteringLevelChanged,
                        filteringLevelAsString: $scope.model.filteringLevelAsString,
                        internetAccessChanged: $scope.model.internetAccessChanged,
                        internetAccess: $scope.model.internetAccess,
                        defaultInternetAccess: $scope.model.useSchoolDefault,
                        userDNList: [],
                        groupDN: $scope.model.groupDN
                    };
                }

                else {
                    $.each($scope.model.smartTableUsersRows, function(idx, obj) {
                        $scope.model.userDNList.push(obj.dn); //For each selectedUsers, add the userDN to the empty userDNList object
                    });

                    $scope.model.updates = {
                        downloadQuotaChanged: $scope.model.downloadQuotaChanged,
                        downloadQuotaAsMB: $scope.model.downloadQuotaAsMB,
                        filteringLevelChanged: $scope.model.filteringLevelChanged,
                        filteringLevelAsString: $scope.model.filteringLevelAsString,
                        temporaryFilteringAccessChanged: $scope.model.temporaryFilteringAccessChanged,
                        temporaryFilteringAccess: $scope.model.temporaryFilteringAccess,
                        internetAccessChanged: $scope.model.internetAccessChanged,
                        internetAccess: $scope.model.internetAccess,
                        userDNList: $scope.model.userDNList,
                        groupDN: null
                    };
                }

                //Now call the update service & await results
                $rootScope.$broadcast('workingStart');
                internetAdminService.saveUpdates($scope.model.updates).then(function (data) {
                    console.log(JSON.stringify($scope.model.updates));
                    shellService.saveComplete();
                    $rootScope.messageSuccess = 'Changes to details have been saved';
                    $rootScope.$broadcast('toastMessageUpdateSuccess');
                    $scope.refreshTable();
                    //Now clear change booleans to prevent resave etc
                    $scope.model.downloadQuotaChanged = false;
                    $scope.model.filteringLevelChanged = false;
                    $scope.model.temporaryFilteringAccessChanged = false;
                    $scope.model.internetAccessChanged = false;
                }, function () {
                    shellService.saveComplete();
                    $rootScope.messageError = 'Changes to details failed to save';
                    $rootScope.$broadcast('toastMessageUpdateError');
                });

            };



            // FUNCTION THAT REFRESHES SMART TABLE AFTER SUCCESSFUL UPDATE
            $scope.refreshTable = function () {
                $.each($scope.model.smartTableUsersRows, function(idx, obj) {
                    obj.internetAccess = $scope.model.internetAccess;
                    obj.downloadLimit = $scope.model.downloadQuotaAsMB;
                    obj.tempAllow = $scope.model.temporaryFilteringAccess;
                    obj.proxyClientFilterLevel = $scope.model.filteringLevelAsString;
                });
                console.log('Smart table refreshed');
            };



            // FUNCTION THAT RUNS WHEN USER CLICKS THE 'CLOSE' BUTTON
            $scope.cancel = function () {
                console.log('internet admin section closed');
            };


        }]
);