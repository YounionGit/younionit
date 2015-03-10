

var usuariosApp = angular.module('UsuariosApp',[]);


usuariosApp.controller('UsuariosCtrl', function($rootScope, $scope, $http, $location, $modal,$dialogs) {
	
	loadGrid();
	$scope.nome = "aslkjdklasds";
	
	$scope.open = function (size) {
		console.log("open...");		
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
	    
	};
	
	$scope.editar = function(entity){
		console.log("editar");
		
		var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
		      controller: 'ModalUsuariosEditarCtrl',		     
		      resolve: {
			        items: function () {
			          return entity;
			        }
			      }
		    });
		
	};
	
	$scope.apagar = function(entity){
		console.log("apagar");
		console.log(entity);		
		
	};
	
	function loadGrid(){
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
		console.log("salvar....")
		var usuario = {};
		
		var login = $scope.login;
		var nome = $scope.nome;
		var senha = $scope.password;
		var senha2 = $scope.password2;
		
		usuario.nome = $scope.nome;
		usuario.login = $scope.login;
		usuario.senha = $scope.password;
		usuario.perfil = $scope.perfilModel;
			
		console.log(usuario);
		//console.log(Base64.encode(senha));
		
		if(senha !== senha2){
			$scope.error = "Senha deve ser igual.";
		}else{
			
			$http.post('/usuarios/salvar', {usuario: usuario})
		    .success(function (res) {
		    	console.log(res);
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
		$scope.login = item.login;
		$scope.nome = item.nome;		
		$scope.perfilModel = item.id_perfil;
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	
});