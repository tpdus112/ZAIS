sap.ui.define(
  ["sap/ui/core/mvc/Controller", "zais/scm/zais/controller/modal/ModalManager"],
  (Controller, ModalManager) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainSD", {
      onInit() {
        this._bindStepEvents();
      },

      onAfterRendering() {
        this._bindStepEvents();
      },

      _bindStepEvents() {
        const aSteps = [
          { id: "stepSO", key: "SO" },
          { id: "stepDelivery", key: "Delivery" },
          { id: "stepPGI", key: "PGI" },
          { id: "stepDeliveryComplete", key: "DeliveryComplete" },
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
