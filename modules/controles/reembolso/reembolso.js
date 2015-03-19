var reembolsoApp = angular.module('ReembolsoApp',['ngGrid']);


reembolsoApp.controller('ReembolsoController', function($rootScope, $scope, $http, $location, $modal, $document, $timeout) {
	
	
	var user = $rootScope.globals.currentUser;   
    
	
    $scope.gridOptions = {
        data: 'myData',
        enableRowSelection: false,
        enableCellSelection: true,
       // plugins: [new ngGridCsvExportPlugin()],
        showFooter: false,
        columnDefs: [
            {field:'id', displayName:'Número', width: 70, cellTemplate: 'modules/controles/reembolso/id_open_modal.html'},
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
    
    
		$scope.open = function (size) {
			console.log('chamou open');
			 var modalInstance = $modal.open({
			      templateUrl: 'modules/controles/reembolso/reembolsoLista.html',
			      controller: 'ModalReembolsoAddList',
			      size: size,
			      resolve: {
			        usuario: function () {
			          return {ativo:"1", id_perfil:2};
			        }
			      }		 
			    });
			 
			 modalInstance.result.then(function (res) {			
				 loadGrid();
		         showSuccess("Usuário criado com sucesso.");
			 });		 
		};
	
	
	$scope.editar = function(entity){		
		var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
		      controller: 'ModalReembolsoAddList',		     
		      resolve: {
			        usuario: function () {
			          return entity;
			        }
			      }
		    });	
		
		modalInstance.result.then(function (res) {			 
			 loadGrid();
	         showSuccess("Usuário atualizado com sucesso.");
	    });
		
	};
//	
//	
//	
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
		
	};
//	
//	
    $scope.apagar = function (entity, rowid){
    	if(entity.id === undefined){
    		$scope.myData.splice(rowid,1);
    	}else{
    		var r = confirm("Deseja apagar o registro? \n\n Atividade:  "+entity.atividade);
    		
    		if (r == true) {
    			$http.post('/reembolso/apagar', { entity: entity})
    			.success(function (res) {
    				$scope.msgController = "Reembolso removido com sucesso.";
    				$scope.classMsgController = "alert alert-success";
    			});
    			$scope.myData.splice(rowid,1);
    		}
    		$timeout(hideMsg, 5000);    		
    	}
    	    	
    };

	
	$scope.loadGrid = function(){
    	var year = $scope.selectedYear;
    	var month = $scope.selectedMonth;
    	
    	var user = $rootScope.globals.currentUser;
    	
    	$scope.myData = null;
    	
    	$http.post("/reembolso/list", {user: user, month: month, year: year})
         .success(function(response) {
        	 
         	$scope.myData = response;
        });   
              
    }
	
	$scope.selectedYear = new Date().getFullYear();
	    
	$scope.selectedMonth = new Date().getMonth() + 1;
	
	$scope.changeDate();
	
	
	
	
	$scope.add = function (){
    	
    	var id = user.id;
    	
        var newRow = [{id_usuario: id}];
        
        $scope.myData = $scope.myData.concat(newRow);
        
    };
    
   $scope.salvar = function (entity){
    	
    	if(validaTabela(entity, $scope)){
    		$http.post('/controle/reembolso/salvar', { entity: entity})
            .success(function (res) {
            	$scope.msgController = "Reembolso criado com sucesso. Agora preencha os itens de reembolso.";
            	$scope.classMsgController = "alert alert-success";
            });
    	}else{
    		$scope.classMsgController = "alert alert-danger";
    	}
    	$timeout(hideMsg, 5000);
    	$scope.loadGrid();
    };
    
    
    function validaTabela (entity, $scope){
    	var resposta = true;
    		
    	if(entity.observacoes === undefined){
    		
    		 $scope.msgController = 'Favor preencher todos os campos.';
    		 resposta = false;
    	}
    	
    	return resposta;
    };
    
	 function hideMsg() {
		 $scope.msgController = false;
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
reembolsoApp.controller('ModalReembolsoAddList', function ($scope,$http,md5, $modalInstance, usuario) {
			
	
	$scope.save = function(){
		var usuario = $scope.usuario;
		
		if(usuario.senha !== usuario.senha2){
			$scope.showMsg = "Senha deve ser igual.";
			$scope.classMsg = "alert alert-danger";
			
		}else if(usuario.id_usuario ===undefined && (usuario.senha2 === undefined || usuario.senha === undefined) ){
			$scope.showMsg = "Informe uma senha para o usuário.";
			$scope.classMsg = "alert alert-danger";			
		}else{
			if(usuario.senha !== undefined){
				usuario.senhaMD5 = md5.createHash(usuario.senha);
				usuario.senha = "";
				usuario.senha2 = "";
			}
			$http.post('/usuarios/salvar', {usuario: usuario})
		    .success(function (res) {		
		    	console.log(res);
		    	if(res.code === "ER_DUP_ENTRY"){
		    		$scope.showMsg = "Este Login já existe";
					$scope.classMsg = "alert alert-danger";
		    	}else{
		    		$modalInstance.close(res);
		    	}
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