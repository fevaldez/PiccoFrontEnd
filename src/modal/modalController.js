'use strict';		
    angular
        .module('RDash')
        .controller('ModalController', ModalController);
        
    ModalController.$inject = ['$scope', 'close', 'title','body', 'data'];
    function ModalController($scope, close, title, body, data) {
        $scope.title = title;
        $scope.body = body;
        $scope.data = data;
        // console.log($scope.data);
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
    }
