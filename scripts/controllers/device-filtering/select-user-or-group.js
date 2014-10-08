'use strict';

angular.module('controller.deviceFiltering.selectusergroup', [])

.controller('SelectUserGroupCtrl', ['$scope', '$rootScope', '$modal', '$modalInstance', 'deviceFilteringService', 'smartTableUtils', 'shellService',
    function ($scope, $rootScope, $modal, $modalInstance, deviceFilteringService, smartTableUtils, shellService) {


        console.log('created select user or group controller');

		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
			selected: [],
			Rows: [],
			Columns: [
				{'label':'Name','map':'displayName','headerTemplateUrl':'views/templates/smarttable-select-all.html', isSortable:false},
				{'label':'MIS ID','map':'misId', isSortable:false},
				{'label':'Filter Level','map':'proxyClientFilterLevel', isSortable:false}
				//{'headerTemplateUrl':'views/templates/smarttable-select-all.html','cellTemplateUrl':'views/templates/smarttable-select-row.html'}
			],			
			Config: {
				isPaginationEnabled: false,
                defaultSortColumn: 1,
				selectionMode: 'multiple',
				displaySelectionCheckbox: true
            }
			
			};
		console.log('select user or group $scope.model config set');
		console.log('smart table columns & config set');

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {	
			$scope.model.initialised = true;
			console.log('select user or group pop-up modal $scope.model.initialised = true');
			$scope.model.Rows = $rootScope.rows;
			console.log('smart table populated with $rootScope from deviceFilteringService');
        };
        $scope.init();
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLOSES MODAL WINDOW OR CLICKS THE 'CLOSE' BUTTON
		$scope.cancel = function () {

			$('#ajaxLoaderGif').css("visibility","hidden");
			$rootScope.$broadcast('updated');
            $modalInstance.dismiss();
			console.log('Select user or group cancelled - modal closed');
        };

		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS THE 'SELECT' BUTTON (after checking tickboxes)
		$scope.select = function () {
		
			$('#ajaxLoaderGif').css("visibility","hidden");
			$.each($scope.model.Rows, function(idx, obj) {
				if (obj.isSelected == true)
					{
					$scope.model.selected.push(obj);
					}
			 });

			$rootScope.selected = $scope.model.selected;
			$rootScope.$broadcast('updated');
			console.log(JSON.stringify($rootScope.selected));
			$modalInstance.dismiss(); //Close window
        };
      


    }]
);