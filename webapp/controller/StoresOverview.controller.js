sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.StoresOverview", {
    onStoreClick: function (oEvent) {
      this.getOwnerComponent()
        .getRouter()
        .navTo("StoreDetails", {
          storeId: oEvent
            .getSource()
            .getBindingContext("odata")
            .getObject("id"),
        });
    },
  });
});
