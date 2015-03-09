// main.js
var controlerApp = angular.module('ControlerApp', ['ngGrid']);

controlerApp.controller('ControlerCtrl', function($rootScope, $scope, $http, $location) {

	var user = $rootScope.globals.currentUser;
        
   $scope.mySelections = [];     
        
    $scope.gridOptions = {
        data: 'myData',
        enableRowSelection: false,
        enableCellSelection: true,
        selectedItems: $scope.mySelections,
        columnDefs: [
            {field:'data', displayName:'Dia do Mês', 
            	cellTemplate: 'modules/controles/datepicker.html'},
            {field:'hora_entrada', displayName:'Entrada',
            		cellTemplate: 'modules/controles/timepicker_entrada.html'},
            {field:'hora_saida', displayName:'Saída',
            		cellTemplate: 'modules/controles/timepicker_saida.html'},
            {field:'total_Horas', displayName:'Total Horas', enableCellEdit: false},
            {field:'atividade', displayName:'Atividade', enableCellEdit: true},
            {field:'observacao', displayName:'Observação',enableCellEdit: true},
            {cellTemplate: 'modules/controles/icones.html', enableRowSelection: false}]
    };
    
    $scope.add = function (){
    	
    	//var id = user.id; TODO
    	id = 1;
        var newRow = [{id_usuario: id}];
        
        $scope.myData = $scope.myData.concat(newRow);
        
    };
    
    $scope.salvar = function (entity){
    	console.log(entity);
    	
    	if(validaTabela(entity, $scope)){
    		$http.post('/horarios/salvar', { entity: entity})
            .success(function (res) {
            	$scope.msgController = "Horario salvo com sucesso.";
            	$scope.classMsgController = "alert alert-success";
            });
    	}else{
    		$scope.classMsgController = "alert alert-danger";
    	}

    };
    
    $scope.apagar = function (entity, rowid){
    	    	
    	var r = confirm("Deseja apagar o registro? \n\n Atividade:  "+entity.atividade);
    		
    	if (r == true) {
    		 $http.post('/horarios/apagar', { entity: entity})
    	        .success(function (res) {
    	        	$scope.msgController = "Horario removido com sucesso.";
    	        	$scope.classMsgController = "alert alert-success";
    	        });
    		 $scope.myData.splice(rowid,1);
    	}
    	
    };
    
   
    $scope.changeDate = function (){
    	var year = $scope.selectedYear;
    	var month = $scope.selectedMonth;
    	var user = $rootScope.globals.currentUser;
    	
    	 $http.post("/horarios/fechamento/mes", {user: user, month: month, year: year})
         .success(function(response) {
         	$scope.editavel = response.flag;
        })   	
    	
        
    	
    	 $http.post("/horarios/list", {user: user, month: month, year: year})
         .success(function(response) {
         	console.log(response);
         	$scope.myData = response
        })   
        
    };   
    
    
    function validaTabela (entity, $scope){
    	var resposta = true;
    		
    	if(entity.data === undefined ||
    			entity.hora_entrada === undefined ||
    			entity.hora_saida === undefined ||
    			entity.atividade === undefined ||
    			entity.observacao === undefined){
    		
    		 $scope.msgController = 'Favor preencher todos os campos.';
    		 resposta = false;
    	}
    	
    	if(entity.hora_entrada >= entity.hora_saida ){
    		$scope.msgController = "A Hora de saida deve ser maior que a entrada.";
    		resposta = false;
    	}
    	
    	return resposta;
    };
    
    
    $scope.selectedYear = new Date().getFullYear();
    
	$scope.selectedMonth = new Date().getMonth() + 1;
	
	$scope.changeDate();
	
    
});
