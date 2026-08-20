sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
  ],
  (Controller, JSONModel, ODataModel, MessageToast) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.modal.SD.SO", {
      /* =========================================================
       * 초기화
       * ========================================================= */
      onInit() {
        /* =========================================
         * 페이지네이션 Model
         * ========================================= */
        const oPaginationModel = new JSONModel({
          totalCount: 0,
          pageSize: 10,
          currentPage: 1,
          totalPages: 1,
          displayList: [],
        });

        this.getView().setModel(
          oPaginationModel,
          "pagination",
        );

        /* =========================================
         * SAP OData Model
         * ========================================= */
        this._oODataModel = new ODataModel(
          "/sap/opu/odata/sap/ZAIS_SCM_SRV/",
          {
            useBatch: false,
          },
        );

        this._aFullList = [];
        this._aFilteredList = [];

        this._bLoaded = false;
        this._bLoading = false;

        /* =========================================
         * ModalManager에서 View에 Model이 연결된 뒤
         * 데이터 조회
         * ========================================= */
        this.getView().attachModelContextChange(() => {
          this._loadData();
        });
      },

      /* =========================================================
       * 렌더링 후 조회
       * ========================================================= */
      onAfterRendering() {
        this._loadData();
      },

      /* =========================================================
       * Sales Order 조회
       *
       * EntitySet:
       * SdSalesOrderSet
       * ========================================================= */
      _loadData() {
  if (this._bLoaded || this._bLoading) {
    return;
  }

  const oTable = this.byId("soTable");

  this._bLoading = true;

  if (oTable) {
    oTable.setBusy(true);
  }

  this._oODataModel.read("/SdSalesOrderSet", {
    success: (oData) => {
      const aResults = oData.results || [];

      this._aFullList = aResults.map((oItem) => {
        const fQty = Number(oItem.OrderQty || 0);

        return {
          soNo: oItem.Vbeln || "",

          itemNo: oItem.Posnr || "",

          customerCode: oItem.SoldTo || "",

          customer:
            oItem.SoldToName ||
            oItem.SoldTo ||
            "",

          matCode: oItem.Matnr || "",

          matName: oItem.Maktx || "",

          orderQty: fQty.toLocaleString("ko-KR", {
            maximumFractionDigits: 0,
          }),

          unit:
            oItem.Meins === "ST"
              ? "PC"
              : oItem.Meins || "",

          orderDate: oItem.DocDate || "",

          status:
            oItem.Status === "완료"
              ? "수주 완료"
              : oItem.Status || "대기",

          statusState:
            oItem.Status === "완료"
              ? "Success"
              : "None",
        };
      });

      /* 최신 수주 순 */
      this._aFullList.sort((a, b) => {
        if (a.orderDate !== b.orderDate) {
          return b.orderDate.localeCompare(
            a.orderDate,
          );
        }

        return b.soNo.localeCompare(a.soNo);
      });

      /* dashboard model */
      const oComponent =
        this.getOwnerComponent();

      const oDashboardModel =
        this.getView().getModel("dashboard") ||
        (oComponent
          ? oComponent.getModel("dashboard")
          : null);

      if (oDashboardModel) {
        oDashboardModel.setProperty(
          "/soList",
          this._aFullList,
        );

        oDashboardModel.setProperty(
          "/modalConfig/SO/totalCount",
          this._aFullList.length,
        );
      }

      /* 첫 페이지 */
      const oPaginationModel =
        this.getView().getModel("pagination");

      if (oPaginationModel) {
        oPaginationModel.setProperty(
          "/currentPage",
          1,
        );
      }

      this._applyFiltersAndPaging();

      this._bLoaded = true;
      this._bLoading = false;

      /* ★ 로딩 종료 */
      if (oTable) {
        oTable.setBusy(false);
      }

      console.log(
        "SdSalesOrderSet 조회 성공:",
        this._aFullList,
      );
    },

    error: (oError) => {
      console.error(
        "SdSalesOrderSet 조회 실패:",
        oError,
      );

      this._bLoading = false;

      /* ★ 오류가 나도 로딩 종료 */
      if (oTable) {
        oTable.setBusy(false);
      }

      MessageToast.show(
        "Sales Order 조회에 실패했습니다.",
      );
    },
  });
},

      /* =========================================================
       * 검색 + 필터 + 페이지네이션 계산
       * ========================================================= */
      _applyFiltersAndPaging() {
        const aList =
          this._aFullList || [];

        const oKeywordInput =
          this.byId("searchKeyword");

        const oStatusSelect =
          this.byId("searchStatus");

        const oDateFromPicker =
          this.byId("searchDateFrom");

        const oDateToPicker =
          this.byId("searchDateTo");

        /* =========================================
         * 검색어
         * ========================================= */
        const sKeyword =
          oKeywordInput
            ? (
                oKeywordInput.getValue() ||
                ""
              )
                .trim()
                .toLowerCase()
            : "";

        /* =========================================
         * 상태
         * ========================================= */
        const sStatusKey =
          oStatusSelect
            ? oStatusSelect.getSelectedKey()
            : "ALL";

        /* =========================================
         * 날짜
         * ========================================= */
        const sDateFrom =
          oDateFromPicker
            ? oDateFromPicker.getValue()
            : "";

        const sDateTo =
          oDateToPicker
            ? oDateToPicker.getValue()
            : "";

        /* =========================================
         * 필터
         * ========================================= */
        const aFiltered = aList.filter(
          (oItem) => {
            /* -----------------------------
             * 통합검색
             * ----------------------------- */
            if (sKeyword) {
              const bMatchNo =
                (
                  oItem.soNo || ""
                )
                  .toLowerCase()
                  .includes(sKeyword);

              const bMatchItem =
                (
                  oItem.itemNo || ""
                )
                  .toLowerCase()
                  .includes(sKeyword);

              const bMatchCustomer =
                (
                  oItem.customer || ""
                )
                  .toLowerCase()
                  .includes(sKeyword);

              const bMatchCustomerCode =
                (
                  oItem.customerCode ||
                  ""
                )
                  .toLowerCase()
                  .includes(sKeyword);

              const bMatchCode =
                (
                  oItem.matCode || ""
                )
                  .toLowerCase()
                  .includes(sKeyword);

              const bMatchName =
                (
                  oItem.matName || ""
                )
                  .toLowerCase()
                  .includes(sKeyword);

              if (
                !bMatchNo &&
                !bMatchItem &&
                !bMatchCustomer &&
                !bMatchCustomerCode &&
                !bMatchCode &&
                !bMatchName
              ) {
                return false;
              }
            }

            /* -----------------------------
             * 상태
             * ----------------------------- */
            if (
              sStatusKey ===
                "COMPLETED" &&
              oItem.status !==
                "수주 완료"
            ) {
              return false;
            }

            /* -----------------------------
             * From
             * ----------------------------- */
            if (
              sDateFrom &&
              oItem.orderDate <
                sDateFrom
            ) {
              return false;
            }

            /* -----------------------------
             * To
             * ----------------------------- */
            if (
              sDateTo &&
              oItem.orderDate >
                sDateTo
            ) {
              return false;
            }

            return true;
          },
        );

        this._aFilteredList =
          aFiltered;

        /* =========================================
         * 페이지 계산
         * ========================================= */
        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        const iPageSize =
          oPaginationModel.getProperty(
            "/pageSize",
          ) || 10;

        const iTotalCount =
          aFiltered.length;

        const iTotalPages =
          Math.max(
            1,
            Math.ceil(
              iTotalCount /
                iPageSize,
            ),
          );

        let iCurrentPage =
          oPaginationModel.getProperty(
            "/currentPage",
          ) || 1;

        if (
          iCurrentPage >
          iTotalPages
        ) {
          iCurrentPage = 1;
        }

        oPaginationModel.setProperty(
          "/totalCount",
          iTotalCount,
        );

        oPaginationModel.setProperty(
          "/totalPages",
          iTotalPages,
        );

        oPaginationModel.setProperty(
          "/currentPage",
          iCurrentPage,
        );

        this._applyPagingOnly();
      },

      /* =========================================================
       * 현재 페이지 데이터만 표시
       * ========================================================= */
      _applyPagingOnly() {
        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        if (!oPaginationModel) {
          return;
        }

        const aFiltered =
          this._aFilteredList ||
          this._aFullList ||
          [];

        const iPageSize =
          oPaginationModel.getProperty(
            "/pageSize",
          ) || 10;

        const iCurrentPage =
          oPaginationModel.getProperty(
            "/currentPage",
          ) || 1;

        const iStart =
          (iCurrentPage - 1) *
          iPageSize;

        const aPageData =
          aFiltered.slice(
            iStart,
            iStart + iPageSize,
          );

        oPaginationModel.setProperty(
          "/displayList",
          aPageData,
        );
      },

      /* =========================================================
       * 검색
       * ========================================================= */
      onSearch() {
        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        if (oPaginationModel) {
          oPaginationModel.setProperty(
            "/currentPage",
            1,
          );
        }

        this._applyFiltersAndPaging();

        MessageToast.show(
          "검색이 완료되었습니다.",
        );
      },

      /* =========================================================
       * 초기화
       * ========================================================= */
      onReset() {
        const oKeywordInput =
          this.byId("searchKeyword");

        const oStatusSelect =
          this.byId("searchStatus");

        const oDateFromPicker =
          this.byId("searchDateFrom");

        const oDateToPicker =
          this.byId("searchDateTo");

        if (oKeywordInput) {
          oKeywordInput.setValue("");
        }

        if (oStatusSelect) {
          oStatusSelect.setSelectedKey(
            "ALL",
          );
        }

        if (oDateFromPicker) {
          oDateFromPicker.setValue("");
        }

        if (oDateToPicker) {
          oDateToPicker.setValue("");
        }

        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        if (oPaginationModel) {
          oPaginationModel.setProperty(
            "/currentPage",
            1,
          );
        }

        this._applyFiltersAndPaging();

        MessageToast.show(
          "검색 조건이 초기화되었습니다.",
        );
      },

      /* =========================================================
       * 첫 페이지
       * ========================================================= */
      onPaginationFirst() {
        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        if (!oPaginationModel) {
          return;
        }

        oPaginationModel.setProperty(
          "/currentPage",
          1,
        );

        this._applyPagingOnly();
      },

      /* =========================================================
       * 이전 페이지
       * ========================================================= */
      onPaginationPrev() {
        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        if (!oPaginationModel) {
          return;
        }

        const iCurrentPage =
          oPaginationModel.getProperty(
            "/currentPage",
          );

        if (iCurrentPage <= 1) {
          MessageToast.show(
            "첫 페이지입니다.",
          );

          return;
        }

        oPaginationModel.setProperty(
          "/currentPage",
          iCurrentPage - 1,
        );

        this._applyPagingOnly();
      },

      /* =========================================================
       * 다음 페이지
       * ========================================================= */
      onPaginationNext() {
        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        if (!oPaginationModel) {
          return;
        }

        const iCurrentPage =
          oPaginationModel.getProperty(
            "/currentPage",
          );

        const iTotalPages =
          oPaginationModel.getProperty(
            "/totalPages",
          );

        if (
          iCurrentPage >=
          iTotalPages
        ) {
          MessageToast.show(
            "마지막 페이지입니다.",
          );

          return;
        }

        oPaginationModel.setProperty(
          "/currentPage",
          iCurrentPage + 1,
        );

        this._applyPagingOnly();
      },

      /* =========================================================
       * 마지막 페이지
       * ========================================================= */
      onPaginationLast() {
        const oPaginationModel =
          this.getView().getModel(
            "pagination",
          );

        if (!oPaginationModel) {
          return;
        }

        const iTotalPages =
          oPaginationModel.getProperty(
            "/totalPages",
          ) || 1;

        oPaginationModel.setProperty(
          "/currentPage",
          iTotalPages,
        );

        this._applyPagingOnly();
      },
    });
  },
);