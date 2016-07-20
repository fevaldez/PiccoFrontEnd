
angular
    .module('RDash')
    .controller('StatusController', StatusController);


StatusController.$inject = ['growl', 'StatusService'];
function StatusController(growl, StatusService) {
	var vm = this;
	vm.statusAcc = [];
	vm.parentAcc = [];
	vm.statusStartDate;
	vm.statusEndDate;

    function initController() {

        //Get Pojects
        getStatus();
    }

    function getStatus() {

	    StatusService.getAccountStatus()
	    .then(function(response){

	        if (response.success){
	            //Assign returnes companies
	            vm.statusAcc = response.data.filter(function(acc){
	            	return acc.parent_id === null;
	            });
	            // Copy of Major Accounts
	            // vm.parentAcc = vm.statusAcc.slice(0);

	    		vm.statusAcc.forEach(function(a){
	    			a.childs = response.data.filter(function(acc){
	    				return acc.parent_id === a.account_id;
	    			});
	    		});

	    		vm.statusAcc.forEach(function(a){
	    			a.folderClass = "fa-plus",
	    			a.childs.forEach(function(ga){
	    				ga.folderClass = "fa-plus",
		    			ga.childs = response.data.filter(function(acc){
		    				return acc.parent_id === ga.account_id;
		    			});
	    			});
	    		});
	    		console.log('Nested Accounts', vm.statusAcc);
	        }
	        //Response from service was not succesfull
	        else {
	            growl.error(response.message, {ttl:10000});
	        }
	        }, function(error){
	            console.log(error);
	        }
	    );
	}

	vm.toggleChildren = function(data) {
      data.childrenVisible = !data.childrenVisible;
        data.folderClass = data.childrenVisible?"fa-minus":"fa-plus";
    };

	vm.openStart = function() {
		vm.popupStart.opened = true;
	};

	vm.popupStart = {
		opened: false
	};

    //Call initialization
    initController();
}