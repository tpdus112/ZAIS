sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/MM/MMDataService"
  ],
  (BaseModalController, MMDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.MM.GR", {
      getTableId() {
        return "grTable";
      },

      getCachePath() {
        return "/grList";
      },

      loadDataService(oComponent, oDashboardModel) {
        return MMDataService.loadGoodsReceipts(oComponent, oDashboardModel);
      }
    });
  }
);