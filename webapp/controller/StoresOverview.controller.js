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
      onInit: function () {
        this.registerViewToMessageManager();
      },

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
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oEntryCtx = oODataModel.createEntry("/Stores");

        this.loadFormFragmentByName(CONSTANTS.FORM_NAME.STORE);

        this.oForm.setBindingContext(oEntryCtx);

        this.oForm.open();
      },

      isCreateStoreFormValid: function () {
        if (this.msgManagerHasErrors()) {
          const sMsgError = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.FIX_VALIDATION_ERRORS_MSG
          );
          MessageBox.error(sMsgError);
          return false;
        }

        for (const oField of Object.values(CONSTANTS.FORM_FIELD.STORE)) {
          if (!this.byId(oField.ID).getValue()) {
            const sMsgError = this.getTextFromResourceModel(
              CONSTANTS.I18N_KEY.FIELD_IS_MANADATORY_MSG,
              [oField.LABEL]
            );
            MessageBox.error(sMsgError);
            return false;
          }
        }

        return true;
      },

      onStoreFormCreateBtnPress: function () {
        if (!this.isCreateStoreFormValid()) {
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

      onStoreFormCancelBtnPress: function () {
        this.oForm.close();
      },

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

        sap.ui.getCore().getMessageManager().removeAllMessages();
      },

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
