
	//angular.module('authApp').service('ModalService', ['$modal',

    angular.module('RDash')
      .controller('MyModalController', MyModalController)
      .directive('modalTrigger', modalTriggerDirective)
      .factory('$myModal', myModalFactory)
    ;

    MyModalController.$inject['$uibModalInstance', 'items'];
    function MyModalController($uibModalInstance, items) {
      var vm = this;
      vm.content = items;
      //vm.confirm = $uibModalInstance.close;
      //vm.cancel = $uibModalInstance.dismiss;
        vm.confirm = function () {
            $uibModalInstance.close(true);
        }
        vm.cancel = function () {
            $uibModalInstance.dismiss(false);
        }
    };

    modalTriggerDirective.$inject['$myModal'];
    function modalTriggerDirective($myModal) {
      function postLink(scope, iElement, iAttrs) {
        function onClick() {
          var size = scope.$eval(iAttrs.size) || 'lg'; // default to large size
          var title = scope.$eval(iAttrs.title) || 'Default Title';
          var message = scope.$eval(iAttrs.message) || 'Default Message';
          $myModal.open(size, title, message);
        }
        iElement.on('click', onClick);
        scope.$on('$destroy', function() {
          iElement.off('click', onClick);
        });
      }

      return {
        link: postLink
      };
    }

    myModalFactory.$inject['$uibModal'];
    function myModalFactory($uibModal) {
      var open = function (size, title, message) {
        return $uibModal.open({
          controller: 'MyModalController',
          controllerAs: 'vm',
          templateUrl : 'modal/CustomModal.html',
          size: size,
          resolve: {
            items: function() {
              return {
                title: title,
                message: message
              };
            }
          }
        });
      };

      return {
        open: open
      };
    }

