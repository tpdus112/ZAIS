sap.ui.define(
  [
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/base/Log",
    "zais/scm/zais/controller/modal/MM/MMDataService",
    "zais/scm/zais/controller/modal/PP/PPDataService",
    "zais/scm/zais/controller/modal/SD/SDDataService"
  ],
  (
    Fragment,
    XMLView,
    MessageToast,
    MessageBox,
    Log,
    MMDataService,
    PPDataService,
    SDDataService
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
              "/modalConfig/" + sStepKey
            )) || {
            title: sStepKey + " 목록",
            sapGuiName: "SAP GUI 열기",
            sapGuiRoute: "T-CODE",
            totalCount: 0
          };

        const MATNR_MAP = {
          HBMProd: "AI-H-HBM3E",
          BGPProd: "AI-H-BGP",
          GPUProd: "AI-H-GPU",
          AISAssembly: "AI-F-AIS"
        };

        // 먼저 currentModal 생성
        if (oDashboardModel) {
          oDashboardModel.setProperty(
            "/currentModal",
            {
              stepKey: sStepKey,
              title: oModalConfig.title,
              matnr: MATNR_MAP[sStepKey] || "",
              sapGuiName:
                oModalConfig.sapGuiName ||
                "SAP GUI 열기",
              sapGuiRoute:
                oModalConfig.sapGuiRoute || "",
              totalCount:
                oModalConfig.totalCount || 0
            }
          );
        }

        // 2. 프로세스별 데이터 조회
        // MM
        if (sStepKey === "PR") {
          MMDataService.loadPurchaseRequests(
            oComponent,
            oDashboardModel
          );
        } else if (sStepKey === "PO") {
          MMDataService.loadPurchaseOrders(
            oComponent,
            oDashboardModel
          );
        } else if (sStepKey === "GR") {
          MMDataService.loadGoodsReceipts(
            oComponent,
            oDashboardModel
          );
        }
        // PP
        else if (sStepKey === "DramProd") {
          PPDataService.loadDramProdData(
            oComponent,
            oDashboardModel
          );
        } else if (
          sStepKey === "HBMProd" ||
          sStepKey === "BGPProd" ||
          sStepKey === "GPUProd" ||
          sStepKey === "AISAssembly"
        ) {
          PPDataService.loadProdOrderData(
            oComponent,
            oDashboardModel,
            sStepKey,
            MATNR_MAP[sStepKey]
          );
        }
        // SD
        else if (sStepKey === "SO") {
          SDDataService.loadSalesOrders(
            oComponent,
            oDashboardModel
          );
        } else if (sStepKey === "Delivery") {
          SDDataService.loadDeliveryList(
            oComponent,
            oDashboardModel
          );
        } else if (sStepKey === "PGI") {
          SDDataService.loadPgiList(
            oComponent,
            oDashboardModel
          );
        } else if (sStepKey === "DeliveryComplete") {
          SDDataService.loadDeliveryCompleteList(
            oComponent,
            oDashboardModel
          );
        }

        // 3. 공통 프래그먼트 다이얼로그 로드
        if (!_pDialog) {
          _pDialog = Fragment.load({
            id: "commonProcessModalFragment",
            name:
              "zais.scm.zais.view.modal.CommonModalDialog",
            controller: this
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
                "dashboard"
              );
            }

            const oTitle = Fragment.byId(
              "commonProcessModalFragment",
              "modalDialogTitle"
            );

            if (oTitle) {
              oTitle.setText(
                oModalConfig.title
              );
            }

            const oBtnSapGui = Fragment.byId(
              "commonProcessModalFragment",
              "btnSapGui"
            );

            if (oBtnSapGui) {
              oBtnSapGui.setText(
                oModalConfig.sapGuiName ||
                  "SAP GUI 열기"
              );
            }

            // 4. 프로세스별 View 삽입
            const oSlot = Fragment.byId(
              "commonProcessModalFragment",
              "modalViewSlot"
            );

            if (oSlot) {
              oSlot.destroyItems();

              // 모달 뷰 경로 결정 (MM, PP, SD 서브폴더 반영)
              let sModalViewName = "";

              if (
                sStepKey === "PR" ||
                sStepKey === "PO" ||
                sStepKey === "GR"
              ) {
                sModalViewName =
                  "zais.scm.zais.view.modal.MM." +
                  sStepKey;
              } else if (sStepKey === "DramProd") {
                // DRAM REM 반복생산 현황 모달 뷰
                sModalViewName =
                  "zais.scm.zais.view.modal.PP.DramProd";
              } else if (
                sStepKey === "HBMProd" ||
                sStepKey === "BGPProd" ||
                sStepKey === "GPUProd" ||
                sStepKey === "AISAssembly"
              ) {
                // 공통 생산오더 모달 뷰
                sModalViewName =
                  "zais.scm.zais.view.modal.PP.ProdOrder";
              } else if (
                sStepKey === "SO" ||
                sStepKey === "Delivery" ||
                sStepKey === "PGI" ||
                sStepKey === "DeliveryComplete"
              ) {
                // SD 영업/출하 모달 뷰
                sModalViewName =
                  "zais.scm.zais.view.modal.SD." +
                  sStepKey;
              } else {
                sModalViewName =
                  "zais.scm.zais.view.modal." +
                  sStepKey;
              }

              const fnCreateView = () => {
                return XMLView.create({
                  viewName: sModalViewName
                });
              };

              const pView = oComponent
                ? oComponent.runAsOwner(fnCreateView)
                : fnCreateView();

              pView
                .then((oModalInnerView) => {
                  if (oDashboardModel) {
                    oModalInnerView.setModel(
                      oDashboardModel,
                      "dashboard"
                    );
                  }

                  oView.addDependent(oModalInnerView);
                  oSlot.destroyItems();
                  oSlot.addItem(oModalInnerView);
                })
                .catch((err) => {
                  Log.error(
                    "Failed to load modal view for " +
                      sStepKey +
                      " (" +
                      sModalViewName +
                      "): " +
                      err
                  );
                });
            }

            oDialog.open();
          })
          .catch((err) => {
            Log.error(
              "Failed to open process modal dialog: " +
                err
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
              "dashboard"
            );

          const sRoute = oModel
            ? oModel.getProperty(
                "/currentModal/sapGuiRoute"
              )
            : "";

          const sTitle = oModel
            ? oModel.getProperty(
                "/currentModal/title"
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
              ")"
          );
        } else {
          MessageToast.show(
            "SAP GUI 트랜잭션 화면을 호출합니다."
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
      }
    };
  }
);