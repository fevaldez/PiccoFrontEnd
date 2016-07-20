'use strict';
	angular
		.module('RDash')
		.factory('iModalService', iModalService);

	iModalService.$inject = ['ModalService'];
	function iModalService(ModalService) {

		var service = {};
		service.modalPromise = modalPromise;

		return service;

		function modalPromise(title, body, data, sorting, template, controller){
			//Define template to use
            var temp = "templates/customModal.html";
            var ctr = "ModalController";
            if (template !== undefined) temp = template;
            if (controller !== undefined) ctr = controller;

        	console.log("iModalService",data, 'icontroller', ctr);

			return ModalService.showModal({
                templateUrl: temp,
                controller: ctr,
                inputs: {
                    title: title,
                    body: body,
                    data: data,
                    sorting: sorting
                }
            });
		}
	}