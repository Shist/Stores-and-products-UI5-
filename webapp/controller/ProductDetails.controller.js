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

          const oCommentsBinding = controllerContext
            .byId("commentsList")
            .getBinding("items");

          oCommentsBinding.refresh();

          oCommentsBinding.filter(
            new Filter({
              path: "ProductId",
              operator: FilterOperator.EQ,
              value1: sProductId,
              comparator: controllerContext.idFilterComparator,
            })
          );
        });
      },

      idFilterComparator: function (a, b) {
        if (!isNaN(a) && !isNaN(b)) {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          return numA - numB;
        } else {
          return NaN;
        }
      },

      formatBadgeType: function (sStatus) {
        const oAppViewModel = this.getView().getModel("appView");
        const sOkProductsKey = oAppViewModel.getProperty(
          "/productsCounts/statusOk/serverKey"
        );
        const sStorageProductsKey = oAppViewModel.getProperty(
          "/productsCounts/statusStorage/serverKey"
        );
        const sOutOfStockProductsKey = oAppViewModel.getProperty(
          "/productsCounts/statusOutOfStock/serverKey"
        );
        switch (sStatus) {
          case sOkProductsKey:
            return 8;
          case sStorageProductsKey:
            return 1;
          case sOutOfStockProductsKey:
            return 3;
          default:
            if (sStatus) {
              console.warn(`Got unknown type of product status: ${sStatus}`);
            }
            return 10;
        }
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
