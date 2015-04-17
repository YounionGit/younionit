ReembolsoModule.controller('ReembolsoAprovacaoController', function ($rootScope, $scope, $http, $modal) {
  var user = $rootScope.globals.currentUser;
  $scope.filtroAprovacao = [];
  $scope.showApagar = false;
  $scope.filtroAprovacao.colaborador = [];
  var today = new Date();
  var firstMonthDay = new Date();
  firstMonthDay.setDate(1);
  $scope.filtroAprovacao.data_de = $rootScope.convertDate(firstMonthDay);
  $scope.filtroAprovacao.data_ate = $rootScope.convertDate(today);
  $scope.gridOptions = {
    data                : 'myData',
    enableRowSelection  : false,
    enableCellSelection : true,
    showFooter          : false,
    columnDefs          : [
      {field : 'id', displayName : 'Número', width : 70, cellTemplate : 'modules/controles/reembolso/id_open_modal.html'},
      {field : 'observacoes', displayName : 'Observações', enableCellEdit : false},
      {field : 'id_status', displayName : 'Status', cellTemplate : './templates/genericStatus.html'},
      {field : 'data_requisicao', displayName : 'Data Requisicao'},
      {field : 'data_pagamento', displayName : 'Data Pagamento', cellTemplate : './templates/genericDatepicker.html'},
      {cellTemplate : 'modules/controles/reembolso/icones_reembolso.html', enableRowSelection : false}
    ]
  };
  $scope.loadGrid = function () {
    $scope.editavel = true;//mostrar os botoes na grid
    var de = $scope.filtroAprovacao.data_de;
    var ate = $scope.filtroAprovacao.data_ate;
    var colaborador = $scope.filtroAprovacao.colaborador;
    $scope.myData = null;
    $http.post("/reembolso/aprovacao/list", {colaborador : colaborador, de : de, ate : ate}).success(function (response) {
      $scope.myData = response;
    }).error(function (response) {
      $rootScope.showErrorModal("Aconteceu um erro ao carregar a grid, preencha os campos corretamente e tente novamente :(", $scope);
    });
  }
  $scope.getColaborador = function (val) {
    return $http.post('/usuarios/list/typeahead', {
      params : {
        nome : val
      }
    }).then(function (response) {
      return response.data.map(function (item) {
        $scope.usuario = item;
        return item;
      });
    });
  };
  $scope.apagar = function (entity, rowid) {
    if (entity.id === undefined) {
      $scope.myData.splice(rowid, 1);
    } else {
      var r = confirm("Deseja apagar o registro? \n\n Atividade:  " + entity.atividade);
      if (r == true) {
        $http.post('/reembolso/apagar', { entity : entity}).success(function (res) {
          $scope.msgController = "Reembolso removido com sucesso.";
          $scope.classMsgController = "alert alert-success";
        });
        $scope.myData.splice(rowid, 1);
      }
      $timeout(hideMsg, 5000);
    }
  };
  $scope.salvar = function (entity) {
    if (validaTabela(entity, $scope)) {
      $http.post('/controle/reembolso/update', { entity : entity}).success(function (res) {
        $rootScope.showSuccess("Reembolso salvo com sucesso ;)", $scope);
      });
      $scope.loadGrid();
    } else {
      $rootScope.showError("Preencha o campo status.", $scope);
    }
  };
  function validaTabela(entity, $scope) {
    var resposta = true;
    if (entity.status === undefined) {
      resposta = false;
    }
    return resposta;
  };
  $scope.loadStatusReembolso = function () {
    $http.post('/controle/reembolso/status/list').success(function (res) {
      $scope.statusReembolsoList = res;
    });
  };
  $scope.open = function (entity) {
    var modalInstance = $modal.open({
      templateUrl : 'modules/controles/reembolso/reembolsoAprovacaoNotasList.html',
      controller  : 'ModalReembolsoAprovacaoList',
      height      : 'auto',
      resolve     : {
        reembolsoNota : function () {
          entity.tipo = 1;
          return entity;
        }
      }
    });
    modalInstance.result.then(function (res) {
      loadGrid();
      showSuccess("Usuário criado com sucesso.");
    });
  };
  $scope.loadStatusReembolso();
});
ReembolsoModule.controller('ModalReembolsoAprovacaoList', function ($rootScope, $scope, $http, md5, $modalInstance, reembolsoNota, FileUploader) {
  $scope.prefix = "R$";
  $scope.notas = [];
  $scope.salvarNotaPath = '/reembolso/nota/salvar';
  var uploader = $scope.uploader = new FileUploader({
    url : $scope.salvarNotaPath
  });
  uploader.onBeforeUploadItem = function (item) {
    formData = [reembolsoNota];
    Array.prototype.push.apply(item.formData, formData);
  };
  uploader.onSuccessItem = function (item, response, status, headers) {
    if (status == 200) {//upload com sucesso
      $rootScope.showSuccessModal("Nota carregada com sucesso ;)", $scope);
      var nota = $.extend(true, {}, reembolsoNota);
      $scope.notas = $scope.notas.concat(nota);
      cleanForm();
      $scope.loadNotas();
    } else {
      $rootScope.showErrorModal("Aconteceu um erro ao carregar sua nota :(", $scope);
    }
  };
  function cleanForm() {
    reembolsoNota.valor = "0.00";
    reembolsoNota.num_nota = "";
    reembolsoNota.emissor = "";
    reembolsoNota.descricao = "";
    $('input[type=file]').val('');
    uploader.clearQueue();
  }

  $scope.save = function () {
    if (uploader.queue.length == 0) {
      $http.post($scope.salvarNotaPath, reembolsoNota).success(function (res) {
        $rootScope.showSuccessModal("Nota carregada com sucesso ;)", $scope);
        var nota = $.extend(true, {}, reembolsoNota);
        $scope.notas = $scope.notas.concat(nota);
        cleanForm();
        $scope.loadNotas();
      });
    } else {
      uploader.uploadAll();
    }
  };
  $scope.deleteNota = function (id_nota) {
    $http.post('/reembolso/nota/delete', {id_nota : id_nota}).success(function (res) {
      $rootScope.showSuccessModal("Nota excluída com sucesso ;)", $scope);
      $scope.loadNotas();
    }).error(function (res) {
      $rootScope.showErrorModal("A nota não pode ser excluída :(", $scope);
      $scope.loadNotas();
    });
  };
  $scope.showAttachment = function (fileName) {
    //FIXME MOSTRAR OU BAIXAR IMG?
  };
  $scope.loadTipoReembolso = function () {
    $http.post('/controle/reembolso/tipo/list').success(function (res) {
      $scope.tiposReembolsoList = res;
    });
  };
  $scope.loadNotas = function () {
    $http.post('/controle/reembolso/notas/list', {reembolso : reembolsoNota}).success(function (res) {
      $scope.notas = res;
    });
  };
  $scope.loadItems = function (reembolsoNota) {
    if (reembolsoNota !== undefined) {
      $scope.reembolsoNota = reembolsoNota;
    }
  }
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.loadTipoReembolso();
  $scope.loadItems(reembolsoNota);
  $scope.loadNotas();
});

