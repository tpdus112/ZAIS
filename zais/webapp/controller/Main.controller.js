sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.Main", {
        onInit() {
        },

        // 로그아웃 처리
        onLogout() {
            MessageBox.confirm("로그아웃 하시겠습니까?", {
                title: "로그아웃",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        // 로그인 세션 제거
                        sessionStorage.removeItem("zaisLoggedIn");

                        MessageToast.show("로그아웃되었습니다.");

                        // Login 화면으로 라우팅 이동
                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("RouteLogin", {}, true);
                    }
                }
            });
        }
    });
});