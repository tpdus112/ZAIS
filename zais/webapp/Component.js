sap.ui.define(
  ["sap/ui/core/UIComponent", "zais/scm/zais/model/models"],
  (UIComponent, models) => {
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

          // FLP 로그아웃 시 ZAIS 로그인 세션 삭제
          sap.ushell.Container.attachLogoutEvent(() => {
            sessionStorage.removeItem("zaisLoggedIn");
          });
        }

        const oRouter = this.getRouter();

        // 1. 라우팅 가드: 로그인이 안 되어 있는데 메인 화면(RouteMain)으로 직접 접근한 경우 -> RouteLogin으로 리다이렉트
        oRouter.attachBeforeRouteMatched((oEvent) => {
          const sRouteName = oEvent.getParameter("name");
          const bIsLoggedIn = sessionStorage.getItem("zaisLoggedIn") === "true";

          if (sRouteName === "RouteMain" && !bIsLoggedIn) {
            oEvent.preventDefault();
            oRouter.navTo("RouteLogin", {}, true);
            return;
          }
        });

        // 2. 라우팅 변경 시 런치패드 헤더 제어 및 레터박스 비활성화
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
