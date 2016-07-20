/**
 * Widget Directive
 */

angular
    .module('RDash')
    .directive('rdWidgetClick', rdWidgetClick);

function rdWidgetClick() {
    var directive = {
        transclude: true,
        template: '<div class="widget widget-click" ng-transclude></div>',
        restrict: 'EA'
    };
    return directive;

    function link(scope, element, attrs) {
        /* */
    }
};