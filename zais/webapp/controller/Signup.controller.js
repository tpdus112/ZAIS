sap.ui.define(
  [
    // SAPUI5 MVC의 기본 Controller 클래스
    "sap/ui/core/mvc/Controller",

    // JSON Model
    "sap/ui/model/json/JSONModel",

    // Dialog & Toast
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  (Controller, JSONModel, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.Signup", {
      onInit() {
        // 회원가입 입력 데이터 모델 초기화
        const oSignupModel = new JSONModel({
          name: "",
          userId: "",
          password: "",
          isPasswordVisible: false,
        });

        this.getView().setModel(oSignupModel, "signup");

        // 라우터 이벤트 등록
        const oRouter = this.getOwnerComponent().getRouter();
        if (oRouter) {
          const oRoute = oRouter.getRoute("RouteSignup");
          if (oRoute) {
            oRoute.attachPatternMatched(this._onRouteMatched, this);
          }
        }
      },

      _onRouteMatched() {
        // 폼 필드 및 에러 상태 초기화
        const oSignupModel = this.getView().getModel("signup");
        if (oSignupModel) {
          oSignupModel.setData({
            name: "",
            userId: "",
            password: "",
            isPasswordVisible: false,
          });
        }

        const oNameInput = this.byId("nameInput");
        const oUserIdInput = this.byId("signupUserIdInput");
        const oPasswordInput = this.byId("signupPasswordInput");

        if (oNameInput) {
          oNameInput.setValueState("None");
        }
        if (oUserIdInput) {
          oUserIdInput.setValueState("None");
        }
        if (oPasswordInput) {
          oPasswordInput.setValueState("None");
        }
      },

      onTogglePassword() {
        const oSignupModel = this.getView().getModel("signup");
        const bVisible = oSignupModel.getProperty("/isPasswordVisible");

        oSignupModel.setProperty("/isPasswordVisible", !bVisible);
      },

      onNavToLogin() {
        // 로그인 화면으로 이동
        this.getOwnerComponent().getRouter().navTo("RouteLogin");
      },

      onSignup() {
        console.log("onSignup 실행됨");

        const oSignupModel = this.getView().getModel("signup");

        const sName = (oSignupModel.getProperty("/name") || "").trim();
        const sUserId = (oSignupModel.getProperty("/userId") || "").trim();
        const sPassword = oSignupModel.getProperty("/password") || "";

        const oNameInput = this.byId("nameInput");
        const oUserIdInput = this.byId("signupUserIdInput");
        const oPasswordInput = this.byId("signupPasswordInput");

        // 이전 에러 상태 초기화
        oNameInput.setValueState("None");
        oUserIdInput.setValueState("None");
        oPasswordInput.setValueState("None");

        let bValid = true;

        if (!sName) {
          oNameInput.setValueState("Error");
          oNameInput.setValueStateText("이름을 입력하세요.");
          bValid = false;
        }

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

        // manifest.json에 등록한 OData Model 가져오기
        const oLoginService = this.getOwnerComponent().getModel("loginService");

        // ABAP Register Entity로 전달할 데이터
        const oRegisterData = {
          UserId: sUserId,
          Password: sPassword,
          UserName: sName,
          Success: false,
          Message: "",
        };

        // 회원가입 버튼
        const oSignupButton = this.byId("signupButton");

        // 중복 클릭 방지
        oSignupButton.setEnabled(false);

        // RegisterSet에 POST 요청
        oLoginService.create("/RegisterSet", oRegisterData, {
          // OData 요청 성공
          success: (oData) => {
            // 버튼 다시 활성화
            oSignupButton.setEnabled(true);

            // ABAP에서 회원가입 성공을 반환한 경우
            if (oData.Success === true) {
              MessageBox.success(
                oData.Message || "회원가입이 완료되었습니다.",
                {
                  title: "회원가입 성공",

                  onClose: () => {
                    // 입력값 초기화
                    oSignupModel.setData({
                      name: "",
                      userId: "",
                      password: "",
                      isPasswordVisible: false,
                    });

                    // 로그인 화면으로 이동
                    this.getOwnerComponent().getRouter().navTo("RouteLogin");
                  },
                },
              );
            } else {
              // ID 중복 등 ABAP에서 Success=false 반환
              MessageBox.warning(oData.Message || "회원가입에 실패했습니다.");
            }
          },

          // OData 통신 자체가 실패한 경우
          error: (oError) => {
            oSignupButton.setEnabled(true);

            console.error("Signup OData Error:", oError);

            MessageBox.error("회원가입 처리 중 서버 오류가 발생했습니다.");
          },
        });
      },
    });
  },
);
