sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zais/scm/zais/controller/modal/ModalManager",
  ],
  (Controller, ODataModel, Filter, FilterOperator, ModalManager) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainPP", {
      /* =========================================================
       * 초기화
       * ========================================================= */
      onInit() {
        // PP 요약 데이터 SAP 조회
        this._loadPpSummary();

        // PP 공정 아이콘 클릭 이벤트 연결
        this._bindStepEvents();

        // 전체 새로고침 이벤트 구독
        const oComponent = this.getOwnerComponent();
        const oEventBus =
          (oComponent && oComponent.getEventBus && oComponent.getEventBus()) ||
          sap.ui.getCore().getEventBus();

        if (oEventBus) {
          oEventBus.subscribe("Dashboard", "RefreshAll", this._loadPpSummary, this);
        }
      },

      onExit() {
        const oComponent = this.getOwnerComponent();
        const oEventBus =
          (oComponent && oComponent.getEventBus && oComponent.getEventBus()) ||
          sap.ui.getCore().getEventBus();

        if (oEventBus) {
          oEventBus.unsubscribe("Dashboard", "RefreshAll", this._loadPpSummary, this);
        }
      },

      /* =========================================================
       * 화면 렌더링 후 클릭 이벤트 재연결
       * ========================================================= */
      onAfterRendering() {
        this._bindStepEvents();
      },

      /* =========================================================
       * PP 공정 아이콘 클릭 이벤트
       * ========================================================= */
      _bindStepEvents() {
        const aSteps = [
          { id: "stepDram", key: "DramProd" },
          { id: "stepHBM", key: "HBMProd" },
          { id: "stepBGP", key: "BGPProd" },
          { id: "stepGPU", key: "GPUProd" },
          { id: "stepAIS", key: "AISAssembly" },
        ];

        aSteps.forEach((oStep) => {
          const oControl = this.byId(oStep.id);

          if (oControl) {
            oControl
              .$()
              .off("click")
              .on("click", () => {
                ModalManager.openModal(
                  this,
                  oStep.key,
                  "PP",
                );
              });
          }
        });
      },

      /* =========================================================
       * PP 요약 데이터 조회
       * EntitySet : PpSummarySet, PpDramSet, PpOrderSet (품목별 필터)
       * ========================================================= */
      _loadPpSummary() {
        const oODataModel = new ODataModel(
          "/sap/opu/odata/sap/ZAIS_SCM_SRV/",
          {
            useBatch: false,
          },
        );

        const readOData = (sPath, mParameters) => {
          return new Promise((resolve) => {
            oODataModel.read(sPath, {
              ...mParameters,
              success: (oData) => resolve(oData.results || []),
              error: (err) => {
                console.warn(sPath + " 조회 실패 (fallback 적용):", err);
                resolve([]);
              },
            });
          });
        };

        Promise.all([
          readOData("/PpSummarySet"),
          readOData("/PpDramSet"),
          readOData("/PpOrderSet", {
            filters: [new Filter("Matnr", FilterOperator.EQ, "AI-H-HBM3E")],
          }),
          readOData("/PpOrderSet", {
            filters: [new Filter("Matnr", FilterOperator.EQ, "AI-H-BGP")],
          }),
          readOData("/PpOrderSet", {
            filters: [new Filter("Matnr", FilterOperator.EQ, "AI-H-GPU")],
          }),
          readOData("/PpOrderSet", {
            filters: [new Filter("Matnr", FilterOperator.EQ, "AI-F-AIS")],
          }),
        ]).then(([aSummaryResults, aDramResults, aHbmResults, aBgpResults, aGpuResults, aAisResults]) => {
          const aResults = aSummaryResults || [];

          /* =====================================================
           * SortOrder 기준 정렬
           *
           * 1 DRAM
           * 2 HBM3E
           * 3 BGP
           * 4 GPU
           * 5 AIS
           * ===================================================== */
          aResults.sort(
            (a, b) =>
              Number(a.SortOrder || 0) -
              Number(b.SortOrder || 0),
          );

          const oDashboardModel =
            this.getView().getModel("dashboard");

          if (!oDashboardModel) {
            console.error(
              "dashboard 모델을 찾을 수 없습니다.",
            );
            return;
          }

          /* =====================================================
           * 1. 하단 PP 공정/품목 요약 테이블
           * ===================================================== */
          const aMaterials = aResults.map((oItem) => {
            const nPlanQty = Math.round(Number(
              oItem.PlanQty || 0,
            ));

            const nActualQty = Math.round(Number(
              oItem.ActualQty || 0,
            ));

            const nProgress = Number(
              oItem.Progress || 0,
            );

            const sUnit =
              !oItem.Meins || oItem.Meins === "ST" || oItem.Meins === "EA"
                ? "PC"
                : oItem.Meins;

            return {
              // 공정 / 품목명
              name:
                oItem.Name || "",

              // 계획수량
              planQty:
                nPlanQty.toLocaleString() +
                " " +
                sUnit,

              // 생산실적
              actQty:
                nActualQty.toLocaleString() +
                " " +
                sUnit,

              // 단위
              unit: sUnit,

              // 진행률
              rate:
                Math.round(nProgress) + "%",

              // 상태
              status:
                oItem.Status || "",

              // ObjectStatus 상태
              statusState:
                this._getPpStatusState(
                  oItem.Status,
                ),

              // SAP 자재코드
              matnr:
                oItem.Matnr || "",

              // 정렬 순서
              sortOrder:
                Number(oItem.SortOrder || 0),
            };
          });

          // 기존 하드코딩 PP 하단 테이블 → SAP 실제 데이터
          oDashboardModel.setProperty(
            "/process/pp/materials",
            aMaterials,
          );

          /* =====================================================
           * 3. 상단 생산 진행 (PP) KPI
           * ===================================================== */
          const aAllPpOrders = [
            ...(aDramResults || []),
            ...(aHbmResults || []),
            ...(aBgpResults || []),
            ...(aGpuResults || []),
            ...(aAisResults || []),
          ];

          const iTotalPpOrders = aAllPpOrders.length;
          const iCompletedPpOrders = aAllPpOrders.filter(
            (ord) => ord.Status === "완료",
          ).length;

          const iPpRate =
            iTotalPpOrders > 0
              ? Math.min(
                  100,
                  Math.round(
                    (iCompletedPpOrders / iTotalPpOrders) * 100,
                  ),
                )
              : aResults.length > 0
                ? Math.min(
                    100,
                    Math.round(
                      aResults.reduce(
                        (sum, item) => sum + Number(item.Progress || 0),
                        0,
                      ) / aResults.length,
                    ),
                  )
                : 0;

          // 진행률 숫자
          oDashboardModel.setProperty(
            "/header/pp/rate",
            iPpRate,
          );

          // 진행률 텍스트
          oDashboardModel.setProperty(
            "/header/pp/rateText",
            iPpRate + "%",
          );

          // 설명
          oDashboardModel.setProperty(
            "/header/pp/subText",
            "생산 완료 기준",
          );

          // 완료 건수
          oDashboardModel.setProperty(
            "/header/pp/countText",
            iCompletedPpOrders +
              " / " +
              iTotalPpOrders +
              " 건",
          );

          /* =====================================================
           * 2. 상단 PP 공정 단계
           * ===================================================== */
          const aSteps =
            oDashboardModel.getProperty(
              "/process/pp/steps",
            ) || [];

          const aStepOrderMap = [
            aDramResults || [],
            aHbmResults || [],
            aBgpResults || [],
            aGpuResults || [],
            aAisResults || [],
          ];

          const getStepCountAndStatus = (oItem, iIndex) => {
            const aStepOrders = aStepOrderMap[iIndex] || [];

            const iOrderTotal = aStepOrders.length;
            const iOrderCompleted = aStepOrders.filter(
              (ord) => ord.Status === "완료"
            ).length;

            let sCountText = "";
            let sStatus = "completed";
            let sStatusText = "완료";

            if (iOrderTotal > 0) {
              sCountText = iOrderCompleted + " / " + iOrderTotal;
              if (iOrderCompleted >= iOrderTotal) {
                sStatus = "completed";
                sStatusText = "완료";
              } else if (iOrderCompleted > 0) {
                sStatus = "inProgress";
                sStatusText = "진행 중";
              } else {
                sStatus = "inProgress";
                sStatusText = "진행 중";
              }
            } else {
              // Fallback to PpSummarySet item status
              const sItemStatus = oItem ? (oItem.Status || "완료") : "완료";
              sStatus = this._getPpStepStatus(sItemStatus);
              sStatusText = sItemStatus === "완료" ? "완료" : (sItemStatus === "대기" ? "대기" : "진행 중");
              sCountText = sStatus === "completed" ? "1 / 1" : "0 / 1";
            }

            return {
              countText: sCountText,
              status: sStatus,
              statusText: sStatusText,
            };
          };

          const aUpdatedSteps = aSteps.map(
            (oStep, iIndex) => {
              const oItem =
                aResults[iIndex];

              const oCalc = getStepCountAndStatus(oItem, iIndex);

              return {
                // 기존 name, icon 등 유지
                ...oStep,

                // SAP 실제 자재코드
                matnr:
                  oItem ? (oItem.Matnr || "") : (oStep.matnr || ""),

                // 건수 (X / Y)
                count:
                  oCalc.countText,

                countText:
                  oCalc.countText,

                // 상태 텍스트 (완료, 진행 중 등)
                rate:
                  oCalc.statusText,

                // 원형 아이콘 상태 (completed, inProgress, waiting)
                status:
                  oCalc.status,

                // 상태 텍스트
                statusText:
                  oCalc.statusText,
              };
            },
          );

          // 상단 PP 공정 단계 → SAP 실제 데이터
          oDashboardModel.setProperty(
            "/process/pp/steps",
            aUpdatedSteps,
          );

          console.log(
            "PP Summary & Orders 조회 성공:",
            {
              summary: aResults,
              dram: aDramResults,
              orders: aAllPpOrders,
              materials: aMaterials,
              steps: aUpdatedSteps,
            },
          );
        }).catch((oError) => {
          console.error(
            "PP Summary 조회 실패:",
            oError,
          );
        });
      },

      /* =========================================================
       * 하단 테이블 ObjectStatus 상태 변환
       * ========================================================= */
      _getPpStatusState(sStatus) {
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
       * 상단 원형 아이콘 상태 변환
       *
       * completed  → 완료
       * inProgress → 진행 중
       * waiting    → 대기
       * ========================================================= */
      _getPpStepStatus(sStatus) {
        switch (sStatus) {
          case "완료":
            return "completed";

          case "진행 중":
            return "inProgress";

          case "대기":
            return "waiting";

          default:
            return "waiting";
        }
      },
    });
  },
);