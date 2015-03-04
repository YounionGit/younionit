// main.js
var controlerApp = angular.module('ControlerApp', ['ngGrid']);

controlerApp.controller('ControlerCtrl', function($scope, $http, $location) {

    $http.get("/users/list")
        .success(function(response) {$scope.myData = response})
        
   $scope.mySelections = [];     
        
    $scope.gridOptions = {
        data: 'myData',
        enableRowSelection: false,
        enableCellSelection: true,
        selectedItems: $scope.mySelections,
        columnDefs: [
            {field:'data', displayName:'Dia do Mês', cellTemplate: 'modules/controles/datepicker.html', enableCellEdit: true},
            {field:'hora_entrada', displayName:'Hora de Entrada', enableCellEdit: true},
            {field:'hora_saida', displayName:'Hora de Saída', enableCellEdit: true},
            {field:'atividade', displayName:'Atividade', enableCellEdit: true},
            {field:'observacao', displayName:'Observação',enableCellEdit: true},
            {cellTemplate: 'modules/controles/icones.html', enableRowSelection: false}]
    };
    
    $scope.add = function (){
        
        var newRow = [{name: "", age: ""}];
        
        $scope.myData = $scope.myData.concat(newRow);
        
        
    };
    
    $scope.salvar = function (entity){
    	console.log(entity);
    	
    	$http.post('/horarios/salvar', { entity: entity})
        .success(function (res) {            	
        	callback(res);
        });
        
        
    };
    
    $scope.apagar = function (){
        
        
        
    };
    
});
