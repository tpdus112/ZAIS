sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/PP/PPDataService"
  ],
  (BaseModalController, PPDataService) => {
    "use strict";

    return BaseModalController.extend("zais.scm.zais.controller.modal.PP.DramProd", {
      getTableId() {
        return "dramProdTable";
      },

      getCachePath() {
        return "/dramProdList";
      },

      getDefaultPageSize() {
        return 5;
      },

      loadDataService(oComponent, oDashboardModel) {
        return PPDataService.loadDramProdData(oComponent, oDashboardModel);
      }
    });
  }
);