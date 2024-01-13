sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("pavel.zhukouski.controller.ProductDetails", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("ProductDetails")
          .attachPatternMatched(this.onRouterPatternMatched, this);
      },

      onAfterRendering: function () {
        const oCommentsBinding = this.byId("commentsList").getBinding("items");

        setTimeout(() => {
          const nProductId = this.getView()
            .getBindingContext("odata")
            .getObject("id");

          oCommentsBinding.filter(
            new Filter("ProductId", FilterOperator.EQ, nProductId)
          );
        }, 100); // TODO: Somehow refactor this cringe. We need to wait before productId will appear inside Binding
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
        const oAppViewModel = this.getView().getModel("appView");
        oAppViewModel.setProperty("/currStatusFilter", "ALL");

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
  }
);
