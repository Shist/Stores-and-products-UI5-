sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.StoresOverview", {
    onNavToStoreDetails: function () {
      this.getOwnerComponent()
        .getRouter()
        .navTo("StoreDetails", { storeId: 1 });
    },
  });
});
