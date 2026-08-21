sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "zais/scm/zais/model/models",
    "sap/ui/core/routing/HashChanger"
  ],
  (UIComponent, models, HashChanger) => {
    "use strict";

    return UIComponent.extend("zais.scm.zais.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        config: {
          fullWidth: true,
        },
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set device and dashboard models
        this.setModel(models.createDeviceModel(), "device");
        this.setModel(models.createDashboardModel(), "dashboard");

        // Fiori Launchpad 레터박스(양옆 여백) 강제 해제 및 100% 풀 와이드 설정
        if (window.sap && sap.ushell && sap.ushell.Container) {
          try {
            const oRenderer = sap.ushell.Container.getRenderer("fiori2");
            if (oRenderer && oRenderer.setLetterboxMode) {
              oRenderer.setLetterboxMode(false);
            }
          } catch (e) {
            // ignore
          }
        }

        const oRouter = this.getRouter();

        const bIsLoggedIn =
          (typeof window !== "undefined" &&
            window.sessionStorage &&
            sessionStorage.getItem("zais_is_logged_in") === "true") ||
          (typeof window !== "undefined" &&
            window.localStorage &&
            localStorage.getItem("zais_is_logged_in") === "true");

        // Fiori Launchpad 타일 클릭 및 초기 진입 시 해시 검사 및 자동 분기
        const oHashChanger = HashChanger.getInstance();
        const sCurrentHash = oHashChanger.getHash();

        if (bIsLoggedIn) {
          // 이미 로그인된 경우 초기 빈 해시("") 또는 로그인 화면일 때 즉시 'main'으로 해시 교체
          if (!sCurrentHash || sCurrentHash === "" || sCurrentHash === "login") {
            oHashChanger.replaceHash("main");
          }
        } else {
          // 로그인되지 않은 상태에서 메인 접근 시 로그인 화면으로 교체
          if (sCurrentHash === "main") {
            oHashChanger.replaceHash("");
          }
        }

        // 로그인 세션 상태에 따른 라우팅 가드 (Route Guard)
        oRouter.attachBeforeRouteMatched((oEvent) => {
          const sRouteName = oEvent.getParameter("name");
          const bCurrentLoggedIn =
            (typeof window !== "undefined" &&
              window.sessionStorage &&
              sessionStorage.getItem("zais_is_logged_in") === "true") ||
            (typeof window !== "undefined" &&
              window.localStorage &&
              localStorage.getItem("zais_is_logged_in") === "true");

          // 이미 로그인된 상태에서 로그인 화면에 접근 시 메인으로 자동 이동
          if (sRouteName === "RouteLogin" && bCurrentLoggedIn) {
            oRouter.navTo("RouteMain", {}, true);
          } else if (sRouteName === "RouteMain" && !bCurrentLoggedIn) {
            // 로그인되지 않은 상태에서 메인 화면 접근 시 로그인 화면으로 이동
            oRouter.navTo("RouteLogin", {}, true);
          }
        });

        // 라우팅 변경 시 런치패드 헤더 제어 및 레터박스 비활성화
        oRouter.attachRouteMatched((oEvent) => {
          const sRouteName = oEvent.getParameter("name");
          const bIsAuthScreen =
            sRouteName === "RouteLogin" || sRouteName === "RouteSignup";

          if (bIsAuthScreen) {
            document.body.classList.add("login-active");
            if (window.sap && sap.ushell && sap.ushell.Container) {
              try {
                const oRenderer = sap.ushell.Container.getRenderer("fiori2");
                if (oRenderer && oRenderer.setHeaderVisibility) {
                  oRenderer.setHeaderVisibility(false, false, ["app"]);
                }
              } catch (e) {
                // ignore
              }
            }
          } else {
            document.body.classList.remove("login-active");
            if (window.sap && sap.ushell && sap.ushell.Container) {
              try {
                const oRenderer = sap.ushell.Container.getRenderer("fiori2");
                if (oRenderer) {
                  if (oRenderer.setHeaderVisibility) {
                    oRenderer.setHeaderVisibility(true, false, ["app"]);
                  }
                  if (oRenderer.setLetterboxMode) {
                    oRenderer.setLetterboxMode(false);
                  }
                  if (oRenderer.hideHeaderItem) {
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
                // ignore
              }
            }
          }
        });

        // enable routing
        oRouter.initialize();
      },

      destroy() {
        document.body.classList.remove("login-active");
        if (window.sap && sap.ushell && sap.ushell.Container) {
          try {
            const oRenderer = sap.ushell.Container.getRenderer("fiori2");
            if (oRenderer && oRenderer.setHeaderVisibility) {
              oRenderer.setHeaderVisibility(true, false, ["app"]);
            }
          } catch (e) {
            // ignore
          }
        }
        UIComponent.prototype.destroy.apply(this, arguments);
      },
    });
  },
);
