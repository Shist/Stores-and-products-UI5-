sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("pavel.zhukouski.controller.StoresOverview", {
      onStoreClick: function (oEvent) {
        const nStoreId = oEvent
          .getSource()
          .getBindingContext("odata")
          .getObject("id");

        this.getOwnerComponent().getRouter().navTo("StoreDetails", {
          storeId: nStoreId,
        });
      },

      onStoresSearchBtnClick: function (oEvent) {
        const oStoresBinding = this.byId("storesList").getBinding("items");
        const sQuery = oEvent.getParameter("query");
        let targetFilter = [];

        oStoresBinding.refresh();

        if (sQuery && sQuery.length > 0) {
          const aSearchFilters = this.getStoresSearchFilter(sQuery);

          targetFilter = new Filter({ filters: aSearchFilters, and: false });
        }

        oStoresBinding.filter(targetFilter);
      },

      getStoresSearchFilter: function (sQuery) {
        const aFilters = [];

        const filterName = new Filter({
          path: "Name",
          operator: FilterOperator.Contains,
          value1: sQuery,
          caseSensitive: false,
        });
        aFilters.push(filterName);

        const filterAddress = new Filter({
          path: "Address",
          operator: FilterOperator.Contains,
          value1: sQuery,
          caseSensitive: false,
        });
        aFilters.push(filterAddress);

        const filterFloorArea = new Filter({
          path: "FloorArea",
          operator: FilterOperator.EQ,
          value1: sQuery,
          comparator: (a, b) => a - b,
        });
        aFilters.push(filterFloorArea);

        return aFilters;
      },
    });
  }
);
