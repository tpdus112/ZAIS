sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createDashboardModel: function () {
            var oData = {
                lastUpdated: "2024.05.20 10:30",
                header: {
                    mm: {
                        title: "구매 진행 (MM)",
                        rate: 82,
                        rateText: "82%",
                        subText: "입고 완료 기준",
                        countText: "132 / 161 건",
                        icon: "sap-icon://cart",
                        colorClass: "headerCardBlue"
                    },
                    pp: {
                        title: "생산 진행 (PP)",
                        rate: 72,
                        rateText: "72%",
                        subText: "생산 완료 기준",
                        countText: "9 / 12 건",
                        icon: "sap-icon://factory",
                        colorClass: "headerCardGreen"
                    },
                    sd: {
                        title: "출하 진행 (SD)",
                        rate: 45,
                        rateText: "45%",
                        subText: "출하 완료 기준",
                        countText: "5 / 11 건",
                        icon: "sap-icon://shipping-status",
                        colorClass: "headerCardPurple"
                    },
                    stock: {
                        title: "재고 현황",
                        amount: "1,248",
                        subText: "주요 자재 가용 수량",
                        icon: "sap-icon://product",
                        colorClass: "headerCardOrange"
                    }
                },
                process: {
                    mm: {
                        title: "MM 조달",
                        steps: [
                            { name: "구매요청", count: "12 / 12", status: "completed", statusText: "완료", icon: "sap-icon://request" },
                            { name: "구매오더", count: "12 / 12", status: "completed", statusText: "완료", icon: "sap-icon://cart" },
                            { name: "자재 입고", count: "9 / 12", status: "inProgress", statusText: "진행 중", icon: "sap-icon://inventory" },
                            { name: "입고 완료", count: "9 / 12", status: "inProgress", statusText: "진행 중", icon: "sap-icon://building" }
                        ],
                        materials: [
                            { name: "WFR (DWFR)", poQty: "44 PC", grQty: "44 PC", rate: "100%", status: "완료", statusState: "Success" },
                            { name: "POCO", poQty: "20 PC", grQty: "20 PC", rate: "100%", status: "완료", statusState: "Success" },
                            { name: "PCB", poQty: "10 PC", grQty: "10 PC", rate: "100%", status: "완료", statusState: "Success" },
                            { name: "CPU", poQty: "20 PC", grQty: "18 PC", rate: "90%", status: "진행 중", statusState: "Information" },
                            { name: "RAM (64GB RDIMM)", poQty: "640 EA", grQty: "448 EA", rate: "70%", status: "진행 중", statusState: "Information" },
                            { name: "NIC (InfiniBand)", poQty: "4 EA", grQty: "0 EA", rate: "0%", status: "대기", statusState: "None" }
                        ]
                    },
                    pp: {
                        title: "PP 생산",
                        steps: [
                            { name: "DRAM 생산", count: "12,000 EA", rate: "100%", status: "completed", statusText: "완료", icon: "sap-icon://developer-settings" },
                            { name: "HBM3E 생산", count: "640 EA", rate: "60%", status: "inProgress", statusText: "진행 중", icon: "sap-icon://database" },
                            { name: "BGP 생산", count: "80 EA", rate: "31%", status: "inProgress", statusText: "진행 중", icon: "sap-icon://grid" },
                            { name: "GPU 생산", count: "10 EA", rate: "0%", status: "waiting", statusText: "대기", icon: "sap-icon://it-instance" },
                            { name: "AIS 조립", count: "10 EA", rate: "70%", status: "inProgress", statusText: "진행 중", icon: "sap-icon://brain" }
                        ],
                        materials: [
                            { name: "DRAM (REM)", planQty: "12,000 EA", actQty: "12,000 EA", rate: "100%", status: "완료", statusState: "Success" },
                            { name: "HBM3E", planQty: "640 EA", actQty: "384 EA", rate: "60%", status: "진행 중", statusState: "Information" },
                            { name: "BGP", planQty: "80 EA", actQty: "25 EA", rate: "31%", status: "진행 중", statusState: "Information" },
                            { name: "GPU", planQty: "10 EA", actQty: "0 EA", rate: "0%", status: "대기", statusState: "None" },
                            { name: "AIS SERVER", planQty: "10 EA", actQty: "7 EA", rate: "70%", status: "진행 중", statusState: "Information" }
                        ]
                    },
                    sd: {
                        title: "SD 판매/출하",
                        steps: [
                            { name: "Sales Order", count: "10 / 10", status: "completed", statusText: "완료", icon: "sap-icon://sales-order" },
                            { name: "Delivery", count: "5 / 10", status: "inProgress", statusText: "진행 중", icon: "sap-icon://shipping-status" },
                            { name: "PGI", count: "4 / 10", status: "inProgress", statusText: "진행 중", icon: "sap-icon://receipt" },
                            { name: "납품 완료", count: "0 / 10", status: "waiting", statusText: "대기", icon: "sap-icon://collaborate" }
                        ],
                        materials: [
                            { name: "Sales Order", orderQty: "10 EA", doneQty: "10 EA", rate: "100%", status: "완료", statusState: "Success" },
                            { name: "Delivery", orderQty: "10 EA", doneQty: "5 EA", rate: "50%", status: "진행 중", statusState: "Information" },
                            { name: "PGI", orderQty: "10 EA", doneQty: "4 EA", rate: "40%", status: "진행 중", statusState: "Information" },
                            { name: "납품 완료", orderQty: "10 EA", doneQty: "0 EA", rate: "0%", status: "대기", statusState: "None" }
                        ]
                    }
                },
                aisProduction: [
                    { code: "AI-F-AIS", name: "AIS", qty: "10 EA", step: "AIS 조립", rate: 70, status: "진행 중", statusState: "Information", dueDate: "2024.05.25" },
                    { code: "AI-H-GPU", name: "GPU", qty: "10 EA", step: "생산 완료", rate: 100, status: "완료", statusState: "Success", dueDate: "2024.05.15" },
                    { code: "AI-H-BGP", name: "BGP", qty: "80 EA", step: "생산 완료", rate: 100, status: "완료", statusState: "Success", dueDate: "2024.05.14" },
                    { code: "AI-H-HBM3E", name: "HBM3E", qty: "640 EA", step: "HBM3E 생산", rate: 60, status: "진행 중", statusState: "Information", dueDate: "2024.05.22" },
                    { code: "AI-H-DRAM", name: "DRAM", qty: "7,680 EA", step: "생산 완료", rate: 100, status: "완료", statusState: "Success", dueDate: "2024.05.12" }
                ],
                materials: [
                    { code: "AI-R-DWFR", name: "WFR (Raw Wafer)", unit: "EA", stock: 44, status: "정상", statusState: "Success" },
                    { code: "AI-R-GWFR", name: "GWFR (Good Wafer)", unit: "EA", stock: 20, status: "정상", statusState: "Success" },
                    { code: "AI-R-POCO", name: "POCO (Package Organic Substrate)", unit: "EA", stock: 10, status: "정상", statusState: "Success" },
                    { code: "AI-R-PCB", name: "PCB (Board)", unit: "EA", stock: 10, status: "정상", statusState: "Success" },
                    { code: "AI-R-CPU", name: "CPU (Processor)", unit: "EA", stock: 20, status: "정상", statusState: "Success" },
                    { code: "AI-R-RAM", name: "DRAM (64GB RDIMM)", unit: "EA", stock: 320, status: "부족", statusState: "Warning" }
                ]
            };

            var oModel = new JSONModel(oData);
            return oModel;
        }
    };
});