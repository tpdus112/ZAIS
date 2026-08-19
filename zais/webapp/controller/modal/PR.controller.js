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

    return Controller.extend("zais.scm.zais.controller.modal.PR", {
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

      _updatePagination() {
        const oTable = this.byId("prTable");
        const oPaginationModel = this.getView().getModel("pagination");
        if (!oTable || !oPaginationModel) {
          return;
        }

        const oBinding = oTable.getBinding("items");
        const iTotalCount = oBinding ? oBinding.getLength() : 5;
        const iPageSize = oPaginationModel.getProperty("/pageSize") || 5;
        const iTotalPages = Math.max(1, Math.ceil(iTotalCount / iPageSize));
        let iCurrentPage = oPaginationModel.getProperty("/currentPage") || 1;

        if (iCurrentPage > iTotalPages) {
          iCurrentPage = iTotalPages;
        }

        oPaginationModel.setProperty("/totalCount", iTotalCount);
        oPaginationModel.setProperty("/totalPages", iTotalPages);
        oPaginationModel.setProperty("/currentPage", iCurrentPage);
      },

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

    // 통합 검색
    if (sKeyword) {
        aFilters.push(
            new Filter({
                filters: [
                    new Filter(
                        "prNo",
                        FilterOperator.Contains,
                        sKeyword
                    ),
                    new Filter(
                        "matCode",
                        FilterOperator.Contains,
                        sKeyword
                    ),
                    new Filter(
                        "matName",
                        FilterOperator.Contains,
                        sKeyword
                    )
                ],
                and: false
            })
        );
    }

    // 상태 검색
    if (sStatusKey === "PO_CREATED") {
        aFilters.push(
            new Filter(
                "status",
                FilterOperator.EQ,
                "PO 생성"
            )
        );
    } else if (sStatusKey === "PR_REQUESTED") {
        aFilters.push(
            new Filter(
                "status",
                FilterOperator.EQ,
                "구매요청"
            )
        );
    } else if (sStatusKey === "DELETED") {
        aFilters.push(
            new Filter(
                "status",
                FilterOperator.EQ,
                "삭제"
            )
        );
    }

    // 날짜 검색
    if (sDateFrom && sDateTo) {
        aFilters.push(
            new Filter(
                "reqDate",
                FilterOperator.BT,
                sDateFrom,
                sDateTo
            )
        );
    } else if (sDateFrom) {
        aFilters.push(
            new Filter(
                "reqDate",
                FilterOperator.GE,
                sDateFrom
            )
        );
    } else if (sDateTo) {
        aFilters.push(
            new Filter(
                "reqDate",
                FilterOperator.LE,
                sDateTo
            )
        );
    }

    const oTable = this.byId("prTable");

    if (oTable) {
        const oBinding = oTable.getBinding("items");

        if (oBinding) {
            oBinding.filter(aFilters);
        }
    }

    this._updatePagination();

    MessageToast.show("검색이 완료되었습니다.");
},

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

        const oTable = this.byId("prTable");
        if (oTable) {
          const oBinding = oTable.getBinding("items");
          if (oBinding) {
            oBinding.filter([]);
          }
        }

        this._updatePagination();
        MessageToast.show("검색 조건이 초기화되었습니다.");
      },

      onPaginationFirst() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          oPaginationModel.setProperty("/currentPage", 1);
        }
        MessageToast.show("첫 페이지입니다.");
      },

      onPaginationPrev() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          const iCur = oPaginationModel.getProperty("/currentPage");
          if (iCur > 1) {
            oPaginationModel.setProperty("/currentPage", iCur - 1);
          } else {
            MessageToast.show("첫 페이지입니다.");
            return;
          }
        }
        MessageToast.show("이전 페이지로 이동합니다.");
      },

      onPaginationNext() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          const iCur = oPaginationModel.getProperty("/currentPage");
          const iTotal = oPaginationModel.getProperty("/totalPages");
          if (iCur < iTotal) {
            oPaginationModel.setProperty("/currentPage", iCur + 1);
          } else {
            MessageToast.show("마지막 페이지입니다.");
            return;
          }
        }
        MessageToast.show("다음 페이지로 이동합니다.");
      },

      onPaginationLast() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          const iTotal = oPaginationModel.getProperty("/totalPages");
          oPaginationModel.setProperty("/currentPage", iTotal);
        }
        MessageToast.show("마지막 페이지입니다.");
      },

      onValueHelpPrNo() {
        MessageToast.show("구매요청 번호 검색 도움창입니다.");
      },

      onValueHelpMatCode() {
        MessageToast.show("자재코드 검색 도움창입니다.");
      },
    });
  },
);
