sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.StoreDetails", {
    onNavToProductDetails: function () {
      this.getOwnerComponent()
        .getRouter()
        .navTo("ProductDetails", { storeId: 1, productId: 1 });
    },

    onNavToStoresOverview: function () {
      this.getOwnerComponent().getRouter().navTo("StoresOverview");
    },
  });
});
