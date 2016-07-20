// angular.module('RDash', ['ui.bootstrap', 'ui.router', 'ngCookies']);
'use strict';
var underscore = angular.module('underscore', []);
    underscore.factory('_', function() {
      return window._; //Underscore must already be loaded on the page
});

angular.module('RDash',
			['ui.bootstrap', 'ui.router', 'ngCookies', 'satellizer', 'ngTable', 'angular-growl', 'ngAnimate',
			'ui.select', 'ngSanitize', 'angular-loading-bar', 'angularMoment', 'underscore', 'angularModalService'])
        .constant('ENDPOINT_URI', 'http://piccoapi.local/')
        // .constant('ENDPOINT_URI', 'http://pico.appadn.com/laravel/public/')

        .constant("moment", moment)
        .filter('dateToISO', function() {
            return function(input) {
                // if (!(input === null || input === undefined) )
                if (input){
                    input = new Date( Date.parse(input) );
                    input = input.toISOString();
                }
                return input;
            };
        })
        .filter( 'titleCase', function() {
            return function( input ) {
                return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            };
        })
        .filter('dateRange', function () {
            return function (items, startDate, endDate) {
                // console.log(startDate);
                // if (item[property] === null) return false;
                if (startDate === undefined && endDate === undefined) return items;
         
                return items.filter(function(item){
                    if (item === undefined || item.start_date === undefined) return false;
                    if (startDate !== undefined && endDate === undefined)
                        return moment(item.start_date).isAfter(startDate);
                    else if (startDate === undefined && endDate !== undefined)
                        return moment(item.end_date).isBefore(endDate);
                    else
                        return (
                            moment(item.start_date).isAfter(startDate)
                            &&
                            moment(item.end_date).isBefore(endDate)
                            );
                    // moment('2016-10-30').isBetween('2016-10-30', '2016-10-30', null, '[]'); //true
                })
            };
        })
        .directive('permission', ['AuthService', function(AuthService) {
           return {
               restrict: 'A',
               scope: {
                  permission: '='
               },
         
               link: function (scope, elem, attrs) {
                    scope.$watch(AuthService.isLoggedIn, function() {
                        if (AuthService.userHasPermission(scope.permission)) {
                            elem.show();
                        } else {
                            elem.hide();
                        }
                    });                
               }
           }
        }])

        .config(['growlProvider', '$stateProvider', '$urlRouterProvider', '$authProvider', '$httpProvider', '$provide', 'ENDPOINT_URI',
        function (growlProvider, $stateProvider, $urlRouterProvider, $authProvider, $httpProvider, $provide, ENDPOINT_URI) {

            $httpProvider.interceptors.push(['$q', '$injector',
            function($q, $injector) {

                return {
                    responseError: function(rejection) {
                        console.log(rejection);

                        // Need to use $injector.get to bring in $state or else we get
                        // a circular dependency error
                        var $state = $injector.get('$state');

                        // Instead of checking for a status code of 400 which might be used
                        // for other reasons in Laravel, we check for the specific rejection
                        // reasons to tell us if we need to redirect to the login state
                        var rejectionReasons = ['token_not_provided', 'token_expired', 'token_absent', 'token_invalid'];

                        // Loop through each rejection reason and redirect to the login
                        // state if one is encountered
                        angular.forEach(rejectionReasons, function(value, key) {

                            if(rejection.data.error === value) {

                                // If we get a rejection corresponding to one of the reasons
                                // in our array, we know we need to authenticate the user so 
                                // we can remove the current user from local storage
                                localStorage.removeItem('user');

                                // Send the user to the auth state so they can login
                                $state.go('auth');
                            }
                        });

                        return $q.reject(rejection);
                    }
                }

            }]);

	        // Satellizer configuration that specifies which API
	        // route the JWT should be retrieved from
	        $authProvider.loginUrl = ENDPOINT_URI + '/api/authenticate';

			growlProvider.globalTimeToLive(3600);
	  		growlProvider.globalDisableCountDown(true);
  			growlProvider.globalPosition('top-right');
		}])//;//
        .run( ['$rootScope', '$state', '$stateParams', 'AuthService',
            function ($rootScope, $state, $stateParams, AuthService) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;

            // $stateChangeStart is fired whenever the state changes. We can use some parameters
            // such as toState to hook into details about the state as it is changing
            $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {

                // track the state the user wants to go to;
                // authorization service needs this
                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;

                // Grab the user from local storage and parse it to an object
                var user = JSON.parse(localStorage.getItem('user'));

                // If there is any user data in local storage then the user is quite
                // likely authenticated. If their token is expired, or if they are
                // otherwise not actually authenticated, they will be redirected to
                // the auth state because of the rejected request anyway
                if(user) {

                    // The user's authenticated state gets flipped to
                    // true so we can now show parts of the UI that rely
                    // on the user being logged in
                    $rootScope.authenticated = true;

                    // Putting the user's data on $rootScope allows
                    // us to access it anywhere across the app. Here
                    // we are grabbing what is in local storage
                    $rootScope.currentUser = user;

                    // If the user is logged in and we hit the auth route we don't need
                    // to stay there and can send the user to the main state
                    if(toState.name === "auth") {

                        // Preventing the default behavior allows us to use $state.go
                        // to change states
                        event.preventDefault();

                        // go to the "main" state which in our case is users
                        $state.go('index');
                    }
                    // Check if user has permissions for requested view
                    if (!AuthService.checkPermissionForView(toState)){
                        event.preventDefault();
                        $state.go('auth');
                    }
                }
            });
            }
        ]);
		//Growl, destroy previous messages on state change
		// .run(['$rootScope', 'growlMessages', function ($rootScope, growlMessages) {
	 //        $rootScope.$on('$stateChangeSuccess', function () {
	 //            //growlMessages.destroyAllMessages();
	 //        });
  //   	}]);