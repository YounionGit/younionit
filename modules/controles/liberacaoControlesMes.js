// main.js
var controlerApp = angular.module('LiberacaoControllerApp', ['ngGrid']);

controlerApp.controller('LiberacaoController', function($rootScope, $scope, $http, $location, $timeout) {
	
	var user = $rootScope.globals.currentUser;        
    
	$scope.getColaborador = function(val) {
	    return $http.post('/usuarios/list/typeahead', {
	      params: {
	    	nome: val
	      }
	    }).then(function(response){
	    	
	    	return response.data.map(function(item){
	    		$scope.usuario = item;
	    		console.log(item);
	            return item;
	          });
	    });
	  };
	  
//	  $scope.onSelect = function(item, model, label){
//		  console.log($scope.colaborador.id_usuario);
//		  
//	  }
	  
	  $scope.liberarMes = function (){
	    	console.log($scope.colaborador);
	    	console.log($scope.data);
	    	
//	    	if(validaTabela(entity, $scope)){
    		   $http.post('/controle/liberacao/salvar', {data: $scope.data, id_usuario: $scope.colaborador.id_usuario })
	            .success(function (res) {
	            	$scope.msgController = "Liberação efetuada com sucesso.";
	            	$scope.classMsgController = "alert alert-success";
	            })
	            .error(function(data, status, headers, config) {
	            	$scope.msgController = "Liberação não efetuada.";
	            	$scope.classMsgController = "alert alert-danger";
	              });
//	    	}else{
//	    		$scope.classMsgController = "alert alert-danger";
//	    	}
//	    	$timeout(hideMsg, 5000);
//	    	$scope.loadGrid();
	    };
	    
	    $scope.bloquearMes = function (){
	    	console.log($scope.colaborador);
	    	console.log($scope.data);
	    	
//	    	if(validaTabela(entity, $scope)){
    		   $http.post('/controle/liberacao/bloquear', {data: $scope.data, id_usuario: $scope.colaborador.id_usuario })
	            .success(function (res) {
	            	$scope.msgController = "Liberação efetuada com sucesso.";
	            	$scope.classMsgController = "alert alert-success";
	            })
	            .error(function(data, status, headers, config) {
	            	$scope.msgController = "Liberação não efetuada.";
	            	$scope.classMsgController = "alert alert-danger";
	            });
//	    	}else{
//	    		$scope.classMsgController = "alert alert-danger";
//	    	}
//	    	$timeout(hideMsg, 5000);
//	    	$scope.loadGrid();
	    };
	
});
