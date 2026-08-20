sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "zais/scm/zais/controller/modal/MM/MMDataService"
  ],
  (Controller, JSONModel, MessageToast, MMDataService) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.modal.MM.PO", {
      onInit() {
        const oPaginationModel = new JSONModel({
          totalCount: 0,
          pageSize: 10,
          currentPage: 1,
          totalPages: 1,
          displayList: []
        });

        this.getView().setModel(oPaginationModel, "pagination");

        this.getView().attachModelContextChange(() => {
          this._loadData();
        });
      },

      onAfterRendering() {
        this._loadData();
      },

      _loadData() {
        const oTable = this.byId("poTable");
        const oComponent = this.getOwnerComponent();
        const oDashboardModel =
          this.getView().getModel("dashboard") ||
          oComponent?.getModel("dashboard");

        if (oDashboardModel) {
          const aCached = oDashboardModel.getProperty("/poList");
          if (Array.isArray(aCached) && aCached.length > 0) {
            this._aFullList = aCached;
            this._applyFiltersAndPaging();
          }
        }

        if (oTable && (!this._aFullList || this._aFullList.length === 0)) {
          oTable.setBusy(true);
        }

        MMDataService.loadPurchaseOrders(oComponent, oDashboardModel)
          .then((aList) => {
            this._aFullList = aList || [];
            this._applyFiltersAndPaging();
          })
          .catch(() => {})
          .finally(() => {
            if (oTable) {
              oTable.setBusy(false);
            }
          });
      },

      _applyFiltersAndPaging() {
        const aList = this._aFullList || [];

        const oKeywordInput = this.byId("searchKeyword");
        const oStatusSelect = this.byId("searchStatus");
        const oDateFromPicker = this.byId("searchDateFrom");
        const oDateToPicker = this.byId("searchDateTo");

        const sKeyword = oKeywordInput
          ? (oKeywordInput.getValue() || "").trim().toLowerCase()
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

        const aFiltered = aList.filter((oItem) => {
          if (sKeyword) {
            const bMatchNo = (oItem.poNo || "")
              .toLowerCase()
              .includes(sKeyword);
            const bMatchCode = (oItem.matCode || "")
              .toLowerCase()
              .includes(sKeyword);
            const bMatchName = (oItem.matName || "")
              .toLowerCase()
              .includes(sKeyword);

            if (!bMatchNo && !bMatchCode && !bMatchName) {
              return false;
            }
          }

          if (sStatusKey === "PO_CREATED" && oItem.status !== "구매오더") {
            return false;
          }
          if (sStatusKey === "GR_COMPLETED" && oItem.status !== "입고 완료") {
            return false;
          }
          if (sStatusKey === "DELETED" && oItem.status !== "삭제") {
            return false;
          }

          if (sDateFrom && oItem.orderDate < sDateFrom) {
            return false;
          }
          if (sDateTo && oItem.orderDate > sDateTo) {
            return false;
          }

          return true;
        });

        this._aFilteredList = aFiltered;

        const oPaginationModel = this.getView().getModel("pagination");
        const iPageSize = oPaginationModel.getProperty("/pageSize") || 10;
        const iTotalCount = aFiltered.length;
        const iTotalPages = Math.max(1, Math.ceil(iTotalCount / iPageSize));

        let iCurrentPage = oPaginationModel.getProperty("/currentPage") || 1;
        if (iCurrentPage > iTotalPages) {
          iCurrentPage = 1;
        }

        oPaginationModel.setProperty("/totalCount", iTotalCount);
        oPaginationModel.setProperty("/totalPages", iTotalPages);
        oPaginationModel.setProperty("/currentPage", iCurrentPage);

        this._applyPagingOnly();
      },

      _applyPagingOnly() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (!oPaginationModel) {
          return;
        }

        const aFiltered = this._aFilteredList || this._aFullList || [];
        const iPageSize = oPaginationModel.getProperty("/pageSize") || 10;
        const iCurrentPage = oPaginationModel.getProperty("/currentPage") || 1;

        const iStart = (iCurrentPage - 1) * iPageSize;
        const aPageData = aFiltered.slice(iStart, iStart + iPageSize);

        oPaginationModel.setProperty("/displayList", aPageData);
      },

      onSearch() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          oPaginationModel.setProperty("/currentPage", 1);
        }

        this._applyFiltersAndPaging();
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

        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          oPaginationModel.setProperty("/currentPage", 1);
        }

        this._applyFiltersAndPaging();
        MessageToast.show("검색 조건이 초기화되었습니다.");
      },

      onPaginationFirst() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          oPaginationModel.setProperty("/currentPage", 1);
          this._applyPagingOnly();
        }
        MessageToast.show("첫 페이지입니다.");
      },

      onPaginationPrev() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          const iCurrentPage = oPaginationModel.getProperty("/currentPage");
          if (iCurrentPage > 1) {
            oPaginationModel.setProperty("/currentPage", iCurrentPage - 1);
            this._applyPagingOnly();
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
          const iCurrentPage = oPaginationModel.getProperty("/currentPage");
          const iTotalPages = oPaginationModel.getProperty("/totalPages");
          if (iCurrentPage < iTotalPages) {
            oPaginationModel.setProperty("/currentPage", iCurrentPage + 1);
            this._applyPagingOnly();
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
          const iTotalPages = oPaginationModel.getProperty("/totalPages");
          oPaginationModel.setProperty("/currentPage", iTotalPages);
          this._applyPagingOnly();
        }
        MessageToast.show("마지막 페이지입니다.");
      }
    });
  }
);