var ReembolsoModule = angular.module('ReembolsoModule',['ngGrid', 'angularFileUpload']);


ReembolsoModule.controller('ReembolsoController', function($rootScope, $scope, $http, $location, $modal, $document, $timeout) {
	
	
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
    
    
  
    
		$scope.open = function (entity) {
			 var modalInstance = $modal.open({
			      templateUrl: 'modules/controles/reembolso/reembolsoLista.html',
			      controller: 'ModalReembolsoAddList',
			      height: 'auto',
			      resolve: {
			        reembolsoNota: function () {
			        	entity.tipo = 1;
			          return entity;
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
            	showSuccess("Reembolso criado com sucesso. Agora preencha os itens de reembolso.");
            });
    		
    		$scope.loadGrid();
    	}else{
    		showError("Preencha o campo observação");
    	
    	}	
    };
    
    
    function validaTabela (entity, $scope){
    	var resposta = true;
    		
    	if(entity.observacoes === undefined){
    		 resposta = false;
    	}
    	
    	return resposta;
    };
    
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


ReembolsoModule.controller('ModalReembolsoAddList', function ($rootScope, $scope, $http,md5, $modalInstance, reembolsoNota, FileUploader) {
	
	$scope.prefix = "R$";
	
	$scope.notas = [];
	
	var uploader = $scope.uploader = new FileUploader({
	    url : '/reembolso/nota/salvar'
	});
	
	uploader.onBeforeUploadItem = function(item) {
	    formData = [reembolsoNota];
	    Array.prototype.push.apply(item.formData, formData);
	};
	
	uploader.onSuccessItem = function(item, response, status, headers) {
	    if(status == 200){//upload com sucesso
	    	$rootScope.showSuccessModal("Nota carregada com sucesso ;)", $scope);
	    	var nota = $.extend(true, {}, reembolsoNota);
	    	$scope.notas = $scope.notas.concat(nota);
	    	cleanForm();
	    	$scope.loadNotas();
	    }else{
	    	$rootScope.showErrorModal("Aconteceu um erro ao carregar sua nota :(", $scope);
	    }
	};
	
	function cleanForm(){
		reembolsoNota.valor = "0.00";
		reembolsoNota.num_nota = "";
		reembolsoNota.emissor = "";
		reembolsoNota.descricao = "";
		$('input[type=file]').val('');
		uploader.clearQueue();
	}
	
	$scope.save = function(){
		
		uploader.uploadAll();
		
	};
	
	$scope.showAttachment = function(fileName){
		//FIXME MOSTRAR OU BAIXAR IMG?
		
	};
	
	$scope.loadTipoReembolso = function(){
		$http.post('/controle/reembolso/list')
	    .success(function (res) {	    	
	    	$scope.tiposReembolsoList = res;
	    });
		
	};
	
	$scope.loadNotas = function(){
		
		$http.post('/controle/reembolso/notas/list', {reembolso: reembolsoNota})
	    .success(function (res) {	 
	    	
	    	$scope.notas = res;
	    });
		
	};
	
	$scope.loadItems = function(reembolsoNota){

		if(reembolsoNota !== undefined){
			$scope.reembolsoNota = reembolsoNota;
			//FIXME
			$scope.reembolsoNota.num_nota = '999999999999999';
			$scope.reembolsoNota.emissor = 'emissor';
			$scope.reembolsoNota.valor = '10.01';
			$scope.reembolsoNota.descricao = 'desc';
		}
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	  
	$scope.loadTipoReembolso();

	
	$scope.loadItems(reembolsoNota);
	
	$scope.loadNotas();
	
	
	
});


