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
            // 1. 이미 로그인된 세션이 있는 경우 -> 로그인 화면을 건너뛰고 바로 Main 화면으로 이동
            if (sessionStorage.getItem("zaisLoggedIn") === "true") {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteMain", {}, true);
                return;
            }

            // 2. 로그인이 안 된 경우 -> 폼 입력 필드 및 에러 상태 초기화
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

        /* 
           onLogin()
            1. 로그인 버튼 클릭
            2. ID / Password Input에서 Enter 입력
           test / test 계정으로 Mock 로그인.
        */
        onLogin() {
            const oLoginModel = this.getView().getModel("login");

            const sUserId = (oLoginModel.getProperty("/userId") || "").trim();
            const sPassword = oLoginModel.getProperty("/password") || "";

            const oUserIdInput = this.byId("userIdInput");
            const oPasswordInput = this.byId("passwordInput");

            // 이전 로그인 시도 에러 상태 초기화
            oUserIdInput.setValueState("None");
            oPasswordInput.setValueState("None");

            let bValid = true;

            if (!sUserId) {
                oUserIdInput.setValueState("Error");
                oUserIdInput.setValueStateText("사용자 ID를 입력하세요.");
                bValid = false;
            }

            if (!sPassword) {
                oPasswordInput.setValueState("Error");
                oPasswordInput.setValueStateText("비밀번호를 입력하세요.");
                bValid = false;
            }

            if (!bValid) {
                return;
            }

            // Mock Login (test / test)
            if (sUserId === "test" && sPassword === "test") {
                MessageToast.show("로그인에 성공했습니다.");

                // 1. 세션에 로그인 상태 저장
                sessionStorage.setItem("zaisLoggedIn", "true");

                // 2. Fiori Launchpad Home(#Shell-home)으로 이동
                if (window.sap && sap.ushell && sap.ushell.Container) {
                    window.location.hash = "#Shell-home";
                } else {
                    // 런치패드 환경이 아닐 경우 Main 화면으로 이동
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("RouteMain");
                }
                return;
            }

            MessageBox.error(
                "ID 또는 비밀번호가 올바르지 않습니다."
            );
        }

    });

});