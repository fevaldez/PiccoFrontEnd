'use strict';		
    angular
        .module('RDash')
        .controller('NgTableModalController', NgTableModalController);
        
    NgTableModalController.$inject = ['$scope', 'close', 'title','body', 'data', 'sorting', 'NgTableParams'];
    function NgTableModalController($scope, close, title, body, data, sorting, NgTableParams) {
        $scope.title = title;
        $scope.body = body;
        $scope.data = data;
        $scope.sorting = sorting;

    	$scope.close = function(result) {
		 	close(result, 500); // close, but give 500ms for bootstrap to animate
		};
        $scope.myFilter = function (item) { 
            if (item.id_proyecto === null)
                return true;
            else
                return;
        }
        $scope.filterNull = function (item) { 
            if (item.id_proyecto === null)
                return;
            else
                return true;
        }
        $scope.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: $scope.sorting,//{ id: "desc" },
            filter: {
                account: ''
            }
        }, {
            counts: [], // hide page counts control
            total: $scope.data.length,  // value less than count hide pagination
            filterDelay: 300,
            data: $scope.data
        });
    }
