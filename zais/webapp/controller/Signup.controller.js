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

      onInputChange(oEvent) {
        const oInput = oEvent.getSource();
        if (oInput && oInput.getValueState() !== "None") {
          oInput.setValueState("None");
          oInput.setValueStateText("");
        }
      },

      onSignup() {
        const oNameInput = this.byId("nameInput");
        const oUserIdInput = this.byId("signupUserIdInput");
        const oPasswordInput = this.byId("signupPasswordInput");
        const oSignupModel = this.getView().getModel("signup");

        const sName = (
          oNameInput
            ? oNameInput.getValue()
            : oSignupModel.getProperty("/name") || ""
        ).trim();
        const sUserId = (
          oUserIdInput
            ? oUserIdInput.getValue()
            : oSignupModel.getProperty("/userId") || ""
        ).trim();
        const sPassword = oPasswordInput
          ? oPasswordInput.getValue()
          : oSignupModel.getProperty("/password") || "";

        // 모델 동기화
        if (oSignupModel) {
          oSignupModel.setProperty("/name", sName);
          oSignupModel.setProperty("/userId", sUserId);
          oSignupModel.setProperty("/password", sPassword);
        }

        // 이전 에러 상태 초기화
        if (oNameInput) oNameInput.setValueState("None");
        if (oUserIdInput) oUserIdInput.setValueState("None");
        if (oPasswordInput) oPasswordInput.setValueState("None");

        let bValid = true;

        if (!sName) {
          if (oNameInput) {
            oNameInput.setValueState("Error");
            oNameInput.setValueStateText("이름을 입력하세요.");
          }
          bValid = false;
        }

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
          MessageToast.show("모든 항목을 입력하세요.");
          return;
        }

        // 회원가입 버튼 비활성화 (중복 클릭 방지)
        const oSignupButton = this.byId("signupButton");
        if (oSignupButton) {
          oSignupButton.setEnabled(false);
        }

        // OData 모델 가져오기
        const oLoginService = this.getOwnerComponent().getModel("loginService");

        if (!oLoginService) {
          if (oSignupButton) oSignupButton.setEnabled(true);
          MessageBox.error("SAP 로그인/회원가입 서비스를 찾을 수 없습니다.");
          return;
        }

        const oRegisterData = {
          UserId: sUserId,
          Password: sPassword,
          UserName: sName,
          Success: false,
          Message: "",
        };

        oLoginService.create("/RegisterSet", oRegisterData, {
          success: (oData) => {
            if (oSignupButton) oSignupButton.setEnabled(true);

            // SAP 백엔드에서 명시적으로 실패 메시지를 보낸 경우 (ID 중복 등)
            const bExplicitFailure =
              oData &&
              (oData.Success === false || oData.Success === "false") &&
              oData.Message &&
              (oData.Message.includes("실패") ||
                oData.Message.includes("존재") ||
                oData.Message.includes("중복") ||
                oData.Message.includes("오류"));

            if (bExplicitFailure) {
              MessageBox.warning(oData.Message);
              return;
            }

            // 회원가입 성공: 토스트 표시 및 로그인 화면으로 즉시 이동
            MessageToast.show(
              oData?.Message || "회원가입이 완료되었습니다. 로그인해 주세요.",
            );

            // 입력값 초기화
            oSignupModel.setData({
              name: "",
              userId: "",
              password: "",
              isPasswordVisible: false,
            });

            // 로그인 화면으로 복귀
            this.getOwnerComponent().getRouter().navTo("RouteLogin");
          },
          error: (oError) => {
            if (oSignupButton) oSignupButton.setEnabled(true);
            console.error("Signup OData service error:", oError);

            // SAP OData 에러 메시지 추출
            let sErrorMessage = "회원가입 처리 중 SAP 서버 오류가 발생했습니다.";
            if (oError && oError.responseText) {
              try {
                const oParsed = JSON.parse(oError.responseText);
                if (
                  oParsed.error &&
                  oParsed.error.message &&
                  oParsed.error.message.value
                ) {
                  sErrorMessage = oParsed.error.message.value;
                }
              } catch (e) {
                const aMatch = oError.responseText.match(
                  /<message[^>]*>([^<]+)<\/message>/i,
                );
                if (aMatch && aMatch[1]) {
                  sErrorMessage = aMatch[1];
                }
              }
            } else if (oError && oError.message) {
              sErrorMessage = oError.message;
            }

            MessageBox.error(sErrorMessage);
          },
        });
      },
    });
  },
);
