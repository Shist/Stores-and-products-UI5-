sap.ui.define(
  [
    "pavel/zhukouski/controller/BaseController",
    "pavel/zhukouski/model/constants",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, CONSTANTS, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("pavel.zhukouski.controller.StoresOverview", {
      /**
       * This method is called upon initialization of the View; it is only called once per View instance
       * @public
       */
      onInit: function () {
        this.registerViewToMessageManager();
      },

      /**
       * Handles search event of search stores input
       * @param {sap.ui.base.Event} oEvent oEvent event object
       * @public
       */
      onStoresSearchBtnPress: function (oEvent) {
        if (!this.isSearchFieldValid(CONSTANTS.ID.STORES_SEARCH)) {
          const sMsgWarning = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.SEARCH_VALIDATION_WARNING
          );
          MessageBox.warning(sMsgWarning);
          return;
        }

        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding("items");
        const sQuery = oEvent.getParameter("query");
        let aTargetFilter = [];

        oStoresBinding.refresh();

        if (sQuery) {
          aTargetFilter = new Filter({
            filters: this.getStoresSearchFilter(sQuery),
            and: false,
          });
        }

        oStoresBinding.filter(aTargetFilter);
      },

      /**
       * Collects all needed filters for given sQuery and returns them as an array
       * @param {sQuery} sQuery string containing search query
       * @returns {sap.ui.model.Filter[]} array with all needed store filters
       * @public
       */
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

      /**
       * Handles press event of create store button
       * @public
       */
      onCreateStoreBtnPress: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oEntryCtx = oODataModel.createEntry("/Stores");

        this.loadFormFragmentByName(CONSTANTS.FORM_NAME.STORE);

        this.oForm.setBindingContext(oEntryCtx);

        this.oForm.open();
      },

      /**
       * Handles press event of create button that is located inside store form
       * @public
       */
      onStoreFormCreateBtnPress: function () {
        if (!this.isFormValid(CONSTANTS.FORM_FIELD.STORE)) {
          return;
        }

        const oControllerContext = this;
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);

        oODataModel.submitChanges({
          // These two functions will only be called when we will start using batch
          success: function () {
            const sMsgSuccess = oControllerContext.getTextFromResourceModel(
              CONSTANTS.I18N_KEY.STORE_CREATE_SUCCESS
            );
            MessageToast.show(sMsgSuccess);
          },
          error: function () {
            const sMsgError = oControllerContext.getTextFromResourceModel(
              CONSTANTS.I18N_KEY.STORE_CREATE_ERROR
            );
            MessageBox.error(sMsgError);
          },
        });

        this.oForm.close();
      },

      /**
       * Handles press event of cancel button that is located inside store form
       * @public
       */
      onStoreFormCancelBtnPress: function () {
        this.oForm.close();
      },

      /**
       * Handles afterClose event of store form
       * @public
       */
      onStoreFormAfterClose: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding("items");

        // This reset called Any time when the dialog is closing (even after confirmation)
        // For some reason my model does not release data after submitChanges(), may be because of server behaviour,
        // so I call resetChanges() after submitChanges() not to duplicate some stores, products or comments
        oODataModel.resetChanges();

        // For some reason server does not update my list (by additional GET request) after submitChanges()
        // That is why I have to refresh it by myself after some time
        setTimeout(() => oStoresBinding.refresh(), 100);

        this.clearFormValueStates(CONSTANTS.FORM_FIELD.STORE);
        this.getMsgManager().removeAllMessages();
      },

      /**
       * Handles press event of stores list item
       * @param {sap.ui.base.Event} oEvent oEvent event object
       * @public
       */
      onStorePress: function (oEvent) {
        const nStoreId = this.getBindingContextData(CONSTANTS.STORE_PROP.ID, oEvent);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oStoresBinding = this.byId(CONSTANTS.ID.STORES_LIST).getBinding("items");

        oAppViewModel.setProperty("/currStoresSearchFilter", "");

        oStoresBinding.filter([]);

        this.navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
        });
      },
    });
  }
);
