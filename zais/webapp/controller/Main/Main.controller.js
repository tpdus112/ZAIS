sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
  ],
  (
    Controller,
    MessageToast
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

          this._restoreLaunchpadHeader();
        },

        onAfterRendering() {
          this._restoreLaunchpadHeader();
        },

        _restoreLaunchpadHeader() {
          // 1. body 클래스 복구
          document.body.classList.remove(
            "login-active"
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
                  "fiori2"
                );

              if (oRenderer) {
                if (
                  typeof oRenderer.setHeaderVisibility ===
                  "function"
                ) {
                  oRenderer.setHeaderVisibility(
                    true,
                    false
                  );
                }

                if (
                  typeof oRenderer.showShellHeader ===
                  "function"
                ) {
                  oRenderer.showShellHeader(
                    true
                  );
                }

                if (
                  typeof oRenderer.setLetterboxMode ===
                  "function"
                ) {
                  oRenderer.setLetterboxMode(
                    false
                  );
                }

                // 런치패드 헤더 계정 / 프로필 버튼 숨김
                if (
                  typeof oRenderer.hideHeaderItem ===
                  "function"
                ) {
                  try {
                    oRenderer.hideHeaderItem(
                      [
                        "userActionsMenuHeaderButton",
                        "meAreaHeaderButton",
                        "meAreaButton"
                      ],
                      false
                    );
                  } catch (err) {
                    // ignore
                  }
                }
              }
            } catch (e) {
              console.log(
                "FLP Renderer restore in Main:",
                e
              );
            }
          }
        },

        onLogout() {
          // 브라우저 세션 및 로컬 스토리지 로그인 상태 삭제
          if (typeof window !== "undefined") {
            if (window.sessionStorage) {
              sessionStorage.removeItem("zais_is_logged_in");
              sessionStorage.removeItem("zais_user_id");
              sessionStorage.removeItem("zais_user_name");
            }
            if (window.localStorage) {
              localStorage.removeItem("zais_is_logged_in");
              localStorage.removeItem("zais_user_id");
              localStorage.removeItem("zais_user_name");
            }
          }

          document.body.classList.add(
            "login-active"
          );

          MessageToast.show(
            "로그아웃되었습니다."
          );

          this.getOwnerComponent()
            .getRouter()
            .navTo(
              "RouteLogin",
              {},
              true
            );
        }
      }
    );
  }
);