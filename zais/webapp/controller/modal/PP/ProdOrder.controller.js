sap.ui.define(
  [
    "zais/scm/zais/controller/modal/BaseModalController",
    "zais/scm/zais/controller/modal/PP/PPDataService"
  ],
  (BaseModalController, PPDataService) => {
    "use strict";

    const MATNR_MAP = {
      HBMProd: "AI-H-HBM3E",
      BGPProd: "AI-H-BGP",
      GPUProd: "AI-H-GPU",
      AISAssembly: "AI-F-AIS"
    };

    return BaseModalController.extend("zais.scm.zais.controller.modal.PP.ProdOrder", {
      getTableId() {
        return "prodOrderTable";
      },

      getCachePath() {
        return "/prodOrderList";
      },

      getDefaultPageSize() {
        return 5;
      },

      loadDataService(oComponent, oDashboardModel) {
        let sStepKey = "";
        let sMatnr = "";

        if (oDashboardModel) {
          sStepKey = oDashboardModel.getProperty("/currentModal/stepKey") || "";
          sMatnr = oDashboardModel.getProperty("/currentModal/matnr") || MATNR_MAP[sStepKey] || "";

          if (!sMatnr) {
            const sTitle = oDashboardModel.getProperty("/currentModal/title") || "";
            if (sTitle.includes("HBM3E")) sMatnr = "AI-H-HBM3E";
            else if (sTitle.includes("BGP")) sMatnr = "AI-H-BGP";
            else if (sTitle.includes("GPU")) sMatnr = "AI-H-GPU";
            else if (sTitle.includes("AIS")) sMatnr = "AI-F-AIS";
          }
        }

        return PPDataService.loadProdOrderData(oComponent, oDashboardModel, sStepKey, sMatnr);
      }
    });
  }
);