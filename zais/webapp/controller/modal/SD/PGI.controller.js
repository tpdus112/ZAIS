sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/SD/SDDataService"
  ],
  (BaseModalController, SDDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.SD.PGI", {
      getTableId() {
        return "pgiTable";
      },

      getCachePath() {
        return "/pgiList";
      },

      loadDataService(oComponent, oDashboardModel) {
        return SDDataService.loadPgiList(oComponent, oDashboardModel);
      }
    });
  }
);