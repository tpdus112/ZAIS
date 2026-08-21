sap.ui.define(
  [
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/base/Log"
  ],
  (Filter, FilterOperator, MessageBox, Log) => {
    "use strict";

    const MATNR_MAP = {
      HBMProd: "AI-H-HBM3E",
      BGPProd: "AI-H-BGP",
      GPUProd: "AI-H-GPU",
      AISAssembly: "AI-F-AIS"
    };

    return {
      /**
       * DRAM 반복생산 (REM) 현황 데이터 조회
       */
      loadDramProdData(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aCached = oDashboardModel ? oDashboardModel.getProperty("/dramProdList") || [] : [];
            resolve(aCached);
            return;
          }

          oScmModel.read("/PpDramSet", {
            success: (oData) => {
              const aResults = oData.results || [];
              const aDramList = aResults.map((oItem) => {
                const nProgress = Number(oItem.Progress || 0);
                const nPlan = Number(oItem.PlanQty || 0);
                const nAct = Number(oItem.ActualQty || 0);

                return {
                  periodKey: oItem.PeriodKey || "",
                  weekPeriod: oItem.WeekPeriod || "",
                  prodLine: oItem.ProdLine || "",
                  plant: oItem.Plant || "",
                  matCode: oItem.Matnr || "",
                  matName: oItem.Maktx || "",
                  planQty: Math.round(nPlan).toLocaleString(),
                  actQty: Math.round(nAct).toLocaleString(),
                  unit:
                    !oItem.Meins ||
                    oItem.Meins.trim().toUpperCase() === "ST" ||
                    oItem.Meins.trim().toUpperCase() === "EA"
                      ? "PC"
                      : oItem.Meins,
                  rate: nProgress.toFixed(0) + "%",
                  status: oItem.Status || "",
                  statusState: oItem.Status === "완료" ? "Success" : (oItem.Status === "진행 중" ? "Information" : "None")
                };
              });

              aDramList.sort((a, b) => b.periodKey.localeCompare(a.periodKey));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/dramProdList", aDramList);
                oDashboardModel.setProperty("/modalConfig/DramProd/totalCount", aDramList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aDramList.length);
              }

              Log.info("PP DRAM 반복생산 현황 목록: " + JSON.stringify(aDramList));
              resolve(aDramList);
            },
            error: (oError) => {
              Log.error("DRAM REM 조회 실패:", oError);
              MessageBox.error("DRAM 반복생산 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /**
       * 공통 생산오더 현황 데이터 조회 (HBM3E / BGP / GPU / AIS)
       */
      loadProdOrderData(oComponent, oDashboardModel, sProcessKey, sMatnr) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          const sTargetMatnr = sMatnr || MATNR_MAP[sProcessKey] || "";

          if (!oScmModel || !sTargetMatnr) {
            const aCached = oDashboardModel ? oDashboardModel.getProperty("/prodOrderList") || [] : [];
            resolve(aCached);
            return;
          }

          const aFilters = [new Filter("Matnr", FilterOperator.EQ, sTargetMatnr)];

          oScmModel.read("/PpOrderSet", {
            filters: aFilters,
            success: (oData) => {
              const aResults = oData.results || [];
              const aOrderList = aResults.map((oItem) => {
                const iProgress = Number(oItem.Progress || 0);
                const nPlan = Number(oItem.PlanQty || 0);
                const nAct = Number(oItem.ActualQty || 0);

                return {
                  orderNo: oItem.Aufnr || "",
                  matCode: oItem.Matnr || "",
                  matName: oItem.Maktx || "",
                  planQty: Math.round(nPlan).toLocaleString(),
                  actQty: Math.round(nAct).toLocaleString(),
                  unit:
                    !oItem.Meins ||
                    oItem.Meins.trim().toUpperCase() === "ST" ||
                    oItem.Meins.trim().toUpperCase() === "EA"
                      ? "PC"
                      : oItem.Meins,
                  rate: iProgress + "%",
                  status: oItem.Status || "",
                  statusState: oItem.Status === "완료" ? "Success" : (oItem.Status === "진행 중" ? "Information" : "None")
                };
              });

              aOrderList.sort((a, b) => b.orderNo.localeCompare(a.orderNo));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/prodOrderList", aOrderList);
                if (sProcessKey) {
                  oDashboardModel.setProperty("/modalConfig/" + sProcessKey + "/totalCount", aOrderList.length);
                }
                oDashboardModel.setProperty("/currentModal/totalCount", aOrderList.length);
              }

              Log.info(
                "PP 공통 생산오더 현황 목록 (" +
                  sProcessKey +
                  " / " +
                  sTargetMatnr +
                  "): " +
                  JSON.stringify(aOrderList)
              );
              resolve(aOrderList);
            },
            error: (oError) => {
              Log.error("PP 생산오더 조회 실패:", oError);
              MessageBox.error("생산오더 목록을 불러오지 못했습니다.");
              reject(oError);
            }
          });
        });
      },

      /**
       * 대시보드 PP 요약 및 5대 공정 단계 데이터 조회/집계
       */
      loadPpDashboardSummary(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;
          if (!oScmModel || !oDashboardModel) {
            resolve({});
            return;
          }

          const readOData = (sPath, mParameters) => {
            return new Promise((res) => {
              oScmModel.read(sPath, {
                ...mParameters,
                success: (oData) => res(oData.results || []),
                error: (err) => {
                  console.warn(sPath + " 조회 실패 (fallback 적용):", err);
                  res([]);
                }
              });
            });
          };

          Promise.all([
            readOData("/PpSummarySet"),
            readOData("/PpDramSet"),
            readOData("/PpOrderSet", { filters: [new Filter("Matnr", FilterOperator.EQ, "AI-H-HBM3E")] }),
            readOData("/PpOrderSet", { filters: [new Filter("Matnr", FilterOperator.EQ, "AI-H-BGP")] }),
            readOData("/PpOrderSet", { filters: [new Filter("Matnr", FilterOperator.EQ, "AI-H-GPU")] }),
            readOData("/PpOrderSet", { filters: [new Filter("Matnr", FilterOperator.EQ, "AI-F-AIS")] })
          ])
            .then(([aSummaryResults, aDramResults, aHbmResults, aBgpResults, aGpuResults, aAisResults]) => {
              const aResults = aSummaryResults || [];
              aResults.sort((a, b) => Number(a.SortOrder || 0) - Number(b.SortOrder || 0));

              const aMaterials = aResults.map((oItem) => {
                const nPlanQty = Math.round(Number(oItem.PlanQty || 0));
                const nActualQty = Math.round(Number(oItem.ActualQty || 0));
                const nProgress = Number(oItem.Progress || 0);
                const sUnit = !oItem.Meins || oItem.Meins.trim().toUpperCase() === "ST" || oItem.Meins.trim().toUpperCase() === "EA" ? "PC" : oItem.Meins;

                const getStatusState = (s) => (s === "완료" ? "Success" : s === "진행 중" ? "Information" : "None");

                return {
                  name: oItem.Name || "",
                  planQty: nPlanQty.toLocaleString() + " " + sUnit,
                  actQty: nActualQty.toLocaleString() + " " + sUnit,
                  unit: sUnit,
                  rate: Math.round(nProgress) + "%",
                  status: oItem.Status || "",
                  statusState: getStatusState(oItem.Status),
                  matnr: oItem.Matnr || "",
                  sortOrder: Number(oItem.SortOrder || 0)
                };
              });

              oDashboardModel.setProperty("/process/pp/materials", aMaterials);

              const aAllPpOrders = [
                ...(aDramResults || []),
                ...(aHbmResults || []),
                ...(aBgpResults || []),
                ...(aGpuResults || []),
                ...(aAisResults || [])
              ];

              const iTotalPpOrders = aAllPpOrders.length;
              const iCompletedPpOrders = aAllPpOrders.filter((ord) => ord.Status === "완료").length;
              const iPpRate =
                iTotalPpOrders > 0
                  ? Math.min(100, Math.round((iCompletedPpOrders / iTotalPpOrders) * 100))
                  : aResults.length > 0
                    ? Math.min(100, Math.round(aResults.reduce((sum, item) => sum + Number(item.Progress || 0), 0) / aResults.length))
                    : 0;

              oDashboardModel.setProperty("/header/pp/rate", iPpRate);
              oDashboardModel.setProperty("/header/pp/rateText", iPpRate + "%");
              oDashboardModel.setProperty("/header/pp/subText", "생산 완료 기준");
              oDashboardModel.setProperty("/header/pp/countText", iCompletedPpOrders + " / " + iTotalPpOrders + " 건");

              const aSteps = oDashboardModel.getProperty("/process/pp/steps") || [];
              const aStepOrderMap = [aDramResults || [], aHbmResults || [], aBgpResults || [], aGpuResults || [], aAisResults || []];

              const aUpdatedSteps = aSteps.map((oStep, iIndex) => {
                const oItem = aResults[iIndex];
                const aStepOrders = aStepOrderMap[iIndex] || [];
                const iOrderTotal = aStepOrders.length;
                const iOrderCompleted = aStepOrders.filter((ord) => ord.Status === "완료").length;

                let sCountText = "";
                let sStatus = "completed";
                let sStatusText = "완료";

                if (iOrderTotal > 0) {
                  sCountText = iOrderCompleted + " / " + iOrderTotal;
                  if (iOrderCompleted >= iOrderTotal) {
                    sStatus = "completed";
                    sStatusText = "완료";
                  } else {
                    sStatus = "inProgress";
                    sStatusText = "진행 중";
                  }
                } else {
                  const sItemStatus = oItem ? oItem.Status || "완료" : "완료";
                  sStatus = sItemStatus === "완료" ? "completed" : sItemStatus === "대기" ? "waiting" : "inProgress";
                  sStatusText = sItemStatus;
                  sCountText = sStatus === "completed" ? "1 / 1" : "0 / 1";
                }

                return {
                  ...oStep,
                  matnr: oItem ? oItem.Matnr || "" : oStep.matnr || "",
                  count: sCountText,
                  countText: sCountText,
                  rate: sStatusText,
                  status: sStatus,
                  statusText: sStatusText
                };
              });

              oDashboardModel.setProperty("/process/pp/steps", aUpdatedSteps);
              Log.info("PP Dashboard Summary 갱신 완료");
              resolve({ summary: aResults, steps: aUpdatedSteps, materials: aMaterials });
            })
            .catch((oError) => {
              Log.error("PP Summary 조회 실패:", oError);
              reject(oError);
            });
        });
      }
    };
  }
);
