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

      onAfterRendering: function () {
        const oODataModel = this.getView().getModel("odata");
        const oAppViewModel = this.getView().getModel("appView");

        const oProductsTable = this.byId("productsTable");
        const oItemsBinding = oProductsTable.getBinding("items");

        oItemsBinding.attachDataReceived(function () {
          const oTableCtx = oProductsTable.getBindingContext("odata");
          const sStoresPath = oODataModel.createKey(
            "/Stores",
            oTableCtx.getObject()
          );
          const oProductsCounts = oAppViewModel.getProperty(
            "/currStore/productsCounts"
          );

          Object.entries(oProductsCounts).forEach(([sStatus, oStatusValue]) => {
            const oParams = {
              success: (sCount) => {
                oAppViewModel.setProperty(
                  `/currStore/productsCounts/${sStatus}/count`,
                  sCount
                );
              },
            };

            if (oStatusValue.serverKey !== "ALL") {
              oParams.filters = [
                new Filter("Status", FilterOperator.EQ, oStatusValue.serverKey),
              ];
            }

            oODataModel.read(sStoresPath + "/rel_Products/$count", oParams);
          });
        });
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
  }
);
