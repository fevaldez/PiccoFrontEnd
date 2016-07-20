
angular
    .module('RDash')
    .controller('ProjectsController', ProjectsController);


ProjectsController.$inject = ['growl', 'ProjectsService'];
function ProjectsController(growl, ProjectsService) {
	var vm = this;

    //  We'll load our list of Customers from our JSON Web Service into this variable
    vm.listOfCustomers = null;

    //  When the user selects a "Customer" from our MasterView list, we'll set the following variable.
    vm.selectedCustomer = null;


        ProjectsService.getUsers()
        .then(function(response){
            console.log(response);
            if (response.success){

                vm.listOfCustomers = response.data.data;
                vm.selectedCustomer = vm.listOfCustomers[0].id;
                vm.loadOrders();
            }
            //Response from service was not succesfull
            else {
                growl.error(response.message, {ttl:10000});
            }
        }, function(error){
            console.log(error);
        });
    
    vm.selectCustomer = function (val) {
        //  If the user clicks on a <div>, we can get the ng-click to call this function, to set a new selected Customer.
        vm.selectedCustomer = val.id;
        vm.loadOrders();
    }

    vm.loadOrders = function () {
        //  Reset our list of orders  (when binded, this'll ensure the previous list of orders disappears from the screen while we're loading our JSON data)
        vm.listOfOrders = null;

        ProjectsService.getUser(vm.selectedCustomer)
        .then(function(response){
            console.log(response);
            if (response.success){

                vm.listOfOrders = response.data.data;                
            }
            //Response from service was not succesfull
            else {
                growl.error(response.message, {ttl:10000});
            }
        }, function(error){
            console.log(error);
        });
    }

}