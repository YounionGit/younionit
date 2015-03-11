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
	  
	  
	  $scope.liberarMes = function (){
	    	console.log($scope.colaborador);
	    	console.log($scope.data);
	    	

    		   $http.post('/controle/liberacao/salvar', {data: $scope.data, id_usuario: $scope.colaborador.id_usuario })
	            .success(function (res) {
	            	$scope.msgController = "Liberação efetuada com sucesso.";
	            	$scope.classMsgController = "alert alert-success";
	            })
	            .error(function(data, status, headers, config) {
	            	$scope.msgController = "Liberação não efetuada.";
	            	$scope.classMsgController = "alert alert-danger";
	              });
    		   
    		   $timeout(hideMsg, 3000);
    		   
    		   $scope.colaborador = null;
    		   $scope.data = null;
	    };
	    
	    $scope.bloquearMes = function (){
	    	console.log($scope.colaborador);
	    	console.log($scope.data);
	    		    	
    		   $http.post('/controle/liberacao/bloquear', {data: $scope.data, id_usuario: $scope.colaborador.id_usuario })
	            .success(function (res) {
	            	$scope.msgController = "Bloqueado com sucesso.";
	            	$scope.classMsgController = "alert alert-success";
	            })
	            .error(function(data, status, headers, config) {
	            	$scope.msgController = "Falha ao bloquear.";
	            	$scope.classMsgController = "alert alert-danger";
	            });
    		   
    		   $timeout(hideMsg, 3000);

    		   $scope.colaborador = null;
    		   $scope.data = null;
	    };
	
	    function hideMsg() {
	        $scope.msgController = false;
	    }
	    
});
