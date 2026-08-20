sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    ODataModel,
    MessageToast
  ) {
    "use strict";

    return Controller.extend(
      "zais.scm.zais.controller.modal.PP.DramProd",
      {
        onInit: function () {
          this._aAllData = [];
          this._aFilteredData = [];
          this._iPageSize = 5;

          var oPaginationModel = new JSONModel({
            displayList: [],
            totalCount: 0,
            currentPage: 1,
            totalPages: 1,
          });

          this.getView().setModel(
            oPaginationModel,
            "pagination"
          );
        },

        onBeforeRendering: function () {
          if (this._aAllData.length === 0) {
            this._loadDramData();
          }
        },

        /* ================================
         * DRAM REM 데이터 조회
         * ================================ */
        _loadDramData: function () {
          var that = this;

          var oODataModel = new ODataModel(
            "/sap/opu/odata/sap/ZAIS_SCM_SRV/",
            {
              useBatch: false,
            }
          );

          oODataModel.read("/PpDramSet", {
            success: function (oData) {
              var aResults = oData.results || [];

              var aMapped = aResults.map(function (oItem) {
                var nProgress = Number(
                  oItem.Progress || 0
                );

                return {
                  periodKey:
                    oItem.PeriodKey || "",

                  weekPeriod:
                    oItem.WeekPeriod || "",

                  prodLine:
                    oItem.ProdLine || "",

                  plant:
                    oItem.Plant || "",

                  matCode:
                    oItem.Matnr || "",

                  matName:
                    oItem.Maktx || "",

                  planQty:
                    that._formatQty(
                      oItem.PlanQty
                    ),

                  actQty:
                    that._formatQty(
                      oItem.ActualQty
                    ),

                  unit:
                    !oItem.Meins || oItem.Meins === "ST" || oItem.Meins === "EA"
                      ? "PC"
                      : oItem.Meins,

                  rate:
                    nProgress.toFixed(0) + "%",

                  status:
                    oItem.Status || "",

                  statusState:
                    that._getStatusState(
                      oItem.Status
                    ),
                };
              });

              // 최신 주차부터
              aMapped.sort(function (a, b) {
                return b.periodKey.localeCompare(
                  a.periodKey
                );
              });

              that._aAllData = aMapped;
              that._aFilteredData =
                aMapped.slice();

              var oPaginationModel =
                that
                  .getView()
                  .getModel("pagination");

              oPaginationModel.setProperty(
                "/currentPage",
                1
              );

              that._updatePagination();

              var oDashboardModel =
                that
                  .getView()
                  .getModel("dashboard");

              if (oDashboardModel) {
                oDashboardModel.setProperty(
                  "/currentModal/totalCount",
                  aMapped.length
                );
              }
            },

            error: function (oError) {
              console.error(
                "DRAM REM 조회 실패",
                oError
              );

              that._aAllData = [];
              that._aFilteredData = [];

              that._updatePagination();

              MessageToast.show(
                "DRAM 반복생산 조회에 실패했습니다."
              );
            },
          });
        },

        /* ================================
         * 수량 표시
         * ================================ */
        _formatQty: function (vQty) {
          var nQty = Number(vQty);

          if (isNaN(nQty)) {
            return vQty || "0";
          }

          return Math.round(nQty).toLocaleString();
        },

        /* ================================
         * 상태
         * ================================ */
        _getStatusState: function (sStatus) {
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

        /* ================================
         * 검색
         * ================================ */
        onSearch: function () {
          var sKeyword = this.byId(
            "searchKeyword"
          )
            .getValue()
            .trim()
            .toLowerCase();

          var sStatusKey = this.byId(
            "searchStatus"
          ).getSelectedKey();

          var aFiltered =
            this._aAllData.filter(
              function (oItem) {
                var bKeywordMatch =
                  !sKeyword ||
                  oItem.weekPeriod
                    .toLowerCase()
                    .includes(sKeyword) ||
                  oItem.prodLine
                    .toLowerCase()
                    .includes(sKeyword) ||
                  oItem.matCode
                    .toLowerCase()
                    .includes(sKeyword) ||
                  oItem.matName
                    .toLowerCase()
                    .includes(sKeyword);

                var bStatusMatch = true;

                if (
                  sStatusKey === "COMPLETED"
                ) {
                  bStatusMatch =
                    oItem.status === "완료";
                } else if (
                  sStatusKey ===
                  "IN_PROGRESS"
                ) {
                  bStatusMatch =
                    oItem.status === "진행 중";
                } else if (
                  sStatusKey === "WAITING"
                ) {
                  bStatusMatch =
                    oItem.status === "대기";
                }

                return (
                  bKeywordMatch &&
                  bStatusMatch
                );
              }
            );

          this._aFilteredData =
            aFiltered;

          this.getView()
            .getModel("pagination")
            .setProperty(
              "/currentPage",
              1
            );

          this._updatePagination();
        },

        /* ================================
         * 초기화
         * ================================ */
        onReset: function () {
          this.byId(
            "searchKeyword"
          ).setValue("");

          this.byId(
            "searchStatus"
          ).setSelectedKey("ALL");

          this.byId(
            "searchDateFrom"
          ).setValue("");

          this.byId(
            "searchDateTo"
          ).setValue("");

          this._aFilteredData =
            this._aAllData.slice();

          this.getView()
            .getModel("pagination")
            .setProperty(
              "/currentPage",
              1
            );

          this._updatePagination();
        },

        /* ================================
         * 페이지네이션
         * ================================ */
        _updatePagination: function () {
          var oModel =
            this.getView().getModel(
              "pagination"
            );

          var aList =
            this._aFilteredData || [];

          var iTotalCount =
            aList.length;

          var iTotalPages =
            Math.max(
              1,
              Math.ceil(
                iTotalCount /
                  this._iPageSize
              )
            );

          var iCurrentPage =
            oModel.getProperty(
              "/currentPage"
            ) || 1;

          if (
            iCurrentPage >
            iTotalPages
          ) {
            iCurrentPage =
              iTotalPages;
          }

          var iStart =
            (iCurrentPage - 1) *
            this._iPageSize;

          var aDisplayList =
            aList.slice(
              iStart,
              iStart +
                this._iPageSize
            );

          oModel.setProperty(
            "/displayList",
            aDisplayList
          );

          oModel.setProperty(
            "/totalCount",
            iTotalCount
          );

          oModel.setProperty(
            "/currentPage",
            iCurrentPage
          );

          oModel.setProperty(
            "/totalPages",
            iTotalPages
          );
        },

        onPaginationFirst: function () {
          this.getView()
            .getModel("pagination")
            .setProperty(
              "/currentPage",
              1
            );

          this._updatePagination();
        },

        onPaginationPrev: function () {
          var oModel =
            this.getView().getModel(
              "pagination"
            );

          var iPage =
            oModel.getProperty(
              "/currentPage"
            ) || 1;

          if (iPage > 1) {
            oModel.setProperty(
              "/currentPage",
              iPage - 1
            );

            this._updatePagination();
          }
        },

        onPaginationNext: function () {
          var oModel =
            this.getView().getModel(
              "pagination"
            );

          var iPage =
            oModel.getProperty(
              "/currentPage"
            ) || 1;

          var iTotalPages =
            oModel.getProperty(
              "/totalPages"
            ) || 1;

          if (iPage < iTotalPages) {
            oModel.setProperty(
              "/currentPage",
              iPage + 1
            );

            this._updatePagination();
          }
        },

        onPaginationLast: function () {
          var oModel =
            this.getView().getModel(
              "pagination"
            );

          var iTotalPages =
            oModel.getProperty(
              "/totalPages"
            ) || 1;

          oModel.setProperty(
            "/currentPage",
            iTotalPages
          );

          this._updatePagination();
        },
      }
    );
  }
);