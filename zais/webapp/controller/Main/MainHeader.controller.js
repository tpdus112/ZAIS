sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], (Controller, Fragment, MessageToast) => {
    "use strict";

    return Controller.extend("zais.scm.zais.controller.main.MainHeader", {

        onInit() {
            // UI5 Event Delegate를 통한 카드 클릭 이벤트 등록
            const oStockCard = this.byId("stockCard");
            if (oStockCard) {
                oStockCard.addEventDelegate({
                    onclick: () => {
                        this.onOpenMaterialDialog();
                    }
                }, this);
            }
        },

        onAfterRendering() {
            // DOM 렌더링 후 직접 클릭 이벤트 바인딩 (이중 안전장치)
            const oStockCard = this.byId("stockCard");
            if (oStockCard) {
                oStockCard.$().off("click").on("click", () => {
                    this.onOpenMaterialDialog();
                });
            }
        },

        onRefresh() {
            const oModel = this.getView().getModel("dashboard");
            if (oModel) {
                // 현재 시각으로 최종 업데이트 시간 갱신
                const oNow = new Date();
                const sFormattedDate = oNow.getFullYear() + "." +
                    String(oNow.getMonth() + 1).padStart(2, "0") + "." +
                    String(oNow.getDate()).padStart(2, "0") + " " +
                    String(oNow.getHours()).padStart(2, "0") + ":" +
                    String(oNow.getMinutes()).padStart(2, "0");

                oModel.setProperty("/lastUpdated", sFormattedDate);
            }
            MessageToast.show("대시보드 데이터가 최신 상태로 갱신되었습니다.");
        },

        onOpenMaterialDialog() {
            const oView = this.getView();
            const oDashboardModel = oView.getModel("dashboard") || this.getOwnerComponent().getModel("dashboard");

            if (!this._pMaterialDialog) {
                this._pMaterialDialog = Fragment.load({
                    id: oView.getId(),
                    name: "zais.scm.zais.view.main.MaterialDialog",
                    controller: this
                }).then((oDialog) => {
                    oView.addDependent(oDialog);
                    if (oDashboardModel) {
                        oDialog.setModel(oDashboardModel, "dashboard");
                    }
                    return oDialog;
                });
            }

            this._pMaterialDialog.then((oDialog) => {
                if (oDashboardModel) {
                    oDialog.setModel(oDashboardModel, "dashboard");
                }
                oDialog.open();
            }).catch((err) => {
                console.error("Failed to open material dialog:", err);
            });
        },

        onCloseMaterialDialog() {
            if (this.byId("materialDialog")) {
                this.byId("materialDialog").close();
            }
        }

    });

});
