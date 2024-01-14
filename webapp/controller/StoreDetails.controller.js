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

      onSortBtnClicked(sBtnKey) {
        const oAppViewModel = this.getView().getModel("appView");
        const sCurrSortState = oAppViewModel.getProperty(
          `/columnsSortStates/${sBtnKey}`
        );

        const newSortObj = {
          name: "DEFAULT",
          price: "DEFAULT",
          specs: "DEFAULT",
          supplierInfo: "DEFAULT",
          country: "DEFAULT",
          prodCompany: "DEFAULT",
          rating: "DEFAULT",
        };

        if (sCurrSortState === "DEFAULT") {
          newSortObj[sBtnKey] = "ASC";
        } else if (sCurrSortState === "ASC") {
          newSortObj[sBtnKey] = "DESC";
        }

        oAppViewModel.setProperty("/columnsSortStates", newSortObj);
      },

      onSortNameBtnClicked: function () {
        this.onSortBtnClicked("name");
      },

      onSortPriceBtnClicked: function () {
        this.onSortBtnClicked("price");
      },

      onSortSpecsBtnClicked: function () {
        this.onSortBtnClicked("specs");
      },

      onSortSupplierBtnClicked: function () {
        this.onSortBtnClicked("supplierInfo");
      },

      onSortCountryBtnClicked: function () {
        this.onSortBtnClicked("country");
      },

      onSortProdCompanyBtnClicked: function () {
        this.onSortBtnClicked("prodCompany");
      },

      onSortRatingBtnClicked: function () {
        this.onSortBtnClicked("rating");
      },

      formatSortBtnIcon: function (sSortState) {
        switch (sSortState) {
          case "DEFAULT":
            return "sap-icon://sort";
          case "ASC":
            return "sap-icon://sort-ascending";
          case "DESC":
            return "sap-icon://sort-descending";
          default:
            console.warn(`Got unknown type of sort state: ${sSortState}`);
            return "sap-icon://sys-help";
        }
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
