sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/base/Log"
  ],
  (MessageBox, Log) => {
    "use strict";

    return {

      /*구매요청 목록 조회*/
      loadPurchaseRequests(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aCached = oDashboardModel ? oDashboardModel.getProperty("/prList") || [] : [];
            resolve(aCached);
            return;
          }

          oScmModel.read("/PurchaseReqSet", {
            success: function (oData) {
              const aPrList = (oData.results || []).map((oItem) => ({
                prNo: oItem.ReqNumber,
                itemNo: oItem.ReqItem,
                matCode: oItem.Material,
                matName: oItem.MaterialName,
                reqQty: Math.round(Number(oItem.Quantity || 0)).toLocaleString(),
                unit:
                  !oItem.Unit || oItem.Unit === "ST" || oItem.Unit === "EA"
                    ? "PC"
                    : oItem.Unit,
                plant: oItem.Plant,
                reqDate: oItem.RequestDate,
                poNo: oItem.PoNumber || "-",
                status: oItem.Status,
                statusState:
                  oItem.Status === "PO 생성"
                    ? "Success"
                    : oItem.Status === "구매요청"
                      ? "Information"
                      : oItem.Status === "삭제"
                        ? "Error"
                        : "None"
              }));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/prList", aPrList);

                const iPrCount = new Set(
                  aPrList.map((oItem) => oItem.prNo)
                ).size;

                oDashboardModel.setProperty(
                  "/modalConfig/PR/totalCount",
                  iPrCount
                );

                oDashboardModel.setProperty(
                  "/currentModal/totalCount",
                  iPrCount
                );
              }

              Log.info(
                "SAP 구매요청 목록: " + JSON.stringify(aPrList)
              );

              resolve(aPrList);
            },

            error: function (oError) {
              Log.error("구매요청 조회 실패", oError);
              MessageBox.error(
                "SAP 구매요청 목록을 불러오지 못했습니다."
              );
              reject(oError);
            }
          });
        });
      },

      /* 구매오더 목록 조회 */
      loadPurchaseOrders(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aCached = oDashboardModel ? oDashboardModel.getProperty("/poList") || [] : [];
            resolve(aCached);
            return;
          }

          oScmModel.read("/PurchaseOrderSet", {
            success: function (oData) {
              const aPoList = (oData.results || []).map((oItem) => ({
                poNo: oItem.PoNumber,
                itemNo: oItem.PoItem,
                matCode: oItem.Material,
                matName: oItem.MaterialName,
                orderQty: Math.round(Number(oItem.Quantity || 0)).toLocaleString(),
                unit:
                  !oItem.Unit || oItem.Unit === "ST" || oItem.Unit === "EA"
                    ? "PC"
                    : oItem.Unit,
                plant: oItem.Plant,
                vendor: oItem.Vendor,
                orderDate: oItem.OrderDate,
                prNo: oItem.ReqNumber || "-",
                status: oItem.Status,
                statusState:
                  oItem.Status === "입고 완료"
                    ? "Success"
                    : oItem.Status === "구매오더"
                      ? "Information"
                      : oItem.Status === "삭제"
                        ? "Error"
                        : "None"
              }));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/poList", aPoList);

                const iPoCount = new Set(
                  aPoList.map((oItem) => oItem.poNo)
                ).size;

                oDashboardModel.setProperty(
                  "/modalConfig/PO/totalCount",
                  iPoCount
                );

                oDashboardModel.setProperty(
                  "/currentModal/totalCount",
                  iPoCount
                );
              }

              Log.info(
                "SAP 구매오더 목록: " + JSON.stringify(aPoList)
              );

              resolve(aPoList);
            },

            error: function (oError) {
              Log.error("구매오더 조회 실패", oError);
              MessageBox.error(
                "SAP 구매오더 목록을 불러오지 못했습니다."
              );
              reject(oError);
            }
          });
        });
      },

      /* 자재입고 목록 조회 */
      loadGoodsReceipts(oComponent, oDashboardModel) {
        return new Promise((resolve, reject) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aCached = oDashboardModel ? oDashboardModel.getProperty("/grList") || [] : [];
            resolve(aCached);
            return;
          }

          oScmModel.read("/GoodsReceiptSet", {
            success: function (oData) {
              const aGrList = (oData.results || []).map((oItem) => ({
                materialDoc: oItem.MaterialDoc,
                docYear: oItem.DocYear,
                docItem: oItem.DocItem,
                matCode: oItem.Material,
                matName: oItem.MaterialName,
                grQty: Math.round(Number(oItem.Quantity || 0)).toLocaleString(),
                unit:
                  !oItem.Unit || oItem.Unit === "ST" || oItem.Unit === "EA"
                    ? "PC"
                    : oItem.Unit,
                plant: oItem.Plant,
                movementType: oItem.MovementType,
                poNo: oItem.PoNumber || "-",
                poItem: oItem.PoItem || "-",
                postingDate: oItem.PostingDate,
                status: oItem.Status,
                statusState:
                  oItem.Status === "입고 완료"
                    ? "Success"
                    : oItem.Status === "입고 취소"
                      ? "Error"
                      : "None"
              }));

              if (oDashboardModel) {
                oDashboardModel.setProperty("/grList", aGrList);

                const iGrCount = new Set(
                  aGrList.map(
                    (oItem) =>
                      oItem.materialDoc + "-" + oItem.docYear
                  )
                ).size;

                oDashboardModel.setProperty(
                  "/modalConfig/GR/totalCount",
                  iGrCount
                );

                oDashboardModel.setProperty(
                  "/currentModal/totalCount",
                  iGrCount
                );
              }

              Log.info(
                "SAP 자재입고 목록: " + JSON.stringify(aGrList)
              );

              resolve(aGrList);
            },

            error: function (oError) {
              Log.error("자재입고 조회 실패", oError);
              MessageBox.error(
                "SAP 자재입고 목록을 불러오지 못했습니다."
              );
              reject(oError);
            }
          });
        });
      },


      /* 자재별 PO / 입고 진행현황 조회 */
      loadMaterialReceiptProgress(
        oComponent,
        oDashboardModel
      ) {
        const oScmModel =
          oComponent.getModel("scmService");

        if (!oScmModel) {
          return;
        }

        const readOData = (sPath) => {
          return new Promise((resolve, reject) => {
            oScmModel.read(sPath, {
              success: (oData) => {
                resolve(oData.results || []);
              },

              error: reject
            });
          });
        };

       Promise.all([
  readOData("/PurchaseReqSet"),
  readOData("/PurchaseOrderSet"),
  readOData("/GoodsReceiptSet")
])
.then(([aPrList, aPoList, aGrList]) => {

// MM 프로세스 실제 진행 건수 계산
// 삭제된 PR 제외
const aActivePrList = aPrList.filter(
  (oItem) => oItem.Status !== "삭제"
);

// PR 문서번호별 그룹
const oPrMap = new Map();

aActivePrList.forEach((oItem) => {
  if (!oPrMap.has(oItem.ReqNumber)) {
    oPrMap.set(oItem.ReqNumber, []);
  }

  oPrMap.get(oItem.ReqNumber).push(oItem);
});

// 전체 PR 문서 수
const iPrTotal = oPrMap.size;

// PO 생성이 완료된 PR 문서 수
// PR 내 모든 품목에 PO 번호가 존재해야 완료로 판단
let iPoCreated = 0;

oPrMap.forEach((aItems) => {
  const bAllPoCreated = aItems.every(
    (oItem) =>
      oItem.PoNumber &&
      oItem.PoNumber.trim() !== ""
  );

  if (bAllPoCreated) {
    iPoCreated++;
  }
});

// PO 계산
// 삭제 PO 제외
const aActivePoList = aPoList.filter(
  (oItem) => oItem.Status !== "삭제"
);

// PO 문서번호별 그룹
const oPoMap = new Map();

aActivePoList.forEach((oItem) => {
  if (!oPoMap.has(oItem.PoNumber)) {
    oPoMap.set(oItem.PoNumber, []);
  }

  oPoMap.get(oItem.PoNumber).push(oItem);
});

// 전체 PO 문서 수
const iPoTotal = oPoMap.size;

let iGrStarted = 0;
let iGrCompleted = 0;


// PO 하나씩 입고 상태 계산
oPoMap.forEach((aPoItems, sPoNumber) => {

  let bStarted = false;
  let bCompleted = true;

  aPoItems.forEach((oPoItem) => {

    const fPoQty =
      Number(oPoItem.Quantity || 0);

    // 해당 PO + 품목의 순 입고수량
    const fGrQty = aGrList
      .filter(
        (oGrItem) =>
          oGrItem.PoNumber === sPoNumber &&
          oGrItem.PoItem === oPoItem.PoItem
      )
      .reduce((fSum, oGrItem) => {

        const fQty =
          Number(oGrItem.Quantity || 0);

        if (oGrItem.MovementType === "101") {
          return fSum + fQty;
        }

        if (oGrItem.MovementType === "102") {
          return fSum - fQty;
        }

        return fSum;
      }, 0);


    // 하나라도 입고됐으면 입고 시작
    if (fGrQty > 0) {
      bStarted = true;
    }

    // 한 품목이라도 PO 수량보다 덜 들어왔으면
    // 해당 PO는 입고 완료가 아님
    if (fGrQty < fPoQty) {
      bCompleted = false;
    }
  });


  if (bStarted) {
    iGrStarted++;
  }

  if (
  aPoItems.length > 0 &&
  bStarted &&
  bCompleted
) {
  iGrCompleted++;
}
});


// =====================================================
// 단계별 상태 결정
// =====================================================

// 구매요청
let sPrStatus = "planned";
let sPrStatusText = "진행 예정";

if (iPrTotal > 0) {
  sPrStatus = "completed";
  sPrStatusText = "진행 완료";
}


// 구매오더
let sPoStatus = "planned";
let sPoStatusText = "진행 예정";

if (iPrTotal > 0 && iPoCreated > 0) {

  if (iPoCreated >= iPrTotal) {
    sPoStatus = "completed";
    sPoStatusText = "진행 완료";
  } else {
    sPoStatus = "inProgress";
    sPoStatusText = "진행 중";
  }
}


// 자재 입고
let sGrStatus = "planned";
let sGrStatusText = "진행 예정";

if (iPoTotal > 0 && iGrStarted > 0) {

  if (iGrStarted >= iPoTotal) {
    sGrStatus = "completed";
    sGrStatusText = "진행 완료";
  } else {
    sGrStatus = "inProgress";
    sGrStatusText = "진행 중";
  }
}


// 입고 완료
let sGrCompleteStatus = "planned";
let sGrCompleteStatusText = "진행 예정";

if (iPoTotal > 0 && iGrCompleted > 0) {

  if (iGrCompleted >= iPoTotal) {
    sGrCompleteStatus = "completed";
    sGrCompleteStatusText = "진행 완료";
  } else {
    sGrCompleteStatus = "inProgress";
    sGrCompleteStatusText = "진행 중";
  }
}


// 화면 모델에 저장
oDashboardModel.setProperty(
  "/mmProcessSummary",
  {
    prCountText:
      iPrTotal + " / " + iPrTotal,

    poCountText:
      iPoCreated + " / " + iPrTotal,

    grCountText:
      iGrStarted + " / " + iPoTotal,

    grCompleteCountText:
      iGrCompleted + " / " + iPoTotal,


    prStatus: sPrStatus,
    prStatusText: sPrStatusText,

    poStatus: sPoStatus,
    poStatusText: sPoStatusText,

    grStatus: sGrStatus,
    grStatusText: sGrStatusText,

    grCompleteStatus:
      sGrCompleteStatus,

    grCompleteStatusText:
      sGrCompleteStatusText
  }
);

// MM 전체 진행률 계산 (입고 완료 기준)
const iMmRate =
  iPoTotal > 0
    ? Math.min(
        100,
        Math.round(
          (iGrCompleted / iPoTotal) * 100
        )
      )
    : 0;

oDashboardModel.setProperty(
  "/header/mm/rate",
  iMmRate
);
oDashboardModel.setProperty(
  "/header/mm/rateText",
  iMmRate + "%"
);
oDashboardModel.setProperty(
  "/header/mm/subText",
  "입고 완료 기준"
);
oDashboardModel.setProperty(
  "/header/mm/countText",
  iGrCompleted +
    " / " +
    iPoTotal +
    " 건"
);

Log.info(
  "MM 프로세스 진행현황: " +
  JSON.stringify(oDashboardModel.getProperty("/mmProcessSummary"))
);

            const aMaterials = [
  {
    code: "AI-R-DWFR",
    name: "WFR (DWFR)"
  },
  {
    code: "AI-R-HWFR",
    name: "WFR (GWFR)"
  },
  {
    code: "AI-R-GWFR",
    name: "WFR (GWFR)"
  },
  {
    code: "AI-R-POCO",
    name: "POCO"
  },
  {
    code: "AI-R-PCB",
    name: "PCB"
  },
  {
    code: "AI-R-CPU",
    name: "CPU"
  },
  {
    code: "AI-R-RAM",
    name: "RAM (64GB RDIMM)"
  },
  {
    code: "AI-R-NIC",
    name: "NIC (InfiniBand)"
  },
  {
    code: "AI-R-SSD",
    name: "SSD"
  },
  {
    code: "AI-R-GPUB",
    name: "GPU Baseboard Substrate"
  },
  {
    code: "AI-R-GPUC",
    name: "NVSwitch Interconnect Chip"
  }
];

            const aProgressList =
              aMaterials.map((oMaterial) => {

                // 1. 현재 자재의 유효한 PO만 추출
const aMaterialPoList = aPoList.filter(
  (oItem) =>
    oItem.Material === oMaterial.code &&
    oItem.Status !== "삭제"
);

// 2. 해당 자재의 PO 수량 합계
const fPoQty = aMaterialPoList.reduce(
  (fSum, oItem) =>
    fSum + Number(oItem.Quantity || 0),
  0
);

// 3. 현재 PO번호 + PO품목 조합 저장
const oPoKeys = new Set(
  aMaterialPoList.map(
    (oItem) =>
      oItem.PoNumber + "-" + oItem.PoItem
  )
);

// 4. 현재 PO에 실제 연결된 입고만 계산
const fGrQty = aGrList
  .filter((oItem) => {
    const sPoKey =
      oItem.PoNumber + "-" + oItem.PoItem;

    return (
      oItem.Material === oMaterial.code &&
      oPoKeys.has(sPoKey)
    );
  })
  .reduce((fSum, oItem) => {
    const fQty =
      Number(oItem.Quantity || 0);

    // 101 = 입고
    if (oItem.MovementType === "101") {
      return fSum + fQty;
    }

    // 102 = 입고 취소
    if (oItem.MovementType === "102") {
      return fSum - fQty;
    }

    return fSum;
  }, 0);
                const iProgress =
                  fPoQty > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (fGrQty / fPoQty) *
                            100
                        )
                      )
                    : 0;

                let sStatus = "대기";
                let sState = "None";

                if (iProgress >= 100) {
                  sStatus = "완료";
                  sState = "Success";
                } else if (iProgress > 0) {
                  sStatus = "진행 중";
                  sState = "Information";
                }

                return {
                  material: oMaterial.code,
                  materialName:
                    oMaterial.name,

                  poQty: Math.round(fPoQty).toLocaleString(),
                  grQty: Math.round(fGrQty).toLocaleString(),

                  unit: "PC",

                  progress: iProgress,
                  progressText:
                    iProgress + "%",

                  status: sStatus,
                  statusState: sState
                };
              });

            oDashboardModel.setProperty(
              "/materialReceiptProgress",
              aProgressList
            );

            Log.info(
              "자재 입고 진행현황: " + JSON.stringify(aProgressList)
            );
          })
          .catch((oError) => {
            Log.error(
              "자재 입고 진행현황 조회 실패",
              oError
            );
          });
      }

    };
  }
);