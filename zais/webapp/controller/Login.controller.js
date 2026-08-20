sap.ui.define(
  [
    // SAPUI5 MVC의 기본 Controller 클래스
    "sap/ui/core/mvc/Controller",

    // JSON 형식의 데이터를 화면과 연결하기 위한 Model
    "sap/ui/model/json/JSONModel",

    // 경고 / 오류 / 안내 Dialog를 표시하기 위한 Control
    "sap/m/MessageBox",

    // 짧은 성공 메시지를 표시하기 위한 Control
    "sap/m/MessageToast",
  ],
  (Controller, JSONModel, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.Login", {
      onInit() {
        // 로그인 화면에서 사용할 데이터를 JavaScript Object 형태로 생성.
        const oLoginModel = new JSONModel({
          userId: "",
          password: "",
          isPasswordVisible: false,
        });

        this.getView().setModel(oLoginModel, "login");

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
        const bIsLoggedIn =
          sessionStorage.getItem("zaisLoggedIn") === "true" ||
          localStorage.getItem("zaisLoggedIn") === "true";

        if (bIsLoggedIn) {
          this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
          return;
        }

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

      onTogglePassword() {
        // 비밀번호 표시 토글
        const oLoginModel = this.getView().getModel("login");
        const bVisible = oLoginModel.getProperty("/isPasswordVisible");

        oLoginModel.setProperty("/isPasswordVisible", !bVisible);
      },

      onForgotPassword() {
        // 비밀번호 찾기 기능 안내
        MessageBox.information("비밀번호 찾기 기능은 추후 구현 예정입니다.");
      },

      onNavToSignup() {
        // 회원가입 화면으로 이동
        this.getOwnerComponent().getRouter().navTo("RouteSignup");
      },

      onInputChange(oEvent) {
        const oInput = oEvent.getSource();
        if (oInput && oInput.getValueState() !== "None") {
          oInput.setValueState("None");
          oInput.setValueStateText("");
        }
      },

      onLogin() {
        const oUserIdInput = this.byId("userIdInput");
        const oPasswordInput = this.byId("passwordInput");
        const oLoginModel = this.getView().getModel("login");

        const sUserId = (
          oUserIdInput
            ? oUserIdInput.getValue()
            : oLoginModel.getProperty("/userId") || ""
        ).trim();

        const sPassword = oPasswordInput
          ? oPasswordInput.getValue()
          : oLoginModel.getProperty("/password") || "";

        // 입력값 모델에 동기화
        oLoginModel.setProperty("/userId", sUserId);
        oLoginModel.setProperty("/password", sPassword);

        // 이전 오류 상태 초기화
        oUserIdInput.setValueState("None");
        oPasswordInput.setValueState("None");

        let bValid = true;

        // ID 확인
        if (!sUserId) {
          oUserIdInput.setValueState("Error");
          oUserIdInput.setValueStateText("사용자 ID를 입력하세요.");
          bValid = false;
        }

        // 비밀번호 확인
        if (!sPassword) {
          oPasswordInput.setValueState("Error");
          oPasswordInput.setValueStateText("비밀번호를 입력하세요.");
          bValid = false;
        }

        if (!bValid) {
          MessageToast.show("ID와 비밀번호를 모두 입력하세요.");
          return;
        }

        // manifest.json의 loginService 사용
        const oModel = this.getOwnerComponent().getModel("loginService");

        if (!oModel) {
          MessageBox.error("SAP 로그인 서비스를 찾을 수 없습니다.");
          return;
        }

        // SAP LoginSet에 전달할 데이터
        const oLoginData = {
          UserId: sUserId,
          Password: sPassword,
          Success: false,
          UserName: "",
        };

        // SAP OData 호출
        oModel.create("/LoginSet", oLoginData, {
          success: function (oData) {
            console.log("SAP 로그인 응답:", oData);

            // 로그인 성공
            if (oData.Success === true) {
              MessageToast.show(
                `${oData.UserName || sUserId}님 로그인되었습니다.`,
              );

              // 세션 및 로컬 저장소에 로그인 상태 저장
              sessionStorage.setItem("zaisLoggedIn", "true");
              sessionStorage.setItem("zaisUserId", sUserId);
              sessionStorage.setItem("zaisUserName", oData.UserName || "");

              localStorage.setItem("zaisLoggedIn", "true");
              localStorage.setItem("zaisUserId", sUserId);
              localStorage.setItem("zaisUserName", oData.UserName || "");

              // 비밀번호 초기화
              oLoginModel.setProperty("/password", "");

              // Launchpad Header 복구
              document.body.classList.remove("login-active");

              if (window.sap && sap.ushell && sap.ushell.Container) {
                try {
                  const oRenderer = sap.ushell.Container.getRenderer("fiori2");

                  if (oRenderer && oRenderer.setHeaderVisibility) {
                    oRenderer.setHeaderVisibility(true, false, ["app"]);
                  }
                } catch (e) {
                  console.warn("Header 복구 실패:", e);
                }
              }

              // 메인 화면 이동
              this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
            } else {
              // 로그인 실패

              // ID / PW 모두 다시 수정 가능하도록 설정
              oUserIdInput.setEditable(true);
              oPasswordInput.setEditable(true);

              oUserIdInput.setEnabled(true);
              oPasswordInput.setEnabled(true);

              // 둘 다 오류 표시
              oUserIdInput.setValueState("Error");
              oPasswordInput.setValueState("Error");

              oUserIdInput.setValueStateText("ID를 다시 확인하세요.");

              oPasswordInput.setValueStateText("비밀번호를 다시 확인하세요.");

              // 팝업 대신 Toast 사용
              MessageToast.show("ID 또는 비밀번호가 올바르지 않습니다.");

              // 아이디 입력창부터 다시 입력 가능
              oUserIdInput.focus();
            }
          }.bind(this),

          error: function (oError) {
            console.error("SAP 로그인 오류:", oError);

            MessageBox.error("SAP 서버에서 로그인 정보를 확인하지 못했습니다.");
          },
        });
      },
    });
  },
);
