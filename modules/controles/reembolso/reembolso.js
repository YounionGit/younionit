var reembolsoApp = angular.module('ReembolsoApp',['ngGrid']);


reembolsoApp.controller('ReembolsoController', function($rootScope, $scope, $http, $location, $modal, $document, $timeout) {
	
	
	var user = $rootScope.globals.currentUser;   
    
    $scope.gridOptions = {
        data: 'myData',
        enableRowSelection: false,
        enableCellSelection: true,
        rowHeight: 45,
       // plugins: [new ngGridCsvExportPlugin()],
        showFooter: false,
        columnDefs: [
            {field:'id', displayName:'Número'},
            {field:'observacoes', displayName:'Observações', enableCellEdit: true},
            {field:'status', displayName:'Status'},
            {field:'data_pag', displayName:'Data Pagamento', enableCellEdit: false},
            {cellTemplate: 'modules/controles/reembolso/icones_reembolso.html', enableRowSelection: false}]
    };
	
	
    $scope.changeDate = function (){
    	var year = $scope.selectedYear;
    	var month = $scope.selectedMonth;
    	var user = $rootScope.globals.currentUser;
    	
    	
//    	 $http.post("/horarios/fechamento/mes", {user: user, month: month, year: year})
//         .success(function(response) {
//         	$scope.editavel = response.flag;
//        })   	
    	$scope.editavel =true;
        $scope.loadGrid();
    };   
//	$scope.open = function (size) {
//		
//		 var modalInstance = $modal.open({
//		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
//		      controller: 'ModalUsuariosEditarCtrl',
//		      size: size,
//		      resolve: {
//		        usuario: function () {
//		          return {ativo:"1", id_perfil:2};
//		        }
//		      }		 
//		    });
//		 
//		 modalInstance.result.then(function (res) {			
//			 loadGrid();
//	         showSuccess("Usuário criado com sucesso.");
//		 });		 
//	};
//	
//	
//	$scope.editar = function(entity){		
//		var modalInstance = $modal.open({
//		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
//		      controller: 'ModalUsuariosEditarCtrl',		     
//		      resolve: {
//			        usuario: function () {
//			          return entity;
//			        }
//			      }
//		    });	
//		
//		modalInstance.result.then(function (res) {			 
//			 loadGrid();
//	         showSuccess("Usuário atualizado com sucesso.");
//	    });
//		
//	};
//	
//	
//	
//	$scope.mostrar = function(entity){		
//		var modalInstance = $modal.open({
//		      templateUrl: 'modules/admin/usuarios/usuarioMostrar.html',
//		      controller: 'ModalUsuariosMostrarCtrl',	
//		      //size: 'lg',
//		      resolve: {
//			        usuario: function () {
//			          return entity;
//			        }
//			      }
//		    });	
//		
//	};
//	
//	
//	$scope.apagar = function(entity){
//		if(entity.ativo == 0){
//			showError("Usuário já está inativo.")
//		}else{
//			var r = confirm("Deseja desativar o usuário? ","");
//			if(r == true){
//				$http.post('/usuarios/apagar', { entity: entity})
//		        .success(function (res) {
//		        	showSuccess("Usuário desativado com sucesso.");
//		        	loadGrid();
//		        });
//			}
//		}
//	};

	
	$scope.loadGrid = function(){
    	var year = $scope.selectedYear;
    	var month = $scope.selectedMonth;
    	
    	var user = $rootScope.globals.currentUser;
    	
    	$scope.myData = null;
    	
    	$http.post("/reembolso/list", {user: user, month: month, year: year})
         .success(function(response) {
        	 console.log('list')
         	$scope.myData = response;
        });   
              
    }
	
	$scope.selectedYear = new Date().getFullYear();
	    
	$scope.selectedMonth = new Date().getMonth() + 1;
	
	$scope.changeDate();
	
	 function hideMsg() {
         $scope.showMsg = false;
     }
	 
	 function showSuccess(msg){
		$scope.showMsg = true;
		$scope.msgController = msg;
     	$scope.classMsgController = "alert alert-success";
     	$timeout(hideMsg, 3000);
	 }
	 
	 function showError(msg){
			$scope.showMsg = true;
			$scope.msgController = msg;
	     	$scope.classMsgController = "alert alert-danger";
	     	$timeout(hideMsg, 3000);
		 }
	
});

//reembolsoApp.controller('ModalUsuariosMostrarCtrl', function ($scope,$http, $modalInstance, $filter, usuario) {
//	
//	$scope.loadDadosPessoais = function(){
//		$http.post('/usuarios/dados/list', {usuario: usuario})
//	    .success(function (res) {
//	    	
//	    	$scope.usuario = res;
//	    });		
//	};
//	
//	
//	$scope.cancel = function () {
//	    $modalInstance.dismiss('cancel');
//	};
//	
//	
//	$scope.editar = function(){
//		$scope.editavel = ! $scope.editavel;
//		$scope.loadTipoContratacao();
//	};
//	
//	$scope.salvar = function(){		
//		var usuario = $scope.usuario;
//
//		$http.post('/usuarios/dados/salvar', {usuario: usuario})
//	    .success(function (res) {
//	    	$modalInstance.close(res);
//	    });
//	};
//	
//	$scope.loadTipoContratacao = function(){
//		$http.post('/usuarios/dados/contratacao/list')
//	    .success(function (res) {
//	    	$scope.tipoContratacao = res;		    	
//	    });
//		
//	};
//		
//	$scope.loadDadosPessoais();
//	
//});
//
//reembolsoApp.controller('ModalUsuariosEditarCtrl', function ($scope,$http,md5, $modalInstance, usuario) {
//			
//	
//	$scope.save = function(){
//		var usuario = $scope.usuario;
//		
//		if(usuario.senha !== usuario.senha2){
//			$scope.showMsg = "Senha deve ser igual.";
//			$scope.classMsg = "alert alert-danger";
//			
//		}else if(usuario.id_usuario ===undefined && (usuario.senha2 === undefined || usuario.senha === undefined) ){
//			$scope.showMsg = "Informe uma senha para o usuário.";
//			$scope.classMsg = "alert alert-danger";			
//		}else{
//			if(usuario.senha !== undefined){
//				usuario.senhaMD5 = md5.createHash(usuario.senha);
//				usuario.senha = "";
//				usuario.senha2 = "";
//			}
//			$http.post('/usuarios/salvar', {usuario: usuario})
//		    .success(function (res) {		
//		    	console.log(res);
//		    	if(res.code === "ER_DUP_ENTRY"){
//		    		$scope.showMsg = "Este Login já existe";
//					$scope.classMsg = "alert alert-danger";
//		    	}else{
//		    		$modalInstance.close(res);
//		    	}
//		    });
//		}
//	};
//	
//	
//	
//	$scope.loadPerfil = function(){
//		$http.post('/usuarios/perfil/list')
//	    .success(function (res) {	    	
//	    	$scope.perfis = res;
//	    });
//		
//	};
//	
//	$scope.loadItems = function(usuario){
//
//		if(usuario !== undefined){
//			$scope.usuario = usuario;
//		}
//	}
//	
//	$scope.cancel = function () {
//	    $modalInstance.dismiss('cancel');
//	};
//	  
//	$scope.loadPerfil();
//	$scope.loadItems(usuario);
//	
//});