sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.StoresOverview", {
    onStoreClick: function (oEvent) {
      const storeId = oEvent
        .getSource()
        .getBindingContext("odata")
        .getObject("id");

      const oAppViewModel = this.getView().getModel("appView");
      oAppViewModel.setProperty("/currStore/id", storeId);

      this.getOwnerComponent().getRouter().navTo("StoreDetails", {
        storeId: storeId,
      });
    },
  });
});
