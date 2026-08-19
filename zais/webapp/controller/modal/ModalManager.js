sap.ui.define(
  [
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/base/Log",
  ],
  (Fragment, XMLView, MessageToast, MessageBox, Log) => {
    "use strict";

    let _pDialog = null;
    let _oCurrentDialog = null;

    return {
      /**
       * 프로세스 모달 다이얼로그 열기
       * @param {sap.ui.core.mvc.Controller} oParentController 호출 컨트롤러
       * @param {string} sStepKey 단계 키 (예: 'PR', 'PO', 'DramProd' 등)
       */
      openModal(oParentController, sStepKey) {
        const oView = oParentController.getView();
        const oComponent = oParentController.getOwnerComponent();
        const oDashboardModel =
          oView.getModel("dashboard") || oComponent.getModel("dashboard");

        // 1. 모달 메타데이터 설정
        const oModalConfig = (oDashboardModel &&
          oDashboardModel.getProperty("/modalConfig/" + sStepKey)) || {
          title: sStepKey + " 목록",
          sapGuiName: "SAP GUI 열기",
          sapGuiRoute: "T-CODE",
          totalCount: 0,
        };

        if (oDashboardModel) {
          oDashboardModel.setProperty("/currentModal", {
            stepKey: sStepKey,
            title: oModalConfig.title,
            sapGuiName: oModalConfig.sapGuiName || "SAP GUI 열기",
            sapGuiRoute: oModalConfig.sapGuiRoute || "",
          });
        }

        // 2. 공통 프래그먼트 다이얼로그 로드
        if (!_pDialog) {
          _pDialog = Fragment.load({
            id: "commonProcessModalFragment",
            name: "zais.scm.zais.view.modal.CommonModalDialog",
            controller: this,
          }).then((oDialog) => {
            oView.addDependent(oDialog);
            _oCurrentDialog = oDialog;
            return oDialog;
          });
        }

        _pDialog
          .then((oDialog) => {
            if (oDashboardModel) {
              oDialog.setModel(oDashboardModel, "dashboard");
            }

            // 타이틀 및 SAP GUI 버튼 텍스트 명시적 갱신
            const oTitle = Fragment.byId(
              "commonProcessModalFragment",
              "modalDialogTitle",
            );
            if (oTitle) {
              oTitle.setText(oModalConfig.title);
            }
            const oBtnSapGui = Fragment.byId(
              "commonProcessModalFragment",
              "btnSapGui",
            );
            if (oBtnSapGui) {
              oBtnSapGui.setText(oModalConfig.sapGuiName || "SAP GUI 열기");
            }

            // 3. 다이얼로그 내부 슬롯에 해당 프로세스 전용 뷰 동적 임베딩
            const oSlot = Fragment.byId(
              "commonProcessModalFragment",
              "modalViewSlot",
            );
            if (oSlot) {
              oSlot.destroyItems();

              XMLView.create({
                viewName: "zais.scm.zais.view.modal." + sStepKey,
              })
                .then((oModalInnerView) => {
                  if (oDashboardModel) {
                    oModalInnerView.setModel(oDashboardModel, "dashboard");
                  }
                  oSlot.addItem(oModalInnerView);
                })
                .catch((err) => {
                  Log.error(
                    "Failed to load modal view for " + sStepKey + ": " + err,
                  );
                });
            }

            oDialog.open();
          })
          .catch((err) => {
            Log.error("Failed to open process modal dialog: " + err);
          });
      },

      /**
       * SAP GUI 열기 버튼 클릭 핸들러
       */
      onOpenSapGui() {
        if (_oCurrentDialog) {
          const oModel = _oCurrentDialog.getModel("dashboard");
          const sRoute = oModel
            ? oModel.getProperty("/currentModal/sapGuiRoute")
            : "";
          const sTitle = oModel
            ? oModel.getProperty("/currentModal/title")
            : "";

          MessageBox.information(
            "[" +
              sTitle +
              "] 에 연결된 SAP GUI (" +
              sRoute +
              ") 트랜잭션 화면을 호출합니다.\n(경로: SAP GUI -> " +
              sRoute +
              ")",
          );
        } else {
          MessageToast.show("SAP GUI 트랜잭션 화면을 호출합니다.");
        }
      },

      /**
       * 모달 닫기
       */
      onCloseModalDialog() {
        if (_oCurrentDialog) {
          _oCurrentDialog.close();
        }
      },
    };
  },
);
