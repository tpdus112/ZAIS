sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "zais/scm/zais/controller/modal/ModalManager",
    "zais/scm/zais/controller/modal/PP/PPDataService"
  ],
  (Controller, ModalManager, PPDataService) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainPP", {
      /* =========================================================
       * 초기화
       * ========================================================= */
      onInit() {
        this._loadPpSummary();
        this._bindStepEvents();

        const oComponent = this.getOwnerComponent();
        const oEventBus =
          (oComponent && oComponent.getEventBus && oComponent.getEventBus()) ||
          sap.ui.getCore().getEventBus();

        if (oEventBus) {
          oEventBus.subscribe("Dashboard", "RefreshAll", this._loadPpSummary, this);
        }
      },

      onExit() {
        const oComponent = this.getOwnerComponent();
        const oEventBus =
          (oComponent && oComponent.getEventBus && oComponent.getEventBus()) ||
          sap.ui.getCore().getEventBus();

        if (oEventBus) {
          oEventBus.unsubscribe("Dashboard", "RefreshAll", this._loadPpSummary, this);
        }
      },

      onAfterRendering() {
        this._bindStepEvents();
      },

      /* =========================================================
       * PP 공정 아이콘 클릭 이벤트
       * ========================================================= */
      _bindStepEvents() {
        const aSteps = [
          { id: "stepDram", key: "DramProd" },
          { id: "stepHBM", key: "HBMProd" },
          { id: "stepBGP", key: "BGPProd" },
          { id: "stepGPU", key: "GPUProd" },
          { id: "stepAIS", key: "AISAssembly" }
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

      /* =========================================================
       * PP 요약 데이터 조회
       * ========================================================= */
      _loadPpSummary() {
        const oComponent = this.getOwnerComponent();
        const oDashboardModel =
          this.getView().getModel("dashboard") ||
          (oComponent && oComponent.getModel("dashboard"));

        if (oComponent && oDashboardModel) {
          PPDataService.loadPpDashboardSummary(oComponent, oDashboardModel);
        }
      }
    });
  }
);