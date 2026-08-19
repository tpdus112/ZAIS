sap.ui.define([
    // SAPUI5 MVC의 기본 Controller 클래스
    "sap/ui/core/mvc/Controller",

    // JSON 형식의 데이터를 화면과 연결하기 위한 Model
    "sap/ui/model/json/JSONModel",

    // 경고 / 오류 / 안내 Dialog를 표시하기 위한 Control
    "sap/m/MessageBox",

    // 짧은 성공 메시지를 표시하기 위한 Control
    "sap/m/MessageToast"

], (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast
) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.Login", {

        onInit() {
            // 로그인 화면에서 사용할 데이터를 JavaScript Object 형태로 생성.
            const oLoginModel = new JSONModel({
                userId: "",
                password: "",
                isPasswordVisible: false
            });

            this.getView().setModel(
                oLoginModel,
                "login"
            );

            // 라우터가 RouteLogin으로 이동할 때마다 체크
            const oRouter = this.getOwnerComponent().getRouter();
            if (oRouter) {
                const oRoute = oRouter.getRoute("RouteLogin");
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onRouteMatched, this);
                }
            }
        },

        _onRouteMatched() {
            // 폼 입력 필드 및 에러 상태 초기화
            const oLoginModel = this.getView().getModel("login");
            if (oLoginModel) {
                oLoginModel.setProperty("/password", "");
                oLoginModel.setProperty("/isPasswordVisible", false);
            }

            const oUserIdInput = this.byId("userIdInput");
            const oPasswordInput = this.byId("passwordInput");
            if (oUserIdInput) {
                oUserIdInput.setValueState("None");
            }
            if (oPasswordInput) {
                oPasswordInput.setValueState("None");
            }
        },

        onTogglePassword() { // 비밀번호 표시 토글
            const oLoginModel = this.getView().getModel("login");
            const bVisible = oLoginModel.getProperty("/isPasswordVisible");

            oLoginModel.setProperty(
                "/isPasswordVisible",
                !bVisible
            );
        },

        onForgotPassword() { // 비밀번호 찾기 기능 안내
            MessageBox.information(
                "비밀번호 찾기 기능은 추후 구현 예정입니다."
            );
        },

        onNavToSignup() { // 회원가입 화면으로 이동
            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteSignup");
        },

        onInputChange(oEvent) {
            const oInput = oEvent.getSource();
            if (oInput && oInput.getValueState() !== "None") {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        },

        /* 
           onLogin()
            1. 로그인 버튼 클릭
            2. ID / Password Input에서 Enter 입력
           test / test 계정으로 Mock 로그인.
        */
        onLogin() {
            const oUserIdInput = this.byId("userIdInput");
            const oPasswordInput = this.byId("passwordInput");
            const oLoginModel = this.getView().getModel("login");

            const sUserId = (oUserIdInput ? oUserIdInput.getValue() : (oLoginModel.getProperty("/userId") || "")).trim();
            const sPassword = oPasswordInput ? oPasswordInput.getValue() : (oLoginModel.getProperty("/password") || "");

            // 모델 값 동기화
            if (oLoginModel) {
                oLoginModel.setProperty("/userId", sUserId);
                oLoginModel.setProperty("/password", sPassword);
            }

            // 이전 에러 상태 초기화
            if (oUserIdInput) oUserIdInput.setValueState("None");
            if (oPasswordInput) oPasswordInput.setValueState("None");

            let bValid = true;

            if (!sUserId) {
                if (oUserIdInput) {
                    oUserIdInput.setValueState("Error");
                    oUserIdInput.setValueStateText("사용자 ID를 입력하세요.");
                }
                bValid = false;
            }

            if (!sPassword) {
                if (oPasswordInput) {
                    oPasswordInput.setValueState("Error");
                    oPasswordInput.setValueStateText("비밀번호를 입력하세요.");
                }
                bValid = false;
            }

            if (!bValid) {
                MessageToast.show("ID와 비밀번호를 모두 입력하세요.");
                return;
            }

            // Mock Login (test / test)
            if (sUserId === "test" && sPassword === "test") {
                MessageToast.show("로그인에 성공했습니다.");

                // 1. 세션에 로그인 상태 저장
                sessionStorage.setItem("zaisLoggedIn", "true");

                // 2. 런치패드 헤더 즉시 복구 및 login-active 제거
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

                // Main 대시보드 화면으로 이동
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteMain", {}, true);
                return;
            }

            MessageBox.error(
                "ID 또는 비밀번호가 올바르지 않습니다."
            );
        }

    });

});