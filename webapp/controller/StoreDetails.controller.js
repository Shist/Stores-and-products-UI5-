sap.ui.define(
  [
    "pavel/zhukouski/controller/BaseController",
    "pavel/zhukouski/model/constants",
    "pavel/zhukouski/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
  ],
  function (
    BaseController,
    CONSTANTS,
    formatter,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator,
    Sorter
  ) {
    "use strict";

    return BaseController.extend("pavel.zhukouski.controller.StoreDetails", {
      /**
       * Field for storing formatter that is needed for sort icons formatting
       * @type {Object}
       * @public
       */
      formatter: formatter,

      /**
       * This method is called upon initialization of the View; it is only called once per View instance
       * @public
       */
      onInit: function () {
        this.registerViewToMessageManager();

        this.getRoute(CONSTANTS.ROUTE.STORE_DETAILS).attachPatternMatched(
          this.onRouterPatternMatched,
          this
        );
      },

      /**
       * This function is called when the rendering of the view is completed
       * @public
       */
      onAfterRendering: function () {
        this.byId(CONSTANTS.ID.PRODUCTS_TABLE)
          .getBinding("items")
          .attachDataReceived(this.updateStatusFilters, this);
      },

      /**
       * This method is called upon desctuction of the view
       * @public
       */
      onExit: function () {
        this.getRoute(CONSTANTS.ROUTE.STORE_DETAILS).detachPatternMatched(
          this.onRouterPatternMatched,
          this
        );

        this.byId(CONSTANTS.ID.PRODUCTS_TABLE)
          .getBinding("items")
          .detachDataReceived(this.updateStatusFilters, this);
      },

      /**
       * Handles the patternMatched event of sap.ui.core.routing.Route; calls every time pattern is matched
       * @param {sap.ui.base.Event} oEvent oEvent event object
       * @public
       */
      onRouterPatternMatched: function (oEvent) {
        const oControllerContext = this;
        const sStoreId = oEvent.getParameter("arguments")[CONSTANTS.ROUTE.PAYLOAD.STORE_ID];
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);

        oAppViewModel.setProperty("/currStoreId", sStoreId);

        oODataModel.metadataLoaded().then(function () {
          const sKey = oODataModel.createKey("/Stores", { id: sStoreId });

          oControllerContext.getView().bindObject({
            path: sKey,
            model: CONSTANTS.MODEL.ODATA,
          });
        });
      },

      /**
       * Returns the key for the current store via current binding context
       * @returns {string} key of the store entry
       * @public
       */
      getCurrStorePath: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const sStorePath = oODataModel.createKey("/Stores", this.getBindingContextData());
        return sStorePath;
      },

      /**
       * Updates the amounts of status filters (all, ok, storage, out of stock) via 4 server requests
       * @public
       */
      updateStatusFilters: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oProductsCounts = oAppViewModel.getProperty("/productsCounts");
        const oProductsSearchFilter = this.getProductsSearchFilter();

        Object.keys(oProductsCounts).forEach((sStatusModelKey) => {
          const oParams = {
            success: (sCount) => {
              oAppViewModel.setProperty(`/productsCounts/${sStatusModelKey}`, sCount);
            },
          };
          const aFilters = [];

          if (oProductsSearchFilter) {
            aFilters.push(oProductsSearchFilter);
          }
          if (sStatusModelKey !== CONSTANTS.STATUS.ALL.MODEL_KEY) {
            aFilters.push(
              new Filter(
                CONSTANTS.PRODUCT_PROP.STATUS,
                FilterOperator.EQ,
                this.findServerKeyByModelKey(CONSTANTS.STATUS, sStatusModelKey)
              )
            );
          }
          if (aFilters.length) {
            oParams.filters = [new Filter({ filters: aFilters, and: true })];
          }

          oODataModel.read(this.getCurrStorePath() + "/rel_Products/$count", oParams);
        });
      },

      /**
       * Handles either search event of search products input or select event of statuses IconTabBar
       * @public
       */
      onFiltersChanged: function () {
        if (!this.isSearchFieldValid(CONSTANTS.ID.PRODUCTS_SEARCH)) {
          const sMsgWarning = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.SEARCH_VALIDATION_WARNING
          );
          MessageBox.warning(sMsgWarning);
          return;
        }

        const oProductsBinding = this.byId(CONSTANTS.ID.PRODUCTS_TABLE).getBinding("items");
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

      /**
       * Gets current filter for product status
       * @returns {?sap.ui.model.Filter} needed product filter or null (if there is 'all' status)
       * @public
       */
      getIconTabBarFilter: function () {
        const sIconTabBarKey = this.byId(CONSTANTS.ID.ICON_TAB_BAR).getSelectedKey();

        if (sIconTabBarKey !== CONSTANTS.STATUS.ALL.SERVER_KEY) {
          return new Filter(CONSTANTS.PRODUCT_PROP.STATUS, FilterOperator.EQ, sIconTabBarKey);
        } else {
          return null;
        }
      },

      /**
       * Get the search filter for the field of string type
       * @param {} sServerKey server key of the needed field
       * @param {} sSearchValue the value to be searched
       * @returns {sap.ui.model.Filter} needed search filter for the field of string type
       * @public
       */
      getFilterForStr: function (sServerKey, sSearchValue) {
        return new Filter({
          path: sServerKey,
          operator: FilterOperator.Contains,
          value1: sSearchValue,
          caseSensitive: false,
        });
      },

      /**
       * Get the search filter for the field of number type
       * @param {} sServerKey server key of the needed field
       * @param {} sSearchValue the value to be searched
       * @returns {sap.ui.model.Filter} needed search filter for the field of number type
       * @public
       */
      getFilterForNum: function (sServerKey, sSearchValue) {
        return new Filter({
          path: sServerKey,
          operator: FilterOperator.EQ,
          value1: sSearchValue,
          comparator: (a, b) => a - b,
        });
      },

      /**
       * Collects all needed search filters for current search query (if exists) into one object and returns it
       * @returns {?sap.ui.model.Filter} needed products search filter or null if search query is empty
       * @public
       */
      getProductsSearchFilter: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const sQuery = oAppViewModel.getProperty("/currProductsSearchFilter");

        if (!sQuery) {
          return null;
        }

        const aFilters = [];

        Object.values(CONSTANTS.SORT_PROP).forEach((oField) => {
          oField.IS_NUM
            ? aFilters.push(this.getFilterForNum(oField.SERVER_KEY, sQuery))
            : aFilters.push(this.getFilterForStr(oField.SERVER_KEY, sQuery));
        });

        return new Filter({ filters: aFilters, and: false });
      },

      /**
       * Makes new copy of sorting states object (based on the one in AppViewModel), sets to default state and returns it
       * @returns {Object.<string, string>} new copy of sorting states object
       * @public
       */
      getNewSortObj: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oNewSortStates = JSON.parse(
          JSON.stringify(oAppViewModel.getProperty("/productsSortStates"))
        );

        for (const sKey in oNewSortStates) {
          oNewSortStates[sKey] = CONSTANTS.SORT_STATE.DEFAULT;
        }

        return oNewSortStates;
      },

      /**
       * Handles press event for one of seven sorting buttons
       * @param {string} sSortModelKey the value of sorting key that is declared in AppViewModel
       * @public
       */
      onSortBtnPress: function (sSortModelKey) {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const sCurrSortState = oAppViewModel.getProperty(`/productsSortStates/${sSortModelKey}`);
        const oProductsBinding = this.byId(CONSTANTS.ID.PRODUCTS_TABLE).getBinding("items");

        const oNewSortFieldsObj = this.getNewSortObj();

        if (sCurrSortState === CONSTANTS.SORT_STATE.DEFAULT) {
          oNewSortFieldsObj[sSortModelKey] = CONSTANTS.SORT_STATE.ASC;
        } else if (sCurrSortState === CONSTANTS.SORT_STATE.ASC) {
          oNewSortFieldsObj[sSortModelKey] = CONSTANTS.SORT_STATE.DESC;
        }

        oAppViewModel.setProperty("/productsSortStates", oNewSortFieldsObj);

        oProductsBinding.refresh();

        if (oNewSortFieldsObj[sSortModelKey] === CONSTANTS.SORT_STATE.DEFAULT) {
          oProductsBinding.sort([]);
        } else {
          const oSorter = new Sorter(
            this.findServerKeyByModelKey(CONSTANTS.SORT_PROP, sSortModelKey),
            oNewSortFieldsObj[sSortModelKey] === CONSTANTS.SORT_STATE.DESC,
            undefined,
            this.sorterComparator
          );
          oProductsBinding.sort(oSorter);
        }
      },

      /**
       * Handles press event of create product button
       * @public
       */
      onCreateProductBtnPress: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oEntryCtx = oODataModel.createEntry("/Products", {
          properties: {
            [CONSTANTS.PRODUCT_PROP.STATUS]: CONSTANTS.STATUS.OK.SERVER_KEY,
            [CONSTANTS.PRODUCT_PROP.STORE_ID]: oAppViewModel.getProperty("/currStoreId"),
          },
        });

        oAppViewModel.setProperty(
          "/currProductFormTitle",
          this.getTextFromResourceModel(CONSTANTS.I18N_KEY.CREATE_NEW_PRODUCT)
        );
        oAppViewModel.setProperty(
          "/currProductFormConfirmBtn",
          this.getTextFromResourceModel(CONSTANTS.I18N_KEY.CREATE)
        );

        this.loadFormFragmentByName(CONSTANTS.FORM_NAME.PRODUCT);

        this.oForm.setBindingContext(oEntryCtx);

        this.oForm.open();
      },

      /**
       * Handles press event of edit product button
       * @public
       */
      onEditProductBtnPress: function (oEvent) {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oCtx = oEvent.getSource().getBindingContext(CONSTANTS.MODEL.ODATA);

        oAppViewModel.setProperty(
          "/currProductFormTitle",
          this.getTextFromResourceModel(CONSTANTS.I18N_KEY.EDIT_PRODUCT)
        );
        oAppViewModel.setProperty(
          "/currProductFormConfirmBtn",
          this.getTextFromResourceModel(CONSTANTS.I18N_KEY.EDIT)
        );

        this.loadFormFragmentByName(CONSTANTS.FORM_NAME.PRODUCT);

        this.oForm.setBindingContext(oCtx);

        this.oForm.open();
      },

      /**
       * Handles press event of confirm button inside product form (either create or edit)
       * @public
       */
      onProductFormConfirmBtnPress: function () {
        if (!this.isFormValid(CONSTANTS.FORM_FIELD.PRODUCT)) {
          return;
        }

        const oControllerContext = this;
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const formIsCreating =
          oAppViewModel.getProperty("/currProductFormTitle") ===
          this.getTextFromResourceModel(CONSTANTS.I18N_KEY.CREATE_NEW_PRODUCT);

        oODataModel.submitChanges({
          // These two functions will only be called when we will start using batch
          success: function () {
            const sMsgSuccess = oControllerContext.getTextFromResourceModel(
              formIsCreating
                ? CONSTANTS.I18N_KEY.PRODUCT_CREATE_SUCCESS
                : CONSTANTS.I18N_KEY.PRODUCT_EDIT_SUCCESS
            );
            MessageToast.show(sMsgSuccess);
          },
          error: function () {
            const sMsgError = oControllerContext.getTextFromResourceModel(
              formIsCreating
                ? CONSTANTS.I18N_KEY.PRODUCT_CREATE_ERROR
                : CONSTANTS.I18N_KEY.PRODUCT_EDIT_ERROR
            );
            MessageBox.error(sMsgError);
          },
        });

        this.oForm.close();
      },

      /**
       * Handles press event of cancel button that is located inside product form
       * @public
       */
      onProductFormCancelBtnPress: function () {
        this.oForm.close();
      },

      /**
       * Handles afterClose event of product form
       * @public
       */
      onProductFormAfterClose: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oProductsBinding = this.byId(CONSTANTS.ID.PRODUCTS_TABLE).getBinding("items");

        // This reset called Any time when the dialog is closing (even after confirmation)
        // For some reason my model does not release data after submitChanges(), may be because of server behaviour,
        // so I call resetChanges() after submitChanges() not to duplicate some stores, products or comments
        oODataModel.resetChanges();

        // For some reason server does not update my list (by additional GET request) after submitChanges()
        // That is why I have to refresh it by myself after some time
        setTimeout(() => oProductsBinding.refresh(), 100);

        this.clearFormValueStates(CONSTANTS.FORM_FIELD.PRODUCT);
        this.getMsgManager().removeAllMessages();
      },

      /**
       * Handles press event of delete store button
       * @public
       */
      onDeleteStoreBtnPress: function () {
        const oControllerContext = this;
        const sConfirmationMsg = this.getTextFromResourceModel(
          CONSTANTS.I18N_KEY.STORE_DELETE_CONFIRMATION
        );

        MessageBox.confirm(sConfirmationMsg, {
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              const oODataModel = oControllerContext.getModel(CONSTANTS.MODEL.ODATA);
              const sKey = oControllerContext.getCurrStorePath();

              oODataModel.remove(sKey, {
                success: function () {
                  const sMsgSuccess = oControllerContext.getTextFromResourceModel(
                    CONSTANTS.I18N_KEY.STORE_DELETE_SUCCESS
                  );
                  MessageToast.show(sMsgSuccess, {
                    closeOnBrowserNavigation: false,
                  });
                  oControllerContext.onStoresListLinkPress();
                },
                error: function () {
                  const sMsgError = oControllerContext.getTextFromResourceModel(
                    CONSTANTS.I18N_KEY.STORE_DELETE_ERROR
                  );
                  MessageBox.error(sMsgError);
                },
              });
            }
          },
        });
      },

      /**
       * Handles press event of delete product button
       * @public
       */
      onDeleteProductBtnPress: function (oEvent) {
        const oControllerContext = this;
        const oCtx = oEvent.getSource().getBindingContext(CONSTANTS.MODEL.ODATA);
        const sConfirmationMsg = this.getTextFromResourceModel(
          CONSTANTS.I18N_KEY.PRODUCT_DELETE_CONFIRMATION
        );

        MessageBox.confirm(sConfirmationMsg, {
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              const oODataModel = oCtx.getModel();
              const sKey = oODataModel.createKey("/Products", oCtx.getObject());

              oODataModel.remove(sKey, {
                success: function () {
                  const sMsgSuccess = oControllerContext.getTextFromResourceModel(
                    CONSTANTS.I18N_KEY.PRODUCT_DELETE_SUCCESS
                  );
                  MessageToast.show(sMsgSuccess);
                },
                error: function () {
                  const sMsgError = oControllerContext.getTextFromResourceModel(
                    CONSTANTS.I18N_KEY.PRODUCT_DELETE_ERROR
                  );
                  MessageBox.error(sMsgError);
                },
              });
            }
          },
        });
      },

      /**
       * Sorting comparator which can compare either string type items or number type items
       * @param {string|number} a the first item to compare
       * @param {string|number} b the second item to compare
       * @returns {number} the number which indicates if the first item is larger than the second item or not
       * @public
       */
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

      /**
       * Finds and returns needed field server key of the entity via given object to be searched and field AppViewModel key;
       * it is assumed that the values of transmitted object must contain the fields MODEL_KEY and SERVER_KEY
       * @param {Object.<string, Object<string, string>>} oObjForSearch object containing objects to be searched on needed key
       * @param {string} sModelKey the key of the field that is declared in AppViewModel
       * @returns {?string} needed server key of the field or null if the key is not found
       * @public
       */
      findServerKeyByModelKey: function (oObjForSearch, sModelKey) {
        for (const sKey in oObjForSearch) {
          if (oObjForSearch[sKey].MODEL_KEY === sModelKey) {
            return oObjForSearch[sKey].SERVER_KEY;
          }
        }
        return null;
      },

      /**
       * Sets all AppViewModel states and all controls values to default
       * @public
       */
      setAllControlsToDefault: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        oAppViewModel.setProperty("/currStoreId", null);
        oAppViewModel.setProperty("/currProductsStatusFilter", CONSTANTS.STATUS.ALL.SERVER_KEY);
        oAppViewModel.setProperty("/currProductsSearchFilter", "");
        oAppViewModel.setProperty("/productsSortStates", this.getNewSortObj());
        const oProductsBinding = this.byId(CONSTANTS.ID.PRODUCTS_TABLE).getBinding("items");
        oProductsBinding.filter([]);
        oProductsBinding.sort([]);
      },

      /**
       * Handles press event of link to the stores list
       * @public
       */
      onStoresListLinkPress: function () {
        this.setAllControlsToDefault();

        this.navTo(CONSTANTS.ROUTE.STORES_OVERVIEW);
      },

      /**
       * Handles press event of products table item
       * @param {sap.ui.base.Event} oEvent oEvent event object
       * @public
       */
      onProductPress: function (oEvent) {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const nStoreId = oAppViewModel.getProperty("/currStoreId");
        const nProductId = this.getBindingContextData(CONSTANTS.PRODUCT_PROP.ID, oEvent);

        this.setAllControlsToDefault();

        this.navTo(CONSTANTS.ROUTE.PRODUCT_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
          [CONSTANTS.ROUTE.PAYLOAD.PRODUCT_ID]: nProductId,
        });
      },
    });
  }
);
