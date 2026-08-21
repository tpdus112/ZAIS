sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/SD/SDDataService"
  ],
  (BaseModalController, SDDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.SD.Delivery", {
      getTableId() {
        return "deliveryTable";
      },

      getCachePath() {
        return "/deliveryList";
      },

      loadDataService(oComponent, oDashboardModel) {
        return SDDataService.loadDeliveryList(oComponent, oDashboardModel);
      }
    });
  }
);