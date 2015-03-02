// main.js
var controlerApp = angular.module('ControlerApp', ['ngGrid']);

controlerApp.controller('ControlerCtrl', function($scope, $http, $location) {

    $http.get("/users/list")
        .success(function(response) {$scope.myData = response})
    $scope.gridOptions = {
        data: 'myData',
        columnDefs: [
            {field:'hora_entrada', displayName:'Hora de Entrada'},
            {field:'hora_saida', displayName:'Hora de Saída'},
            {field:'Data', displayName:'Dia do Mês', cellFilter: 'date:\'dd/MM/yyyy\''},
            {field:'atividade', displayName:'Atividade'},
            {field:'observacao', displayName:'Observação'}]
    };
});