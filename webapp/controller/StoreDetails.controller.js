sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
  ],
  function (Controller, Filter, FilterOperator, Sorter) {
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

      getCurrStorePath: function () {
        const oODataModel = this.getView().getModel("odata");
        const sStorePath = oODataModel.createKey(
          "/Stores",
          this.getView().getBindingContext("odata").getObject()
        );
        return sStorePath;
      },

      updateStatusFilters: function () {
        const oODataModel = this.getView().getModel("odata");
        const oAppViewModel = this.getView().getModel("appView");
        const sAllProductsKey = oAppViewModel.getProperty(
          "/productsCounts/statusAll/serverKey"
        );
        const oProductsCounts = oAppViewModel.getProperty("/productsCounts");
        const oProductsSearchFilter = this.getProductsSearchFilter();

        Object.entries(oProductsCounts).forEach(([sStatusKey, oStatusObj]) => {
          const oParams = {
            success: (sCount) => {
              oAppViewModel.setProperty(
                `/productsCounts/${sStatusKey}/count`,
                sCount
              );
            },
          };
          const aFilters = [];

          if (oProductsSearchFilter) {
            aFilters.push(oProductsSearchFilter);
          }
          if (oStatusObj.serverKey !== sAllProductsKey) {
            aFilters.push(
              new Filter("Status", FilterOperator.EQ, oStatusObj.serverKey)
            );
          }
          if (aFilters.length) {
            oParams.filters = [new Filter({ filters: aFilters, and: true })];
          }

          // FOR SOME REASON SERVER DOES NOT CALCULATE COUNTS CORRECTLY
          // Without search filter - everything is fine; with search filter - fully ignoring search filter
          // For example, on this URL
          // http://localhost:3000/odata/Stores(3)/rel_Products/$count?$filter=(%20Price%20eq%20somestrangestringm%20)
          // server will return 26, which is weird, right?
          // There is no way that store has 26 products with Price="somestrangestring"
          oODataModel.read(
            this.getCurrStorePath() + "/rel_Products/$count",
            oParams
          );
        });
      },

      onFiltersChanged: function () {
        const oProductsBinding = this.byId("productsTable").getBinding("items");
        const oIconTabBarFilter = this.getIconTabBarFilter();
        const oProductsSearchFilter = this.getProductsSearchFilter();
        const aFilters = [];

        oProductsBinding.refresh();

        if (oIconTabBarFilter) {
          aFilters.push(oIconTabBarFilter);
        }

        if (oProductsSearchFilter) {
          aFilters.push(oProductsSearchFilter);
        }

        oProductsBinding.filter(new Filter({ filters: aFilters, and: true }));
      },

      getIconTabBarFilter: function () {
        const oAppViewModel = this.getView().getModel("appView");
        const sAllProductsKey = oAppViewModel.getProperty(
          "/productsCounts/statusAll/serverKey"
        );
        const sIconTabBarKey = this.byId("iconTabBar").getSelectedKey();

        if (sIconTabBarKey !== sAllProductsKey) {
          return new Filter("Status", FilterOperator.EQ, sIconTabBarKey);
        } else {
          return null;
        }
      },

      getFilterForStr: function (serverKey, searchValue) {
        return new Filter({
          path: serverKey,
          operator: FilterOperator.Contains,
          value1: searchValue,
          caseSensitive: false,
        });
      },

      getFilterForNum: function (serverKey, searchValue) {
        return new Filter({
          path: serverKey,
          operator: FilterOperator.EQ,
          value1: searchValue,
          comparator: (a, b) => a - b, // <-- For some reason server doesn't filter without a comparator for numbers
        });
      },

      getProductsSearchFilter: function () {
        const oAppViewModel = this.getView().getModel("appView");
        const oSortFieldsObj = oAppViewModel.getProperty("/columnsSortStates");
        const sQuery = this.byId("productsSearch").getValue();

        if (sQuery) {
          const aFilters = [];

          const oFilterName = this.getFilterForStr(
            oSortFieldsObj.name.serverKey,
            sQuery
          );
          aFilters.push(oFilterName);
          const oFilterPrice = this.getFilterForNum(
            oSortFieldsObj.price.serverKey,
            sQuery
          );
          aFilters.push(oFilterPrice);
          const oFilterSpecs = this.getFilterForStr(
            oSortFieldsObj.specs.serverKey,
            sQuery
          );
          aFilters.push(oFilterSpecs);
          const oFilterSupplier = this.getFilterForStr(
            oSortFieldsObj.supplierInfo.serverKey,
            sQuery
          );
          aFilters.push(oFilterSupplier);
          const oFilterCountry = this.getFilterForStr(
            oSortFieldsObj.country.serverKey,
            sQuery
          );
          aFilters.push(oFilterCountry);
          const oFilterProdCompany = this.getFilterForStr(
            oSortFieldsObj.prodCompany.serverKey,
            sQuery
          );
          aFilters.push(oFilterProdCompany);
          const oFilterRating = this.getFilterForNum(
            oSortFieldsObj.rating.serverKey,
            sQuery
          );
          aFilters.push(oFilterRating);

          return new Filter({ filters: aFilters, and: false });
        } else {
          return null;
        }
      },

      getNewSortObj: function () {
        const oAppViewModel = this.getView().getModel("appView");
        const oNewSortState = JSON.parse(
          JSON.stringify(oAppViewModel.getProperty("/columnsSortStates"))
        );

        for (const key in oNewSortState) {
          oNewSortState[key].state = "DEFAULT";
        }

        return oNewSortState;
      },

      onSortBtnPress: function (sBtnKey) {
        const oAppViewModel = this.getView().getModel("appView");
        const oProductsBinding = this.byId("productsTable").getBinding("items");
        const sCurrSortState = oAppViewModel.getProperty(
          `/columnsSortStates/${sBtnKey}/state`
        );

        const oNewSortFieldsObj = this.getNewSortObj();

        if (sCurrSortState === "DEFAULT") {
          oNewSortFieldsObj[sBtnKey].state = "ASC";
        } else if (sCurrSortState === "ASC") {
          oNewSortFieldsObj[sBtnKey].state = "DESC";
        }

        oAppViewModel.setProperty("/columnsSortStates", oNewSortFieldsObj);

        oProductsBinding.refresh();

        if (oNewSortFieldsObj[sBtnKey].state === "DEFAULT") {
          oProductsBinding.sort([]);
        } else {
          const oSorter = new Sorter(
            oNewSortFieldsObj[sBtnKey].serverKey,
            oNewSortFieldsObj[sBtnKey].state === "DESC",
            undefined, // <-- vGroup? parameter; idk how to skip it, just put undefined
            this.sorterComparator // <-- For some reason server doesn't sort number columns without a comparator
          );
          oProductsBinding.sort(oSorter);
        }
      },

      sorterComparator: function (a, b) {
        if (!isNaN(a) && !isNaN(b)) {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          return numA - numB;
        } else {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        }
      },

      onSortNameBtnPress: function () {
        this.onSortBtnPress("name");
      },

      onSortPriceBtnPress: function () {
        this.onSortBtnPress("price");
      },

      onSortSpecsBtnPress: function () {
        this.onSortBtnPress("specs");
      },

      onSortSupplierBtnPress: function () {
        this.onSortBtnPress("supplierInfo");
      },

      onSortCountryBtnPress: function () {
        this.onSortBtnPress("country");
      },

      onSortProdCompanyBtnPress: function () {
        this.onSortBtnPress("prodCompany");
      },

      onSortRatingBtnPress: function () {
        this.onSortBtnPress("rating");
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

      setAllControlsToDefault() {
        const oAppViewModel = this.getView().getModel("appView");
        oAppViewModel.setProperty("/currStatusFilter", "ALL");
        oAppViewModel.setProperty("/currProductsSearchFilter", "");
        oAppViewModel.setProperty("/columnsSortStates", this.getNewSortObj());
        const oProductsBinding = this.byId("productsTable").getBinding("items");
        oProductsBinding.filter([]);
        oProductsBinding.sort([]);
      },

      onStoresListLinkPress: function () {
        // Setting everything to default before moving to other view
        this.setAllControlsToDefault();

        this.getOwnerComponent().getRouter().navTo("StoresOverview");
      },

      onProductPress: function (oEvent) {
        const nStoreId = this.getView()
          .getBindingContext("odata")
          .getObject("id");
        const nProductId = oEvent
          .getSource()
          .getBindingContext("odata")
          .getObject("id");

        // Setting everything to default before moving to other view
        this.setAllControlsToDefault();

        this.getOwnerComponent().getRouter().navTo("ProductDetails", {
          storeId: nStoreId,
          productId: nProductId,
        });
      },
    });
  }
);
