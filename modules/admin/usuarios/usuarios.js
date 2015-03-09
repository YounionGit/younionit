

var usuariosApp = angular.module('UsuariosApp',[]);

usuariosApp.controller('UsuariosCtrl', function($rootScope, $scope, $http, $location) {
	
	loadGrid();
	
	$scope.save = function(){
		
		var login = $scope.login;
		var nome = $scope.nome;
		var senha = $scope.password;
				
		loadGrid();
		
	};
	
	function loadGrid(){
		$http.post('/usuarios/list')
	    .success(function (res) {
	    	console.log(res);    	
	    	$scope.usuarios = res;
	    });
	};
	
});