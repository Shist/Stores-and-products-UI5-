sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.StoreDetails", {
    onInit: function () {
      const oComponent = this.getOwnerComponent();
      const oRouter = oComponent.getRouter();
      oRouter
        .getRoute("StoreDetails")
        .attachPatternMatched(this.onPatternMatched, this);
    },

    onExit: function () {
      const oComponent = this.getOwnerComponent();
      const oRouter = oComponent.getRouter();
      oRouter
        .getRoute("StoreDetails")
        .detachPatternMatched(this.onPatternMatched, this);
    },

    onPatternMatched: function (oEvent) {
      const controllerContext = this;
      const mRouteArguments = oEvent.getParameter("arguments");
      const sStoreId = mRouteArguments.storeId;
      const oODataModel = this.getView().getModel("odata");

      oODataModel.metadataLoaded().then(function () {
        const sKey = oODataModel.createKey("/Stores", { id: sStoreId });

        controllerContext.getView().bindObject({
          path: sKey,
          model: "odata",
        });
      });
    },

    // onNavToProductDetails: function () {
    //   this.getOwnerComponent()
    //     .getRouter()
    //     .navTo("ProductDetails", { storeId: 1, productId: 1 });
    // },

    // onNavToStoresOverview: function () {
    //   this.getOwnerComponent().getRouter().navTo("StoresOverview");
    // },
  });
});
