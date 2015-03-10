

var usuariosApp = angular.module('UsuariosApp',[]);


usuariosApp.controller('UsuariosCtrl', function($rootScope, $scope, $http, $location, $modal, $document) {
	
	loadGrid();
	
	$scope.open = function (size) {		
		 var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
		      controller: 'ModalUsuariosEditarCtrl',
		      size: size,
		      resolve: {
		        items: function () {
		          return $scope.items;
		        }
		      }		 
		    });
		 
		 modalInstance.result.then(function (res) {			
			 loadGrid();
		    });		 
	};
	
	
	$scope.editar = function(entity){		
		var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
		      controller: 'ModalUsuariosEditarCtrl',		     
		      resolve: {
			        items: function () {
			          return entity;
			        }
			      }
		    });	
		
		modalInstance.result.then(function (res) {			 
			 loadGrid();
		    });
	};
	
	$scope.apagar = function(entity){	
		var r = confirm("Deseja apagar o usuário? ","ajsdhjksa");
		if(r == true){
			$http.post('/usuarios/apagar', { entity: entity})
	        .success(function (res) {
	        	$scope.error = "usuário removido com sucesso.";
	        	$scope.classMsg = "alert alert-success";
	        	loadGrid();
	        });
		}
	};

	
	function loadGrid(){
		console.log("loadGrid");
		$http.post('/usuarios/list')
	    .success(function (res) {	    	
	    	$scope.usuarios = res;
	    });				
	};	
	
});



usuariosApp.controller('ModalUsuariosEditarCtrl', function ($scope,$http, $modalInstance, items) {
	
	$scope.ativoModel = 1;
	loadPerfil();
	loadItems(items);
	
	$scope.save = function(){

		var usuario = {};
		
		usuario.login = $scope.login;
		usuario.nome = $scope.nome;
		usuario.senha = $scope.password;
		var senha2 = $scope.password2;
		usuario.perfil = $scope.perfilModel;
		usuario.ativo = $scope.ativoModel;
		usuario.id_usuario = $scope.id_usuario;
		
		//console.log(Base64.encode(senha));
		
		if(usuario.senha !== senha2){
			$scope.error = "Senha deve ser igual.";
			$scope.classMsg = "alert alert-danger";
		}else{
			
			$http.post('/usuarios/salvar', {usuario: usuario})
		    .success(function (res) {		    	
		    	$modalInstance.close(res);
		    });
		}		
	};
	
	
	function loadPerfil(){
		$http.post('/usuarios/perfil/list')
	    .success(function (res) {
	    	$scope.perfis = res;	    	
	    });
		$scope.perfilModel = 1;
	};
	
	function loadItems(item){

		if(item !== undefined){
			$scope.login = item.login;
			$scope.nome = item.nome;
			$scope.perfilModel = item.id_perfil;
			$scope.ativoModel = item.ativo;
			$scope.id_usuario = item.id_usuario;
		}
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	
});