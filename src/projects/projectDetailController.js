
angular
    .module('RDash')
    .controller('ProjectDetailController', ProjectDetailController);


ProjectDetailController.$inject = ['growl', 'UsersService', 'project'];
function ProjectDetailController(growl, UsersService, project) {
    var vm = this;

    console.log(project);

    if (project.success) {

        vm.pt = project.data.data;
    }else {

        growl.error(project.message, {ttl:8000});
    }
}