// main.js
var controlerApp = angular.module('ControlerApp', ['ngGrid']);

controlerApp.controller('ControlerCtrl', function($scope, $http, $location) {

    $http.get("/users/list")
        .success(function(response) {$scope.myData = response})
        
   $scope.mySelections = [];     
        
    $scope.gridOptions = {
        data: 'myData',
        enableCellSelection: true,
        selectedItems: $scope.mySelections,
        afterSelectionChange: function (row, evt) {      
           // console.log(row.entity.id);
        },
        columnDefs: [
            {field:'hora_entrada', displayName:'Hora de Entrada', enableCellEdit: true},
            {field:'hora_saida', displayName:'Hora de Saída', enableCellEdit: true},
            {field:'Data', displayName:'Dia do Mês', cellFilter: 'date:\'dd/MM/yyyy\''},
            {field:'atividade', displayName:'Atividade', enableCellEdit: true},
            {field:'observacao', displayName:'Observação',enableCellEdit: true},
            {displayName:'Ação', cellTemplate: 'modules/controles/icones.html'}]
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
