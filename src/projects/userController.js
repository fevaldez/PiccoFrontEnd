// public/scripts/userController.js

// (function() {
//     'use strict';

    angular
        .module('RDash')
        .controller('UserController', UserController);  

    UserController.$inject = ['$scope', '$http', '$rootScope', '$state', 'UsersService', 'NgTableParams', '$timeout', 'growl'];
    function UserController($scope, $http, $rootScope, $state, UsersService, NgTableParams, $timeout, growl) {

        var vm = this;
        
        vm.users = [];
        vm.applyGlobalSearch = applyGlobalSearch;
        //User Model
        vm.newUser = {
                user_name: '',
                first_name: '',
                last_name: '',
                gender: '',
                birth_date: '',
                height: '',
                email: '',
                password: '',
                commute: '',
                breakfast: '',
                hydration: '',
                hydration_amount: '',
                company_id: ''
            };
        vm.createUser = createUser;
        //edited
        vm.editedUser = null;
        vm.editedUserId;
        vm.isEditing = false;
        //Drop Down
        vm.companiesArray = [];
        vm.selected = [];

        function initController() {

            getUsers();
            // console.log(editedUser);
            var currentState = $state.current.name;
            switch (currentState) {
                case 'projects':
                    getUsers();
                    break;
                case 'newUser':
                    getCompanies();
                    break;
                case 'editUser':
                    getCompanies();
                    //Check if URI has an object and is not empty
                    // if ( angular.isDefined(editedUser.data) &&
                    //     angular.isObject(editedUser.data.data) &&
                    //     Object.keys(editedUser.data.data).length > 0 )
                    if (editedUser.success) {

                        vm.setEditedUser(editedUser.data.data);
                        // Fetch company object
                        CompanyService.getCompany(vm.editedUser.company_id)
                            .then(function(response) {

                            if (response.success){
                                //Assign the corresponding company array to ui-select
                                console.log(response.data.data);
                                vm.selected.value = response.data.data;

                            }else {

                                growl.error(response.message, {ttl:10000});                        
                            }

                        }, function(error) {
                            console.log(error);
                        });

                    // } else if ( angular.isObject(editedUser) &&
                    //     Object.keys(editedUser).length > 0 )
                    // {
                    //     console.log("PASSED EditUser COPY Check");
                    //     vm.setEditedUser(editedUser);

                    }else {
                        growl.error(editedUser.message, {ttl:10000});
                        $state.go('users', {});
                    }
                    break;
                default:
            } 
        }

        function applyGlobalSearch(){
            // var term = vm.globalSearchTerm;
            // vm.tableParams.filter({ $: term });
            // vm.tableParams.reload();
        }

        //vm.getUsers = function() {
        function getUsers() {
            UsersService.getUsers()
                .then(function(response){
                    console.log(response);
                    if (response.success){
                        vm.users = response.data.data;
                        vm.tableParams = new NgTableParams({
                            page: 1, // show first page
                            count: 6, // count per page
                            filter: {
                                first_name: '',
                                last_name: '',
                                email: ''
                            }
                        }, {
                          filterDelay: 0,
                          data: response.data.data
                        });
                    }
                    //Response from service was not succesfull
                    else {
                        growl.error(response.message, {ttl:10000});
                    }
                }, function(error){
                    console.log(error);
                });
            
        }

        function getCompanies(){
            CompanyService.getCompanies()
                .then(function(response){

                    if(response.success){
                        vm.companiesArray = response.data.data
                    }
                    //Response from service was not succesfull
                    else {
                        growl.error(response.message, {ttl:10000});
                    }
                }, function(error){
                    console.log(error);
                });
        }

        //Go to edit users form
        vm.manageUsers = function() {
            $state.go('manageUsers', {});
        }

        //Call User service to create new user
        function createUser(user) {

            if ( angular.isDefined(vm.selected) &&
                    angular.isDefined(vm.selected.value) ) {

                var selectedCompany = vm.selected.value.id;
                UsersService.create(user, selectedCompany)
                .then(function(response) {
                    if (response.success){
                        growl.success(response.message);
                        //Go to users list
                        $state.go('users', {});

                    }else {

                        growl.error(response.message, {ttl:10000});                        
                    }

                }, function(error) {
                    console.log(error);
                });

            } else{
                growl.error("Please select a Company to proceed.");
            }
        }

        //Call User service to update existing user
        //function updateUser(user) {
        vm.updateUser = function(user) {

            if ( angular.isDefined(vm.selected) &&
                    angular.isDefined(vm.selected.value) ) {

                var prevCompany = user.company_id;
                user.company_id = vm.selected.value.id;
                UsersService.update(user.id, user, prevCompany)
                    .then(function(response) {
                    if (response.success){
                            growl.success(response.message);
                            cancelEditing();
                            $state.go('users', {});
                        }else{
                            growl.error(response.message, {ttl:10000});
                        }
                    }, function(error) {
                        console.log(error);
                    });
            } else{
                growl.error("Please select a Company to proceed.");
            }
        }

        //Call User service to update existing user
        //function updateUser(user) {
        vm.deleteUser = function(user) {

            iModalService.modalPromise("Delete User: " +
                user.first_name + ' ' + user.last_name,
                "Are you sure you want to delete this user?")
                .then(function(modal) {
                    //it's a bootstrap element, use 'modal' to show it
                    modal.element.modal();
                    modal.close.then(function(result) {
                        if (result === true){
                            //User confirms deletion
                            UsersService.deleteUser(user.id, user.company_id)
                                .then(function(response) {
                                    if (response.success){
                                        growl.success(response.message);
                                        getUsers();
                                    }else{
                                        growl.error(response.message, {ttl: 10000});
                                    }
                                });
                        }

                    });
                });
        }

        vm.storeEditedUser = function(user) {
            UsersService.storeEditedUser(user);
        }

        //Update User
        // function setEditedUser(user) {
        vm.setEditedUser = function(user) {
            vm.editedUser = angular.copy(user);
            vm.isEditing = true;
        }

        function cancelEditing() {
            vm.editedUser = null;
            vm.isEditing = false;
            UsersService.clearEditedUser();
        }

        // We would normally put the logout method in the same
        // spot as the login method, ideally extracted out into
        // a service. For this simpler example we'll leave it here
        vm.logout = function() {

            $auth.logout().then(function() {

                // Remove the authenticated user from local storage
                localStorage.removeItem('user');

                // Flip authenticated to false so that we no longer
                // show UI elements dependant on the user being logged in
                $rootScope.authenticated = false;

                // Remove the current user info from rootscope
                $rootScope.currentUser = null;

                $state.go('auth', {});
            });
        }

        function clearAlerts(timeout){
            $timeout(function() {
                vm.success =null;
                vm.error =null;
            }, timeout);
        }

        initController();

    }
    
// })();