'use strict';

angular.module('controller.shell', ['ui.router']).controller('ShellCtrl',
    ['$scope', '$rootScope', '$routeParams', '$location', '$modal', 'shellService',
        function($scope, $rootScope, $routeParams, $location, $modal, shellService){

    console.log('created shell controller');

    $scope.model = {
        initialised: false,
        angularInitialised:true
    };

    $scope.init = function () {
        $scope.workingStart();

        shellService.initialise().then(function (data) {
            var host = $location.host();
            $scope.model.logout = $location.protocol() + '://' + host.replace('admin.mis', 'auth') + '/amserver/UI/Logout';
            $scope.model.currentEntity = data.hierarchy;
            $scope.model.currentUser = data.authenticatedUser;
            $scope.menuitems = data.actionGrid.elements;
            $scope.model.initialised = true;
            $scope.model.lastLoginTime = data.lastLoginTime;
            $scope.model.schoolMessage = data.schoolMessage;

            //The following variables are for use in right-hand-column.html
            $scope.school = data.hierarchy.eqSchool.eqSchoolName;
            $scope.displayName = data.authenticatedUser.displayName;
            $scope.misId = data.authenticatedUser.misId;
            $scope.message = data.schoolMessage.message;

            //The following variables are for the manage schools context
            $rootScope.currentSchoolName = data.hierarchy.eqSchool.eqSchoolName;
            $rootScope.defaultSchoolName = data.hierarchy.eqSchool.eqSchoolName;
            $rootScope.currentSchoolCentreCode = data.hierarchy.eqSchool.centreCode;
            $rootScope.displaySchoolCentreCode = '(' + $rootScope.currentSchoolCentreCode + ')';
            $rootScope.defaultSchoolCentreCode = data.hierarchy.eqSchool.centreCode;
            $rootScope.currentSchoolQedUniqueId = data.hierarchy.eqSchool.qedUniqueId;
            $rootScope.defaultSchoolQedUniqueId = data.hierarchy.eqSchool.qedUniqueId;
            $rootScope.currentSchoolId = data.hierarchy.eqSchool.eqSchoolId;
            $rootScope.defaultSchoolId = data.hierarchy.eqSchool.eqSchoolId;

            $scope.workingStop();
            // Set default screen & sub-menu display upon load
            $location.path('/views/modals/filter-check/proxy-client-filter-check.html');
            if ($(window).width() > 1230) {setTimeout(function(){$scope.subMenuItemShow('0')}, 5);}
        }, function () {
            $location.path('/invalid');
            $scope.workingStop();
            $scope.model.dropDown = 0;
        });
    };

    // FUNCTIONS TO START/STOP 'WORKING...' MESSAGE
    $rootScope.$on('workingStart', function () {
         $scope.workingStart();
    });

    $scope.workingStart = function () {
         $('#working').css('display','block');
         console.log('Working...');
    };

    $rootScope.$on('workingStop', function () {
         $scope.workingStop();
    });

    $scope.workingStop = function () {
        $('#working').fadeOut(500);
    };

    $scope.init();

    /**
     * Opens the modal using the provided values.
     * @param partial the location of the modal html.
     * @param ctrl the name of the controller to be instantiated.
     */
   /* $scope.openDialog = function (partial, ctrl) {
        var options = {
            templateUrl: partial,
            controller: ctrl
        };
        $modal.open(options);
    };*/

    $scope.loadScreen = function (screen) {
        $location.path(screen);
    };

    /**
     * Listens for notifications and displays them using the Humane growler.
     */
    $rootScope.$on('notify', function (event, data) {
        if (data.level === 'error') {
            humane.error(data.msg);
        } else {
            humane.log(data.msg);
        }
    });

    /**
     * Listens for the 'authRequired' event sent by the http interceptor when it
     * detects that the user requires authentication.
     */
    $rootScope.$on('authRequired', function () {
        console.log('detected authentication required');
        $modal.open({
            templateUrl: 'views/modals/timeout.html'
        });
    });



    // FUNCTIONS TO DISPLAY/HIDE TOASTER MESSAGES (e.g. save success/fail)
    $rootScope.$on('toastMessageUpdateSuccess', function () {
        $scope.toastMessage = $rootScope.messageSuccess;
        $scope.workingStop();
        $('#toaster-container').fadeIn(2000);
        setTimeout(function(){$scope.toasterClose()}, 20000);
    });

    $scope.toasterClose = function () {
        $('#toaster-container').fadeOut(1500);
        setTimeout(function(){$('#toaster-container').css('display','none');}, 2000);
    };

    $rootScope.$on('toastMessageUpdateError', function () {
         $scope.toastMessageError = $rootScope.messageError;
         $scope.workingStop();
         $('#toaster-container-error').fadeIn(2000);
         setTimeout(function(){$scope.toasterErrorClose()}, 20000);
    });

     $scope.toasterErrorClose = function () {
          $('#toaster-container-error').fadeOut(1500);
          setTimeout(function(){$('#toaster-container-error').css('display','none');}, 2000);
      };

     $rootScope.$on('toastMessageUpdateInfo', function () {
          $scope.toastMessageInfo = $rootScope.messageInfo;
          $scope.workingStop();
          $('#toaster-container-info').fadeIn(2000);
          setTimeout(function(){$scope.toasterInfoClose()}, 20000);
     });

     $scope.toasterInfoClose = function () {
          $('#toaster-container-info').fadeOut(1500);
          setTimeout(function(){$('#toaster-container-info').css('display','none');}, 2000);
     };

     $scope.subMenuItemShow = function (subMenuOption) {
         var menuItems = $scope.menuitems.length;
         for(var i = 0; i < menuItems; i++) {
             document.getElementById(i).style.display = 'none';
         }
         document.getElementById(subMenuOption).style.display = 'block';
     };

     $scope.subMenuItemHide = function () {
         if ($(window).width() < 1230) {
             setTimeout(function(){$('.menuItem').css('display','none');}, 5);}
         $scope.dropDownMenuClose();
     };

     $scope.dropDownMenuOpen = function () {
         if ($scope.model.dropDown != 0)
         {
             $('#left-nav').slideDown();
             $scope.model.dropDown = 0;
         }
         else {$('#left-nav').slideUp();
             $scope.model.dropDown = 1;
         }
     };

     $scope.dropDownMenuClose = function () {
          $('#left-nav').slideUp();
         $scope.model.dropDown = 1;
     };


}]);
