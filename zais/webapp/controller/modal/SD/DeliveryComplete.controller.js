sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
  ],
  (Controller, JSONModel, ODataModel, MessageToast) => {
    "use strict";

    return Controller.extend(
      "zais.scm.zais.controller.modal.SD.DeliveryComplete",
      {
        /* =========================================================
         * 초기화
         * ========================================================= */
        onInit() {
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
         * 납품 완료 / Billing 조회
         *
         * EntitySet:
         * SdDeliveryCompleteSet
         * ========================================================= */
        _loadData() {
          if (this._bLoaded || this._bLoading) {
            return;
          }

          const oTable =
            this.byId("deliveryCompleteTable");

          this._bLoading = true;

          if (oTable) {
            oTable.setBusy(true);
          }

          this._oODataModel.read(
            "/SdDeliveryCompleteSet",
            {
              success: (oData) => {
                const aResults =
                  oData.results || [];

                /* =====================================
                 * OData → 화면 데이터 변환
                 * ===================================== */
                this._aFullList = aResults.map(
                  (oItem) => {
                    const fQty =
                      Number(
                        oItem.BillingQty || 0,
                      );

                    let sStatus =
                      oItem.Status ||
                      "납품 완료";

                    let sStatusState =
                      "None";

                    if (
                      sStatus ===
                      "납품 완료"
                    ) {
                      sStatusState =
                        "Success";
                    }

                    return {
                      /* Billing Document */
                      billNo:
                        oItem.BillingNo ||
                        "",

                      /* Billing Item */
                      itemNo:
                        oItem.Posnr ||
                        "",

                      /* Delivery */
                      deliveryNo:
                        oItem.DeliveryNo ||
                        "",

                      /* Sales Order */
                      soNo:
                        oItem.SoNumber ||
                        "",

                      /* 고객코드 */
                      customerCode:
                        oItem.SoldTo ||
                        "",

                      /* 고객명 */
                      customer:
                        oItem.SoldToName ||
                        oItem.SoldTo ||
                        "",

                      /* 자재 */
                      matCode:
                        oItem.Matnr ||
                        "",

                      matName:
                        oItem.Maktx ||
                        "",

                      /* Billing 수량 */
                      billQty:
                        fQty.toLocaleString(
                          "ko-KR",
                          {
                            maximumFractionDigits:
                              0,
                          },
                        ),

                      /* ST → PC */
                      unit:
                        oItem.Meins ===
                        "ST"
                          ? "PC"
                          : oItem.Meins ||
                            "",

                      /* Billing Date */
                      billDate:
                        oItem.BillingDate ||
                        "",

                      /* 상태 */
                      status:
                        sStatus,

                      statusState:
                        sStatusState,
                    };
                  },
                );

                /* =====================================
                 * 최신 Billing Date 우선
                 * ===================================== */
                this._aFullList.sort(
                  (a, b) => {
                    if (
                      a.billDate !==
                      b.billDate
                    ) {
                      return b.billDate.localeCompare(
                        a.billDate,
                      );
                    }

                    return b.billNo.localeCompare(
                      a.billNo,
                    );
                  },
                );

                /* =====================================
                 * Dashboard cache
                 * ===================================== */
                const oComponent =
                  this.getOwnerComponent();

                const oDashboardModel =
                  this.getView().getModel(
                    "dashboard",
                  ) ||
                  (oComponent
                    ? oComponent.getModel(
                        "dashboard",
                      )
                    : null);

                if (oDashboardModel) {
                  oDashboardModel.setProperty(
                    "/deliveryCompleteList",
                    this._aFullList,
                  );

                  oDashboardModel.setProperty(
                    "/modalConfig/DeliveryComplete/totalCount",
                    this._aFullList.length,
                  );
                }

                /* 첫 페이지 */
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

                this._bLoaded = true;
                this._bLoading = false;

                /* Busy 종료 */
                if (oTable) {
                  oTable.setBusy(false);
                }

                console.log(
                  "SdDeliveryCompleteSet 조회 성공:",
                  this._aFullList,
                );
              },

              error: (oError) => {
                console.error(
                  "SdDeliveryCompleteSet 조회 실패:",
                  oError,
                );

                this._bLoading = false;

                if (oTable) {
                  oTable.setBusy(false);
                }

                MessageToast.show(
                  "납품 완료 조회에 실패했습니다.",
                );
              },
            },
          );
        },

        /* =========================================================
         * 검색 + 필터 + 페이지 계산
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
          const aFiltered =
            aList.filter(
              (oItem) => {
                if (sKeyword) {
                  const bMatchBill =
                    (
                      oItem.billNo ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        sKeyword,
                      );

                  const bMatchDelivery =
                    (
                      oItem.deliveryNo ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        sKeyword,
                      );

                  const bMatchSo =
                    (
                      oItem.soNo ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        sKeyword,
                      );

                  const bMatchCustomer =
                    (
                      oItem.customer ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        sKeyword,
                      );

                  const bMatchCustomerCode =
                    (
                      oItem.customerCode ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        sKeyword,
                      );

                  const bMatchCode =
                    (
                      oItem.matCode ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        sKeyword,
                      );

                  const bMatchName =
                    (
                      oItem.matName ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        sKeyword,
                      );

                  if (
                    !bMatchBill &&
                    !bMatchDelivery &&
                    !bMatchSo &&
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
                    "납품 완료"
                ) {
                  return false;
                }

                /* -----------------------------
                 * 청구일 From
                 * ----------------------------- */
                if (
                  sDateFrom &&
                  oItem.billDate <
                    sDateFrom
                ) {
                  return false;
                }

                /* -----------------------------
                 * 청구일 To
                 * ----------------------------- */
                if (
                  sDateTo &&
                  oItem.billDate >
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
           * 페이지
           * ========================================= */
          const oPaginationModel =
            this.getView().getModel(
              "pagination",
            );

          if (!oPaginationModel) {
            return;
          }

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
         * 현재 페이지 표시
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
      },
    );
  },
);