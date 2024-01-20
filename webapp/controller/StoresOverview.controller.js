sap.ui.define(
  [
    "pavel/zhukouski/controller/BaseController",
    "pavel/zhukouski/model/constants",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, CONSTANTS, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("pavel.zhukouski.controller.StoresOverview", {
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

      onCreateStorePress: function () {
        const oView = this.getView();

        if (!this.oDialog) {
          this.oDialog = sap.ui.xmlfragment(
            oView.getId(),
            "pavel.zhukouski.view.fragments.CreateStoreDialog",
            this
          );

          oView.addDependent(this.oDialog);
        }

        this.oDialog.open();
      },

      onDialogCancelPress: function () {
        this.oDialog.close();
      },

      onStoreFormAfterClose: function () {
        const oAppViewModel = this.getAppViewModel();
        const oNewStoreFormStatesObj = JSON.parse(
          JSON.stringify(oAppViewModel.getProperty("/storeFormInputs"))
        );

        for (const sKey in oNewStoreFormStatesObj) {
          oNewStoreFormStatesObj[sKey] = "";
        }

        oAppViewModel.setProperty("/storeFormInputs", oNewStoreFormStatesObj);
      },

      onStorePress: function (oEvent) {
        const nStoreId = this.getBindingContextData(
          CONSTANTS.STORE_PROP.ID,
          oEvent
        );

        const oAppViewModel = this.getAppViewModel();
        oAppViewModel.setProperty("/currStoresSearchFilter", "");
        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding(
          "items"
        );
        oStoresBinding.filter([]);

        this.navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
        });
      },
    });
  }
);
