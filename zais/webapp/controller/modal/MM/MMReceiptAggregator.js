sap.ui.define(
  [
    "sap/base/Log"
  ],
  (Log) => {
    "use strict";

    const RAW_MATERIALS = [
      { code: "AI-R-DWFR", name: "WFR (DWFR)" },
      { code: "AI-R-HWFR", name: "WFR (GWFR)" },
      { code: "AI-R-GWFR", name: "WFR (GWFR)" },
      { code: "AI-R-POCO", name: "POCO" },
      { code: "AI-R-PCB", name: "PCB" },
      { code: "AI-R-CPU", name: "CPU" },
      { code: "AI-R-RAM", name: "RAM (64GB RDIMM)" },
      { code: "AI-R-NIC", name: "NIC (InfiniBand)" },
      { code: "AI-R-SSD", name: "SSD" },
      { code: "AI-R-GPUB", name: "GPU Baseboard Substrate" },
      { code: "AI-R-GPUC", name: "NVSwitch Interconnect Chip" }
    ];

    return {
      /**
       * MM 4단계 프로세스 상태 및 상단 KPI 요약 계산
       */
      calculateProcessSummary(aPrList = [], aPoList = [], aGrList = []) {
        // 1. PR 계산 (삭제 제외)
        const aActivePrList = aPrList.filter((oItem) => oItem.Status !== "삭제");
        const oPrMap = new Map();
        aActivePrList.forEach((oItem) => {
          if (!oPrMap.has(oItem.ReqNumber)) {
            oPrMap.set(oItem.ReqNumber, []);
          }
          oPrMap.get(oItem.ReqNumber).push(oItem);
        });

        const iPrTotal = oPrMap.size;
        let iPoCreated = 0;
        oPrMap.forEach((aItems) => {
          const bAllPoCreated = aItems.every((oItem) => oItem.PoNumber && oItem.PoNumber.trim() !== "");
          if (bAllPoCreated) iPoCreated++;
        });

        // 2. PO 계산 (삭제 제외)
        const aActivePoList = aPoList.filter((oItem) => oItem.Status !== "삭제");
        const oPoMap = new Map();
        aActivePoList.forEach((oItem) => {
          if (!oPoMap.has(oItem.PoNumber)) {
            oPoMap.set(oItem.PoNumber, []);
          }
          oPoMap.get(oItem.PoNumber).push(oItem);
        });

        const iPoTotal = oPoMap.size;
        let iGrStarted = 0;
        let iGrCompleted = 0;

        oPoMap.forEach((aPoItems, sPoNumber) => {
          let bStarted = false;
          let bCompleted = true;

          aPoItems.forEach((oPoItem) => {
            const fPoQty = Number(oPoItem.Quantity || 0);
            const fGrQty = aGrList
              .filter((oGrItem) => oGrItem.PoNumber === sPoNumber && oGrItem.PoItem === oPoItem.PoItem)
              .reduce((fSum, oGrItem) => {
                const fQty = Number(oGrItem.Quantity || 0);
                if (oGrItem.MovementType === "101") return fSum + fQty;
                if (oGrItem.MovementType === "102") return fSum - fQty;
                return fSum;
              }, 0);

            if (fGrQty > 0) bStarted = true;
            if (fGrQty < fPoQty) bCompleted = false;
          });

          if (bStarted) iGrStarted++;
          if (aPoItems.length > 0 && bStarted && bCompleted) iGrCompleted++;
        });

        // 3. 단계별 상태 판정
        const sPrStatus = iPrTotal > 0 ? "completed" : "planned";
        const sPrStatusText = iPrTotal > 0 ? "진행 완료" : "진행 예정";

        let sPoStatus = "planned";
        let sPoStatusText = "진행 예정";
        if (iPrTotal > 0 && iPoCreated > 0) {
          sPoStatus = iPoCreated >= iPrTotal ? "completed" : "inProgress";
          sPoStatusText = iPoCreated >= iPrTotal ? "진행 완료" : "진행 중";
        }

        let sGrStatus = "planned";
        let sGrStatusText = "진행 예정";
        if (iPoTotal > 0 && iGrStarted > 0) {
          sGrStatus = iGrStarted >= iPoTotal ? "completed" : "inProgress";
          sGrStatusText = iGrStarted >= iPoTotal ? "진행 완료" : "진행 중";
        }

        let sGrCompleteStatus = "planned";
        let sGrCompleteStatusText = "진행 예정";
        if (iPoTotal > 0 && iGrCompleted > 0) {
          sGrCompleteStatus = iGrCompleted >= iPoTotal ? "completed" : "inProgress";
          sGrCompleteStatusText = iGrCompleted >= iPoTotal ? "진행 완료" : "진행 중";
        }

        const iMmRate = iPoTotal > 0 ? Math.min(100, Math.round((iGrCompleted / iPoTotal) * 100)) : 0;

        return {
          processSummary: {
            prCountText: `${iPrTotal} / ${iPrTotal}`,
            poCountText: `${iPoCreated} / ${iPrTotal}`,
            grCountText: `${iGrStarted} / ${iPoTotal}`,
            grCompleteCountText: `${iGrCompleted} / ${iPoTotal}`,
            prStatus: sPrStatus,
            prStatusText: sPrStatusText,
            poStatus: sPoStatus,
            poStatusText: sPoStatusText,
            grStatus: sGrStatus,
            grStatusText: sGrStatusText,
            grCompleteStatus: sGrCompleteStatus,
            grCompleteStatusText: sGrCompleteStatusText
          },
          header: {
            rate: iMmRate,
            rateText: `${iMmRate}%`,
            subText: "입고 완료 기준",
            countText: `${iGrCompleted} / ${iPoTotal} 건`
          }
        };
      },

      /**
       * 11대 원자재별 PO/입고 진척률 계산
       */
      calculateMaterialProgress(aPoList = [], aGrList = []) {
        return RAW_MATERIALS.map((oMaterial) => {
          const aMaterialPoList = aPoList.filter(
            (oItem) => oItem.Material === oMaterial.code && oItem.Status !== "삭제"
          );

          const fPoQty = aMaterialPoList.reduce((fSum, oItem) => fSum + Number(oItem.Quantity || 0), 0);
          const oPoKeys = new Set(aMaterialPoList.map((oItem) => `${oItem.PoNumber}-${oItem.PoItem}`));

          const fGrQty = aGrList
            .filter((oItem) => oItem.Material === oMaterial.code && oPoKeys.has(`${oItem.PoNumber}-${oItem.PoItem}`))
            .reduce((fSum, oItem) => {
              const fQty = Number(oItem.Quantity || 0);
              if (oItem.MovementType === "101") return fSum + fQty;
              if (oItem.MovementType === "102") return fSum - fQty;
              return fSum;
            }, 0);

          const iProgress = fPoQty > 0 ? Math.min(100, Math.round((fGrQty / fPoQty) * 100)) : 0;
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
            materialName: oMaterial.name,
            poQty: Math.round(fPoQty).toLocaleString(),
            grQty: Math.round(fGrQty).toLocaleString(),
            unit: "PC",
            progress: iProgress,
            progressText: `${iProgress}%`,
            status: sStatus,
            statusState: sState
          };
        });
      },

      /**
       * 대시보드 모델에 계산 결과 반영
       */
      applyToDashboard(oDashboardModel, aPrList = [], aPoList = [], aGrList = []) {
        if (!oDashboardModel) return;

        const { processSummary, header } = this.calculateProcessSummary(aPrList, aPoList, aGrList);
        const aProgressList = this.calculateMaterialProgress(aPoList, aGrList);

        oDashboardModel.setProperty("/mmProcessSummary", processSummary);
        oDashboardModel.setProperty("/header/mm/rate", header.rate);
        oDashboardModel.setProperty("/header/mm/rateText", header.rateText);
        oDashboardModel.setProperty("/header/mm/subText", header.subText);
        oDashboardModel.setProperty("/header/mm/countText", header.countText);
        oDashboardModel.setProperty("/materialReceiptProgress", aProgressList);

        Log.info("MM 대시보드 집계 갱신 완료: " + JSON.stringify(processSummary));
      }
    };
  }
);
