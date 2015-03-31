var senhaModule = angular.module('TrocarSenhaModule', ['angular-md5']);

senhaModule.controller('TrocarSenhaController', function($rootScope, $scope, $http, md5) {
	$scope.usuario = $rootScope.globals.currentUser;
	var usuario = $scope.usuario;
	
	$scope.save = function(){
		console.log(usuario.id_usuario);
		if(usuario.senha !== usuario.senha2){
			$rootScope.showError("Senha deve ser igual.", $scope);
			
		}else if(usuario.id === undefined || (usuario.senha2 === undefined || usuario.senha === undefined) ){
			$rootScope.showError("Informe uma senha para o usuário.", $scope);
		}else{
			if(usuario.senha !== undefined){
				usuario.senhaMD5 = md5.createHash(usuario.senha);
				usuario.senha = "";
				usuario.senha2 = "";
			}
			$http.post('/usuarios/trocar/senha', {usuario: usuario})
		    .success(function (res) {		
		    	$rootScope.showSuccess("Senha trocada com sucesso ;)", $scope);
		    	
		    });
		}
	};
	
	
	
	$scope.loadPerfil = function(){
		$http.post('/usuarios/perfil/list')
	    .success(function (res) {	    	
	    	$scope.perfis = res;
	    });
		
	};
	
	  
	$scope.loadPerfil();
	
});