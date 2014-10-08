'use strict';

angular.module('controller.reports.urlUnblockReport', ['ngCsv']).controller('UrlUnblockReportCtrl', ['$scope', '$modal', 'reportService', 'smartTableUtils', '$filter', 'shellService', '$rootScope', 'dateUtils',
    function ($scope, $modal, reportService, smartTableUtils, $filter, shellService, $rootScope, dateUtils) {

        console.log('created url unblock report controller.');

		
		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
            user: shellService.getCurrentUser(),
            searchCriteria: {
                dateType: [
                    {type: 'dateSingle', name: 'Single'},
                    {type: 'dateRange', name: 'Range'}
                ],
                userType: [
                    {type: 'usersAll', name: 'All'},
                    {type: 'usersAllSchools', name: 'All Schools'},
                    {type: 'usersCorp', name: 'Corp Users'},
                    {type: 'usersSpecificSchool', name: 'Specific School'}
                ],
                _startDate: null,
                _endDate: null,
                _centreCode: null,
                _includeCorp: null,
                _includeSchools: null
            },
			startDate: '',
			endDate: '',
			showToRange: false,
			showCentreCode: false,
			reportType: '',
			exportData: [],
            generateAttempted: false,
			smarttableReports: false,
			smartTableReportsRows: [],
			smartTableReportsColumns: [
				{'label':'Requester','map':'misId', isSortable:false},
				{'label':'School','map':'centreCode', isSortable:false},
				{'label':'Domain','map':'domain', isSortable:false},
				{'label':'URL','map':'url', isSortable:false, cellTemplateUrl: '/views/templates/url-tablecell.html'},
				{'label':'Student Access Request','map':'studentAccess', isSortable:false, cellTemplateUrl: '/views/templates/true-false-column.html'},
				{'label':'Temporary Access Request','map':'temporaryAllowStatus', isSortable:false, cellTemplateUrl: '/views/templates/nullable-column.html'},
				{'label':'Requested Date','map':'requestTime', isSortable:false, cellTemplateUrl: '/views/templates/date-column.html'}
			],			
			smartTableReportsConfig: {
				isPaginationEnabled: false,
                defaultSortColumn: 0
            }
        };

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {
            $scope.model.searchCriteria.selectedDateType = $scope.model.searchCriteria.dateType[0];
            $scope.model.searchCriteria.selectedUserType = $scope.model.searchCriteria.userType[0];
			var startDate = new Date();
            startDate.setDate(startDate.getDate() - 365);
			$scope.model.startDate = $filter('date')(startDate, 'dd/MM/yyyy');
            $scope.model.initialised = true;
        };
        $scope.init();
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS DATE TYPE
		$scope.updateDateType = function () {
			if ($scope.model.searchCriteria.selectedDateType.type == 'dateRange')
				{$scope.model.showToRange = true;}
			else {$scope.model.showToRange = false;}
		};
		

		
		// FUNCTION THAT RUNS WHEN USER SELECTS USER TYPE
		$scope.updateUserType = function () {
			if ($scope.model.searchCriteria.selectedUserType.type == 'usersSpecificSchool')
				{$scope.model.showCentreCode = true;}
			else {$scope.model.showCentreCode = false;}
		};
		
		
		
		// VALIDATION FUNCTION
        $scope.showError = function (ngModelController, error) {
            if (ngModelController === undefined) {
                return false;
            }
            return ngModelController.$error[error] && $scope.model.saveAttempted;
        };
		

		
		// FUNCTION THAT RUNS WHEN USER CLICKS EMAIL BUTTON
		$scope.emailReport = function (urlUnblockReportForm) {
			$scope.model.reportType = 'email';
			
			// validate form
            if (!urlUnblockReportForm.$valid) {
                console.log('Form is not valid');
				$scope.model.saveAttempted = true;
                $scope.model.generateAttempted = true;
                shellService.saveComplete();
            
			} else {
			$scope.generate();
			}
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS DISPLAY BUTTON
		$scope.displayReport = function (urlUnblockReportForm) {
			$scope.model.reportType = 'display';
			
			// validate form
            if (!urlUnblockReportForm.$valid) {
                console.log('Form is not valid');
				$scope.model.saveAttempted = true;
                $scope.model.generateAttempted = true;
                shellService.saveComplete();
            
			} else {
			$scope.generate();
			}
		};
		
		
		
		// FUNCTION THAT GENERATES REPORT DATA
        $scope.generate = function () {
            console.log('time to send request for report');
			console.log(JSON.stringify($scope.model.searchCriteria.selectedUserType.type));

            var searchCriteria = {
                startDate: null,
                endDate: null,
                centreCode: null,
                includeCorp: null,
                includeSchools: null,
                emailAddress: null
            };

            
			// Prepare data
			$rootScope.$broadcast('workingStart');
            searchCriteria.startDate = dateUtils.convertDate($scope.model.startDate);
            if ($scope.model.showToRange == true) {
                searchCriteria.endDate = dateUtils.convertDate($scope.model.endDate);
            }

            if ($scope.model.searchCriteria.selectedUserType.type == 'usersAll'){
                searchCriteria.includeCorp = true;
                searchCriteria.includeSchools = true;
                searchCriteria.centreCode = null;
            }
            if ($scope.model.searchCriteria.selectedUserType.type == 'usersAllSchools'){
                searchCriteria.includeCorp = true;
                searchCriteria.includeSchools = true;
                searchCriteria.centreCode = null;
            }
            if ($scope.model.searchCriteria.selectedUserType.type == 'usersAllCorp'){
                searchCriteria.includeCorp = false;
                searchCriteria.includeSchools = true;
                searchCriteria.centreCode = null;
            }
            if ($scope.model.searchCriteria.selectedUserType.type == 'usersSpecificSchool'){
                searchCriteria.includeCorp = false;
                searchCriteria.includeSchools = true;
                searchCriteria.centreCode = $scope.model.searchCriteria._centreCode;
            }

			console.log(JSON.stringify(searchCriteria));
			
			// Email report
			if ($scope.model.reportType == 'email')
				
				{
					searchCriteria.emailAddress = $scope.model.user.emailAddress;

					reportService.generateUnblockReport(searchCriteria).then(function () {
						shellService.saveComplete();
						$rootScope.$broadcast('workingStop');
						$rootScope.messageSuccess = 'Report emailed to ' + searchCriteria.emailAddress;
						$rootScope.$broadcast('toastMessageUpdateSuccess');
					}, function () {
						shellService.saveComplete();
						$rootScope.messageError = 'Failed to send report via email';
						$rootScope.$broadcast('toastMessageUpdateError');
					});
				
				} // End email report
				
				
			// Display report
			if ($scope.model.reportType == 'display')
				
				{
					searchCriteria.emailAddress = $scope.model.user.emailAddress;

					reportService.displayUnblockReport(searchCriteria).then(function (data) {
						console.log(JSON.stringify(data));
						
						$scope.model.smartTableReportsRows = [];
						
						$.each(data, function(idx, obj) {
							if (obj.url == null) {obj.url = '-';}
							if (obj.domain == null) {obj.domain = '-';}
							if (obj.centreCode == null) {obj.centreCode = '-';}
							if (obj.misId == null) {obj.misId = '-';}
							if (obj.studentAccess == null) {obj.requestTime = '-';}
							if (obj.requestTime == null) {obj.requestTime = '-';}
							if (obj.temporaryAllowStatus == null) {obj.temporaryAllowStatus = '-';}
							$scope.model.smartTableReportsRows.push({"url":(obj.url),"domain":(obj.domain),"centreCode":(obj.centreCode),"misId":(obj.misId),"studentAccess":(obj.studentAccess),"requestTime":(obj.requestTime),"temporaryAllowStatus":(obj.temporaryAllowStatus)});
						});
						$scope.model.smartTableReports = true;
						
						shellService.saveComplete();
						$rootScope.$broadcast('workingStop');
						
						
					}, function () {
						shellService.saveComplete();
						$rootScope.messageError = 'Failed to generate report';
						$rootScope.$broadcast('toastMessageUpdateError');
					});
				
				} // End email report
				
        };



		// FUNCTION TO CLOSE DISPLAY TABLE
		$scope.displayClose = function () {
			$scope.model.smartTableReports = false;
			$scope.model.smartTableReportsRows = [];
		};
		

    }]);