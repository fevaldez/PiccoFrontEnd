
    angular
        .module('RDash')
        .controller('AuthController', AuthController);


    AuthController.$inject = ['$state', 'AuthService', 'growl'];
    function AuthController($state, AuthService, growl) {

        var vm = this;
            
        vm.login = function() {
            
            // $state.go('dashboard');

            var credentials = {
                user_name: vm.email,
                password: vm.password
            }
        
            console.log('Entering LoginController');
            AuthService.Login(credentials)
                .then(function(response) {
                    console.log(response);
                    if (response.success){
                        $state.go('index');
                    }else{
                        growl.error(response.message, {ttl: 5000});
                    }

            }, function(error) {
                console.log(error);
            });
        
        }

    }
