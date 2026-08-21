sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
  ],
  (Controller, Fragment, MessageToast) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainHeader", {
      onInit() {
        // -------------------------------------------------------
        // 재고 카드 클릭 이벤트
        // -------------------------------------------------------
        const oStockCard = this.byId("stockCard");

        if (oStockCard) {
          oStockCard.addEventDelegate(
            {
              onclick: () => {
                this.onOpenMaterialDialog();
              },
            },
            this,
          );
        }

        // -------------------------------------------------------
        // 최초 진입 시 실제 재고 데이터 조회
        // -------------------------------------------------------
        this._loadInventoryData();
      },

      onAfterRendering() {
        // -------------------------------------------------------
        // DOM 렌더링 후 클릭 이벤트
        // -------------------------------------------------------
        const oStockCard = this.byId("stockCard");

        if (oStockCard) {
          oStockCard
            .$()
            .off("click")
            .on("click", () => {
              this.onOpenMaterialDialog();
            });
        }
      },

      // =========================================================
      // InventorySet 조회
      // =========================================================
      _loadInventoryData() {
        const oComponent = this.getOwnerComponent();

        // SCM OData Model (InventorySet)
        const oODataModel =
          oComponent.getModel("scmService") ||
          oComponent.getModel();

        // Dashboard JSON Model
        const oDashboardModel =
          this.getView().getModel("dashboard") ||
          oComponent.getModel("dashboard");

        if (!oODataModel) {
          console.error("OData Model을 찾을 수 없습니다.");
          return;
        }

        if (!oDashboardModel) {
          console.error("Dashboard Model을 찾을 수 없습니다.");
          return;
        }

        // -------------------------------------------------------
        // OData V2 InventorySet 조회
        // -------------------------------------------------------
        oODataModel.read("/InventorySet", {
          success: (oData) => {
            const aResults = oData.results || [];

            // ---------------------------------------------------
            // OData 데이터를 기존 dashboard materials 구조로 변환
            // ---------------------------------------------------
            const aMaterials = aResults.map((oItem) => {
              const fRequiredQty =
                parseFloat(oItem.RequiredQty) || 0;

              const fStockQty =
                parseFloat(oItem.StockQty) || 0;

              const fShortageQty =
                parseFloat(oItem.ShortageQty) || 0;

              const sUnit =
                !oItem.Unit || oItem.Unit === "ST" || oItem.Unit === "EA"
                  ? "PC"
                  : oItem.Unit;

              return {
                code: oItem.Material,
                name: oItem.MaterialName,

                unit: sUnit,

                requiredQty: fRequiredQty,
                stockQty: fStockQty,
                shortageQty: fShortageQty,

                requiredQtyText:
                  this._formatQuantity(fRequiredQty),

                stockQtyText:
                  this._formatQuantity(fStockQty),

                shortageQtyText:
                  this._formatQuantity(fShortageQty),

                status: oItem.Status,

                statusState:
                  oItem.Status === "충분"
                    ? "Success"
                    : "Error",
              };
            });

            // ---------------------------------------------------
            // 자재 목록 저장
            // ---------------------------------------------------
            oDashboardModel.setProperty(
              "/materials",
              aMaterials,
            );

            // ---------------------------------------------------
            // 상단 재고 KPI 계산 (총 재고 수량 합계 + PC 단위)
            // ---------------------------------------------------
            const fTotalStockQty = aMaterials.reduce(
              (fSum, oItem) => fSum + Number(oItem.stockQty || 0),
              0,
            );

            const iShortageCount =
              aMaterials.filter(
                (oItem) =>
                  oItem.status === "부족",
              ).length;

            // 총 재고 수량 (e.g. "1,248 PC")
            oDashboardModel.setProperty(
              "/header/stock/amount",
              `${this._formatQuantity(fTotalStockQty)} PC`,
            );

            // 서브텍스트
            oDashboardModel.setProperty(
              "/header/stock/subText",
              `총 ${aMaterials.length}개 품목 · 부족 ${iShortageCount}건`,
            );

            // ---------------------------------------------------
            // 업데이트 시간 변경
            // ---------------------------------------------------
            this._updateLastUpdated();

            console.log(
              "InventorySet 조회 성공:",
              aMaterials,
            );
          },

          error: (oError) => {
            console.error(
              "InventorySet 조회 실패:",
              oError,
            );

            MessageToast.show(
              "재고 데이터를 불러오지 못했습니다.",
            );
          },
        });
      },

      // =========================================================
      // 수량 표시
      //
      // 6912.000 → 6,912
      // 9.000    → 9
      // =========================================================
      _formatQuantity(fQty) {
        return Number(fQty).toLocaleString(
          "ko-KR",
          {
            maximumFractionDigits: 3,
          },
        );
      },

      // =========================================================
      // 최종 업데이트 시간 (실시간 초 단위 포맷)
      // =========================================================
      _updateLastUpdated() {
        const oDashboardModel =
          this.getView().getModel("dashboard") ||
          this.getOwnerComponent().getModel(
            "dashboard",
          );

        if (!oDashboardModel) {
          return;
        }

        const oNow = new Date();

        const sFormattedDate =
          oNow.getFullYear() +
          "." +
          String(oNow.getMonth() + 1).padStart(2, "0") +
          "." +
          String(oNow.getDate()).padStart(2, "0") +
          " " +
          String(oNow.getHours()).padStart(2, "0") +
          ":" +
          String(oNow.getMinutes()).padStart(2, "0") +
          ":" +
          String(oNow.getSeconds()).padStart(2, "0");

        oDashboardModel.setProperty(
          "/lastUpdated",
          sFormattedDate,
        );
      },

      // =========================================================
      // 새로고침 (MM, PP, SD, 재고 전체 동시 갱신)
      // =========================================================
      onRefresh() {
        const oComponent = this.getOwnerComponent();
        const oEventBus =
          (oComponent && oComponent.getEventBus && oComponent.getEventBus()) ||
          sap.ui.getCore().getEventBus();

        // 1. 재고 데이터 새로고침
        this._loadInventoryData();

        // 2. 전체 서브 모듈 (MM, PP, SD) 새로고침 이벤트 발송
        if (oEventBus) {
          oEventBus.publish("Dashboard", "RefreshAll");
        }

        // 3. 최종 업데이트 시간 실시간 갱신
        this._updateLastUpdated();

        MessageToast.show(
          "대시보드 전체 데이터를 새로고침했습니다.",
        );
      },

      // =========================================================
      // 재고 현황 Dialog 열기
      // =========================================================
      onOpenMaterialDialog() {
        const oView = this.getView();

        const oDashboardModel =
          oView.getModel("dashboard") ||
          this.getOwnerComponent().getModel(
            "dashboard",
          );

        // Dialog 열 때도 최신 재고 다시 조회
        this._loadInventoryData();

        if (!this._pMaterialDialog) {
          this._pMaterialDialog = Fragment.load({
            id: oView.getId(),

            name:
              "zais.scm.zais.view.main.MaterialDialog",

            controller: this,
          }).then((oDialog) => {
            oView.addDependent(oDialog);

            if (oDashboardModel) {
              oDialog.setModel(
                oDashboardModel,
                "dashboard",
              );
            }

            return oDialog;
          });
        }

        this._pMaterialDialog
          .then((oDialog) => {
            if (oDashboardModel) {
              oDialog.setModel(
                oDashboardModel,
                "dashboard",
              );
            }

            oDialog.open();
          })
          .catch((err) => {
            console.error(
              "Failed to open material dialog:",
              err,
            );
          });
      },

      // =========================================================
      // Dialog 닫기
      // =========================================================
      onCloseMaterialDialog() {
        const oDialog =
          this.byId("materialDialog");

        if (oDialog) {
          oDialog.close();
        }
      },
    });
  },
);