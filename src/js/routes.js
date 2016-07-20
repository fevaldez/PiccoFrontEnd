'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        // $urlRouterProvider.otherwise('/dashboard');
        $urlRouterProvider.otherwise('/status/range');

        // Application routes
        $stateProvider
            .state('index', {
                // url: '/',
                // templateUrl: 'templates/ngDashboard.html',
                // controller: 'DashboardController as dash'
                url: '/status/range',
                templateUrl: 'templates/statusAccountByRange.html',
                controller: 'StatusByRangeController as acc'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'templates/ngDashboard.html',
                controller: 'DashboardController as dash',
                data: {
                    restrict: true,
                    roles: ['admin', 'ceo', 'stakeholder']
                }
            })
            .state('auth', {
                url: '/auth',
                templateUrl: 'templates/loginView.html',
                controller: 'AuthController as auth'
            })
            .state('projects', {
                url: '/projects',
                templateUrl: 'templates/userView.html',
                controller: 'UserController as user'
                // ,resolve: {
                //     editedUser: function() { return {}; }
                // }
            })
            .state('obras', {
                url: '/obras/:projectId',
                templateUrl: 'templates/projectListView.html',
                controller: 'ProjectListController as prjList',
                resolve: {
                    active: ['$stateParams',
                        function($stateParams){
                            return $stateParams.projectId;
                        }]
                }
            })
            .state('tables', {
                url: '/tables',
                templateUrl: 'templates/tables.html'
            })
            .state('status', {
                url: '/status',
                templateUrl: 'templates/statusAccount.html',
                controller: 'StatusController as acc',
                data: {
                    restrict: true,
                    roles: ['admin', 'ceo']
                }

            })
            .state('statusByRange', {
                url: '/status/range',
                templateUrl: 'templates/statusAccountByRange.html',
                controller: 'StatusByRangeController as acc'
            });
    }
]);