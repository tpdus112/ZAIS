sap.ui.define([
    "sap/ui/core/UIComponent",
    "zais/scm/zais/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("zais.scm.zais.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // FLP 로그아웃 시 ZAIS 로그인 상태 삭제

            if (window.sap && sap.ushell && sap.ushell.Container) {
                sap.ushell.Container.attachLogoutEvent(() => {
                sessionStorage.removeItem("zaisLoggedIn");
            });
            }
            
            const oRouter = this.getRouter();

            // 라우팅 변경 시 런치패드 헤더 제어 (로그인 화면에서는 숨김, 메인 화면에서는 표시)
            oRouter.attachRouteMatched((oEvent) => {
                const sRouteName = oEvent.getParameter("name");
                const bIsAuthScreen = (sRouteName === "RouteLogin" || sRouteName === "RouteSignup");

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
                            if (oRenderer && oRenderer.setHeaderVisibility) {
                                oRenderer.setHeaderVisibility(true, false, ["app"]);
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            });

            // enable routing
            oRouter.initialize();
        }
    });
});