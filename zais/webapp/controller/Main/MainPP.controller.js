sap.ui.define(
  ["sap/ui/core/mvc/Controller", "zais/scm/zais/controller/modal/ModalManager"],
  (Controller, ModalManager) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainPP", {
      onInit() {
        this._bindStepEvents();
      },

      onAfterRendering() {
        this._bindStepEvents();
      },

      _bindStepEvents() {
        const aSteps = [
          { id: "stepDram", key: "DramProd" },
          { id: "stepHBM", key: "HBMProd" },
          { id: "stepBGP", key: "BGPProd" },
          { id: "stepGPU", key: "GPUProd" },
          { id: "stepAIS", key: "AISAssembly" },
        ];

        aSteps.forEach((oStep) => {
          const oControl = this.byId(oStep.id);
          if (oControl) {
            oControl
              .$()
              .off("click")
              .on("click", () => {
                ModalManager.openModal(this, oStep.key);
              });
          }
        });
      },
    });
  },
);
