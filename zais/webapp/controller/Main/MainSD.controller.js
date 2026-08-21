sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "zais/scm/zais/controller/modal/ModalManager",
    "zais/scm/zais/controller/modal/SD/SDDataService"
  ],
  (Controller, ModalManager, SDDataService) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainSD", {
      /* =========================================================
       * 초기화
       * ========================================================= */
      onInit() {
        const oComponent = this.getOwnerComponent();
        let oDashboardModel = this.getView().getModel("dashboard");

        if (!oDashboardModel && oComponent) {
          oDashboardModel = oComponent.getModel("dashboard");
          if (oDashboardModel) {
            this.getView().setModel(oDashboardModel, "dashboard");
          }
        }

        if (oDashboardModel) {
          oDashboardModel.setProperty("/process/sd/materials", []);
        }

        this._loadSdSummary();
        this._loadSdMaterialFlow();
        this._bindStepEvents();

        const oEventBus =
          (oComponent && oComponent.getEventBus && oComponent.getEventBus()) ||
          sap.ui.getCore().getEventBus();

        if (oEventBus) {
          oEventBus.subscribe("Dashboard", "RefreshAll", this._onRefreshAll, this);
        }
      },

      _onRefreshAll() {
        this._loadSdSummary();
        this._loadSdMaterialFlow();
      },

      onExit() {
        const oComponent = this.getOwnerComponent();
        const oEventBus =
          (oComponent && oComponent.getEventBus && oComponent.getEventBus()) ||
          sap.ui.getCore().getEventBus();

        if (oEventBus) {
          oEventBus.unsubscribe("Dashboard", "RefreshAll", this._onRefreshAll, this);
        }
      },

      onAfterRendering() {
        this._bindStepEvents();
        this._applyStepClasses();
      },

      /* =========================================================
       * SD 단계 클릭 이벤트
       * ========================================================= */
      _bindStepEvents() {
        const aSteps = [
          { id: "stepSO", key: "SO" },
          { id: "stepDelivery", key: "Delivery" },
          { id: "stepPGI", key: "PGI" },
          { id: "stepDeliveryComplete", key: "DeliveryComplete" }
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
       * SD 상단 Summary 조회
       * ========================================================= */
      _loadSdSummary() {
        const oComponent = this.getOwnerComponent();
        const oDashboardModel =
          this.getView().getModel("dashboard") ||
          (oComponent && oComponent.getModel("dashboard"));

        SDDataService.loadSdSummary(oComponent, oDashboardModel)
          .then((aSteps) => {
            this._aSdStepStatuses = (aSteps || []).map((oStep) => oStep.status);
            this._applyStepClasses();
          })
          .catch(() => {});
      },

      /* =========================================================
       * SD 하단 자재별 수량 흐름 조회
       * ========================================================= */
      _loadSdMaterialFlow() {
        const oComponent = this.getOwnerComponent();
        const oDashboardModel =
          this.getView().getModel("dashboard") ||
          (oComponent && oComponent.getModel("dashboard"));

        SDDataService.loadSdMaterialFlow(oComponent, oDashboardModel);
      },

      /* =========================================================
       * 원형 아이콘 CSS 자동 변경
       * ========================================================= */
      _applyStepClasses() {
        if (!this._aSdStepStatuses) {
          return;
        }

        const aCircleIds = [
          "circleSO",
          "circleDelivery",
          "circlePGI",
          "circleDeliveryComplete"
        ];

        aCircleIds.forEach((sId, iIndex) => {
          const oCircle = this.byId(sId);
          if (!oCircle) return;

          oCircle.removeStyleClass("stepDone");
          oCircle.removeStyleClass("stepActive");
          oCircle.removeStyleClass("stepWaiting");

          const aItems = oCircle.getItems ? oCircle.getItems() : [];
          const oIcon = aItems.length > 0 ? aItems[0] : null;

          if (oIcon) {
            oIcon.removeStyleClass("stepIconDone");
            oIcon.removeStyleClass("stepIconActive");
            oIcon.removeStyleClass("stepIconWaiting");
          }

          const sStatus = this._aSdStepStatuses[iIndex];
          switch (sStatus) {
            case "completed":
              oCircle.addStyleClass("stepDone");
              if (oIcon) oIcon.addStyleClass("stepIconDone");
              break;
            case "inProgress":
              oCircle.addStyleClass("stepActive");
              if (oIcon) oIcon.addStyleClass("stepIconActive");
              break;
            default:
              oCircle.addStyleClass("stepWaiting");
              if (oIcon) oIcon.addStyleClass("stepIconWaiting");
              break;
          }
        });
      }
    });
  }
);