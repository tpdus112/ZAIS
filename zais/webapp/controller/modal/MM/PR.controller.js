sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/MM/MMDataService"
  ],
  (BaseModalController, MMDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.MM.PR", {
      getTableId() {
        return "prTable";
      },

      getCachePath() {
        return "/prList";
      },

      loadDataService(oComponent, oDashboardModel) {
        return MMDataService.loadPurchaseRequests(oComponent, oDashboardModel);
      }
    });
  }
);
