sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "pavel/zhukouski/model/constants",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, CONSTANTS, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("pavel.zhukouski.controller.StoresOverview", {
      onStoresSearchBtnPress: function (oEvent) {
        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding(
          "items"
        );
        const sQuery = oEvent.getParameter("query");
        let targetFilter = [];

        oStoresBinding.refresh();

        if (sQuery) {
          const aSearchFilters = this.getStoresSearchFilter(sQuery);

          targetFilter = new Filter({ filters: aSearchFilters, and: false });
        }

        oStoresBinding.filter(targetFilter);
      },

      getStoresSearchFilter: function (sQuery) {
        const aFilters = [];

        aFilters.push(
          new Filter({
            path: CONSTANTS.STORE_PROP.NAME,
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false,
          })
        );

        aFilters.push(
          new Filter({
            path: CONSTANTS.STORE_PROP.ADDRESS,
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false,
          })
        );

        aFilters.push(
          new Filter({
            path: CONSTANTS.STORE_PROP.FLOOR_AREA,
            operator: FilterOperator.EQ,
            value1: sQuery,
            comparator: (a, b) => a - b,
          })
        );

        return aFilters;
      },

      onStorePress: function (oEvent) {
        const nStoreId = oEvent
          .getSource()
          .getBindingContext(CONSTANTS.MODEL.ODATA)
          .getObject(CONSTANTS.STORE_PROP.ID);

        const oAppViewModel = this.getView().getModel(CONSTANTS.MODEL.APP_VIEW);
        oAppViewModel.setProperty("/currStoresSearchFilter", "");
        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding(
          "items"
        );
        oStoresBinding.filter([]);

        this.getOwnerComponent()
          .getRouter()
          .navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
            [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
          });
      },
    });
  }
);
