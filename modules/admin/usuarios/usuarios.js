

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
	
	loadPerfil();
	loadItems(items);
	
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
		}
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	
});