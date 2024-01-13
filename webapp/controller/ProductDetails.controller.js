sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.ProductDetails", {
    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter
        .getRoute("ProductDetails")
        .attachPatternMatched(this.onRouterPatternMatched, this);
    },

    onExit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter
        .getRoute("ProductDetails")
        .detachPatternMatched(this.onRouterPatternMatched, this);
    },

    onRouterPatternMatched: function (oEvent) {
      const controllerContext = this;
      const sProductId = oEvent.getParameter("arguments").productId;
      const oODataModel = this.getView().getModel("odata");

      oODataModel.metadataLoaded().then(function () {
        const sKey = oODataModel.createKey("/Products", { id: sProductId });

        controllerContext.getView().bindObject({
          path: sKey,
          model: "odata",
        });
      });
    },

    onStoresListLinkClicked: function () {
      this.getOwnerComponent().getRouter().navTo("StoresOverview");
    },

    onStoreDetailsLinkClicked: function () {
      const nStoreId = this.getView()
        .getBindingContext("odata")
        .getObject("StoreId");

      this.getOwnerComponent().getRouter().navTo("StoreDetails", {
        storeId: nStoreId,
      });
    },
  });
});
