sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "zais/scm/zais/controller/modal/MMDataService",
  ],
  (
    Controller,
    MessageToast,
    MMDataService,
  ) => {
    "use strict";

    return Controller.extend(
      "zais.scm.zais.controller.main.Main",
      {
        onInit() {
          // 대시보드 모델 등록 확인
          const oComponent =
            this.getOwnerComponent();

          let oDashboardModel =
            this.getView().getModel(
              "dashboard",
            );

          if (!oDashboardModel) {
            oDashboardModel =
              oComponent.getModel(
                "dashboard",
              );

            if (oDashboardModel) {
              this.getView().setModel(
                oDashboardModel,
                "dashboard",
              );
            }
          }

          // 실제 SAP PO + GR 데이터로
          // 자재 입고 진행현황 계산
          if (oDashboardModel) {
            MMDataService
              .loadMaterialReceiptProgress(
                oComponent,
                oDashboardModel,
              );
          }

          this._restoreLaunchpadHeader();
        },

        onAfterRendering() {
          this._restoreLaunchpadHeader();
        },

        _restoreLaunchpadHeader() {
          // 1. body 클래스 복구
          document.body.classList.remove(
            "login-active",
          );

          // 2. Fiori Launchpad 표준 렌더러 헤더 및 쉘 강제 복구
          if (
            typeof sap !== "undefined" &&
            sap.ushell &&
            sap.ushell.Container
          ) {
            try {
              const oRenderer =
                sap.ushell.Container.getRenderer(
                  "fiori2",
                );

              if (oRenderer) {
                if (
                  typeof oRenderer.setHeaderVisibility ===
                  "function"
                ) {
                  oRenderer.setHeaderVisibility(
                    true,
                    false,
                  );
                }

                if (
                  typeof oRenderer.showShellHeader ===
                  "function"
                ) {
                  oRenderer.showShellHeader(
                    true,
                  );
                }

                if (
                  typeof oRenderer.setLetterboxMode ===
                  "function"
                ) {
                  oRenderer.setLetterboxMode(
                    false,
                  );
                }
              }
            } catch (e) {
              console.log(
                "FLP Renderer restore in Main:",
                e,
              );
            }
          }
        },

        onLogout() {
          sessionStorage.removeItem(
            "zaisLoggedIn",
          );

          sessionStorage.removeItem(
            "zaisUser",
          );

          document.body.classList.add(
            "login-active",
          );

          MessageToast.show(
            "로그아웃되었습니다.",
          );

          this.getOwnerComponent()
            .getRouter()
            .navTo(
              "RouteLogin",
              {},
              true,
            );
        },
      },
    );
  },
);