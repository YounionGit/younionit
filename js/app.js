'use strict';
/**
 * Main AngularJS Web Application
 */
var app = angular.module('younionApp', [
  'ngRoute', 'ControlerApp', 'UsuariosApp', 'ReembolsoModule', 'TrocarSenhaModule', 'ngCookies', 'angular-md5', 'ui.bootstrap', 'LiberacaoControllerApp', 'ui.mask', 'maskMoney'
]);
/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider// Home
    .when("/", {templateUrl : "modules/home/home.html", controller : "PageCtrl"})// Pages
    .when("/descubra", {templateUrl : "modules/descubra/descubra.html", controller : "PageCtrl"}).when("/solucoes", {templateUrl : "modules/solucoes/solucoes.html", controller : "PageCtrl"}).when("/tecnologias", {templateUrl : "modules/tecnologias/tecnologias.html", controller : "PageCtrl"}).when("/contato", {templateUrl : "modules/contato/contato.html", controller : "PageCtrl"}).when("/login", {templateUrl : "modules/login/login.html", controller : "LoginController"}).when("/controles", {templateUrl : "modules/controles/controles.html", controller : "PageCtrl"}).when("/controles/reembolso", {templateUrl : "modules/controles/reembolso/reembolso.html", controller : "PageCtrl"}).when("/controles/senha/change", {templateUrl : "modules/controles/senha/trocarSenha.html", controller : "PageCtrl"}).when("/boletim", {templateUrl : "modules/boletim/boletim.html", controller : "PageCtrl"}).when("/politicas", {templateUrl : "modules/politicas/politicas.html", controller : "PageCtrl"})//ADMIN
    .when("/usuarios/cadastrar", {templateUrl : "modules/admin/usuarios/usuarios.html", controller : "PageCtrl"}).when("/controles/liberacao/edicao", {templateUrl : "modules/controles/liberacaoControleMes.html", controller : "PageCtrl"}).when("/controles/reembolso/aprovacao", {templateUrl : "modules/controles/reembolso/aprovacaoReembolso.html", controller : "PageCtrl"})// else 404
    .otherwise("/404", {templateUrl : "modules/404.html", controller : "PageCtrl"});
}]);
/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope, $location, $http, $rootScope, $timeout) {

  // Activates the Carousel
  $('.carousel').carousel({
    interval : 5000
  });
  // Activates Tooltips for Social Links
  $('.tooltip-social').tooltip({
    selector : "a[data-toggle=tooltip]"
  });
  if ($rootScope.globals.currentUser != undefined && $rootScope.globals.currentUser.perfil.perfil === "admin") {
    $rootScope.adminPermission = true;
    $rootScope.acessPermission = true;
  }
  $rootScope.showSuccessModal = function (msg, $scope) {
    $scope.showMsgModal = true;
    $scope.msgControllerModal = msg;
    $scope.classMsgControllerModal = "alert alert-success";
    $timeout(function () {
      $scope.showMsgModal = false;
    }, 3000);
  };
  $rootScope.showErrorModal = function (msg, $scope) {
    $scope.showMsgModal = true;
    $scope.msgControllerModal = msg;
    $scope.classMsgControllerModal = "alert alert-danger";
    $timeout(function () {
      $scope.showMsgModal = false;
    }, 3000);
  };
  $rootScope.showSuccess = function (msg, $scope) {
    $scope.showMsg = true;
    $scope.msgController = msg;
    $scope.classMsgController = "alert alert-success";
    $timeout(function () {
      $scope.showMsg = false;
    }, 3000);
  };
  $rootScope.showError = function (msg, $scope) {
    $scope.showMsg = true;
    $scope.msgController = msg;
    $scope.classMsgController = "alert alert-danger";
    $timeout(function () {
      $scope.showMsg = false;
    }, 3000);
  };
  $rootScope.convertDate = function (inputFormat) {
    function pad(s) {
      return (s < 10) ? '0' + s : s;
    }

    var d = new Date(inputFormat);
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
  };
});
app.controller('LoginController', ['$scope', '$rootScope', '$location', 'AuthenticationService', 'md5', function ($scope, $rootScope, $location, AuthenticationService, md5) {
  AuthenticationService.ClearCredentials();
  $scope.login = function () {
    $scope.dataLoading = true;
    var passwordMd5 = md5.createHash($scope.password);
    AuthenticationService.Login($scope.username, passwordMd5, function (response) {
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
app.service('AuthenticationService', ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout', function (Base64, $http, $cookieStore, $rootScope, $timeout) {
  var service = {};
  service.Login = function (username, password, callback) {

    /* Use this for real authentication
     ----------------------------------------------*/
    $http.post('/login', { username : username, password : password }).success(function (res) {
      var response = {success : false, message : '', currentUser : ''};
      response.success = res.success;
      if (!response.success) {
        response.message = 'Usuário ou senha incorreta.';
      } else {
        response.currentUser = res.currentUser;
      }
      $rootScope.acessPermission = response.success;
      if (res.currentUser !== undefined && res.currentUser.perfil !== undefined && res.currentUser.perfil.perfil === "admin") {
        $rootScope.adminPermission = true;
        // $scope.adminPermission = true;
      }
      callback(response);
    }, 1000);
    /* ----------------------------------------------*/
  };
  service.SetCredentials = function (currentUser) {
    var authdata = Base64.encode(username + ':' + password);
    $rootScope.globals = {
      currentUser : {
        name     : currentUser.nome,
        login    : currentUser.login,
        id       : currentUser.id_usuario,
        perfil   : currentUser.perfil,
        authdata : authdata
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
  service.AcessControl = function (path, user, callback) {
    $http.post('/authentication/access', { path : path, user : user}).success(function (res) {
      callback(res);
    });
  };
  return service;
}]);
app.run(['$rootScope', '$location', '$cookieStore', '$http', 'AuthenticationService', function ($rootScope, $location, $cookieStore, $http, AuthenticationService) {
  $rootScope.globals = $cookieStore.get('globals') || {};
  if ($rootScope.globals.currentUser) {
    $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
  }
  $rootScope.$on('$locationChangeStart', function (event, next, current) {
    var path = $location.path();
    //Verifica se o link tem acesso restrito.
    var user = $rootScope.globals.currentUser;
    AuthenticationService.AcessControl(path, user, function (res) {
      if (res) {
        $location.path('/');
        //$rootScope.acessPermission = false;
        //$rootScope.adminPermission = false;
      } else {
        //
      }
    });
    // $rootScope.login();
  });
}]);
app.service('Base64', function () {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  return {
    encode : function (input) {
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
        } else
          if (isNaN(chr3)) {
            enc4 = 64;
          }
        output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);
      return output;
    },
    decode : function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;
      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        window.alert("There were invalid base64 characters in the input text.\n" + "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" + "Expect errors in decoding.");
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
