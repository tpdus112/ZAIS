sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/base/Log"
  ],
  function (
    Controller,
    JSONModel,
    ODataModel,
    Filter,
    FilterOperator,
    MessageToast,
    Log
  ) {
    "use strict";

    return Controller.extend(
      "zais.scm.zais.controller.modal.PP.ProdOrder",
      {
        onInit: function () {
          // 전체 원본 데이터
          this._aAllData = [];

          // 검색 적용 후 데이터
          this._aFilteredData = [];

          // 한 페이지당 10개
          this._iPageSize = 10;

          // 현재 조회 중인 자재
          this._sCurrentMatnr = "";

          // pagination 모델
          var oPaginationModel = new JSONModel({
            displayList: [],
            totalCount: 0,
            pageSize: 10,
            currentPage: 1,
            totalPages: 1
          });

          this.getView().setModel(
            oPaginationModel,
            "pagination"
          );
        },


        /* ====================================================== */
        /* View가 모달에 붙을 때 SAP 조회                          */
        /* ====================================================== */

        onBeforeRendering: function () {
          var oDashboardModel =
            this.getView().getModel("dashboard");

          if (!oDashboardModel) {
            return;
          }

          var oCurrentModal =
            oDashboardModel.getProperty(
              "/currentModal"
            );

          if (!oCurrentModal) {
            return;
          }


          var sMatnr = oCurrentModal.matnr;


          /*
           * 기존 Main Controller가 currentModal에
           * matnr를 복사하지 않는 경우를 위한 fallback
           */
          if (!sMatnr) {
            sMatnr =
              this._getMatnrByTitle(
                oCurrentModal.title
              );
          }


          if (!sMatnr) {
            return;
          }


          /*
           * 같은 모달 재렌더링 때 불필요한 중복조회 방지
           */
          if (
            this._sCurrentMatnr === sMatnr &&
            this._aAllData.length > 0
          ) {
            return;
          }


          this._sCurrentMatnr = sMatnr;

          this._loadProdOrders();
        },


        /* ====================================================== */
        /* 제목 fallback                                          */
        /* ====================================================== */

        _getMatnrByTitle: function (sTitle) {
          sTitle = sTitle || "";

          if (sTitle.indexOf("HBM3E") !== -1) {
            return "AI-H-HBM3E";
          }

          if (sTitle.indexOf("BGP") !== -1) {
            return "AI-H-BGP";
          }

          if (sTitle.indexOf("GPU") !== -1) {
            return "AI-H-GPU";
          }

          if (sTitle.indexOf("AIS") !== -1) {
            return "AI-F-AIS";
          }

          return "";
        },


        /* ====================================================== */
        /* SAP OData 생산오더 조회                                 */
        /* ====================================================== */

        _loadProdOrders: function () {
          var that = this;

          if (!this._sCurrentMatnr) {
            return;
          }


          var oODataModel =
            new ODataModel(
              "/sap/opu/odata/sap/ZAIS_SCM_SRV/",
              {
                useBatch: false
              }
            );


          var aFilters = [
            new Filter(
              "Matnr",
              FilterOperator.EQ,
              this._sCurrentMatnr
            )
          ];


          oODataModel.read(
            "/PpOrderSet",
            {
              filters: aFilters,

              urlParameters: {
                "$format": "json"
              },


              success: function (oData) {
                var aResults =
                  oData.results || [];


                var aMapped =
                  aResults.map(
                    function (oItem) {
                      var iProgress =
                        Number(
                          oItem.Progress || 0
                        );


                      return {
                        /*
                         * SAP 실제 필드
                         */
                        orderNo:
                          oItem.Aufnr || "",

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
                          iProgress + "%",

                        status:
                          oItem.Status || "",

                        statusState:
                          that._getStatusState(
                            oItem.Status
                          )
                      };
                    }
                  );


                /*
                 * 생산오더 번호 내림차순
                 * 최신번호가 위로 오도록
                 */
                aMapped.sort(
                  function (a, b) {
                    return b.orderNo.localeCompare(
                      a.orderNo
                    );
                  }
                );


                that._aAllData =
                  aMapped;

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


                /*
                 * 공통 모달 전체 건수도 동기화
                 */
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
                Log.error(
                  "PP 생산오더 조회 실패",
                  oError
                );

                that._aAllData = [];
                that._aFilteredData = [];

                that._updatePagination();

                MessageToast.show(
                  "생산오더 조회에 실패했습니다."
                );
              }
            }
          );
        },


        /* ====================================================== */
        /* 수량 표시                                              */
        /* ====================================================== */

        _formatQty: function (vQty) {
          var nQty = Number(vQty);

          if (isNaN(nQty)) {
            return vQty || "0";
          }

          return Math.round(nQty).toLocaleString();
        },


        /* ====================================================== */
        /* SAP 상태 → UI5 ObjectStatus State                       */
        /* ====================================================== */

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


        /* ====================================================== */
        /* 검색                                                   */
        /* ====================================================== */

        onSearch: function () {
          var sKeyword =
            this.byId("searchKeyword")
              .getValue()
              .trim()
              .toLowerCase();


          var sStatusKey =
            this.byId("searchStatus")
              .getSelectedKey();


          var aFiltered =
            this._aAllData.filter(
              function (oItem) {
                /*
                 * 통합검색
                 */
                var bKeywordMatch =
                  !sKeyword ||
                  oItem.orderNo
                    .toLowerCase()
                    .includes(sKeyword) ||
                  oItem.matCode
                    .toLowerCase()
                    .includes(sKeyword) ||
                  oItem.matName
                    .toLowerCase()
                    .includes(sKeyword);


                /*
                 * 상태검색
                 */
                var bStatusMatch = true;

                if (
                  sStatusKey ===
                  "COMPLETED"
                ) {
                  bStatusMatch =
                    oItem.status ===
                    "완료";
                }

                if (
                  sStatusKey ===
                  "IN_PROGRESS"
                ) {
                  bStatusMatch =
                    oItem.status ===
                    "진행 중";
                }

                if (
                  sStatusKey ===
                  "WAITING"
                ) {
                  bStatusMatch =
                    oItem.status ===
                    "대기";
                }


                return (
                  bKeywordMatch &&
                  bStatusMatch
                );
              }
            );


          this._aFilteredData =
            aFiltered;


          this
            .getView()
            .getModel("pagination")
            .setProperty(
              "/currentPage",
              1
            );


          this._updatePagination();
        },


        /* ====================================================== */
        /* 검색 초기화                                            */
        /* ====================================================== */

        onReset: function () {
          this.byId(
            "searchKeyword"
          ).setValue("");


          this.byId(
            "searchStatus"
          ).setSelectedKey("ALL");


          this._aFilteredData =
            this._aAllData.slice();


          this
            .getView()
            .getModel("pagination")
            .setProperty(
              "/currentPage",
              1
            );


          this._updatePagination();
        },


        /* ====================================================== */
        /* 페이지 계산                                            */
        /* ====================================================== */

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


        /* ====================================================== */
        /* 첫 페이지                                              */
        /* ====================================================== */

        onPaginationFirst:
          function () {
            this
              .getView()
              .getModel(
                "pagination"
              )
              .setProperty(
                "/currentPage",
                1
              );

            this._updatePagination();
          },


        /* ====================================================== */
        /* 이전 페이지                                            */
        /* ====================================================== */

        onPaginationPrev:
          function () {
            var oModel =
              this
                .getView()
                .getModel(
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


        /* ====================================================== */
        /* 다음 페이지                                            */
        /* ====================================================== */

        onPaginationNext:
          function () {
            var oModel =
              this
                .getView()
                .getModel(
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


            if (
              iPage <
              iTotalPages
            ) {
              oModel.setProperty(
                "/currentPage",
                iPage + 1
              );

              this._updatePagination();
            }
          },


        /* ====================================================== */
        /* 마지막 페이지                                          */
        /* ====================================================== */

        onPaginationLast:
          function () {
            var oModel =
              this
                .getView()
                .getModel(
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
          }
      }
    );
  }
);