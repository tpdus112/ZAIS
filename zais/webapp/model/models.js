sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
  function (JSONModel, Device) {
    "use strict";

    return {
      createDeviceModel: function () {
        var oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
      },

      createDashboardModel: function () {
        var oNow = new Date();
        var sFormattedDate =
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

        var oData = {
          lastUpdated: sFormattedDate,
          header: {
            mm: {
              title: "구매 진행 (MM)",
              rate: 0,
              rateText: "0%",
              subText: "입고 완료 기준",
              countText: "0 / 0 건",
              icon: "sap-icon://cart",
              colorClass: "headerCardBlue"
            },
            pp: {
              title: "생산 진행 (PP)",
              rate: 0,
              rateText: "0%",
              subText: "생산 완료 기준",
              countText: "0 / 0 건",
              icon: "sap-icon://factory",
              colorClass: "headerCardGreen"
            },
            sd: {
              title: "출하 진행 (SD)",
              rate: 0,
              rateText: "0%",
              subText: "출하 완료 기준",
              countText: "0 / 0 건",
              icon: "sap-icon://shipping-status",
              colorClass: "headerCardPurple"
            },
            stock: {
              title: "재고 현황",
              amount: "0 PC",
              subText: "주요 자재 가용 수량",
              icon: "sap-icon://product",
              colorClass: "headerCardOrange"
            }
          },
          process: {
            mm: {
              title: "MM 조달",
              steps: [
                {
                  name: "구매요청",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://request"
                },
                {
                  name: "구매오더",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://cart"
                },
                {
                  name: "자재 입고",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://inventory"
                },
                {
                  name: "입고 완료",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://building"
                }
              ],
              materials: []
            },
            pp: {
              title: "PP 생산",
              steps: [
                {
                  name: "DRAM 생산",
                  count: "0 / 0",
                  countText: "0 / 0",
                  rate: "진행 예정",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://developer-settings"
                },
                {
                  name: "HBM3E 생산",
                  count: "0 / 0",
                  countText: "0 / 0",
                  rate: "진행 예정",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://database"
                },
                {
                  name: "BGP 생산",
                  count: "0 / 0",
                  countText: "0 / 0",
                  rate: "진행 예정",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://grid"
                },
                {
                  name: "GPU 생산",
                  count: "0 / 0",
                  countText: "0 / 0",
                  rate: "진행 예정",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://it-instance"
                },
                {
                  name: "AIS 조립",
                  count: "0 / 0",
                  countText: "0 / 0",
                  rate: "진행 예정",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://brain"
                }
              ],
              materials: []
            },
            sd: {
              title: "SD 판매/출하",
              steps: [
                {
                  name: "Sales Order",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://sales-order"
                },
                {
                  name: "Delivery",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://shipping-status"
                },
                {
                  name: "PGI",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://receipt"
                },
                {
                  name: "납품 완료",
                  count: "0 / 0",
                  status: "planned",
                  statusText: "진행 예정",
                  icon: "sap-icon://collaborate"
                }
              ],
              materials: []
            }
          },
          materialReceiptProgress: [],
          materials: [],
          prList: [],
          poList: [],
          grList: [],
          dramProdList: [],
          prodOrderList: [],
          soList: [],
          deliveryList: [],
          pgiList: [],
          deliveryCompleteList: [],
          modalConfig: {
            // MM
            PR: {
              title: "구매요청 목록",
              sapGuiName: "Purchase Requisition",
              sapGuiRoute: "ME51N",
              totalCount: 0
            },
            PO: {
              title: "구매오더 목록",
              sapGuiName: "Purchase Order",
              sapGuiRoute: "ME21N",
              totalCount: 0
            },
            GR: {
              title: "자재 입고 목록",
              sapGuiName: "Goods Receipt",
              sapGuiRoute: "MIGO",
              totalCount: 0
            },
            GRComplete: {
              title: "입고 완료 목록",
              sapGuiName: "Material Document",
              sapGuiRoute: "MB51",
              totalCount: 0
            },

            // PP
            DramProd: {
              title: "DRAM 반복생산 현황",
              sapGuiName: "Repetitive Manufacturing",
              sapGuiRoute: "MFBF",
              totalCount: 0
            },
            HBMProd: {
              title: "HBM3E 생산오더 현황",
              sapGuiName: "Discrete Manufacturing",
              sapGuiRoute: "CO01",
              totalCount: 0
            },
            BGPProd: {
              title: "BGP 생산오더 현황",
              sapGuiName: "Discrete Manufacturing",
              sapGuiRoute: "CO01",
              totalCount: 0
            },
            GPUProd: {
              title: "GPU 생산오더 현황",
              sapGuiName: "Discrete Manufacturing",
              sapGuiRoute: "CO01",
              totalCount: 0
            },
            AISAssembly: {
              title: "AIS 조립 생산오더 현황",
              sapGuiName: "Discrete Manufacturing",
              sapGuiRoute: "CO01",
              totalCount: 0
            },

            // SD
            SO: {
              title: "Sales Order 목록",
              sapGuiName: "Sales Order",
              sapGuiRoute: "VA01",
              totalCount: 0
            },
            Delivery: {
              title: "Delivery 목록",
              sapGuiName: "Outbound Delivery",
              sapGuiRoute: "VL01N",
              totalCount: 0
            },
            PGI: {
              title: "PGI 목록",
              sapGuiName: "Post Goods Issue",
              sapGuiRoute: "VL02N",
              totalCount: 0
            },
            DeliveryComplete: {
              title: "납품 완료 목록",
              sapGuiName: "Billing Document",
              sapGuiRoute: "VF01",
              totalCount: 0
            }
          },
          mmProcessSummary: {
            prCountText: "0 / 0",
            poCountText: "0 / 0",
            grCountText: "0 / 0",
            grCompleteCountText: "0 / 0",

            prStatus: "planned",
            prStatusText: "진행 예정",

            poStatus: "planned",
            poStatusText: "진행 예정",

            grStatus: "planned",
            grStatusText: "진행 예정",

            grCompleteStatus: "planned",
            grCompleteStatusText: "진행 예정"
          }
        };

        var oModel = new JSONModel(oData);
        return oModel;
      }
    };
  }
);
