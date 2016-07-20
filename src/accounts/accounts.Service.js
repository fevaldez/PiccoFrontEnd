'use strict';

	angular
		.module('RDash')
		.factory('AccountsService', AccountsService);

	AccountsService.$inject = ['$http', 'ENDPOINT_URI', '$q'];
	function AccountsService($http, ENDPOINT_URI, $q) {
		var service = {},
        path = 'accountTypes',
        accPath = 'accounts';

        service.getAccount = getAccount;
        service.getAccountTypes = getAccountTypes;
        service.getInitialBalance = getInitialBalance;
        service.getDebitsCredits = getDebitsCredits;
        service.getFinalBalance = getFinalBalance;

        function getAccountTypeUrl(flag) {
            var statusPath = ENDPOINT_URI + path
            if (flag){
                statusPath += '/';
            }
          return statusPath;
        }
        function getAccountsUrl(flag) {
            var statusPath = ENDPOINT_URI + accPath
            if (flag){
                statusPath += '/';
            }
          return statusPath;
        }

        function getAccount(id){
            return $http.get(getAccountsUrl(true) + id)
                    .then(handleSuccess, handleError);
        }

    	function getAccountTypes(){
			return $http.get(getAccountTypeUrl(false))
					.then(handleSuccess, handleError);
    	}

        function getInitialBalance(acc, bu, startDate){
            console.log('InitialBalance', getAccountsUrl(true) + acc + '/bu/' + bu + '/initialBalance/' + startDate);
            return $http.get(getAccountsUrl(true) + acc + '/bu/' + bu + '/initialBalance/' + startDate)
                    .then(handleSuccess, handleError);
        }
        function getDebitsCredits(acc, bu, startDate, endDate){
            console.log('DebitsCredits', getAccountsUrl(true)  + acc + '/bu/' + bu + '/debitsCredits/' + startDate +'/'+endDate);
            return $http.get(getAccountsUrl(true)  + acc + '/bu/' + bu + '/debitsCredits/' + startDate +'/'+endDate)
                    .then(handleSuccess, handleError);
        }

        /*
        *Gets Final Balance for a specific account in specified period of time
        */
        function getFinalBalance(acc, bu, startDate, endDate){
            //Get Initial Balance and Debits Credits for Specific account in specified period
            var finalBalance;
            var defer = $q.defer();
            $q.all([
                getAccount(acc),
                getInitialBalance(acc, bu, startDate),
                getDebitsCredits(acc, bu, startDate, endDate)
                ])
            .then(function (responses) {
                var account = responses[0].data;
                var initialBalance = responses[1].data;
                var debitsCredits = responses[2].data;

                var credit =parseFloat(debitsCredits[0].credit,10);
                var debit =parseFloat(debitsCredits[0].debit,10);

                finalBalance = parseFloat(initialBalance[0].initial_balance, 10);
                if (account[0].nature){
                    finalBalance = finalBalance +(credit - debit);
                }else {
                    console.log('account.nature',account.nature);
                    finalBalance = finalBalance + (debit - credit);
                }
                
                defer.resolve(finalBalance);
            
             })
            .catch(function (error) {
                console.log('getFinalBalance Error: ', error)
                return defer.reject(error);
             })
            // ['finally'](function(){
            //     console.log('finalBalance for ' + acc, finalBalance);
            //      // $scope.isBusy=false;
            //      return finalBalance;
            //  })
             ;

             return defer.promise;
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