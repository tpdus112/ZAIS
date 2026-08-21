sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/base/Log"
  ],
  (MessageBox, Log) => {
    "use strict";

    return {
      /* =======================================================================
       * 1. Sales Order (수주) 목록 조회
       * ======================================================================= */
      loadSalesOrders(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          if (!oScmModel) {
            resolve(oDashboardModel ? oDashboardModel.getProperty("/soList") || [] : []);
            return;
          }

          oScmModel.read("/SdSalesOrderSet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aSoList = aResults.map((oItem) => ({
                soNo: oItem.Vbeln || "",
                itemNo: oItem.Posnr || "",
                customerCode: oItem.SoldTo || "",
                customer: oItem.SoldToName || oItem.SoldTo || "",
                matCode: oItem.Matnr || "",
                matName: oItem.Maktx || "",
                orderQty: Math.round(Number(oItem.OrderQty || 0)).toLocaleString(),
                unit: oItem.Meins === "ST" ? "PC" : oItem.Meins || "",
                orderDate: oItem.DocDate || "",
                status: oItem.Status === "완료" ? "수주 완료" : oItem.Status || "대기",
                statusState: oItem.Status === "완료" ? "Success" : "None"
              }));

              aSoList.sort((a, b) => (a.orderDate !== b.orderDate ? b.orderDate.localeCompare(a.orderDate) : b.soNo.localeCompare(a.soNo)));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/soList", aSoList);
                oDashboardModel.setProperty("/modalConfig/SO/totalCount", aSoList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aSoList.length);
              }

              Log.info("SD SalesOrder 목록: " + JSON.stringify(aSoList));
              resolve(aSoList);
            },
            error: (oError) => {
              Log.error("SalesOrder 조회 실패:", oError);
              MessageBox.error("Sales Order 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 2. Delivery (납품/출하) 목록 조회
       * ======================================================================= */
      loadDeliveryList(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          if (!oScmModel) {
            resolve(oDashboardModel ? oDashboardModel.getProperty("/deliveryList") || [] : []);
            return;
          }

          oScmModel.read("/SdDeliverySet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aDeliveryList = aResults.map((oItem) => {
                const sStatus = oItem.Status || "대기";
                const sStatusState = sStatus === "PGI 완료" ? "Success" : sStatus === "출하 진행" ? "Information" : "None";

                return {
                  deliveryNo: oItem.Vbeln || "",
                  itemNo: oItem.Posnr || "",
                  soNo: oItem.SoNumber || "",
                  customerCode: oItem.SoldTo || "",
                  customer: oItem.SoldToName || oItem.SoldTo || "",
                  matCode: oItem.Matnr || "",
                  matName: oItem.Maktx || "",
                  deliveryQty: Math.round(Number(oItem.DeliveryQty || 0)).toLocaleString(),
                  unit: oItem.Meins === "ST" ? "PC" : oItem.Meins || "",
                  deliveryDate: oItem.DeliveryDate || "",
                  pgiDate: oItem.PgiDate || "",
                  status: sStatus,
                  statusState: sStatusState
                };
              });

              aDeliveryList.sort((a, b) => (a.deliveryDate !== b.deliveryDate ? b.deliveryDate.localeCompare(a.deliveryDate) : b.deliveryNo.localeCompare(a.deliveryNo)));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/deliveryList", aDeliveryList);
                oDashboardModel.setProperty("/modalConfig/Delivery/totalCount", aDeliveryList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aDeliveryList.length);
              }

              Log.info("SD Delivery 목록: " + JSON.stringify(aDeliveryList));
              resolve(aDeliveryList);
            },
            error: (oError) => {
              Log.error("Delivery 조회 실패:", oError);
              MessageBox.error("Delivery 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 3. PGI (출고전기) 목록 조회
       * ======================================================================= */
      loadPgiList(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          if (!oScmModel) {
            resolve(oDashboardModel ? oDashboardModel.getProperty("/pgiList") || [] : []);
            return;
          }

          oScmModel.read("/SdPgiSet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aPgiList = aResults.map((oItem) => ({
                deliveryNo: oItem.Vbeln || "",
                itemNo: oItem.Posnr || "",
                soNo: oItem.SoNumber || "",
                customerCode: oItem.SoldTo || "",
                customer: oItem.SoldToName || oItem.SoldTo || "",
                matCode: oItem.Matnr || "",
                matName: oItem.Maktx || "",
                pgiQty: Math.round(Number(oItem.PgiQty || 0)).toLocaleString(),
                unit: oItem.Meins === "ST" ? "PC" : oItem.Meins || "",
                pgiDate: oItem.PgiDate || "",
                status: oItem.Status || "PGI 완료",
                statusState: oItem.Status === "PGI 완료" ? "Success" : "None"
              }));

              aPgiList.sort((a, b) => (a.pgiDate !== b.pgiDate ? b.pgiDate.localeCompare(a.pgiDate) : b.deliveryNo.localeCompare(a.deliveryNo)));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/pgiList", aPgiList);
                oDashboardModel.setProperty("/modalConfig/PGI/totalCount", aPgiList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aPgiList.length);
              }

              Log.info("SD PGI 목록: " + JSON.stringify(aPgiList));
              resolve(aPgiList);
            },
            error: (oError) => {
              Log.error("PGI 조회 실패:", oError);
              MessageBox.error("PGI 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 4. 납품 완료 / 대금청구 목록 조회
       * ======================================================================= */
      loadDeliveryCompleteList(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          if (!oScmModel) {
            resolve(oDashboardModel ? oDashboardModel.getProperty("/deliveryCompleteList") || [] : []);
            return;
          }

          oScmModel.read("/SdDeliveryCompleteSet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aBillingList = aResults.map((oItem) => ({
                billNo: oItem.BillingNo || "",
                itemNo: oItem.Posnr || "",
                deliveryNo: oItem.DeliveryNo || "",
                soNo: oItem.SoNumber || "",
                customerCode: oItem.SoldTo || "",
                customer: oItem.SoldToName || oItem.SoldTo || "",
                matCode: oItem.Matnr || "",
                matName: oItem.Maktx || "",
                billQty: Math.round(Number(oItem.BillingQty || 0)).toLocaleString(),
                unit: oItem.Meins === "ST" ? "PC" : oItem.Meins || "",
                billDate: oItem.BillingDate || "",
                status: oItem.Status || "납품 완료",
                statusState: oItem.Status === "납품 완료" ? "Success" : "None"
              }));

              aBillingList.sort((a, b) => (a.billDate !== b.billDate ? b.billDate.localeCompare(a.billDate) : b.billNo.localeCompare(a.billNo)));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/deliveryCompleteList", aBillingList);
                oDashboardModel.setProperty("/modalConfig/DeliveryComplete/totalCount", aBillingList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aBillingList.length);
              }

              Log.info("SD 납품 완료 목록: " + JSON.stringify(aBillingList));
              resolve(aBillingList);
            },
            error: (oError) => {
              Log.error("납품 완료 조회 실패:", oError);
              MessageBox.error("납품 완료 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 5. SD 상단 대시보드 Summary 조회 & KPI 계산
       * ======================================================================= */
      loadSdSummary(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          if (!oScmModel || !oDashboardModel) {
            resolve([]);
            return;
          }

          oScmModel.read("/SdSummarySet", {
            success: (oData) => {
              const aResults = oData.results || [];
              aResults.sort((a, b) => Number(a.SortOrder || 0) - Number(b.SortOrder || 0));

              const aCurrentSteps = oDashboardModel.getProperty("/process/sd/steps") || [];
              const aUpdatedSteps = aCurrentSteps.map((oStep, iIndex) => {
                const oItem = aResults[iIndex];
                if (!oItem) return oStep;

                const iTotal = Number(oItem.TotalCount || 0);
                const iDone = Number(oItem.DoneCount || 0);

                let sStatusText = oItem.Status || "";
                if (!sStatusText) {
                  if (iTotal > 0 && iDone >= iTotal) sStatusText = "완료";
                  else if (iDone > 0) sStatusText = "진행 중";
                  else sStatusText = "대기";
                }

                let sStepStatus = "waiting";
                if (sStatusText === "완료" || sStatusText === "completed") sStepStatus = "completed";
                else if (sStatusText === "진행 중" || sStatusText === "inProgress") sStepStatus = "inProgress";

                return {
                  ...oStep,
                  count: iDone + " / " + iTotal,
                  rate: sStatusText,
                  status: sStepStatus,
                  statusText: sStatusText,
                  stageKey: oItem.StageKey || ""
                };
              });

              oDashboardModel.setProperty("/process/sd/steps", aUpdatedSteps);

              const oComplete = aResults.find((oItem) => oItem.StageKey === "COMPLETE");
              if (oComplete) {
                const iTotal = Number(oComplete.TotalCount || 0);
                const iDone = Number(oComplete.DoneCount || 0);
                const iProgress = Number(oComplete.Progress || 0);

                oDashboardModel.setProperty("/header/sd/rate", Math.round(iProgress));
                oDashboardModel.setProperty("/header/sd/rateText", Math.round(iProgress) + "%");
                oDashboardModel.setProperty("/header/sd/subText", "납품 완료 기준");
                oDashboardModel.setProperty("/header/sd/countText", iDone + " / " + iTotal + " 건");
              }

              Log.info("SD Summary 조회 성공: " + JSON.stringify(aResults));
              resolve(aUpdatedSteps);
            },
            error: (oError) => {
              Log.error("SdSummarySet 조회 실패:", oError);
              reject(oError);
            }
          });
        });
      },

      /* =======================================================================
       * 6. SD 하단 자재별 수량 흐름 집계
       * ======================================================================= */
      loadSdMaterialFlow(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          if (!oScmModel || !oDashboardModel) {
            resolve([]);
            return;
          }

          const readEntitySet = (sPath) => new Promise((res, rej) => oScmModel.read(sPath, { success: (oData) => res(oData.results || []), error: rej }));

          Promise.all([readEntitySet("/SdSalesOrderSet"), readEntitySet("/SdDeliveryCompleteSet")])
            .then(([aSoList, aCompleteList]) => {
              const aMaterials = [
                { code: "AI-F-AIS", name: "AIS" },
                { code: "AI-H-GPU", name: "GPU" },
                { code: "AI-H-HBM3E", name: "HBM3E" },
                { code: "AI-H-DRAM", name: "DRAM" }
              ];

              const aMaterialFlow = aMaterials.map((oMaterial) => {
                const fSoQty = aSoList.filter((oItem) => oItem.Matnr === oMaterial.code).reduce((fSum, oItem) => fSum + Number(oItem.OrderQty || 0), 0);
                const fDeliveryQty = aCompleteList.filter((oItem) => oItem.Matnr === oMaterial.code).reduce((fSum, oItem) => fSum + Number(oItem.BillingQty || 0), 0);
                const iProgress = fSoQty > 0 ? Math.min(100, Math.round((fDeliveryQty / fSoQty) * 100)) : 0;

                let sStatus = "대기";
                let sStatusState = "None";
                if (iProgress >= 100) {
                  sStatus = "완료";
                  sStatusState = "Success";
                } else if (iProgress > 0) {
                  sStatus = "진행 중";
                  sStatusState = "Information";
                }

                const formatSdQty = (fQty) => Number(fQty || 0).toLocaleString("ko-KR", { maximumFractionDigits: 0 }) + " PC";

                return {
                  code: oMaterial.code,
                  name: oMaterial.name,
                  soQty: fSoQty,
                  deliveryQty: fDeliveryQty,
                  soQtyText: formatSdQty(fSoQty),
                  deliveryQtyText: formatSdQty(fDeliveryQty),
                  progress: iProgress,
                  rate: iProgress + "%",
                  status: sStatus,
                  statusState: sStatusState
                };
              });

              oDashboardModel.setProperty("/process/sd/materials", aMaterialFlow);
              Log.info("SD 자재별 납품 현황: " + JSON.stringify(aMaterialFlow));
              resolve(aMaterialFlow);
            })
            .catch((oError) => {
              Log.error("SD 자재별 납품 현황 조회 실패:", oError);
              reject(oError);
            });
        });
      }
    };
  }
);
