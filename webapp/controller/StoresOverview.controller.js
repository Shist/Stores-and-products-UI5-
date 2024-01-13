sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.StoresOverview", {
    onStoreClick: function (oEvent) {
      const nStoreId = oEvent
        .getSource()
        .getBindingContext("odata")
        .getObject("id");

      this.getOwnerComponent().getRouter().navTo("StoreDetails", {
        storeId: nStoreId,
      });
    },
  });
});
