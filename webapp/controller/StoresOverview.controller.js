sap.ui.define(
  [
    "pavel/zhukouski/controller/BaseController",
    "pavel/zhukouski/model/constants",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    BaseController,
    CONSTANTS,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend("pavel.zhukouski.controller.StoresOverview", {
      onInit: function () {
        this.registerViewToMessageManager();
      },

      onStoresSearchBtnPress: function (oEvent) {
        if (!this.isSearchFieldValid("storesSearch")) {
          MessageBox.warning(
            "Please do not use special symbols while searching: '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']', '{', '}', '\\'"
          );
          return;
        }

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

      onCreateStoreBtnPress: function () {
        const oODataModel = this.getODataModel();

        this.loadFormFragmentByName("CreateStoreForm");

        const oEntryCtx = oODataModel.createEntry("/Stores", {
          properties: {
            ID: new Date().getTime().toString().slice(7),
          },
        });

        this.oDialog.setBindingContext(oEntryCtx);

        this.oDialog.open();
      },

      isCreateStoreFormValid: function () {
        if (this.msgManagerHasErrors()) {
          MessageBox.error("Please fix validation errors first!");
          return false;
        }

        if (!this.byId("inputCreateStoreName").getValue()) {
          MessageBox.error(
            "'Name' field is manadatory and can not be empty! Please enter some value for it."
          );
          return false;
        }

        if (!this.byId("inputCreateStoreEmail").getValue()) {
          MessageBox.error(
            "'Email' field is manadatory and can not be empty! Please enter some value for it."
          );
          return false;
        }

        if (!this.byId("inputCreateStorePhone").getValue()) {
          MessageBox.error(
            "'Phone number' field is manadatory and can not be empty! Please enter some value for it."
          );
          return false;
        }

        return true;
      },

      onCreateStoreFormCreateBtnPress: function () {
        if (!this.isCreateStoreFormValid()) {
          return;
        }

        const oODataModel = this.getODataModel();
        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding(
          "items"
        );

        oODataModel.submitChanges({
          // These two functions will only be called when we will start using batch
          success: function () {
            MessageToast.show("Store was successfully created!");
          },
          error: function () {
            MessageBox.error("Error while creating store!");
          },
        });

        oStoresBinding.refresh();

        this.oDialog.close();
      },

      onCreateStoreFormCancelBtnPress: function () {
        const oODataModel = this.getODataModel();
        const oCtx = this.oDialog.getBindingContext();

        oODataModel.deleteCreatedEntry(oCtx);

        this.oDialog.close();
      },

      onStorePress: function (oEvent) {
        const nStoreId = this.getBindingContextData(
          CONSTANTS.STORE_PROP.ID,
          oEvent
        );
        const oAppViewModel = this.getAppViewModel();
        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding(
          "items"
        );

        oAppViewModel.setProperty("/currStoresSearchFilter", "");

        oStoresBinding.filter([]);

        this.navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
        });
      },
    });
  }
);
