// main.js
var controlerApp = angular.module('ControlerApp', ['ngGrid']);

controlerApp.controller('ControlerCtrl', function($scope, $http, $location) {

    $http.get("/users/list")
        .success(function(response) {$scope.myData = response})
    $scope.gridOptions = {
        data: 'myData',
        enableCellSelection: true,
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
    
});
