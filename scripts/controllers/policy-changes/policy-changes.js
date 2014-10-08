'use strict';

angular.module('controller.policyChanges', ['ngCsv']).controller('PolicyChangesCtrl', ['$scope', '$modal', '$timeout', 'policyChangesService', 'smartTableUtils', 'changeSetStatus', '$filter', 'dateUtils', 'shellService', '$rootScope',
    function ($scope, $modal, $timeout, policyChangesService, smartTableUtils, changeSetStatus, $filter, dateUtils, shellService, $rootScope) {

        console.log('created policy changes controller.');

		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
			createDate: null,
			endDate: null,
			misId: null,
			centreCode: null,
			email: shellService.getCurrentUser().emailAddress,

            query: {
                page: 1,
                size: 1000,
                createDate: null,
                endDate: null,
                centreCode: null,
                misId: null,
                email: null
            },
			smartTablePolicyChanges: false,
			smartTablePolicyChangesRows: [],
            smartTablePolicyChangesColumns: [
                { label: 'ID', map: 'id', cellTemplateUrl: '/views/templates/change-sets/id-column.html', isSortable:false},
                { label: 'Status', map: 'status' , isSortable:false},
                { label: 'Created', map: 'createTime', cellTemplateUrl: '/views/templates/date-time-column.html', isSortable:false},
                { label: 'Message', map: 'message', cellTemplateUrl: '/views/templates/nullable-column.html', isSortable:false},
                { label: '', cellTemplateUrl: '/views/templates/edit-tablerow.html' , isSortable:false}
            ],
            smartTablePolicyChangesConfig: {
                isPaginationEnabled: true,
				defaultSortColumn: 1
            },
			smartTablePolicyDetails: false,
			smartTablePolicyDetailsRows: [],
            smartTablePolicyDetailsColumns: [
                { label: 'ID', map: 'id', cellTemplateUrl: '/views/templates/change-sets/id-column.html'},
				{ label: 'Creator', map: 'misId'},
				{ label: 'Created', map: 'createdDate', cellTemplateUrl: '/views/templates/date-time-column.html'},
				{ label: 'School', map: 'centreCode'},
				{ label: 'Last Edited', map: 'lastUpdateDate', cellTemplateUrl: '/views/templates/nullable-column.html'},
				{ label: 'Last Updated', map: 'lastModifiedMisId', cellTemplateUrl: '/views/templates/date-time-column.html'},
				{ label: 'Action', map: 'action'},
				{ label: 'Type', map: 'entity'},
				{ label: 'Description', map: 'comment', cellTemplateUrl: '/views/templates/nullable-column.html'}
            ],
            smartTablePolicyDetailsConfig: {
                isPaginationEnabled: false,
				defaultSortColumn: 0
            }

        };

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {

			//add a default start date
            var createDate = new Date();
            createDate.setDate(createDate.getDate() - 183);
            $scope.model.createDate = $filter('date')(createDate, 'dd/MM/yyyy');
			$scope.model.query.createDate = dateUtils.convertDate($scope.model.createDate);
			
			// Default query for load
			$scope.load();
			$scope.model.initialised = true;
        };



		// VALIDATION FUNCTION
        $scope.showError = function (ngModelController, error) {
            if (ngModelController === undefined) {
                return false;
            }
            return ngModelController.$error[error] && $scope.model.saveAttempted;
        };
		
		
		
		// FUNCTION THAT BUILDS QUERY
		$scope.buildQuery = function (policyChangesForm) {
		
			// validate form
            if (!policyChangesForm.$valid) {
                console.log('Form is not valid');
				$scope.model.saveAttempted = true;
                shellService.saveComplete();
            
			} else {
				$scope.model.query.createDate = dateUtils.convertDate($scope.model.createDate);
				if ($scope.model.endDate) {
					$scope.model.query.endDate = dateUtils.convertDate($scope.model.endDate);
				} else {
					$scope.model.query.endDate = null;
				}
				$scope.model.query.misId = $scope.model.misId;
				$scope.model.query.centreCode = $scope.model.centreCode;
				$scope.model.query.email = $scope.model.email;
				console.log('Query' + JSON.stringify($scope.model.query));
				
				$scope.load();
				
			} //End else
		};


		
		// FUNCTION THAT LOADS DATA ON INITIALISATION & REFRESH
		$scope.load = function () {
		
			$rootScope.$broadcast('workingStart');

			policyChangesService.getChangeSets($scope.model.query).then(function (data) {
				console.log(JSON.stringify(data));
				
				$scope.model.smartTablePolicyChangesRows = []; // Clear prior existing data

				$.each(data.changeSetsForPage, function(idx, obj) {
					if (obj.id == null) {obj.id = '-';}
					if (obj.createTime == null) {obj.createTime = '-';}
					if (obj.startTime == null) {obj.startTime = '-';}
					if (obj.endTime == null) {obj.endTime = '-';}
					if (obj.hostName == null) {obj.hostName = '-';}
					if (obj.status == null) {obj.status = '-';}
					if (obj.message == null) {obj.message = '-';}
					if (obj.generatedFilePath == null) {obj.generatedFilePath = '-';}
					if (obj.items == null) {obj.items = [];}
					$scope.model.smartTablePolicyChangesRows.push({'id':(obj.id),'createTime':(obj.createTime),'startTime':(obj.startTime),'endTime':(obj.endTime),'hostName':(obj.hostName),'status':(obj.status),'message':(obj.message),'generatedFilePath':(obj.generatedFilePath),'items':(obj.items)});
				});
				
				$scope.model.smartTablePolicyChanges = true;
				shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
			}, function () {
                shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Unable to load policy changes list';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
		};



		// INIT CALL (must come after load function)
		$scope.init();



		// FUNCTION THAT RUNS WHEN USER CLICKS EMAIL BUTTON
		$scope.email = function () {
		
			$rootScope.$broadcast('workingStart');
			
			policyChangesService.generateChangeSetReport($scope.model.query).then(function () {
				shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageSuccess = 'Report emailed to ' + $scope.model.query.email;
				$rootScope.$broadcast('toastMessageUpdateSuccess');
			}, function () {
                shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Failed to send report via email';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
		};



		// FUNCTION THAT SHOWS DETAILS WHEN USER CLICKS DETAILS BUTTON
		$scope.$on('edit', function (event, item) {
		
			$rootScope.$broadcast('workingStart');
			
			policyChangesService.getChangeSetItems(item.id).then(function (data) {
				console.log(JSON.stringify(data));
				
				// Use current data to populate fields
				$scope.id = item.id;
				$scope.status = item.status;
				$scope.createTime = item.createTime;
				$scope.startTime = item.startTime;
				$scope.endTime = item.endTime;
				$scope.message = item.message;
				$scope.generatedFilePath = item.generatedFilePath;
				
				// Get additional data for new smart table
				$scope.model.smartTablePolicyDetailsRows = []; // Clear prior existing data
				
				$.each(data, function(idx, obj) {
					if (obj.id == null) {obj.id = '-';}
					if (obj.changeSetId == null) {obj.changeSetId = '-';}
					if (obj.misId == null) {obj.misId = '-';}
					if (obj.hierarchyElementId == null) {obj.hierarchyElementId = '-';}
					if (obj.centreCode == null) {obj.centreCode = '-';}
					if (obj.passive == null) {obj.passive = '-';}
					if (obj.createdDate == null) {obj.createdDate = '-';}
					if (obj.lastUpdateDate == null) {obj.lastUpdateDate = '-';}
					if (obj.deleted == null) {obj.deleted = '-';}
					if (obj.lastModifiedMisId == null) {obj.lastModifiedMisId = '-';}
					if (obj.parentId == null) {obj.parentId = '-';}
					if (obj.action == null) {obj.action = '-';}
					if (obj.entity == null) {obj.entity = '-';}
					if (obj.referenceId == null) {obj.referenceId = '-';}
					if (obj.referenceValue == null) {obj.referenceValue = '-';}
					if (obj.comment == null) {obj.comment = '-';}
					if (obj.entityId == null) {obj.entityId = '-';}
					$scope.model.smartTablePolicyDetailsRows.push({'id':(obj.id),'changeSetId':(obj.changeSetId),'misId':(obj.misId),'hierarchyElementId':(obj.hierarchyElementId),'centreCode':(obj.centreCode),'passive':(obj.passive),'createdDate':(obj.createdDate),'lastUpdateDate':(obj.lastUpdateDate),'deleted':(obj.deleted),'lastModifiedMisId':(obj.lastModifiedMisId),'parentId':(obj.parentId),'action':(obj.action),'entity':(obj.entity),'referenceId':(obj.referenceId),'referenceValue':(obj.referenceValue),'comment':(obj.comment),'entityId':(obj.entityId)});
				});
				
				shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
			}, function () {
                shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Unable to load data';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
		
			$('#policyChanges').collapse('hide')
			$('#policyChangesDetails').collapse('show')
			$scope.model.policyChangesDetails = true;
			$scope.model.smartTablePolicyDetails = true;
			
		});
		
		
		
		// FUNCTION THAT CLOSES DETAILS SECTION
		$scope.close = function () {
			$('#policyChanges').collapse('show')
			$('#policyChangesDetails').collapse('hide')
			$scope.model.policyChangesDetails = false;
			$scope.model.smartTablePolicyDetails = false;
		};
		

    }]);