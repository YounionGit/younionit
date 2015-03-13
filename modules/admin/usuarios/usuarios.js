

var usuariosApp = angular.module('UsuariosApp',[]);


usuariosApp.controller('UsuariosCtrl', function($rootScope, $scope, $http, $location, $modal, $document) {
	
	loadGrid();
	
	$scope.open = function (size) {
		
		 var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
		      controller: 'ModalUsuariosEditarCtrl',
		      size: size,
		      resolve: {
		        usuario: function () {
		          return {ativo:"1", id_perfil:2};
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
	
	
	
	$scope.mostrar = function(entity){		
		var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioMostrar.html',
		      controller: 'ModalUsuariosMostrarCtrl',	
		      //size: 'lg',
		      resolve: {
			        usuario: function () {
			          return entity;
			        }
			      }
		    });	
		
	};
	
	
	$scope.apagar = function(entity){
		if(entity.ativo == 0){
			$scope.error = "usuário já está inativo.";
			$scope.classMsg = "alert alert-danger";
		}else{
			var r = confirm("Deseja desativar o usuário? ");
			if(r == true){
				$http.post('/usuarios/apagar', { entity: entity})
		        .success(function (res) {
		        	$scope.error = "usuário desativado no sistema.";
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

usuariosApp.controller('ModalUsuariosMostrarCtrl', function ($scope,$http, $modalInstance, $filter, usuario) {
	
	$scope.loadDadosPessoais = function(){
		$http.post('/usuarios/dados/list', {usuario: usuario})
	    .success(function (res) {    	
	    	$scope.usuario = res;
	    });		
	};
	
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	
	
	$scope.editar = function(){
		$scope.editavel = ! $scope.editavel;
		$scope.loadTipoContratacao();
	};
	
	$scope.salvar = function(){		
		var usuario = $scope.usuario;
		
		$http.post('/usuarios/dados/salvar', {usuario: usuario})
	    .success(function (res) {
	    	$modalInstance.close(res);
	    });
	};
	
	$scope.loadTipoContratacao = function(){
		$http.post('/usuarios/dados/contratacao/list')
	    .success(function (res) {
	    	$scope.tipoContratacao = res;		    	
	    });
		
	};
		
	$scope.loadDadosPessoais();
	
});

usuariosApp.controller('ModalUsuariosEditarCtrl', function ($scope,$http,md5, $modalInstance, usuario) {
			
	
	$scope.save = function(){
		var usuario = $scope.usuario;
		
		if(usuario.senha !== usuario.senha2){
			$scope.error = "Senha deve ser igual.";
			$scope.classMsg = "alert alert-danger";
			
		}else if(usuario.id_usuario ===undefined && (usuario.senha2 === undefined || usuario.senha === undefined) ){
			$scope.error = "Informe uma senha para o usuário.";
			$scope.classMsg = "alert alert-danger";			
		}else{
			if(usuario.senha !== undefined){
				usuario.senha = md5.createHash(usuario.senha);				
			}
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
	    });
		
	};
	
	$scope.loadItems = function(usuario){

		if(usuario !== undefined){
			$scope.usuario = usuario;
		}
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	  
	$scope.loadPerfil();
	$scope.loadItems(usuario);
	
});