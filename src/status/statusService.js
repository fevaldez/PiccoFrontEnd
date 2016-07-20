'use strict';

	angular
		.module('RDash')
		.factory('StatusService', StatusService);

	StatusService.$inject = ['$http', 'ENDPOINT_URI'];
	function StatusService($http, ENDPOINT_URI) {
		var service = {},
    	path = 'accountStatus';

    	service.getAccountStatus = getAccountStatus;
    	service.getAccountStatusByRange = getAccountStatusByRange;

	    function getUrl(flag) {
	    	var statusPath = ENDPOINT_URI + path
	    	if (flag){
	    		statusPath += '/';
	    	}
	      return statusPath;
	    }

    	function getAccountStatus(){

			// $http.get(getUrl(false))
			// .then(function(response){
			// 	console.log('Account Status Response: ', response);
			// 	// var accountStatus = response.data.reduce(function(status, acc){
			// 	// 	var subacc = [];
			// 	// 	status[acc.top_parent_id][acc.parent_id] = status[acc.top_parent_id][acc.parent_id] || [][];
			// 	// 	//L2					
			// 	// 	// var subacc =
			// 	// 	// status[acc.top_parent_id][acc.parent_id] = status[acc.parent_id] || [];

			// 	// 	//TOP
			// 	// 	status[acc.top_parent_id][acc.parent_id].push({
			// 	// 		acc_id : acc.acc_id,
			// 	// 		acc : acc.account,
			// 	// 		description : acc.description
			// 	// 	});
			// 	// 	return status;
			// 	// }, {});

			// 	// console.log('Nested Account Status', JSON.stringify(accountStatus, null, 2));
			// 	return response.data;
			// }, function(error){

			// });

			return $http.get(getUrl(false))
					.then(handleSuccess, handleError);
    	}

    	function getAccountStatusByRange(company, businessUnit, start, end){
    		start = start.getFullYear()  + ("0" + (start.getMonth() + 1)).slice(-2);

    		var url = '';
    		if (end){
    			end = end.getFullYear()  + ("0" + (end.getMonth() + 1)).slice(-2);
    			url = getUrl(true) + company + '/' + businessUnit + '/'+ start +'/'+ end;
    		}else{
    			url = getUrl(true) + company + '/' + businessUnit + '/'+ start;
    		}
    		console.log('URL: ', url);

			return $http.get( url )
					.then(handleSuccess, handleError);
    	}

    	return service;

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