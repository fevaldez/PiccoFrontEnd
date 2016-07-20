/**
 * Master Controller
 */

angular.module('RDash')
    .controller('MasterCtrl', ['$scope', '$state', '$cookieStore', 'AuthService', 'growl', MasterCtrl]);

function MasterCtrl($scope, $state, $cookieStore, AuthService, growl) {
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.logout = function() {
    
        AuthService.logout()
            .then(function(response) {
                console.log(response);
                if (response.success){
                    $state.go('auth', {});
                }else{
                    growl.error(response.message, {ttl: 5000});
                }

        }, function(error) {
            console.log(error);
        });
    
    }

    $scope.$watch($scope.getWidth, function(newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = ! $cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function() {
        $scope.$apply();
    };
}