sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/base/Log",
    "zais/scm/zais/controller/modal/ModalManager"
  ],
  (Controller, ODataModel, Log, ModalManager) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainSD", {
      /* =========================================================
       * 초기화
       * ========================================================= */
      onInit() {
        const oComponent = this.getOwnerComponent();

        let oDashboardModel =
          this.getView().getModel("dashboard");

        if (!oDashboardModel && oComponent) {
          oDashboardModel =
            oComponent.getModel("dashboard");

          if (oDashboardModel) {
            this.getView().setModel(
              oDashboardModel,
              "dashboard"
            );
          }
        }

        /* =====================================================
         * SAP OData Model
         * ===================================================== */
        this._oODataModel = new ODataModel(
          "/sap/opu/odata/sap/ZAIS_SCM_SRV/",
          {
            useBatch: false
          }
        );

        /* 기존 하드코딩 하단 데이터 제거 */
        if (oDashboardModel) {
          oDashboardModel.setProperty(
            "/process/sd/materials",
            []
          );
        }

        /* 상단 건수 진행현황 */
        this._loadSdSummary();

        /* 하단 자재별 수량 진행현황 */
        this._loadSdMaterialFlow();

        /* 단계 클릭 */
        this._bindStepEvents();
      },


      /* =========================================================
       * 렌더링 후
       * ========================================================= */
      onAfterRendering() {
        this._bindStepEvents();
        this._applyStepClasses();
      },


      /* =========================================================
       * SD 단계 클릭 이벤트
       * ========================================================= */
      _bindStepEvents() {
        const aSteps = [
          {
            id: "stepSO",
            key: "SO"
          },
          {
            id: "stepDelivery",
            key: "Delivery"
          },
          {
            id: "stepPGI",
            key: "PGI"
          },
          {
            id: "stepDeliveryComplete",
            key: "DeliveryComplete"
          }
        ];

        aSteps.forEach((oStep) => {
          const oControl =
            this.byId(oStep.id);

          if (oControl) {
            oControl
              .$()
              .off("click")
              .on("click", () => {
                ModalManager.openModal(
                  this,
                  oStep.key
                );
              });
          }
        });
      },


      /* =========================================================
       * SD 상단 Summary
       *
       * 건수 기준
       *
       * SO       11 / 11
       * Delivery  5 / 11
       * PGI       5 / 11
       * Complete  4 / 11
       * ========================================================= */
      _loadSdSummary() {
        this._oODataModel.read(
          "/SdSummarySet",
          {
            success: (oData) => {
              const aResults =
                oData.results || [];

              /* SortOrder 기준 */
              aResults.sort(
                (a, b) =>
                  Number(a.SortOrder || 0) -
                  Number(b.SortOrder || 0)
              );

              const oDashboardModel =
                this.getView().getModel(
                  "dashboard"
                );

              if (!oDashboardModel) {
                Log.error("dashboard 모델을 찾을 수 없습니다.");
                return;
              }

              /* =================================================
               * 1. SD 상단 프로세스
               * ================================================= */
              const aCurrentSteps =
                oDashboardModel.getProperty(
                  "/process/sd/steps"
                ) || [];

              const aUpdatedSteps =
                aCurrentSteps.map(
                  (oStep, iIndex) => {
                    const oItem =
                      aResults[iIndex];

                    if (!oItem) {
                      return oStep;
                    }

                    const iTotal =
                      Number(
                        oItem.TotalCount || 0
                      );

                    const iDone =
                      Number(
                        oItem.DoneCount || 0
                      );

                    let sStatusText = oItem.Status || "";
                    if (!sStatusText) {
                      if (iTotal > 0 && iDone >= iTotal) {
                        sStatusText = "완료";
                      } else if (iDone > 0) {
                        sStatusText = "진행 중";
                      } else {
                        sStatusText = "대기";
                      }
                    }

                    const sStepStatus =
                      this._getSdStepStatus(sStatusText);

                    return {
                      ...oStep,

                      count:
                        iDone +
                        " / " +
                        iTotal,

                      rate:
                        sStatusText,

                      status:
                        sStepStatus,

                      statusText:
                        sStatusText,

                      stageKey:
                        oItem.StageKey || ""
                    };
                  }
                );

              oDashboardModel.setProperty(
                "/process/sd/steps",
                aUpdatedSteps
              );

              /* =================================================
               * 원형 아이콘 상태
               * ================================================= */
              this._aSdStepStatuses =
                aUpdatedSteps.map(
                  (oStep) =>
                    oStep.status
                );

              this._applyStepClasses();


              /* =================================================
               * 메인 상단 SD KPI
               *
               * 납품 완료 기준
               * ================================================= */
              const oComplete =
                aResults.find(
                  (oItem) =>
                    oItem.StageKey ===
                    "COMPLETE"
                );

              if (oComplete) {
                const iTotal =
                  Number(
                    oComplete.TotalCount || 0
                  );

                const iDone =
                  Number(
                    oComplete.DoneCount || 0
                  );

                const iProgress =
                  Number(
                    oComplete.Progress || 0
                  );

                oDashboardModel.setProperty(
                  "/header/sd/rate",
                  Math.round(iProgress)
                );

                oDashboardModel.setProperty(
                  "/header/sd/rateText",
                  Math.round(iProgress) +
                    "%"
                );

                oDashboardModel.setProperty(
                  "/header/sd/subText",
                  "납품 완료 기준"
                );

                oDashboardModel.setProperty(
                  "/header/sd/countText",
                  iDone +
                    " / " +
                    iTotal +
                    " 건"
                );
              }

              Log.info(
                "SD Summary 조회 성공: " + JSON.stringify(aResults)
              );
            },

            error: (oError) => {
              Log.error(
                "SdSummarySet 조회 실패:",
                oError
              );
            }
          }
        );
      },


      /* =========================================================
       * OData EntitySet Promise 조회
       * ========================================================= */
      _readEntitySet(sPath) {
        return new Promise(
          (resolve, reject) => {
            this._oODataModel.read(
              sPath,
              {
                success: (oData) => {
                  resolve(
                    oData.results || []
                  );
                },

                error: (oError) => {
                  reject(oError);
                }
              }
            );
          }
        );
      },


      /* =========================================================
       * SD 하단 자재별 수량 흐름
       *
       * SdSalesOrderSet
       *   → SO 수량
       *
       * SdDeliverySet
       *   → 납품 수량
       *
       * SdPgiSet
       *   → PGI 수량
       *
       * SdDeliveryCompleteSet
       *   → 납품 완료 수량
       * ========================================================= */
      _loadSdMaterialFlow() {
  Promise.all([
    /* Sales Order 수량 */
    this._readEntitySet(
      "/SdSalesOrderSet"
    ),

    /* 최종 납품 완료 수량 */
    this._readEntitySet(
      "/SdDeliveryCompleteSet"
    )
  ])
    .then(
      ([
        aSoList,
        aCompleteList
      ]) => {

        const oDashboardModel =
          this.getView().getModel(
            "dashboard"
          );

        if (!oDashboardModel) {
          return;
        }


        /* =========================================
         * 표시 대상 자재
         * ========================================= */
        const aMaterials = [
          {
            code: "AI-F-AIS",
            name: "AIS"
          },
          {
            code: "AI-H-GPU",
            name: "GPU"
          },
          {
            code: "AI-H-HBM3E",
            name: "HBM3E"
          },
          {
            code: "AI-H-DRAM",
            name: "DRAM"
          }
        ];


        /* =========================================
         * 자재별 집계
         * ========================================= */
        const aMaterialFlow =
          aMaterials.map(
            (oMaterial) => {

              /* =====================================
               * 1. SO 수량
               * ===================================== */
              const fSoQty =
                aSoList
                  .filter(
                    (oItem) =>
                      oItem.Matnr ===
                      oMaterial.code
                  )
                  .reduce(
                    (fSum, oItem) =>
                      fSum +
                      Number(
                        oItem.OrderQty || 0
                      ),
                    0
                  );


              /* =====================================
               * 2. 납품 완료 수량
               *
               * BillingQty 기준
               * ===================================== */
              const fDeliveryQty =
                aCompleteList
                  .filter(
                    (oItem) =>
                      oItem.Matnr ===
                      oMaterial.code
                  )
                  .reduce(
                    (fSum, oItem) =>
                      fSum +
                      Number(
                        oItem.BillingQty || 0
                      ),
                    0
                  );


              /* =====================================
               * 3. 진행률
               *
               * 납품 수량 / SO 수량
               * ===================================== */
              const iProgress =
                fSoQty > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (
                          fDeliveryQty /
                          fSoQty
                        ) * 100
                      )
                    )
                  : 0;


              /* =====================================
               * 4. 상태
               * ===================================== */
              let sStatus =
                "대기";

              let sStatusState =
                "None";


              if (
                iProgress >= 100
              ) {
                sStatus =
                  "완료";

                sStatusState =
                  "Success";
              }

              else if (
                iProgress > 0
              ) {
                sStatus =
                  "진행 중";

                sStatusState =
                  "Information";
              }


              /* =====================================
               * 화면 Model
               * ===================================== */
              return {
                code:
                  oMaterial.code,

                name:
                  oMaterial.name,

                soQty:
                  fSoQty,

                deliveryQty:
                  fDeliveryQty,

                soQtyText:
                  this._formatSdQty(
                    fSoQty
                  ),

                deliveryQtyText:
                  this._formatSdQty(
                    fDeliveryQty
                  ),

                progress:
                  iProgress,

                rate:
                  iProgress + "%",

                status:
                  sStatus,

                statusState:
                  sStatusState
              };
            }
          );


        /* =========================================
         * Dashboard 저장
         * ========================================= */
        oDashboardModel.setProperty(
          "/process/sd/materials",
          aMaterialFlow
        );


        Log.info(
          "SD 자재별 납품 현황: " +
          JSON.stringify(
            aMaterialFlow
          )
        );
      }
    )
    .catch((oError) => {

      Log.error(
        "SD 자재별 납품 현황 조회 실패:",
        oError
      );

    });
},


      /* =========================================================
       * SD 수량 화면 표시
       *
       * 10.000 → 10 PC
       * 500.000 → 500 PC
       * ========================================================= */
      _formatSdQty(fQty) {
        return (
          Number(
            fQty || 0
          ).toLocaleString(
            "ko-KR",
            {
              maximumFractionDigits: 0
            }
          ) + " PC"
        );
      },


      /* =========================================================
       * 원형 아이콘 CSS 자동 변경
       * ========================================================= */
      _applyStepClasses() {
        if (!this._aSdStepStatuses) {
          return;
        }

        const aCircleIds = [
          "circleSO",
          "circleDelivery",
          "circlePGI",
          "circleDeliveryComplete"
        ];

        aCircleIds.forEach(
          (sId, iIndex) => {
            const oCircle =
              this.byId(sId);

            if (!oCircle) {
              return;
            }

            /* 기존 상태 제거 */
            oCircle.removeStyleClass(
              "stepDone"
            );

            oCircle.removeStyleClass(
              "stepActive"
            );

            oCircle.removeStyleClass(
              "stepWaiting"
            );


            /* 내부 Icon */
            const aItems =
              oCircle.getItems
                ? oCircle.getItems()
                : [];

            const oIcon =
              aItems.length > 0
                ? aItems[0]
                : null;

            if (oIcon) {
              oIcon.removeStyleClass(
                "stepIconDone"
              );

              oIcon.removeStyleClass(
                "stepIconActive"
              );

              oIcon.removeStyleClass(
                "stepIconWaiting"
              );
            }


            const sStatus =
              this._aSdStepStatuses[
                iIndex
              ];


            /* SAP 상태 → CSS */
            switch (sStatus) {
              case "completed":

                oCircle.addStyleClass(
                  "stepDone"
                );

                if (oIcon) {
                  oIcon.addStyleClass(
                    "stepIconDone"
                  );
                }

                break;


              case "inProgress":

                oCircle.addStyleClass(
                  "stepActive"
                );

                if (oIcon) {
                  oIcon.addStyleClass(
                    "stepIconActive"
                  );
                }

                break;


              default:

                oCircle.addStyleClass(
                  "stepWaiting"
                );

                if (oIcon) {
                  oIcon.addStyleClass(
                    "stepIconWaiting"
                  );
                }

                break;
            }
          }
        );
      },


      /* =========================================================
       * ObjectStatus State
       * ========================================================= */
      _getSdStatusState(sStatus) {
        switch (sStatus) {
          case "완료":
            return "Success";

          case "진행 중":
            return "Information";

          case "대기":
            return "None";

          default:
            return "None";
        }
      },


      /* =========================================================
       * 상단 단계 상태
       * ========================================================= */
      _getSdStepStatus(sStatus) {
        switch (sStatus) {
          case "완료":
          case "completed":
            return "completed";

          case "진행 중":
          case "inProgress":
            return "inProgress";

          case "대기":
          case "진행 예정":
          case "waiting":
          case "planned":
            return "waiting";

          default:
            return "waiting";
        }
      }
    });
  }
);