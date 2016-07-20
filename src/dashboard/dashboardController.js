
    angular
        .module('RDash')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$state', '$filter', '$q', 'ProjectsService', 'NgTableParams', 'growl', 'iModalService', 'AccountsService'];
    function DashboardController($state, $filter, $q, ProjectsService, NgTableParams, growl, iModalService, AccountsService) {

        var vm = this;
        vm.companies = [];
        vm.projects = [];
        vm.projectsDuration = [];
        vm.totalIncome = 0;
        vm.pendingIncome = 0;
        vm.totalOutcome = 0;
        vm.active=[];
        vm.payables = 0;
        vm.receivables = 0;
        vm.payments = 0;
        // vm.activeProjectsDetail = [];

        vm.chart1 = {};
        vm.incomeData = [{"id":1,"project_id":77,"income_date":"2016-02-29","account":"400001","observations":"FACT 734 EXT 01 EXTRA","deposit":10867.49},{"id":2,"project_id":77,"income_date":"2016-02-29","account":"400001","observations":"FACT 735 EST 02 EXTRA","deposit":127763.37},{"id":3,"project_id":77,"income_date":"2015-12-11","account":"400001","observations":"FACT 713","deposit":281806.87},{"id":4,"project_id":77,"income_date":"2015-12-11","account":"400001","observations":"FACT 712","deposit":257760.28},{"id":5,"project_id":77,"income_date":"2015-11-21","account":"400001","observations":"EST 04 FACT 709","deposit":863544.94}];

        vm.sum = function(items, prop){
            return items.reduce( function(a, b){
                return a + (b[prop] || 0);
            }, 0);
        };
        vm.sumFloat = function(items, prop){
            return items.reduce( function(a, b){
                return parseFloat(a) + (parseFloat(b[prop]) || 0);
            }, 0);
        };

        vm.clickModal = function(type){
            var data,
                title,
                body,
                template,
                controller,
                sorting;
            switch (type) {
                case 'projects':
                    title       = "Obras Activas";
                    data        = vm.projects;
                    template    = "templates/ngTActiveProjectsModal.html";
                    controller  = 'NgTableModalController';
                    sorting     = { start_date: 'desc', full_name: 'asc' };
                    break;
                case 'income':
                    title       = "Ingresos de Obras Activas";
                    data        = vm.projects;
                    template    = "templates/ngTActiveProjectsModal.html";
                    controller  = 'NgTableModalController';
                    sorting     = { income: 'asc' };
                    break;
                default:
            }
            // modal...
            // if (data !== undefined) {
                iModalService.modalPromise(title, body, data, sorting, template, controller)
                .then(function(modal){
                    modal.element.modal();
                });
            // }
        }

        function initController() {

            vm.getSummaries();
            //Get Poject
            vm.getProjects();
        }

        /*
        * Call Accounts service to get Payables, Receivables and Payments for the specific period
        */
        vm.getSummaries = function(){

            $q.all([
                AccountsService.getDebitsCredits(200, '0101', '201601', '201607'),
                AccountsService.getFinalBalance(200, '0101', '201601', '201607'),
                AccountsService.getFinalBalance(130, '0101', '201601', '201607')
                ])
            .then(function (responses) {
                console.log('AuthService responses: ',responses);
                vm.payments = responses[0].data[0].debit;
                vm.payables = responses[1];
                vm.receivables = responses[2];
            });
             
        }

        /*
        * Call service function to get all users
        */
        // function getProjects() {
        vm.getProjects = function() {

            ProjectsService.getActiveProjects()
            .then(function(response){
                if (response.success){
                    // var copy = angular.copy(response.data);

                    vm.projects = response.data;
                    //Extend projects array by adding duration fields
                    vm.projectsDuration = vm.loadProjectDuration(response.data);
                    //Compute total income
                    vm.totalIncome = vm.sumFloat(vm.projects, 'income');
                    vm.pendingIncome = vm.sumFloat(vm.projects, 'outcome');
                    vm.totalOutcome = vm.sumFloat(vm.projects, 'outcome');

                    //Assign returnes companies
                    vm.initProjectsTable(vm.projectsDuration);

                }
                //Response from service was not succesfull
                else {
                    growl.error(response.message, {ttl:10000});
                }
                }, function(error){
                    console.log(error);
                }
            );
        }.bind(vm);

        /*
        * Call service function to get process JSON array and add Duration
        */
        vm.loadProjectDuration = function(arr) {
            // console.log('loadProjectDuration', arr);
            // var arr = ProjectsService.addDuration(arr);
            // vm.projects = arr;
            // return arr;
            return ProjectsService.addDuration(arr);
        }.bind(vm);

        //Declare NgTableParams for Users table
        // function initProjectsTable(data){
        vm.initProjectsTable = function(data){
            // console.log('initProjectsTable', vm.projectsDuration, vm.projectsDuration.length);
            var data = vm.projectsDuration;
        //     vm.projectTableParams = new NgTableParams({
        //         page: 1, // show first page
        //         count: 5, // count per page
        //         sorting: {
        //             start_date: "desc",
        //             full_name: "asc"
        //         },
        //         filter: {
        //                 id_proyecto: '',
        //                 // monto: '',
        //                 start_date: '',
        //                 end_date: '',
        //                 lapsed:''
        //         }
        //     }, {
        //         counts: [], // hide page counts control
        //         total: data.length,  // value less than count hide pagination
        //         filterDelay: 300,
        //         data: data
        //     }
        //     );
                vm.columns = [
                    { title: 'Proyecto', field: 'full_name', visible: true, filter: { 'full_name': 'text' } },
                    { title: 'Inicio', field: 'start_date', visible: true, filter: { 'start_date': 'date' } },
                    { title: 'Fin', field: 'end_date', visible: true, filter: { 'end_date': 'date' } },
                    { title: 'Progreso', field: 'duration', visible: true },
                    { title: 'Ingreso', field: 'income', visible: true}
                ];
                vm.projectTableParams = new NgTableParams({
                    page: 1,            // show first page
                    count: 5,          // count per page
                    filter: {
                        name: 'M'       // initial filter
                    }
                }, {
                    counts: [], // hide page counts control
                    total: data.length, // length of data
                    getData: function($defer, params) {
                        // use build-in angular filter
                    var orderedData = params.sorting() ?
                        $filter('orderBy')(data, params.orderBy()) :
                        data;

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
        }
        // .bind(vm);
        
        vm.projectDetails = function(prjId){
            $state.go('obras', {projectId: prjId});
        }

        function getActiveProjectsDetail(){

            ProjectsService.getActiveProjectsDetail()
            .then(function(response){                
                if (response.success){
                    // vm.activeProjectsDetail = response.data;
                    console.log("getActiveProjectsDetail", response.data);
                    vm.active= response.data;
                }
            }, function(error){
                console.log(error);
            }
            );
        }

        function getProjectsData(params){
            // snip
            return vm.projects;
        }

        //Call initialization
        initController();

    }
