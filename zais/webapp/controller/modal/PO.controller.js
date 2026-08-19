sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
  ],
  (Controller, JSONModel, Filter, FilterOperator, MessageToast) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.modal.PO", {
      onInit() {
        const oPaginationModel = new JSONModel({
          totalCount: 5,
          pageSize: 5,
          currentPage: 1,
          totalPages: 1,
        });

        this.getView().setModel(oPaginationModel, "pagination");
        this._updatePagination();
      },

      /**
       * 현재 구매오더 목록 기준 페이지 정보 갱신
       */
      _updatePagination() {
        const oTable = this.byId("poTable");
        const oPaginationModel = this.getView().getModel("pagination");

        if (!oTable || !oPaginationModel) {
          return;
        }

        const oBinding = oTable.getBinding("items");
        const iTotalCount = oBinding ? oBinding.getLength() : 0;
        const iPageSize = oPaginationModel.getProperty("/pageSize") || 5;
        const iTotalPages = Math.max(
          1,
          Math.ceil(iTotalCount / iPageSize),
        );

        let iCurrentPage =
          oPaginationModel.getProperty("/currentPage") || 1;

        if (iCurrentPage > iTotalPages) {
          iCurrentPage = iTotalPages;
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
      },

      /**
       * 구매오더 검색
       */
      onSearch() {
        const oKeywordInput = this.byId("searchKeyword");
        const oStatusSelect = this.byId("searchStatus");
        const oDateFromPicker = this.byId("searchDateFrom");
        const oDateToPicker = this.byId("searchDateTo");

        const sKeyword = oKeywordInput
          ? (oKeywordInput.getValue() || "").trim()
          : "";

        const sStatusKey = oStatusSelect
          ? oStatusSelect.getSelectedKey()
          : "ALL";

        const sDateFrom = oDateFromPicker
          ? oDateFromPicker.getValue()
          : "";

        const sDateTo = oDateToPicker
          ? oDateToPicker.getValue()
          : "";

        const aFilters = [];

        // 1. 통합 검색
        // 구매오더 번호 / 자재코드 / 자재명
        if (sKeyword) {
          aFilters.push(
            new Filter({
              filters: [
                new Filter(
                  "poNo",
                  FilterOperator.Contains,
                  sKeyword,
                ),

                new Filter(
                  "matCode",
                  FilterOperator.Contains,
                  sKeyword,
                ),

                new Filter(
                  "matName",
                  FilterOperator.Contains,
                  sKeyword,
                ),
              ],
              and: false,
            }),
          );
        }

        // 2. 상태 검색
        if (sStatusKey === "PO_CREATED") {
          aFilters.push(
            new Filter(
              "status",
              FilterOperator.EQ,
              "구매오더",
            ),
          );
        } else if (sStatusKey === "GR_COMPLETED") {
          aFilters.push(
            new Filter(
              "status",
              FilterOperator.EQ,
              "입고 완료",
            ),
          );
        } else if (sStatusKey === "DELETED") {
          aFilters.push(
            new Filter(
              "status",
              FilterOperator.EQ,
              "삭제",
            ),
          );
        }

        // 3. 발주일 검색
        if (sDateFrom && sDateTo) {
          aFilters.push(
            new Filter(
              "orderDate",
              FilterOperator.BT,
              sDateFrom,
              sDateTo,
            ),
          );
        } else if (sDateFrom) {
          aFilters.push(
            new Filter(
              "orderDate",
              FilterOperator.GE,
              sDateFrom,
            ),
          );
        } else if (sDateTo) {
          aFilters.push(
            new Filter(
              "orderDate",
              FilterOperator.LE,
              sDateTo,
            ),
          );
        }

        // 4. 테이블에 필터 적용
        const oTable = this.byId("poTable");

        if (oTable) {
          const oBinding = oTable.getBinding("items");

          if (oBinding) {
            oBinding.filter(aFilters);
          }
        }

        // 검색 후 첫 페이지로 이동
        const oPaginationModel =
          this.getView().getModel("pagination");

        if (oPaginationModel) {
          oPaginationModel.setProperty(
            "/currentPage",
            1,
          );
        }

        this._updatePagination();

        MessageToast.show(
          "검색이 완료되었습니다.",
        );
      },

      /**
       * 검색 조건 초기화
       */
      onReset() {
        const oKeywordInput = this.byId("searchKeyword");
        const oStatusSelect = this.byId("searchStatus");
        const oDateFromPicker = this.byId("searchDateFrom");
        const oDateToPicker = this.byId("searchDateTo");

        if (oKeywordInput) {
          oKeywordInput.setValue("");
        }

        if (oStatusSelect) {
          oStatusSelect.setSelectedKey("ALL");
        }

        if (oDateFromPicker) {
          oDateFromPicker.setValue("");
        }

        if (oDateToPicker) {
          oDateToPicker.setValue("");
        }

        const oTable = this.byId("poTable");

        if (oTable) {
          const oBinding = oTable.getBinding("items");

          if (oBinding) {
            oBinding.filter([]);
          }
        }

        const oPaginationModel =
          this.getView().getModel("pagination");

        if (oPaginationModel) {
          oPaginationModel.setProperty(
            "/currentPage",
            1,
          );
        }

        this._updatePagination();

        MessageToast.show(
          "검색 조건이 초기화되었습니다.",
        );
      },

      /**
       * 첫 페이지
       */
      onPaginationFirst() {
        const oPaginationModel =
          this.getView().getModel("pagination");

        if (oPaginationModel) {
          oPaginationModel.setProperty(
            "/currentPage",
            1,
          );
        }

        MessageToast.show(
          "첫 페이지입니다.",
        );
      },

      /**
       * 이전 페이지
       */
      onPaginationPrev() {
        const oPaginationModel =
          this.getView().getModel("pagination");

        if (oPaginationModel) {
          const iCurrentPage =
            oPaginationModel.getProperty(
              "/currentPage",
            );

          if (iCurrentPage > 1) {
            oPaginationModel.setProperty(
              "/currentPage",
              iCurrentPage - 1,
            );
          } else {
            MessageToast.show(
              "첫 페이지입니다.",
            );

            return;
          }
        }

        MessageToast.show(
          "이전 페이지로 이동합니다.",
        );
      },

      /**
       * 다음 페이지
       */
      onPaginationNext() {
        const oPaginationModel =
          this.getView().getModel("pagination");

        if (oPaginationModel) {
          const iCurrentPage =
            oPaginationModel.getProperty(
              "/currentPage",
            );

          const iTotalPages =
            oPaginationModel.getProperty(
              "/totalPages",
            );

          if (iCurrentPage < iTotalPages) {
            oPaginationModel.setProperty(
              "/currentPage",
              iCurrentPage + 1,
            );
          } else {
            MessageToast.show(
              "마지막 페이지입니다.",
            );

            return;
          }
        }

        MessageToast.show(
          "다음 페이지로 이동합니다.",
        );
      },

      /**
       * 마지막 페이지
       */
      onPaginationLast() {
        const oPaginationModel =
          this.getView().getModel("pagination");

        if (oPaginationModel) {
          const iTotalPages =
            oPaginationModel.getProperty(
              "/totalPages",
            );

          oPaginationModel.setProperty(
            "/currentPage",
            iTotalPages,
          );
        }

        MessageToast.show(
          "마지막 페이지입니다.",
        );
      },
    });
  },
);