sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/base/Log"
  ],
  (MessageBox, Log) => {
    "use strict";

    /* =========================================================================
     * SD 기본 / 모의 데이터 정의 (SAP OData 연결 시 실제 데이터로 대체됨)
     * ========================================================================= */
    const DEFAULT_SO_LIST = [
      {
        soNo: "SO-2024-001",
        itemNo: "00010",
        customer: "테슬라 (Tesla)",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        orderQty: "10",
        unit: "EA",
        netAmount: "2,500,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-02",
        reqDelivDate: "2024-05-25",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-002",
        itemNo: "00010",
        customer: "오픈AI (OpenAI)",
        matCode: "AI-H-GPU",
        matName: "GPU (High Perf Module)",
        orderQty: "20",
        unit: "EA",
        netAmount: "1,800,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-03",
        reqDelivDate: "2024-05-26",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-003",
        itemNo: "00010",
        customer: "엔비디아 (NVIDIA)",
        matCode: "AI-H-HBM3E",
        matName: "HBM3E (Stack Memory)",
        orderQty: "120",
        unit: "EA",
        netAmount: "1,200,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-04",
        reqDelivDate: "2024-05-28",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-004",
        itemNo: "00010",
        customer: "마이크로소프트 (Microsoft)",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        orderQty: "5",
        unit: "EA",
        netAmount: "1,250,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-05",
        reqDelivDate: "2024-05-30",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-005",
        itemNo: "00010",
        customer: "구글 (Google)",
        matCode: "AI-H-BGP",
        matName: "BGP (Baseboard Grid)",
        orderQty: "40",
        unit: "EA",
        netAmount: "800,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-06",
        reqDelivDate: "2024-05-31",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-006",
        itemNo: "00010",
        customer: "메타 (Meta)",
        matCode: "AI-H-GPU",
        matName: "GPU (High Perf Module)",
        orderQty: "15",
        unit: "EA",
        netAmount: "1,350,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-07",
        reqDelivDate: "2024-06-02",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-007",
        itemNo: "00010",
        customer: "아마존 (Amazon AWS)",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        orderQty: "8",
        unit: "EA",
        netAmount: "2,000,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-08",
        reqDelivDate: "2024-06-05",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-008",
        itemNo: "00010",
        customer: "애플 (Apple)",
        matCode: "AI-H-DRAM",
        matName: "DRAM (64GB RDIMM)",
        orderQty: "500",
        unit: "EA",
        netAmount: "750,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-09",
        reqDelivDate: "2024-06-08",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-009",
        itemNo: "00010",
        customer: "오라클 (Oracle)",
        matCode: "AI-H-GPU",
        matName: "GPU (High Perf Module)",
        orderQty: "10",
        unit: "EA",
        netAmount: "900,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-10",
        reqDelivDate: "2024-06-10",
        status: "수주 완료",
        statusState: "Information"
      },
      {
        soNo: "SO-2024-010",
        itemNo: "00010",
        customer: "삼성전자 (Samsung)",
        matCode: "AI-H-BGP",
        matName: "BGP (Baseboard Grid)",
        orderQty: "25",
        unit: "EA",
        netAmount: "500,000,000",
        currency: "KRW",
        plant: "1000",
        orderDate: "2024-05-11",
        reqDelivDate: "2024-06-12",
        status: "수주 완료",
        statusState: "Information"
      }
    ];

    const DEFAULT_DELIVERY_LIST = [
      {
        deliveryNo: "8000000101",
        itemNo: "00010",
        customer: "테슬라 (Tesla)",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        deliveryQty: "5",
        unit: "EA",
        plant: "1000",
        deliveryDate: "2024-05-18",
        soNo: "SO-2024-001",
        status: "출하 지시",
        statusState: "Information"
      },
      {
        deliveryNo: "8000000102",
        itemNo: "00010",
        customer: "오픈AI (OpenAI)",
        matCode: "AI-H-GPU",
        matName: "GPU (High Perf Module)",
        deliveryQty: "10",
        unit: "EA",
        plant: "1000",
        deliveryDate: "2024-05-19",
        soNo: "SO-2024-002",
        status: "피킹 완료",
        statusState: "Information"
      },
      {
        deliveryNo: "8000000103",
        itemNo: "00010",
        customer: "엔비디아 (NVIDIA)",
        matCode: "AI-H-HBM3E",
        matName: "HBM3E (Stack Memory)",
        deliveryQty: "60",
        unit: "EA",
        plant: "1000",
        deliveryDate: "2024-05-20",
        soNo: "SO-2024-003",
        status: "출하 지시",
        statusState: "Information"
      },
      {
        deliveryNo: "8000000104",
        itemNo: "00010",
        customer: "마이크로소프트 (Microsoft)",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        deliveryQty: "3",
        unit: "EA",
        plant: "1000",
        deliveryDate: "2024-05-21",
        soNo: "SO-2024-004",
        status: "피킹 완료",
        statusState: "Information"
      },
      {
        deliveryNo: "8000000105",
        itemNo: "00010",
        customer: "구글 (Google)",
        matCode: "AI-H-BGP",
        matName: "BGP (Baseboard Grid)",
        deliveryQty: "20",
        unit: "EA",
        plant: "1000",
        deliveryDate: "2024-05-22",
        soNo: "SO-2024-005",
        status: "출하 대기",
        statusState: "Warning"
      }
    ];

    const DEFAULT_PGI_LIST = [
      {
        materialDoc: "4900002001",
        docItem: "0001",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        pgiQty: "5",
        unit: "EA",
        movementType: "601",
        plant: "1000",
        deliveryNo: "8000000101",
        postingDate: "2024-05-19",
        status: "출고 완료",
        statusState: "Success"
      },
      {
        materialDoc: "4900002002",
        docItem: "0001",
        matCode: "AI-H-GPU",
        matName: "GPU (High Perf Module)",
        pgiQty: "10",
        unit: "EA",
        movementType: "601",
        plant: "1000",
        deliveryNo: "8000000102",
        postingDate: "2024-05-20",
        status: "출고 완료",
        statusState: "Success"
      },
      {
        materialDoc: "4900002003",
        docItem: "0001",
        matCode: "AI-H-HBM3E",
        matName: "HBM3E (Stack Memory)",
        pgiQty: "60",
        unit: "EA",
        movementType: "601",
        plant: "1000",
        deliveryNo: "8000000103",
        postingDate: "2024-05-21",
        status: "출고 완료",
        statusState: "Success"
      },
      {
        materialDoc: "4900002004",
        docItem: "0001",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        pgiQty: "3",
        unit: "EA",
        movementType: "601",
        plant: "1000",
        deliveryNo: "8000000104",
        postingDate: "2024-05-22",
        status: "출고 완료",
        statusState: "Success"
      }
    ];

    const DEFAULT_DELIVERY_COMPLETE_LIST = [
      {
        billNo: "9000003001",
        itemNo: "00010",
        customer: "테슬라 (Tesla)",
        matCode: "AI-F-AIS",
        matName: "AIS (AI Server Rack)",
        billQty: "5",
        unit: "EA",
        billAmount: "1,250,000,000",
        currency: "KRW",
        billDate: "2024-05-22",
        deliveryNo: "8000000101",
        soNo: "SO-2024-001",
        status: "납품 완료",
        statusState: "Success"
      },
      {
        billNo: "9000003002",
        itemNo: "00010",
        customer: "오픈AI (OpenAI)",
        matCode: "AI-H-GPU",
        matName: "GPU (High Perf Module)",
        billQty: "10",
        unit: "EA",
        billAmount: "900,000,000",
        currency: "KRW",
        billDate: "2024-05-23",
        deliveryNo: "8000000102",
        soNo: "SO-2024-002",
        status: "납품 완료",
        statusState: "Success"
      }
    ];

    return {
      /* =======================================================================
       * 1. Sales Order (수주) 목록 조회
       * ======================================================================= */
      loadSalesOrders(oComponent, oDashboardModel) {
        return new Promise((resolve) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aList = (oDashboardModel && oDashboardModel.getProperty("/soList")?.length > 0)
              ? oDashboardModel.getProperty("/soList")
              : DEFAULT_SO_LIST;

            if (oDashboardModel) {
              oDashboardModel.setProperty("/soList", aList);
              oDashboardModel.setProperty("/modalConfig/SO/totalCount", aList.length);
              oDashboardModel.setProperty("/currentModal/totalCount", aList.length);
            }
            resolve(aList);
            return;
          }

          // SAP OData SalesOrder 조회 시도 (미구현 시 fallback)
          oScmModel.read("/SalesOrderSet", {
            success: (oData) => {
              const aSoList = (oData.results || []).map((oItem) => ({
                soNo: oItem.Vbeln || oItem.SoNumber,
                itemNo: oItem.Posnr || oItem.ItemNumber || "00010",
                customer: oItem.Kunnr || oItem.CustomerName || "-",
                matCode: oItem.Matnr || oItem.Material,
                matName: oItem.Maktx || oItem.MaterialName,
                orderQty: Math.round(Number(oItem.Kwmeng || oItem.Quantity || 0)).toLocaleString(),
                unit: oItem.Vrkme || oItem.Unit || "EA",
                netAmount: Number(oItem.Netwr || 0).toLocaleString(),
                currency: oItem.Waerk || "KRW",
                plant: oItem.Werks || oItem.Plant || "1000",
                orderDate: oItem.Audat || oItem.OrderDate,
                reqDelivDate: oItem.Vdatu || oItem.ReqDelivDate,
                status: oItem.Status || "수주 완료",
                statusState: oItem.Status === "납품 완료" ? "Success" : "Information"
              }));

              const aFinalList = aSoList.length > 0 ? aSoList : DEFAULT_SO_LIST;
              if (oDashboardModel) {
                oDashboardModel.setProperty("/soList", aFinalList);
                oDashboardModel.setProperty("/modalConfig/SO/totalCount", aFinalList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aFinalList.length);
              }
              resolve(aFinalList);
            },
            error: () => {
              Log.info("SalesOrder OData 미배포 - Fallback 데이터 적용");
              if (oDashboardModel) {
                oDashboardModel.setProperty("/soList", DEFAULT_SO_LIST);
                oDashboardModel.setProperty("/modalConfig/SO/totalCount", DEFAULT_SO_LIST.length);
                oDashboardModel.setProperty("/currentModal/totalCount", DEFAULT_SO_LIST.length);
              }
              resolve(DEFAULT_SO_LIST);
            }
          });
        });
      },

      /* =======================================================================
       * 2. Delivery (납품/출하) 목록 조회
       * ======================================================================= */
      loadDeliveryList(oComponent, oDashboardModel) {
        return new Promise((resolve) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aList = (oDashboardModel && oDashboardModel.getProperty("/deliveryList")?.length > 0)
              ? oDashboardModel.getProperty("/deliveryList")
              : DEFAULT_DELIVERY_LIST;

            if (oDashboardModel) {
              oDashboardModel.setProperty("/deliveryList", aList);
              oDashboardModel.setProperty("/modalConfig/Delivery/totalCount", aList.length);
              oDashboardModel.setProperty("/currentModal/totalCount", aList.length);
            }
            resolve(aList);
            return;
          }

          oScmModel.read("/DeliverySet", {
            success: (oData) => {
              const aDeliveryList = (oData.results || []).map((oItem) => ({
                deliveryNo: oItem.Vbeln || oItem.DeliveryNumber,
                itemNo: oItem.Posnr || oItem.ItemNumber || "00010",
                customer: oItem.Kunnr || oItem.CustomerName || "-",
                matCode: oItem.Matnr || oItem.Material,
                matName: oItem.Maktx || oItem.MaterialName,
                deliveryQty: Math.round(Number(oItem.Lfimg || oItem.Quantity || 0)).toLocaleString(),
                unit: oItem.Meins || oItem.Unit || "EA",
                plant: oItem.Werks || oItem.Plant || "1000",
                deliveryDate: oItem.Wadat || oItem.DeliveryDate,
                soNo: oItem.Vgbel || oItem.SoNumber || "-",
                status: oItem.Status || "출하 지시",
                statusState: oItem.Status === "출고 완료" ? "Success" : "Information"
              }));

              const aFinalList = aDeliveryList.length > 0 ? aDeliveryList : DEFAULT_DELIVERY_LIST;
              if (oDashboardModel) {
                oDashboardModel.setProperty("/deliveryList", aFinalList);
                oDashboardModel.setProperty("/modalConfig/Delivery/totalCount", aFinalList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aFinalList.length);
              }
              resolve(aFinalList);
            },
            error: () => {
              Log.info("Delivery OData 미배포 - Fallback 데이터 적용");
              if (oDashboardModel) {
                oDashboardModel.setProperty("/deliveryList", DEFAULT_DELIVERY_LIST);
                oDashboardModel.setProperty("/modalConfig/Delivery/totalCount", DEFAULT_DELIVERY_LIST.length);
                oDashboardModel.setProperty("/currentModal/totalCount", DEFAULT_DELIVERY_LIST.length);
              }
              resolve(DEFAULT_DELIVERY_LIST);
            }
          });
        });
      },

      /* =======================================================================
       * 3. PGI (출고전기) 목록 조회
       * ======================================================================= */
      loadPgiList(oComponent, oDashboardModel) {
        return new Promise((resolve) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aList = (oDashboardModel && oDashboardModel.getProperty("/pgiList")?.length > 0)
              ? oDashboardModel.getProperty("/pgiList")
              : DEFAULT_PGI_LIST;

            if (oDashboardModel) {
              oDashboardModel.setProperty("/pgiList", aList);
              oDashboardModel.setProperty("/modalConfig/PGI/totalCount", aList.length);
              oDashboardModel.setProperty("/currentModal/totalCount", aList.length);
            }
            resolve(aList);
            return;
          }

          oScmModel.read("/GoodsIssueSet", {
            success: (oData) => {
              const aPgiList = (oData.results || []).map((oItem) => ({
                materialDoc: oItem.Mblnr || oItem.MaterialDoc,
                docItem: oItem.Zeile || oItem.DocItem || "0001",
                matCode: oItem.Matnr || oItem.Material,
                matName: oItem.Maktx || oItem.MaterialName,
                pgiQty: Math.round(Number(oItem.Menge || oItem.Quantity || 0)).toLocaleString(),
                unit: oItem.Meins || oItem.Unit || "EA",
                movementType: oItem.Bwart || oItem.MovementType || "601",
                plant: oItem.Werks || oItem.Plant || "1000",
                deliveryNo: oItem.VbelnIm || oItem.DeliveryNumber || "-",
                postingDate: oItem.Budat || oItem.PostingDate,
                status: oItem.Status || "출고 완료",
                statusState: oItem.Status === "출고 취소" ? "Error" : "Success"
              }));

              const aFinalList = aPgiList.length > 0 ? aPgiList : DEFAULT_PGI_LIST;
              if (oDashboardModel) {
                oDashboardModel.setProperty("/pgiList", aFinalList);
                oDashboardModel.setProperty("/modalConfig/PGI/totalCount", aFinalList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aFinalList.length);
              }
              resolve(aFinalList);
            },
            error: () => {
              Log.info("PGI OData 미배포 - Fallback 데이터 적용");
              if (oDashboardModel) {
                oDashboardModel.setProperty("/pgiList", DEFAULT_PGI_LIST);
                oDashboardModel.setProperty("/modalConfig/PGI/totalCount", DEFAULT_PGI_LIST.length);
                oDashboardModel.setProperty("/currentModal/totalCount", DEFAULT_PGI_LIST.length);
              }
              resolve(DEFAULT_PGI_LIST);
            }
          });
        });
      },

      /* =======================================================================
       * 4. 납품 완료 / 대금청구 목록 조회
       * ======================================================================= */
      loadDeliveryCompleteList(oComponent, oDashboardModel) {
        return new Promise((resolve) => {
          const oScmModel = oComponent ? oComponent.getModel("scmService") : null;

          if (!oScmModel) {
            const aList = (oDashboardModel && oDashboardModel.getProperty("/deliveryCompleteList")?.length > 0)
              ? oDashboardModel.getProperty("/deliveryCompleteList")
              : DEFAULT_DELIVERY_COMPLETE_LIST;

            if (oDashboardModel) {
              oDashboardModel.setProperty("/deliveryCompleteList", aList);
              oDashboardModel.setProperty("/modalConfig/DeliveryComplete/totalCount", aList.length);
              oDashboardModel.setProperty("/currentModal/totalCount", aList.length);
            }
            resolve(aList);
            return;
          }

          oScmModel.read("/BillingSet", {
            success: (oData) => {
              const aBillingList = (oData.results || []).map((oItem) => ({
                billNo: oItem.Vbeln || oItem.BillNumber,
                itemNo: oItem.Posnr || oItem.ItemNumber || "00010",
                customer: oItem.Kunnr || oItem.CustomerName || "-",
                matCode: oItem.Matnr || oItem.Material,
                matName: oItem.Maktx || oItem.MaterialName,
                billQty: Math.round(Number(oItem.Fkmng || oItem.Quantity || 0)).toLocaleString(),
                unit: oItem.Vrkme || oItem.Unit || "EA",
                billAmount: Number(oItem.Netwr || 0).toLocaleString(),
                currency: oItem.Waerk || "KRW",
                billDate: oItem.Fkdat || oItem.BillDate,
                deliveryNo: oItem.Vgbel || oItem.DeliveryNumber || "-",
                soNo: oItem.Aubel || oItem.SoNumber || "-",
                status: oItem.Status || "납품 완료",
                statusState: "Success"
              }));

              const aFinalList = aBillingList.length > 0 ? aBillingList : DEFAULT_DELIVERY_COMPLETE_LIST;
              if (oDashboardModel) {
                oDashboardModel.setProperty("/deliveryCompleteList", aFinalList);
                oDashboardModel.setProperty("/modalConfig/DeliveryComplete/totalCount", aFinalList.length);
                oDashboardModel.setProperty("/currentModal/totalCount", aFinalList.length);
              }
              resolve(aFinalList);
            },
            error: () => {
              Log.info("Billing OData 미배포 - Fallback 데이터 적용");
              if (oDashboardModel) {
                oDashboardModel.setProperty("/deliveryCompleteList", DEFAULT_DELIVERY_COMPLETE_LIST);
                oDashboardModel.setProperty("/modalConfig/DeliveryComplete/totalCount", DEFAULT_DELIVERY_COMPLETE_LIST.length);
                oDashboardModel.setProperty("/currentModal/totalCount", DEFAULT_DELIVERY_COMPLETE_LIST.length);
              }
              resolve(DEFAULT_DELIVERY_COMPLETE_LIST);
            }
          });
        });
      },

      /* =======================================================================
       * 5. SD 전체 진행 현황 계산 및 요약 동기화
       * ======================================================================= */
      loadSdProgress(oComponent, oDashboardModel) {
        if (!oDashboardModel) {
          return;
        }

        Promise.all([
          this.loadSalesOrders(oComponent, oDashboardModel),
          this.loadDeliveryList(oComponent, oDashboardModel),
          this.loadPgiList(oComponent, oDashboardModel),
          this.loadDeliveryCompleteList(oComponent, oDashboardModel)
        ]).then(([aSo, aDelivery, aPgi, aBilling]) => {
          const iSoCount = aSo.length;
          const iDeliveryCount = aDelivery.length;
          const iPgiCount = aPgi.length;
          const iBillingCount = aBilling.length;

          // 헤더 KPI 진행률 계산 (출하/납품 완료 기준)
          const iSdRate = iSoCount > 0 ? Math.min(100, Math.round((iPgiCount / iSoCount) * 100)) : 0;

          oDashboardModel.setProperty("/header/sd/rate", iSdRate);
          oDashboardModel.setProperty("/header/sd/rateText", iSdRate + "%");
          oDashboardModel.setProperty("/header/sd/countText", iPgiCount + " / " + iSoCount + " 건");

          Log.info(
            "SD 진행 현황 업데이트 완료: Rate=" +
              iSdRate +
              "%, SO=" +
              iSoCount +
              ", Delivery=" +
              iDeliveryCount +
              ", PGI=" +
              iPgiCount +
              ", Billing=" +
              iBillingCount
          );
        });
      }
    };
  }
);
