// main.js
var controlerApp = angular.module('LiberacaoControllerApp', ['ngGrid']);

controlerApp.controller('LiberacaoController', function($rootScope, $scope, $http, $location, $timeout) {
	 $scope.var1 = '07-2013';
	var user = $rootScope.globals.currentUser;        
    
	$scope.getColaborador = function(val) {
	    return $http.post('/usuarios/list/typeahead', {
	      params: {
	    	nome: val
	      }
	    }).then(function(response){
	    	return response.data.map(function(item){
	            return item.nome;
	          });
	    });
	  };
	
	  $scope.today = function() {
		    $scope.dt = new Date();
		  };
		  $scope.today();

		  $scope.clear = function () {
		    $scope.dt = null;
		  };

		  // Disable weekend selection
		  $scope.disabled = function(date, mode) {
		    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
		  };

		  $scope.toggleMin = function() {
		    $scope.minDate = $scope.minDate ? null : new Date();
		  };
		  $scope.toggleMin();

		  $scope.open = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();

		    $scope.opened = true;
		  };

		  $scope.dateOptions = {
		    formatYear: 'MM-yyyy',
		    startingDay: 1
		  };

		  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		  $scope.format = $scope.formats[0];
});
