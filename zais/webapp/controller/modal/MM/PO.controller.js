sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/MM/MMDataService"
  ],
  (BaseModalController, MMDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.MM.PO", {
      getTableId() {
        return "poTable";
      },

      getCachePath() {
        return "/poList";
      },

      loadDataService(oComponent, oDashboardModel) {
        return MMDataService.loadPurchaseOrders(oComponent, oDashboardModel);
      }
    });
  }
);