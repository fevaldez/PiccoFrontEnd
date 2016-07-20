
angular
    .module('RDash')
    .controller('StatusByRangeController', StatusByRangeController);


StatusByRangeController.$inject = ['growl', 'StatusService', 'AccountsService', '$filter', '$q', '_'];
function StatusByRangeController(growl, StatusService, AccountsService, $filter, $q, _) {
	var vm = this;
	vm.statusAcc = [];
	vm.parentAcc = [];
	vm.statusStartDate;
	vm.statusEndDate;
	vm.startDateLabel;
	vm.endDateLabel;
	vm.statusType;
	vm.statusTypes = [
		'ERP',
		'FNR',
		'CONSOLIDADO'
	];
	vm.businessUnit;
	vm.businessUnits = 
	// {
	// 	'01':'Pico Total',
	// 	'0101':'Construccion',
	// 	'0103':'Servicios'
	// };
	[{
        Id: '01',
        Name: 'Pico Total'
    	}, {
        Id: '0101',
        Name: 'Construccion'
    	}, {
        Id: '0103',
        Name: 'Servicios'
    }];
	vm.accountTypes = [];

	function sum(numbers) {
	    return _.reduce(numbers, function(result, current) {
	        return result + parseFloat(current);
	    }, 0);
	}

    function initController() {

        //Get Pojects
        getAccountTypes();
    }

    function getAccountTypes(){
    	if (!vm.accountTypes || vm.accountTypes.length <1 ){
			AccountsService.getAccountTypes()
		    .then(function(response){
		        if (response.success){
		        	vm.accountTypes = response.data;
		        }
		        //Response from service was not succesfull
		        else {
		            growl.error(response.message, {ttl:4000});
		        }

    		}, function(error){
				console.log(error);
		    }
		    );
    	}
    }

    function cmp_num(a, b) {
    return a == b ?  0
         : a <  b ? -1
         :          +1
	}
	function cmp(a, b) {
	    return cmp_num(a.sub_tipo_cuenta, b.sub_tipo_cuenta)
	        || cmp_num( a.parent_id,     b.parent_id);
	}

    vm.getStatusByRange = function() {

    	var errorMsg;
    	if (! vm.statusStartDate){
            growl.error('Por favor selecciona una fecha de inicio.', {ttl: 3500});
    	}else if (Date.parse(vm.statusStartDate) > Date.parse(vm.statusEndDate) ){
            growl.error('La fecha de inicio debe ser mayor a la de fin.', {ttl: 3500});
    	}else if (! vm.statusEndDate && vm.isVisible){
            growl.error('Por favor selecciona una fecha de fin.', {ttl: 3500});
    	} else {

    		//CONSOLIDATED vm.isVisible
    		if (vm.statusType === 'CONSOLIDADO'){
				$q.all([StatusService.getAccountStatusByRange('ERP', vm.businessUnit.Id, vm.statusStartDate, vm.statusEndDate),
					StatusService.getAccountStatusByRange('FNR', vm.businessUnit.Id, vm.statusStartDate, vm.statusEndDate)])
				 .then(function (responses) {
		        	var statusERP = responses[0].data;
		        	var statusFNR = responses[1].data;
		        	var mergedStatus = statusERP.concat(statusFNR);

		        	//Remove summary rows except Grand Total
		        	var filteredStatus = mergedStatus.filter(function(a){
		        		return (a.account_id !== null || a.account === "9999");
		        	});
		        	var summaryStatus = filteredStatus.filter(function(a){
		        		return (a.parent_id === null || a.top_parent_id === null) && a.account !== "9999";
		        	});

		        	//UNDERSCORE GROUPBY
		        	var result = _.chain(filteredStatus)
					    .groupBy("account")
					    .map(function(value, key) {

					        return {
					            tipo_cuenta: _.pluck(value, "tipo_cuenta")[0],
					            sub_tipo_cuenta: _.pluck(value, "sub_tipo_cuenta")[0],
					            top_parent_id: _.pluck(value, "top_parent_id")[0],
					            parent_id: _.pluck(value, "parent_id")[0],
					            account_id: _.pluck(value, "account_id")[0],
					            account: key,
					            description: _.pluck(value, "description")[0],
					            cargo: sum(_.pluck(value, "cargo")),
					            abono: sum(_.pluck(value, "abono")),
					            balance: sum(_.pluck(value, "balance"))
					        }
					    })
				    .value();
				    console.log('result', result);

				    //Summaries
		        	var summaries = _.chain(summaryStatus)
					    .groupBy("sub_tipo_cuenta")
					    .map(function(value, key) {

					        return {
					            tipo_cuenta: _.pluck(value, "tipo_cuenta")[0],
					            sub_tipo_cuenta: key,
					            top_parent_id: null,
					            parent_id: 999,
					            account_id: null,
					            account: null,
					            description: _.pluck(value, "description")[0],
					            cargo: sum(_.pluck(value, "cargo")),
					            abono: sum(_.pluck(value, "abono")),
					            balance: sum(_.pluck(value, "balance"))
					        }
					    })
				    .value();
				    console.log('summaries', summaries);
				    result = result.concat(summaries);

		            //Get Major Accounts
		            // vm.statusAcc = response.data.filter(function(acc){
		            vm.statusAcc = result.filter(function(acc){
		            	return acc.parent_id === null || acc.top_parent_id === null;
		            });

		            // Copy of Major Accounts
		            // vm.parentAcc = vm.statusAcc.slice(0);

		    		vm.statusAcc.forEach(function(a){
		    			if (a.account === "9999"){
		    				a.sub_tipo_cuenta=999;
		    			}
		    			if (a.account_id === null){
			    			var at = _.find(vm.accountTypes, function(at){
			    				return (at.tipo_cuenta === a.tipo_cuenta && at.sub_tipo_cuenta == a.sub_tipo_cuenta);
			    			});
			    			console.log('Parent Accounts: ', a, 'Subtipo cuenta: ', at);
			    			if (at)
			    				a.description = 'SUMA ' + at.descripcion_subtipo;
		    			}
		    			//Only Major accounts, exclude summary records
		    			if (a.top_parent_id !== null){
			    			a.childs = result.filter(function(acc){
			    				return acc.parent_id === a.account_id;
			    			});
		    			}
		    		});

		            //SORT
		            vm.statusAcc = vm.statusAcc.sort(cmp);

		    		vm.statusAcc.forEach(function(a){
		    			//Only Major accounts, exclude summary records
		    			if (a.top_parent_id !== null){
			    			a.folderClass = "fa-plus",
			    			a.childs.forEach(function(ga){
			    				ga.folderClass = "fa-plus",
				    			ga.childs = result.filter(function(acc){
				    				return acc.parent_id === ga.account_id;
				    			});
			    			});
		    			}
		    		});
		    		console.log('Nested Accounts', vm.statusAcc);

		    		var start = $filter('date')(vm.statusStartDate, 'MMM yyyy');
		    		//
		    		if (vm.isVisible){
		    			var end = $filter('date')(vm.statusEndDate, 'MMM yyyy');
		    			vm.startDateLabel = "Fecha Incio: " + start;
		    			vm.endDateLabel = "Fecha Fin: " + end;
		    		}
		    		else {
		    			vm.startDateLabel = "Fecha: " + start;
		    		}
				 }).catch(function (data) {
					 // $scope.applications = null;
					 // $scope.environments = null;
				 })['finally'](function(){
					 // $scope.isBusy=false;
				 });
    		}
    		else {
		    StatusService.getAccountStatusByRange(vm.statusType, vm.businessUnit.Id, vm.statusStartDate, vm.statusEndDate)
		    .then(function(response){

		        if (response.success){
		        	var statusERP = response.data;

		            //Get Major Accounts
		            // vm.statusAcc = response.data.filter(function(acc){
		            vm.statusAcc = statusERP.filter(function(acc){
		            	return acc.parent_id === null || acc.top_parent_id === null;
		            });
		            // Copy of Major Accounts
		            // vm.parentAcc = vm.statusAcc.slice(0);

		    		vm.statusAcc.forEach(function(a){
		    			if (a.account === "9999"){
		    				a.sub_tipo_cuenta=999;
		    			}
		    			if (a.account_id === null){
			    			var at = _.find(vm.accountTypes, function(at){
			    					return (at.tipo_cuenta === a.tipo_cuenta && at.sub_tipo_cuenta === a.sub_tipo_cuenta);
			    				});
			    			console.log('Parent Accounts: ', a, 'Subtipo cuenta: ', at);
			    			if (at){
			    				a.description = 'SUMA ' + at.descripcion_subtipo;
			    				a.account = at.cuenta_final+1;
			    			}
		    			}
		    			//Only Major accounts, exclude summary records
		    			if (a.top_parent_id !== null){
			    			a.childs = response.data.filter(function(acc){
			    				return acc.parent_id === a.account_id;
			    			});
		    			}
		    		});


		    		vm.statusAcc.forEach(function(a){
		    			//Only Major accounts, exclude summary records
		    			if (a.top_parent_id !== null){
			    			a.folderClass = "fa-plus",
			    			a.childs.forEach(function(ga){
			    				ga.folderClass = "fa-plus",
				    			ga.childs = response.data.filter(function(acc){
				    				return acc.parent_id === ga.account_id;
				    			});
			    			});
		    			}
		    		});

		            //SORT
		            vm.statusAcc = _.sortBy(vm.statusAcc, 'account');
		    		console.log('Nested Accounts', vm.statusAcc);

		    		var start = $filter('date')(vm.statusStartDate, 'MMM yyyy');
		    		//
		    		if (vm.isVisible){
		    			var end = $filter('date')(vm.statusEndDate, 'MMM yyyy');
		    			vm.startDateLabel = "Fecha Incio: " + start;
		    			vm.endDateLabel = "Fecha Fin: " + end;
		    		}
		    		else {
		    			vm.startDateLabel = "Fecha: " + start;
		    		}
		        }
		        //Response from service was not succesfull
		        else {
		            growl.error(response.message, {ttl:4000});
		        }
		        }, function(error){
		            console.log(error);
		        }
		    );
		    	}// end if consolidated 
		}
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
	vm.openEnd = function() {
		vm.popupEnd.opened = true;
	};

	vm.popupEnd = {
		opened: false
	};

    vm.isVisible = true;
    vm.ShowHide = function () {
        //If DIV is hidden it will be visible and vice versa.
        // vm.isVisible = vm.isVisible ? false : true;

        if (vm.isVisible){
        	vm.isVisible = false;
        	vm.statusEndDate = '';
        }else{
        	vm.isVisible = true;
        }
    }

    //Call initialization
    initController();
}