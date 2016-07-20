
	angular
		.module('RDash')
		.factory('ProjectsService', ProjectsService);

	ProjectsService.$inject = ['$http', 'ENDPOINT_URI', '_', 'moment'];
	function ProjectsService($http, ENDPOINT_URI, _, moment) {
		var service = {},
    	path = 'projects',
    	nestedPath = 'companies/companyId/users',
    	incomePath = 'projects/projectId/income',
		m='',
		editedProject = {};

		//CRUD Functions
		// service.getProject = getProject;
		service.getProject = _.partial(getProject, _, 'Project Details');
		service.getProjects = _.partial(get,'projects', 'Projects');
		service.getActiveProjects = _.partial(get,'projects/active', 'Active Projects');
		service.getProjectIncome = _.partial(getProjectIncome, _, 'Project Income Details');
		service.getActiveProjectsDetail = getActiveProjectsDetail;
		service.addDuration = addDuration;
		// service.getActiveProjects = getActiveProjects;
		// service.getProjectIncome = getProjectIncome;

		return service;

		function get(path, message){
			return $http.get(ENDPOINT_URI + path)
				.then(handleSuccess, handleError('Error while getting '+ message +' list.'));
		}
		
	    function getUrl(flag) {
	    	var userPath = ENDPOINT_URI + path
	    	if (flag){
	    		userPath += '/';
	    	}
	      return userPath;
	    }

	    function getIncomeUrl(projectId) {
	    	var newPath = incomePath.replace("projectId", projectId);
	      return ENDPOINT_URI + newPath;
	    }

	    function getNestedUrlForId(userId, companyId) {
	      return getNestedUrl(companyId) +"/" +userId;
	    }

	  //   function getProject(userId){
			// return $http.get(getUrl(true) + userId)
			// 			.then(handleSuccess, handleError);
	  //   }
	    function getProject(id, message){
	    	return get('projects/'+ id, message)
	    }

	    function getActiveProjects(userId){
			return $http.get(getUrl(true) + 'active')
						.then(handleSuccess, handleError);
			// $http.get(getUrl(true) + 'active')
			// 	.then(
			// 		function(response){
			// 			console.log(response.status);
			// 			response.data;
			// 		}
			// 		,function(error){
			// 			console.log("error from projectsService", error);
			// 		}
			// 	);
	    }

	    function getActiveProjectsDetail(projects){
	    	// return get('projects/active/details', "Active Projects Details");
			return $http.get(getUrl(true) + 'active/details')
						.then(handleSuccess, handleError);
	    }

	  //   function getProjects(){
			// return $http.get(getUrl(true))
			// 	.then(handleSuccess, handleError('Error while getting Projects list.'));
	  //   }

	   //  function getProjectIncome(id){
	   //  	return $http.get(getIncomeUrl(id))
				// .then(handleSuccess, handleError('Error while getting Project details.'));	
	   //  }
	    function getProjectIncome(id, message){
	    	return get('projects/'+ id +'/income', message)
	    }

	    //Transform projects Array by adding 2 fields, project duration in months & days.
	    function addDuration(prjArr){
	    	var _MS_PER_DAY = 1000 * 60 * 60 * 24;
	    	var newData = [];
	   //  	prjArr.forEach(function(p){

	   //  		var a = new Date(p.start_date);
				// var b = new Date(p.end_date);
				// var t = new Date();

				// var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
				// var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
				// var utcToday = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());

				// p.duration = Math.floor((utc2 - utc1) / _MS_PER_DAY);
				// p.lapsed = Math.floor((utcToday - utc1) / _MS_PER_DAY);
				// if (p.duration == 0)
				// 	p.duration=1;

	   //  		// console.log('DURATION', p.full_name, p.duration, p.lapsed);
	   //  	});

	    	angular.forEach(prjArr, function(val, key){
        		var newItem = {};
        		newItem.top_parent_id = val.top_parent_id;
        		newItem.id = val.id;
        		newItem.name = val.name;

        		newItem.full_name = val.full_name;
        		newItem.start_date = val.start_date;
        		newItem.end_date = val.end_date;

        		newItem.income = val.income;
        		newItem.outcome = val.outocme;
        		newItem.balance = val.balance;
        		newItem.budget = val.budget;

        		//Set new variables        		
	    		var a = new Date(val.start_date);
				var b = new Date(val.end_date);
				var t = new Date();

				var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
				var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
				var utcToday = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());

				newItem.duration = Math.floor((utc2 - utc1) / _MS_PER_DAY);
				newItem.lapsed = Math.floor((utcToday - utc1) / _MS_PER_DAY);
				if (newItem.duration == 0)
					newItem.duration=1;

				newData.push(newItem);
	    	});

	    	// console.log('Projects with DURATION', prjArr);
	    	return newData;

	    }

        // PRIVATE FUNCTIONS
        function handleSuccess(res, message) {
            // return { success: true, data: res.data.data };
            return { success: true, data: res.data, message: message };
        }

        function handleError(error) {
        	console.log(error);
        	
        	if (angular.isDefined(error.data) && angular.isDefined(error.data.message) ) {
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
        		m=error;
	            return function () {
	                return { success: false, message: m };
	            };
        	}
        }
	}