'use strict';

angular.module('controller.downloadQuotas.selectusers', [])

.controller('SelectUsersDownloadQuotasCtrl', ['$scope', '$rootScope', '$modal', '$modalInstance', 'downloadQuotasService', 'smartTableUtils', 'shellService',
    function ($scope, $rootScope, $modal, $modalInstance, downloadQuotasService, smartTableUtils, shellService) {


        console.log('created select user or group controller');

		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
			selected: [],
			smartTableSelectRows: [],
			smartTableSelectColumns: [
				{'label':'Name','map':'displayName', isSortable:false},
				{'label':'Current Quota (MB)','map':'downloadLimit', isSortable:false},
				{'headerTemplateUrl':'views/templates/smarttable-select-all.html','cellTemplateUrl':'views/templates/smarttable-select-row.html'}
			],			
			smartTableSelectConfig: {
				isPaginationEnabled: false,
                defaultSortColumn: 1,
				selectionMode: 'multiple',
				displaySelectionCheckbox: true
            }
			
			};
		console.log('select users $scope.model config set');
		console.log('smartTableSelect columns & config set');

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {
			$scope.model.smartTableSelectRows = $rootScope.rows;
			$scope.model.initialised = true;
			console.log('select users pop-up modal $scope.model.initialised = true');
        };
        $scope.init();
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLOSES MODAL WINDOW OR CLICKS THE 'CLOSE' BUTTON
		$scope.cancel = function () {
			$('#ajaxLoaderGif').css("visibility","hidden");
            $modalInstance.dismiss();
			console.log('Select users cancelled - modal closed');
        };
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS THE 'SELECT' BUTTON (after checking tickboxes)
		$scope.select = function () {
			
			$('#ajaxLoaderGif').css("visibility","hidden");
			$.each($scope.model.smartTableSelectRows, function(idx, obj) {
				if (obj.isSelected == true)
					{
					$scope.model.selected.push(obj);
					}
			 });

			$rootScope.selected = $scope.model.selected;
			$rootScope.$broadcast('updated');
			$modalInstance.dismiss(); //Close window
        };
      


    }]
);