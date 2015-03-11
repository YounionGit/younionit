/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

'use strict';

/**
 * Main AngularJS Web Application
 */
var app = angular.module('younionApp', [
  'ngRoute',
  'ControlerApp',
  'UsuariosApp',
  'ngCookies',
  'ui.bootstrap',
  'LiberacaoControllerApp' 	
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
	
  $routeProvider
    // Home
    .when("/", {templateUrl: "modules/home/home.html", controller: "PageCtrl"})
    // Pages
     .when("/descubra", {templateUrl: "modules/descubra/descubra.html", controller: "PageCtrl"})
     .when("/solucoes", {templateUrl: "modules/solucoes/solucoes.html", controller: "PageCtrl"})
     .when("/tecnologias", {templateUrl: "modules/tecnologias/tecnologias.html", controller: "PageCtrl"})
     .when("/contato", {templateUrl: "modules/contato/contato.html", controller: "PageCtrl"})
     .when("/login", {templateUrl: "modules/login/login.html", controller: "LoginController"})
     .when("/controles", {templateUrl: "modules/controles/controles.html", controller: "PageCtrl"})
     .when("/boletim", {templateUrl: "modules/boletim/boletim.html", controller: "PageCtrl"})
     .when("/politicas", {templateUrl: "modules/politicas/politicas.html", controller: "PageCtrl"})
     //ADMIN
      .when("/usuarios/cadastrar", {templateUrl: "modules/admin/usuarios/usuarios.html", controller: "PageCtrl"})
      .when("/controles/liberacao/edicao", {templateUrl: "modules/controles/liberacaoControleMes.html", controller: "PageCtrl"})
      // else 404
    .otherwise("/404", {templateUrl: "modules/404.html", controller: "PageCtrl"});
}]);


/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function (/* $scope, $location, $http */) {

  // Activates the Carousel
  $('.carousel').carousel({
    interval: 5000
  });

  // Activates Tooltips for Social Links
  $('.tooltip-social').tooltip({
    selector: "a[data-toggle=tooltip]"
  })
});

app.controller('LoginController',
    ['$scope', '$rootScope', '$location','AuthenticationService',
        function ($scope, $rootScope, $location,AuthenticationService) {
            AuthenticationService.ClearCredentials();

            $scope.login = function () {
                $scope.dataLoading = true;
                AuthenticationService.Login($scope.username, $scope.password, function(response) {
                    if (response.success) {
                        AuthenticationService.SetCredentials(response.currentUser);
                        $location.path('/');
                    } else {
                        $scope.error = response.message;
                        $scope.dataLoading = false;                        
                    }
                });
            };
}]);


app.service('AuthenticationService',
    ['Base64','$http', '$cookieStore', '$rootScope', '$timeout',
    function(Base64,$http, $cookieStore, $rootScope, $timeout) {
        var service = {};


        service.Login = function (username, password, callback) {

            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
           /* $timeout(function(){
                var response = { success: username === 'test' && password === 'test' };
                if(!response.success) {
                    response.message = 'Username or password is incorrect';
                }
                callback(response);
            }, 1000);
             */

            /* Use this for real authentication
             ----------------------------------------------*/
             $http.post('/login', { username: username, password: password })
                .success(function (res) {
                	
                     var response = {success: false, message : '', currentUser : ''};
                     
                     response.success = res.success;
                     if(!response.success){
                         response.message = 'Username or password is incorrect';
                     }else{
                    	 response.currentUser = res.currentUser;
                     }
                     $rootScope.acessPermission = response.success;
                     
                     if(res.currentUser !== undefined && res.currentUser.perfil !== undefined &&
                    		 res.currentUser.perfil.perfil === "admin"){
                    	 $rootScope.adminPermission = true;
                     }
                    callback(response);
                },1000);

            /* ----------------------------------------------*/
        };


        service.SetCredentials = function (currentUser) {
            var authdata = Base64.encode(username + ':' + password);
                        
            $rootScope.globals = {
                currentUser: {
                	name: currentUser.nome,
                    login: currentUser.login,
                    id: currentUser.id_usuario,
                    perfil: currentUser.perfil,
                    authdata: authdata
                }
            };
            
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };


        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
            $rootScope.acessPermission = false;
            $rootScope.adminPermission = false;
        };
        
        service.AcessControl = function(path,user, callback){
        	
        	$http.post('/authentication/access', { path: path, user: user})
            .success(function (res) {            	
            	callback(res);
            });
        };

        return service;
}]);


app.run(['$rootScope', '$location', '$cookieStore', '$http','AuthenticationService',
    function ($rootScope, $location, $cookieStore, $http, AuthenticationService) {

        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {            
            var path = $location.path();
                        
            //Verifica se o link tem acesso restrito.
            var user = $rootScope.globals.currentUser;
            AuthenticationService.AcessControl(path,user, function(res){
            	
            	var acessoRestrito = res;
            	if (acessoRestrito) {
        			$location.path('/');
        			//$rootScope.acessPermission = false;
        			//$rootScope.adminPermission = false;          		
                }else{
                	//
                }
            	
            	
            });
            
            
        });
}]);



app.service('Base64', function () {
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});

