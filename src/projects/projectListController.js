
    angular
        .module('RDash')
        .controller('ProjectListController', ProjectListController);

    ProjectListController.$inject = ['ProjectsService', 'growl', 'active', 'iModalService'];
    function ProjectListController(ProjectsService, growl, active, iModalService) {

        var vm = this;
        vm.projects = [];
        vm.active;
        vm.projectIncome = [];
        vm.outcome_sub_details=[];
        vm.totalIncome = [];
        vm.totalOutcome = [];

        function initController() {

            //Get Pojects
            getProjects();
        }

        //Start_Date picker popup
		vm.open2 = function() {
			vm.popup2.opened = true;
		};
		vm.popup2 = {
			opened: false
		};
        //End_Date picker popup
		vm.openEndDate = function() {
			vm.ppEndDate.opened = true;
		};
		vm.ppEndDate = {
			opened: false
		};

        function loadActive(){
            //If project Id specified simulate click
            if (active !== undefined){
                vm.active = active;
                
                var index = vm.projects.map(function(prj){
                    return prj.id;
                }).indexOf(parseInt(active));

                // console.log('Active ID', active,'Index', index,'Active Project', vm.projects[index]);
                vm.openPrj(vm.projects[index]);
            }
        }

        /*
        * Call service function to get all users
        */
        function getProjects() {

            ProjectsService.getProjects()
            .then(function(response){

                if (response.success){
                    //Assign returnes companies
                    vm.projects = response.data.data;
                    // initProjectsTable(response.data.data);
                    // console.log(response.data.data);
                    loadActive();
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

        function getProjectIncome(id) {

            clearModel();

            ProjectsService.getProjectIncome(id)
            .then(function(response){

                if (response.success){
                    //Assign returnes companies
                    vm.projectIncome = response.data.data;
                    var res = response.data.data;
                    var i =[];
                    var o =[];
                    var i_l3 =[];
                    var o_l3 =[];
                    res.reduce(function(income, entry){
                        if (
                            entry.parent_id == null &&
                            entry.parent_account == null &&
                            entry.sub_account_name == null &&
                            entry.account == null &&
                            entry.account_name == null &&
                            entry.id_proyecto == null &&
                            entry.nombre == null)
                        {
                            console.log("top parent Summary", entry);
                            if (entry.top_parent_id == 355){
                                vm.totalIncome = {
                                    'top_account_name':entry.top_account_name,
                                    'balance':entry.balance
                                };
                            } else if (entry.top_parent_id == 366){
                                vm.totalOutcome = {
                                    'top_account_name':entry.top_account_name,
                                    'balance':entry.balance
                                };
                            }
                        }
                        else if (entry.top_parent_id == 355){
                            
                            i.push({
                                'account': entry.account_name,
                                'balance': entry.balance
                            })
                        }else if (
                            entry.top_parent_id == 366 &&
                            entry.account == null &&
                            entry.nombre == null
                            ) {
                            o.push({
                                'account': entry.sub_account_name,
                                'balance': entry.balance
                            })
                        }

                    },{})
                    vm.income = i;
                    vm.outcome = o;
                    console.log('Total Income', JSON.stringify(vm.totalIncome, null, 2), 'Total Outcome', JSON.stringify(vm.totalOutcome, null, 2));

                    o_l3 = res
                    .filter(function(rec){
                        return rec.top_parent_id == 366
                    })
                    .reduce( function(sub_details, rec) {
                        sub_details[rec["sub_account_name"]] = sub_details[rec["sub_account_name"]] || []
                        sub_details[rec["sub_account_name"]].push({
                            account: rec["account"],
                            account_name: rec["account_name"],
                            cargo: rec["cargo"],
                            abono: rec["abono"],
                            balance: rec["balance"]
                        })

                        return sub_details;
                    }, {});
                    vm.outcome_sub_details = o_l3;
                    // console.log('details l3', JSON.stringify(o_l3, null, 2) );

                }
                //Response from service was not succesfull
                else {
                    growl.error(response.message, {ttl:9000});
                }
                }, function(error){
                    console.log(error);
                }
            );
        }

        vm.getSubDetails = function(account_l2){

            var data,
                title,
                body,
                template;

            title       = "Detalle de Cuenta " + account_l2;
            template    = "templates/clickModal.html";
            var accounts = vm.projectIncome
            .filter(function(rec){
                return (rec.top_parent_id == 366 && rec.sub_account_name == account_l2)
            })
            .reduce( function(sub_details, rec) {
                sub_details[rec["sub_account_name"]] = sub_details[rec["sub_account_name"]] || []
                sub_details[rec["sub_account_name"]].push({
                    account: rec["account"],
                    account_name: rec["account_name"],
                    cargo: rec["cargo"],
                    abono: rec["abono"],
                    balance: rec["balance"]
                })

                return sub_details;
            }, {});
            data        = accounts[account_l2];

            console.log('details function', accounts );
            console.log('details function', data );
            // console.log('details function', JSON.stringify(accounts, null, 2) );

            iModalService.modalPromise(title, body, data, { account_name: 'asc' },'templates/ngTableModal.html', 'NgTableModalController')
            .then(function(modal){
                modal.element.modal();
            });
        };

        vm.openPrj = function(item){
            console.log('current Project', item);
	        if (vm.isOpen(item)){
	            vm.openedPrj = undefined;
	        } else {
	            vm.openedPrj = item;
                getProjectIncome(item.id);
	        }        
    	};
    
	    vm.isOpen = function(item){
	        return vm.openedPrj === item;
	    };
        vm.anyItemOpen = function() {
            return vm.openedPrj !== undefined;
        };

        function clearModel(){
            vm.totalIncome = [];
            vm.totalOutcome = [];
        }

        //Call initialization
        initController();
    }