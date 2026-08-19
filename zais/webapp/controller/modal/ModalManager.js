sap.ui.define(
  [
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/base/Log",
    "zais/scm/zais/controller/modal/MMDataService",
  ],
  (
    Fragment,
    XMLView,
    MessageToast,
    MessageBox,
    Log,
    MMDataService,
  ) => {
    "use strict";

    let _pDialog = null;
    let _oCurrentDialog = null;

    return {
      /**
       * 프로세스 모달 다이얼로그 열기
       */
      openModal(oParentController, sStepKey) {
        const oView = oParentController.getView();
        const oComponent = oParentController.getOwnerComponent();

        const oDashboardModel =
          oView.getModel("dashboard") ||
          oComponent.getModel("dashboard");

        // 1. 모달 메타데이터 설정
const oModalConfig =
  (oDashboardModel &&
    oDashboardModel.getProperty(
      "/modalConfig/" + sStepKey,
    )) || {
    title: sStepKey + " 목록",
    sapGuiName: "SAP GUI 열기",
    sapGuiRoute: "T-CODE",
    totalCount: 0,
  };

// 먼저 currentModal 생성
if (oDashboardModel) {
  oDashboardModel.setProperty(
    "/currentModal",
    {
      stepKey: sStepKey,
      title: oModalConfig.title,
      sapGuiName:
        oModalConfig.sapGuiName ||
        "SAP GUI 열기",
      sapGuiRoute:
        oModalConfig.sapGuiRoute || "",
      totalCount:
        oModalConfig.totalCount || 0,
    },
  );
}

// 2. 그 다음 SAP 데이터 조회
if (sStepKey === "PR") {
  MMDataService.loadPurchaseRequests(
    oComponent,
    oDashboardModel,
  );
}

if (sStepKey === "PO") {
  MMDataService.loadPurchaseOrders(
    oComponent,
    oDashboardModel,
  );
}

if (sStepKey === "GR") {
  MMDataService.loadGoodsReceipts(
    oComponent,
    oDashboardModel,
  );
}

        // 2. 공통 프래그먼트 다이얼로그 로드
        if (!_pDialog) {
          _pDialog = Fragment.load({
            id: "commonProcessModalFragment",
            name:
              "zais.scm.zais.view.modal.CommonModalDialog",
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
              oDialog.setModel(
                oDashboardModel,
                "dashboard",
              );
            }

            const oTitle = Fragment.byId(
              "commonProcessModalFragment",
              "modalDialogTitle",
            );

            if (oTitle) {
              oTitle.setText(
                oModalConfig.title,
              );
            }

            const oBtnSapGui = Fragment.byId(
              "commonProcessModalFragment",
              "btnSapGui",
            );

            if (oBtnSapGui) {
              oBtnSapGui.setText(
                oModalConfig.sapGuiName ||
                  "SAP GUI 열기",
              );
            }

            // 3. 프로세스별 View 삽입
            const oSlot = Fragment.byId(
              "commonProcessModalFragment",
              "modalViewSlot",
            );

            if (oSlot) {
              oSlot.destroyItems();

              XMLView.create({
                viewName:
                  "zais.scm.zais.view.modal." +
                  sStepKey,
              })
                .then(
                  (oModalInnerView) => {
                    if (oDashboardModel) {
                      oModalInnerView.setModel(
                        oDashboardModel,
                        "dashboard",
                      );
                    }

                    oSlot.addItem(
                      oModalInnerView,
                    );
                  },
                )
                .catch((err) => {
                  Log.error(
                    "Failed to load modal view for " +
                      sStepKey +
                      ": " +
                      err,
                  );
                });
            }

            oDialog.open();
          })
          .catch((err) => {
            Log.error(
              "Failed to open process modal dialog: " +
                err,
            );
          });
      },

      /**
       * SAP GUI 열기
       */
      onOpenSapGui() {
        if (_oCurrentDialog) {
          const oModel =
            _oCurrentDialog.getModel(
              "dashboard",
            );

          const sRoute = oModel
            ? oModel.getProperty(
                "/currentModal/sapGuiRoute",
              )
            : "";

          const sTitle = oModel
            ? oModel.getProperty(
                "/currentModal/title",
              )
            : "";

          MessageBox.information(
            "[" +
              sTitle +
              "] 에 연결된 SAP GUI (" +
              sRoute +
              ") 트랜잭션 화면을 호출합니다.\n" +
              "(경로: SAP GUI -> " +
              sRoute +
              ")",
          );
        } else {
          MessageToast.show(
            "SAP GUI 트랜잭션 화면을 호출합니다.",
          );
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