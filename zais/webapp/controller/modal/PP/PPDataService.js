sap.ui.define(
  ["sap/m/MessageBox", "sap/base/Log"],
  (MessageBox, Log) => {
    "use strict";

    return {
      /**
       * DRAM 반복생산 (REM) 현황 데이터 조회
       */
      loadDramProdData(oComponent, oDashboardModel) {
        if (!oDashboardModel) {
          return;
        }

        // DRAM 반복생산 주차/기간별 실적 데이터 (모의 데이터 제거)
        const aDramList = [];

        oDashboardModel.setProperty("/dramProdList", aDramList);

        const iCount = aDramList.length;
        oDashboardModel.setProperty(
          "/modalConfig/DramProd/totalCount",
          iCount
        );
        oDashboardModel.setProperty(
          "/currentModal/totalCount",
          iCount
        );

        Log.info("PP DRAM 반복생산 현황 목록: " + JSON.stringify(aDramList));
      },

      /**
       * 공통 생산오더 현황 데이터 조회 (HBM3E / BGP / GPU / AIS)
       */
      loadProdOrderData(oComponent, oDashboardModel, sProcessKey) {
        if (!oDashboardModel) {
          return;
        }

        // 공통 생산오더 현황 데이터 (모의 데이터 제거)
        const aOrderList = [];

        oDashboardModel.setProperty("/prodOrderList", aOrderList);

        const iCount = aOrderList.length;
        if (sProcessKey) {
          oDashboardModel.setProperty(
            "/modalConfig/" + sProcessKey + "/totalCount",
            iCount
          );
        }
        oDashboardModel.setProperty(
          "/currentModal/totalCount",
          iCount
        );

        Log.info(
          "PP 공통 생산오더 현황 목록 (" +
            sProcessKey +
            "): " +
            JSON.stringify(aOrderList)
        );
      }
    };
  }
);
