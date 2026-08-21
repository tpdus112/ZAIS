sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/SD/SDDataService"
  ],
  (BaseModalController, SDDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.SD.DeliveryComplete", {
      getTableId() {
        return "deliveryCompleteTable";
      },

      getCachePath() {
        return "/deliveryCompleteList";
      },

      loadDataService(oComponent, oDashboardModel) {
        return SDDataService.loadDeliveryCompleteList(oComponent, oDashboardModel);
      }
    });
  }
);