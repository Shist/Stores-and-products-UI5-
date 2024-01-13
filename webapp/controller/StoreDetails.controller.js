sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("pavel.zhukouski.controller.StoreDetails", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("StoreDetails")
          .attachPatternMatched(this.onRouterPatternMatched, this);
      },

      onAfterRendering: function () {
        const oProductsBinding = this.byId("productsTable").getBinding("items");
        oProductsBinding.attachDataReceived(this.updateStatusFilters, this);
      },

      onExit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("StoreDetails")
          .detachPatternMatched(this.onRouterPatternMatched, this);

        const oProductsBinding = this.byId("productsTable").getBinding("items");
        oProductsBinding.detachDataReceived(this.updateStatusFilters, this);
      },

      onRouterPatternMatched: function (oEvent) {
        const oControllerContext = this;
        const sStoreId = oEvent.getParameter("arguments").storeId;
        const oODataModel = this.getView().getModel("odata");

        oODataModel.metadataLoaded().then(function () {
          const sKey = oODataModel.createKey("/Stores", { id: sStoreId });

          oControllerContext.getView().bindObject({
            path: sKey,
            model: "odata",
          });
        });
      },

      updateStatusFilters: function () {
        const oODataModel = this.getView().getModel("odata");
        const oAppViewModel = this.getView().getModel("appView");
        const sAllProductsKey = oAppViewModel.getProperty(
          "/productsCounts/statusAll/serverKey"
        );
        const oProductsCounts = oAppViewModel.getProperty("/productsCounts");

        Object.entries(oProductsCounts).forEach(([sStatus, oStatusValue]) => {
          const oParams = {
            success: (sCount) => {
              oAppViewModel.setProperty(
                `/productsCounts/${sStatus}/count`,
                sCount
              );
            },
          };

          if (oStatusValue.serverKey !== sAllProductsKey) {
            oParams.filters = [
              new Filter("Status", FilterOperator.EQ, oStatusValue.serverKey),
            ];
          }

          oODataModel.read(
            this.getCurrStorePath() + "/rel_Products/$count",
            oParams
          );
        });
      },

      onFilterSelect: function (oEvent) {
        const oAppViewModel = this.getView().getModel("appView");
        const oProductsBinding = this.byId("productsTable").getBinding("items");
        const sAllProductsKey = oAppViewModel.getProperty(
          "/productsCounts/statusAll/serverKey"
        );
        const sFilterKey = oEvent.getParameter("key");

        if (sFilterKey === sAllProductsKey) {
          oProductsBinding.filter([]);
        } else {
          oProductsBinding.filter(
            new Filter("Status", FilterOperator.EQ, sFilterKey)
          );
        }
      },

      getCurrStorePath: function () {
        const oODataModel = this.getView().getModel("odata");
        const sStorePath = oODataModel.createKey(
          "/Stores",
          this.getView().getBindingContext("odata").getObject()
        );
        return sStorePath;
      },

      onStoresListLinkClicked: function () {
        const oAppViewModel = this.getView().getModel("appView");
        oAppViewModel.setProperty("/currStatusFilter", "ALL");
        this.byId("productsTable").getBinding("items").filter([]);

        this.getOwnerComponent().getRouter().navTo("StoresOverview");
      },

      onProductClick: function (oEvent) {
        const nStoreId = this.getView()
          .getBindingContext("odata")
          .getObject("id");
        const nProductId = oEvent
          .getSource()
          .getBindingContext("odata")
          .getObject("id");

        this.getOwnerComponent().getRouter().navTo("ProductDetails", {
          storeId: nStoreId,
          productId: nProductId,
        });
      },
    });
  }
);
