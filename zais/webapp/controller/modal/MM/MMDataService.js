sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/base/Log",
    "zais/scm/zais/controller/modal/MM/MMReceiptAggregator"
  ],
  (MessageBox, Log, MMReceiptAggregator) => {
    "use strict";

    return {
      /* =======================================================================
       * 1. 구매요청 목록 조회
       * ======================================================================= */
      loadPurchaseRequests(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            resolve(oDashboardModel ? oDashboardModel.getProperty("/prList") || [] : []);
            return;
          }

          oScmModel.read("/PurchaseReqSet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aPrList = aResults.map((oItem) => ({
                prNo: oItem.ReqNumber,
                itemNo: oItem.ReqItem,
                matCode: oItem.Material,
                matName: oItem.MaterialName,
                reqQty: Math.round(Number(oItem.Quantity || 0)).toLocaleString(),
                unit: !oItem.Unit || oItem.Unit === "ST" || oItem.Unit === "EA" ? "PC" : oItem.Unit,
                plant: oItem.Plant,
                reqDate: oItem.RequestDate,
                poNo: oItem.PoNumber || "-",
                status: oItem.Status,
                statusState: oItem.Status === "PO 생성" ? "Success" : oItem.Status === "구매요청" ? "Information" : oItem.Status === "삭제" ? "Error" : "None"
              }));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/prList", aPrList);
                const iPrCount = new Set(aPrList.map((oItem) => oItem.prNo)).size;
                oDashboardModel.setProperty("/modalConfig/PR/totalCount", iPrCount);
                oDashboardModel.setProperty("/currentModal/totalCount", iPrCount);
              }

              Log.info("SAP 구매요청 목록: " + JSON.stringify(aPrList));
              resolve(aPrList);
            },
            error: (oError) => {
              Log.error("구매요청 조회 실패", oError);
              MessageBox.error("SAP 구매요청 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 2. 구매오더 목록 조회
       * ======================================================================= */
      loadPurchaseOrders(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            resolve(oDashboardModel ? oDashboardModel.getProperty("/poList") || [] : []);
            return;
          }

          oScmModel.read("/PurchaseOrderSet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aPoList = aResults.map((oItem) => ({
                poNo: oItem.PoNumber,
                itemNo: oItem.PoItem,
                matCode: oItem.Material,
                matName: oItem.MaterialName,
                orderQty: Math.round(Number(oItem.Quantity || 0)).toLocaleString(),
                unit: !oItem.Unit || oItem.Unit === "ST" || oItem.Unit === "EA" ? "PC" : oItem.Unit,
                plant: oItem.Plant,
                vendor: oItem.Vendor,
                orderDate: oItem.OrderDate,
                prNo: oItem.ReqNumber || "-",
                status: oItem.Status,
                statusState: oItem.Status === "입고 완료" ? "Success" : oItem.Status === "구매오더" ? "Information" : oItem.Status === "삭제" ? "Error" : "None"
              }));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/poList", aPoList);
                const iPoCount = new Set(aPoList.map((oItem) => oItem.poNo)).size;
                oDashboardModel.setProperty("/modalConfig/PO/totalCount", iPoCount);
                oDashboardModel.setProperty("/currentModal/totalCount", iPoCount);
              }

              Log.info("SAP 구매오더 목록: " + JSON.stringify(aPoList));
              resolve(aPoList);
            },
            error: (oError) => {
              Log.error("구매오더 조회 실패", oError);
              MessageBox.error("SAP 구매오더 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 3. 자재입고 목록 조회
       * ======================================================================= */
      loadGoodsReceipts(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            resolve(oDashboardModel ? oDashboardModel.getProperty("/grList") || [] : []);
            return;
          }

          oScmModel.read("/GoodsReceiptSet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aGrList = aResults.map((oItem) => ({
                materialDoc: oItem.MaterialDoc,
                docYear: oItem.DocYear,
                docItem: oItem.DocItem,
                matCode: oItem.Material,
                matName: oItem.MaterialName,
                grQty: Math.round(Number(oItem.Quantity || 0)).toLocaleString(),
                unit: !oItem.Unit || oItem.Unit === "ST" || oItem.Unit === "EA" ? "PC" : oItem.Unit,
                plant: oItem.Plant,
                movementType: oItem.MovementType,
                poNo: oItem.PoNumber || "-",
                poItem: oItem.PoItem || "-",
                postingDate: oItem.PostingDate,
                status: oItem.Status,
                statusState: oItem.Status === "입고 완료" ? "Success" : oItem.Status === "입고 취소" ? "Error" : "None"
              }));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/grList", aGrList);
                const iGrCount = new Set(aGrList.map((oItem) => `${oItem.materialDoc}-${oItem.docYear}`)).size;
                oDashboardModel.setProperty("/modalConfig/GR/totalCount", iGrCount);
                oDashboardModel.setProperty("/currentModal/totalCount", iGrCount);
              }

              Log.info("SAP 자재입고 목록: " + JSON.stringify(aGrList));
              resolve(aGrList);
            },
            error: (oError) => {
              Log.error("자재입고 조회 실패", oError);
              MessageBox.error("SAP 자재입고 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 4. 자재별 PO / 입고 진행현황 조회 & 대시보드 반영
       * ======================================================================= */
      loadMaterialReceiptProgress(oComponent, oDashboardModel) {
        const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
        if (!oScmModel || !oDashboardModel) return Promise.resolve();

        const readOData = (sPath) => new Promise((resolve, reject) => oScmModel.read(sPath, { success: (oData) => resolve(oData.results || []), error: reject }));

        return Promise.all([
          readOData("/PurchaseReqSet"),
          readOData("/PurchaseOrderSet"),
          readOData("/GoodsReceiptSet")
        ])
          .then(([aPrList, aPoList, aGrList]) => {
            MMReceiptAggregator.applyToDashboard(oDashboardModel, aPrList, aPoList, aGrList);
          })
          .catch((oError) => {
            Log.error("자재 입고 진행현황 조회 실패", oError);
          });
      }
    };
  }
);