sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/SD/SDDataService"
  ],
  (BaseModalController, SDDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.SD.SO", {
      getTableId() {
        return "soTable";
      },

      getCachePath() {
        return "/soList";
      },

      loadDataService(oComponent, oDashboardModel) {
        return SDDataService.loadSalesOrders(oComponent, oDashboardModel);
      }
    });
  }
);