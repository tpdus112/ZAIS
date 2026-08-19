sap.ui.define(
  ["sap/ui/core/mvc/Controller", "zais/scm/zais/controller/modal/ModalManager"],
  (Controller, ModalManager) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainMM", {
      onInit() {
        this._bindStepEvents();
      },

      onAfterRendering() {
        this._bindStepEvents();
      },

      _bindStepEvents() {
        const aSteps = [
          { id: "stepPR", key: "PR" },
          { id: "stepPO", key: "PO" },
          { id: "stepGR", key: "GR" },
          { id: "stepGRComplete", key: "GRComplete" },
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
