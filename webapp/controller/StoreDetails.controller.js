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

        const oProductsBinding = this.byId("productsTable").getBinding("items");
        oProductsBinding.detachDataReceived(this.updateStatusFilters, this);
      },

      onAfterRendering: function () {
        const oProductsBinding = this.byId("productsTable").getBinding("items");
        oProductsBinding.attachDataReceived(this.updateStatusFilters, this);
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

      onStoresListLinkClicked: function () {
        const oAppViewModel = this.getView().getModel("appView");
        oAppViewModel.setProperty("/currStore/id", null);
        oAppViewModel.setProperty("/currStore/currStatusFilter", "ALL");

        this.getOwnerComponent().getRouter().navTo("StoresOverview");
      },

      updateStatusFilters: function () {
        const oODataModel = this.getView().getModel("odata");
        const oAppViewModel = this.getView().getModel("appView");
        const sAllProductsKey = oAppViewModel.getProperty(
          "/currStore/productsCounts/statusAll/serverKey"
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
        const oODataModel = this.getView().getModel("odata");
        const oAppViewModel = this.getView().getModel("appView");
        const oProductsBinding = this.byId("productsTable").getBinding("items");
        const sCurrFilter = oAppViewModel.getProperty(
          "/currStore/currStatusFilter"
        );
        const sAllProductsKey = oAppViewModel.getProperty(
          "/currStore/productsCounts/statusAll/serverKey"
        );
        const sFilterKey = oEvent.getParameter("key");

        if (sCurrFilter === sFilterKey) {
          return;
        }

        oAppViewModel.setProperty("/currStore/currStatusFilter", sFilterKey);

        oODataModel.read(this.getCurrStorePath() + "/rel_Products");

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
