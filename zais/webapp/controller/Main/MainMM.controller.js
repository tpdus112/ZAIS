sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "zais/scm/zais/controller/modal/ModalManager",
    "zais/scm/zais/controller/modal/MM/MMDataService"
  ],
  (
    Controller,
    ModalManager,
    MMDataService
  ) => {
    "use strict";

    return Controller.extend(
      "zais.scm.zais.controller.main.MainMM",
      {
        onInit() {
          const oComponent =
            this.getOwnerComponent();

          // dashboard 모델 가져오기
          let oDashboardModel =
            this.getView().getModel(
              "dashboard"
            );

          if (!oDashboardModel) {
            oDashboardModel =
              oComponent.getModel(
                "dashboard"
              );

            if (oDashboardModel) {
              this.getView().setModel(
                oDashboardModel,
                "dashboard"
              );
            }
          }

          // 실제 SAP PO + GR 데이터 조회 후
          // 주요 자재 입고 진행현황 계산
          if (oDashboardModel) {
            MMDataService
              .loadMaterialReceiptProgress(
                oComponent,
                oDashboardModel
              );
          }

          this._bindStepEvents();
        },

        onAfterRendering() {
          this._bindStepEvents();
        },

        /**
         * MM 프로세스 아이콘 클릭 이벤트
         */
        _bindStepEvents() {
          const aSteps = [
            {
              id: "stepPR",
              key: "PR"
            },
            {
              id: "stepPO",
              key: "PO"
            },
            {
              id: "stepGR",
              key: "GR"
            }

            // 입고 완료는 별도 모달 없음
            // stepGRComplete 제외
          ];

          aSteps.forEach((oStep) => {
            const oControl =
              this.byId(oStep.id);

            if (oControl) {
              oControl
                .$()
                .off("click")
                .on("click", () => {
                  ModalManager.openModal(
                    this,
                    oStep.key
                  );
                });
            }
          });
        }
      }
    );
  }
);