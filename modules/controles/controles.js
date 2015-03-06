// main.js
var controlerApp = angular.module('ControlerApp', ['ngGrid']);

controlerApp.controller('ControlerCtrl', function($rootScope, $scope, $http, $location) {

	var user = $rootScope.globals.currentUser;
	
    $http.post("/horarios/list", {user: user})
        .success(function(response) {
        	console.log(response);
        	$scope.myData = response
       })
        
   $scope.mySelections = [];     
        
    $scope.gridOptions = {
        data: 'myData',
        enableRowSelection: false,
        enableCellSelection: true,
        selectedItems: $scope.mySelections,
        columnDefs: [
            {field:'data', displayName:'Dia do Mês', 
            	cellTemplate: 'modules/controles/datepicker.html'},
            {field:'hora_entrada', displayName:'Hora de Entrada',
            		cellTemplate: 'modules/controles/timepicker_entrada.html'},
            {field:'hora_saida', displayName:'Hora de Saída',
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
    	if(entity.data === undefined ||
    			entity.hora_entrada === undefined ||
    			entity.hora_saida === undefined ||
    			entity.atividade === undefined ||
    			entity.observacao === undefined){
    		
    		 $scope.error = 'Favor preencher todos os campos.';
    	}else{
    		$http.post('/horarios/salvar', { entity: entity})
            .success(function (res) {            	
            	//callback(res);
            });
    	}
    	
    	
        
    };
    
    $scope.apagar = function (entity, rowid){
    	    	
    	var r = confirm("Deseja apagar o registro? \n\n Atividade:  "+entity.atividade);
    		
    	if (r == true) {
    		 $http.post('/horarios/apagar', { entity: entity})
    	        .success(function (res) {
    	        	console.log("sucess");
    	        	//callback(res);    	        	
    	        });
    		 $scope.myData.splice(rowid,1);
    	}
    	
    };
    
   
    $scope.change = function (){
    	
    	console.log( $scope.selectedItem);
    	
    };
    
});
