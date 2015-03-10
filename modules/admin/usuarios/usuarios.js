

var usuariosApp = angular.module('UsuariosApp',[]);


usuariosApp.controller('UsuariosCtrl', function($rootScope, $scope, $http, $location) {
	
	loadGrid();
	
	$scope.save = function(){
		
		var usuario = {};
		
		var login = $scope.login;
		var nome = $scope.nome;
		var senha = $scope.password;
		var senha2 = $scope.password2;
		
		usuario.nome = $scope.nome;
		usuario.login = $scope.login;
		usuario.senha = $scope.password;
		usuario.perfil = $scope.perfilModel;
			
		//console.log(Base64.encode(senha));
		
		if(senha !== senha2){
			$scope.error = "Senha deve ser igual.";
		}else{
			
			$http.post('/usuarios/salvar', {usuario: usuario})
		    .success(function (res) {
		    	console.log(res);
		    });
		}
		
		loadGrid();
		
	};
	
	$scope.open = function () {
		console.log("open...");
	    
	};
	
	function loadGrid(){
		$http.post('/usuarios/list')
	    .success(function (res) {	    	
	    	$scope.usuarios = res;
	    });
		
		$http.post('/usuarios/perfil/list')
	    .success(function (res) {	    	
	    	$scope.perfis = res;	    	
	    });
		$scope.perfilModel = 1;
		
	};
	
});