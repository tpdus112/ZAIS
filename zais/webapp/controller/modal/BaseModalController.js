sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
  ],
  (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.modal.BaseModalController", {
      /* =========================================================
       * 초기화
       * ========================================================= */
      onInit() {
        const iDefaultPageSize = this.getDefaultPageSize ? this.getDefaultPageSize() : 10;

        const oPaginationModel = new JSONModel({
          totalCount: 0,
          pageSize: iDefaultPageSize,
          currentPage: 1,
          totalPages: 1,
          displayList: []
        });

        this.getView().setModel(oPaginationModel, "pagination");

        this._aFullList = [];
        this._aFilteredList = [];
        this._bLoaded = false;
        this._bLoading = false;

        this.getView().attachModelContextChange(() => {
          this._loadData();
        });
      },

      onAfterRendering() {
        this._loadData();
      },

      /* =========================================================
       * 테이블 및 캐시 경로 설정 (하위 컨트롤러에서 오버라이드 가능)
       * ========================================================= */
      getTableId() {
        return "mainTable";
      },

      getCachePath() {
        return "";
      },

      getDefaultPageSize() {
        return 10;
      },

      getTableControl() {
        return this.byId(this.getTableId());
      },

      /* =========================================================
       * 공통 데이터 로드 생명주기
       * ========================================================= */
      _loadData() {
        if (this._bLoaded || this._bLoading) {
          return;
        }

        const oComponent = this.getOwnerComponent();
        const oDashboardModel =
          this.getView().getModel("dashboard") ||
          (oComponent && oComponent.getModel("dashboard"));

        const sCachePath = this.getCachePath();
        if (oDashboardModel && sCachePath) {
          const aCached = oDashboardModel.getProperty(sCachePath);
          if (Array.isArray(aCached) && aCached.length > 0) {
            this._aFullList = aCached;
            this._applyFiltersAndPaging();
          }
        }

        const oTable = this.getTableControl();
        if (oTable && (!this._aFullList || this._aFullList.length === 0)) {
          oTable.setBusy(true);
        }

        if (typeof this.loadDataService !== "function") {
          if (oTable) oTable.setBusy(false);
          return;
        }

        this._bLoading = true;

        this.loadDataService(oComponent, oDashboardModel)
          .then((aList) => {
            this._aFullList = aList || [];
            this._bLoaded = true;
            this._applyFiltersAndPaging();
          })
          .catch((err) => {
            console.error("Data load failed in " + this.getMetadata().getName(), err);
          })
          .finally(() => {
            this._bLoading = false;
            if (oTable) {
              oTable.setBusy(false);
            }
          });
      },

      /* =========================================================
       * 필터링 & 페이지 계산
       * ========================================================= */
      _applyFiltersAndPaging() {
        const aList = this._aFullList || [];

        const oKeywordInput = this.byId("searchKeyword");
        const oStatusSelect = this.byId("searchStatus");
        const oDateFromPicker = this.byId("searchDateFrom");
        const oDateToPicker = this.byId("searchDateTo");

        const oFilterParams = {
          keyword: oKeywordInput ? (oKeywordInput.getValue() || "").trim().toLowerCase() : "",
          statusKey: oStatusSelect ? oStatusSelect.getSelectedKey() : "ALL",
          dateFrom: oDateFromPicker ? oDateFromPicker.getValue() : "",
          dateTo: oDateToPicker ? oDateToPicker.getValue() : ""
        };

        this._aFilteredList = aList.filter((oItem) => this.filterItem(oItem, oFilterParams));

        const oPaginationModel = this.getView().getModel("pagination");
        if (!oPaginationModel) {
          return;
        }

        const iPageSize = oPaginationModel.getProperty("/pageSize") || this.getDefaultPageSize();
        const iTotalCount = this._aFilteredList.length;
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

      /* =========================================================
       * 개별 아이템 필터 조건 판별 (하위 컨트롤러에서 커스텀 가능)
       * ========================================================= */
      filterItem(oItem, oParams) {
        const { keyword, statusKey, dateFrom, dateTo } = oParams;

        // 1. 키워드 통합 검색
        if (keyword) {
          const sSearchTarget = [
            oItem.soNo,
            oItem.deliveryNo,
            oItem.billNo,
            oItem.orderNo,
            oItem.prNo,
            oItem.poNo,
            oItem.materialDoc,
            oItem.customer,
            oItem.customerCode,
            oItem.matCode,
            oItem.matName,
            oItem.plant,
            oItem.prodLine
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!sSearchTarget.includes(keyword)) {
            return false;
          }
        }

        // 2. 상태 필터
        if (statusKey && statusKey !== "ALL") {
          const sItemStatus = oItem.status || "";
          if (statusKey === "COMPLETED" && !sItemStatus.includes("완료")) {
            return false;
          }
          if (statusKey === "IN_PROGRESS" && (sItemStatus.includes("완료") || sItemStatus.includes("대기"))) {
            return false;
          }
          if (statusKey === "WAITING" && !sItemStatus.includes("대기")) {
            return false;
          }
          if (statusKey === "PGI_COMPLETED" && sItemStatus !== "PGI 완료") {
            return false;
          }
          if (statusKey === "PO_CREATED" && sItemStatus !== "PO 생성") {
            return false;
          }
        }

        // 3. 일자 범위 필터 (orderDate, deliveryDate, billDate, pgiDate, reqDate, postingDate, periodKey 등)
        const sItemDate =
          oItem.orderDate ||
          oItem.deliveryDate ||
          oItem.billDate ||
          oItem.pgiDate ||
          oItem.reqDate ||
          oItem.postingDate ||
          oItem.periodKey ||
          "";

        if (dateFrom && sItemDate && sItemDate < dateFrom) {
          return false;
        }
        if (dateTo && sItemDate && sItemDate > dateTo) {
          return false;
        }

        return true;
      },

      /* =========================================================
       * 현재 페이지 데이터 슬라이싱
       * ========================================================= */
      _applyPagingOnly() {
        const oPaginationModel = this.getView().getModel("pagination");
        if (!oPaginationModel) {
          return;
        }

        const aFiltered = this._aFilteredList || this._aFullList || [];
        const iPageSize = oPaginationModel.getProperty("/pageSize") || this.getDefaultPageSize();
        const iCurrentPage = oPaginationModel.getProperty("/currentPage") || 1;

        const iStart = (iCurrentPage - 1) * iPageSize;
        const aPageData = aFiltered.slice(iStart, iStart + iPageSize);

        oPaginationModel.setProperty("/displayList", aPageData);
      },

      /* =========================================================
       * 검색 & 초기화 이벤트
       * ========================================================= */
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

        if (oKeywordInput) oKeywordInput.setValue("");
        if (oStatusSelect) oStatusSelect.setSelectedKey("ALL");
        if (oDateFromPicker) oDateFromPicker.setValue("");
        if (oDateToPicker) oDateToPicker.setValue("");

        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          oPaginationModel.setProperty("/currentPage", 1);
        }

        this._applyFiltersAndPaging();
        MessageToast.show("검색 조건이 초기화되었습니다.");
      },

      /* =========================================================
       * 페이지네이션 버튼 이벤트 (별칭 동시 지원)
       * ========================================================= */
      onPaginationFirst() {
        this._setPage(1);
      },
      onPageFirst() {
        this._setPage(1);
      },

      onPaginationPrev() {
        const oPaginationModel = this.getView().getModel("pagination");
        const iCurrent = (oPaginationModel && oPaginationModel.getProperty("/currentPage")) || 1;
        this._setPage(Math.max(1, iCurrent - 1));
      },
      onPagePrev() {
        this.onPaginationPrev();
      },

      onPaginationNext() {
        const oPaginationModel = this.getView().getModel("pagination");
        const iCurrent = (oPaginationModel && oPaginationModel.getProperty("/currentPage")) || 1;
        const iTotal = (oPaginationModel && oPaginationModel.getProperty("/totalPages")) || 1;
        this._setPage(Math.min(iTotal, iCurrent + 1));
      },
      onPageNext() {
        this.onPaginationNext();
      },

      onPaginationLast() {
        const oPaginationModel = this.getView().getModel("pagination");
        const iTotal = (oPaginationModel && oPaginationModel.getProperty("/totalPages")) || 1;
        this._setPage(iTotal);
      },
      onPageLast() {
        this.onPaginationLast();
      },

      onPageSizeChange(oEvent) {
        const oPaginationModel = this.getView().getModel("pagination");
        if (!oPaginationModel) {
          return;
        }

        const iNewSize = Number(oEvent.getSource().getSelectedKey()) || this.getDefaultPageSize();
        oPaginationModel.setProperty("/pageSize", iNewSize);
        oPaginationModel.setProperty("/currentPage", 1);
        this._applyFiltersAndPaging();
      },

      _setPage(iPage) {
        const oPaginationModel = this.getView().getModel("pagination");
        if (oPaginationModel) {
          oPaginationModel.setProperty("/currentPage", iPage);
          this._applyPagingOnly();
        }
      }
    });
  }
);
