// public/scripts/authController.js

(function() {

    'use strict';

    angular
        .module('RDash')
        .factory('AuthService', AuthService);


    AuthService.$inject = ['$auth', '$http', '$state', '$rootScope', 'ENDPOINT_URI'];
    function AuthService($auth, $http, $state, $rootScope, ENDPOINT_URI) {

        var m='';
        var service = {};

        service.Login = Login;
        service.logout = logout;
        service.isLoggedIn = isLoggedIn;
        service.checkPermissionForView = checkPermissionForView;
        service.userHasPermissionForView = userHasPermissionForView;
        service.userHasPermission = userHasPermission;
        // service.SetCredentials = SetCredentials;
        // service.ClearCredentials = ClearCredentials;

        return service;

        function Login(credentials) {

            console.log('AuthService Login: ', credentials);
            var response;
            return $auth.login(credentials).then(function() {

                // Return an $http request for the now authenticated
                // user so that we can flatten the promise chain
                return $http.get(ENDPOINT_URI + 'api/authenticate/user');

            // Handle errors
            }
            // ,
            // handleError
            // function(error) {
            //     // vm.loginError = true;
            //     // vm.loginErrorText = error.data.error;
                // return { success: false, message: 'Username or password is incorrect CUSTOM' };

            // // Because we returned the $http.get request in the $auth.login
            // // promise, we can chain the next promise to the end here
            // }
            ).then(function(response) {
                console.log(response);

                // Stringify the returned data to prepare it
                // to go into local storage
                var user = JSON.stringify(response.data.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                // The user's authenticated state gets flipped to
                // true so we can now show parts of the UI that rely
                // on the user being logged in
                $rootScope.authenticated = true;

                // Putting the user's data on $rootScope allows
                // us to access it anywhere across the app
                $rootScope.currentUser = response.data.user;

                // Everything worked out so we can now redirect to
                // the users state to view the data
                // $state.go('users');
                return handleSuccess(response, "Successful Login");

            }, handleError("Invalid username and/or password."));
        }

        function logout() {

            var res;
            return $auth.logout()
            .then(function(res) {

                // Remove the authenticated user from local storage
                localStorage.removeItem('user');

                // Flip authenticated to false so that we no longer
                // show UI elements dependant on the user being logged in
                $rootScope.authenticated = false;

                // Remove the current user info from rootscope
                $rootScope.currentUser = null;

                // $state.go('auth', {});

                return handleSuccess(res, "Successfully logged out");
            }, handleError);
        }

        //
        function isLoggedIn(){
            // return localStorage.user != null;
            return ($rootScope.currentUser != null && $rootScope.authenticated === true);
        }

        //ROLES CHECK
        function isInRole(role) {
            // if (!_authenticated || !_identity.roles) return false;
            if (!$rootScope.currentUser || !$rootScope.authenticated) return false;

            // return _identity.roles.indexOf(role) != -1;
            return $rootScope.currentUser.permissions.indexOf(role) != -1;
        }

        function isInAnyRole(roles) {
            // if (!_authenticated || !_identity.roles) return false;
            if (!$rootScope.currentUser || !$rootScope.authenticated) return false;

            for (var i = 0; i < roles.length; i++) {
                if (isInRole(roles[i])) return true;
            }

            return false;
        }

        //ROLE BASED AUTH
        function checkPermissionForView(toState) {
            // if (!view.requiresAuthentication) {
            if(!toState.data || !toState.data.restrict){
                return true;
            }
             
            return userHasPermissionForView(toState);
        };

        function userHasPermissionForView(toState){
            // if(!auth.isLoggedIn()){
            //     return false;
            // }
            // console.log('userHasPermissionForView: ', toState);
             
            // if(!view.permissions || !view.permissions.length){
            if(!toState.data || !toState.data.roles){
                return true;
            }
            var permissions = toState.data.roles || [];

            // console.log('AuthService View permissions: ', permissions);
             
            return userHasPermission(permissions);
        }
                  
        function userHasPermission(permissions){
            if(!isLoggedIn()){
                return false;
            }

            //if state does not have roles defined
            if (permissions.length <1)
                return true;
             
            var found = false;
            angular.forEach(permissions, function(permission, index){
                if ($rootScope.currentUser.permissions.indexOf(permission) >= 0){
                    // console.log("Permission required: ", permission, " User permissions:", $rootScope.currentUser.permissions);
                    found = true;
                    return;
                }                        
            });
             
            return found;
        };

        function authorize() {
        // return principal.identity()
        //   .then(function() {
            var isAuthenticated = this.isLoggedIn();

            if ($rootScope.toState.data.roles
                && $rootScope.toState
                             .data.roles.length > 0 
                && !this.isInAnyRole(
                   $rootScope.toState.data.roles))
            {
              if (isAuthenticated) {
                  // user is signed in but not
                  // authorized for desired state
                  $state.go('accessdenied');
              } else {
                // user is not authenticated. Stow
                // the state they wanted before you
                // send them to the sign-in state, so
                // you can return them when you're done
                $rootScope.returnToState
                    = $rootScope.toState;
                $rootScope.returnToStateParams
                    = $rootScope.toStateParams;

                // now, send them to the signin state
                // so they can log in
                $state.go('auth');
              }
            }
        }
          // });

        // PRIVATE FUNCTIONS
        function handleSuccess(res, message) {

            if (angular.isDefined(res) && angular.isDefined(message) ) {
                return { success: true, data: res.data, message: message };
            }else{
                return { success: true, message: message };
            }
        }

        function handleError(error) {
            
            if (angular.isDefined(error.data) && angular.isDefined(error.data.message) ) {
                console.log('Error Object');
                m = error.data.message;
                var mergedMessage = "Please correct the following errors: <br>";
                if ( angular.isObject(m) ){
                    //Concatenate the array of messages from server response
                    angular.forEach(m, function(value, key) {
                        mergedMessage += '<br>' + value;
                    });
                    m = mergedMessage;
                }

                return { success: false, message: m };
            }else{
                console.log('Error Message');
                m=error;
                return function () {
                    return { success: false, message: m };
                };
            }
        }
    }

})();  