

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
			$scope.error = "usuário criado com sucesso.";
	        $scope.classMsg = "alert alert-success";
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
			 $scope.error = "Usuário atualizado com sucesso.";
	         $scope.classMsg = "alert alert-success";
		    });
	};
	
	
	
	$scope.mostrar = function(entity){		
		var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioMostrar.html',
		      controller: 'ModalUsuariosMostrarCtrl',		     
		      resolve: {
			        usuario: function () {
			          return entity;
			        }
			      }
		    });	
		
		modalInstance.result.then(function (res) {			 
			 loadGrid();
			 $scope.error = "Usuário atualizado com sucesso.";
	         $scope.classMsg = "alert alert-success";
		    });
	};
	
	
	$scope.apagar = function(entity){
		if(entity.ativo == 0){
			$scope.error = "usuário já está inativo.";
			$scope.classMsg = "alert alert-danger";
		}else{
			var r = confirm("Deseja apagar o usuário? ","ajsdhjksa");
			if(r == true){
				$http.post('/usuarios/apagar', { entity: entity})
		        .success(function (res) {
		        	$scope.error = "usuário removido com sucesso.";
		        	$scope.classMsg = "alert alert-success";
		        	loadGrid();
		        });
			}
		}
		
	};

	
	function loadGrid(){		
		$http.post('/usuarios/list')
	    .success(function (res) {	    	
	    	$scope.usuarios = res;
	    });				
	};	
	
});

usuariosApp.controller('ModalUsuariosMostrarCtrl', function ($scope,$http, $modalInstance, usuario) {
	
//	$scope.loadDadosPessoais = function(){
//		$http.post('/usuarios/dados/list')
//	    .success(function (res) {    	
//	    	$scope.perfis = res;	
//	    	perfis = res;
//	    });
//		//$scope.perfilModel = 1;
//	};
	
	
});

usuariosApp.controller('ModalUsuariosEditarCtrl', function ($scope,$http, $modalInstance, items) {
	
	var perfis;
	
	//$scope.ativoModel = 1;
	
	
	
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
			
		}if(usuario.id_usuario ===undefined && (senha2 === undefined || usuario.senha === undefined) ){
			$scope.error = "Informe uma senha para o usuário.";
			$scope.classMsg = "alert alert-danger";
			
		}else{

			$http.post('/usuarios/salvar', {usuario: usuario})
		    .success(function (res) {		    	
		    	$modalInstance.close(res);
		    });
		}		
	};
	
	
	$scope.loadPerfil = function(){
		$http.post('/usuarios/perfil/list')
	    .success(function (res) {    	
	    	$scope.perfis = res;	
	    	perfis = res;
	    });
		//$scope.perfilModel = 1;
	};
	
	$scope.loadItems = function(item, perfis){

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
	  
	  

	$scope.loadPerfil();
	$scope.loadItems(items, perfis);
	
});