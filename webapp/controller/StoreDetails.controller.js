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
      formatter: formatter,

      onInit: function () {
        this.registerViewToMessageManager();

        this.getRoute(CONSTANTS.ROUTE.STORE_DETAILS).attachPatternMatched(
          this.onRouterPatternMatched,
          this
        );
      },

      onAfterRendering: function () {
        this.byId(CONSTANTS.ID.PRODUCTS_TABLE)
          .getBinding("items")
          .attachDataReceived(this.updateStatusFilters, this);
      },

      onExit: function () {
        this.getRoute(CONSTANTS.ROUTE.STORE_DETAILS).detachPatternMatched(
          this.onRouterPatternMatched,
          this
        );

        this.byId(CONSTANTS.ID.PRODUCTS_TABLE)
          .getBinding("items")
          .detachDataReceived(this.updateStatusFilters, this);
      },

      onRouterPatternMatched: function (oEvent) {
        const oControllerContext = this;
        const sStoreId =
          oEvent.getParameter("arguments")[CONSTANTS.ROUTE.PAYLOAD.STORE_ID];
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

      getCurrStorePath: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const sStorePath = oODataModel.createKey(
          "/Stores",
          this.getBindingContextData()
        );
        return sStorePath;
      },

      updateStatusFilters: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oProductsCounts = oAppViewModel.getProperty("/productsCounts");
        const oProductsSearchFilter = this.getProductsSearchFilter();

        Object.keys(oProductsCounts).forEach((sStatusModelKey) => {
          const oParams = {
            success: (sCount) => {
              oAppViewModel.setProperty(
                `/productsCounts/${sStatusModelKey}`,
                sCount
              );
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

          oODataModel.read(
            this.getCurrStorePath() + "/rel_Products/$count",
            oParams
          );
        });
      },

      onFiltersChanged: function () {
        if (!this.isSearchFieldValid(CONSTANTS.ID.PRODUCTS_SEARCH)) {
          const sMsgWarning = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.SEARCH_VALIDATION_WARNING
          );
          MessageBox.warning(sMsgWarning);
          return;
        }

        const oProductsBinding = this.byId(
          CONSTANTS.ID.PRODUCTS_TABLE
        ).getBinding("items");
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
        const sIconTabBarKey = this.byId(
          CONSTANTS.ID.ICON_TAB_BAR
        ).getSelectedKey();

        if (sIconTabBarKey !== CONSTANTS.STATUS.ALL.SERVER_KEY) {
          return new Filter(
            CONSTANTS.PRODUCT_PROP.STATUS,
            FilterOperator.EQ,
            sIconTabBarKey
          );
        } else {
          return null;
        }
      },

      getFilterForStr: function (sServerKey, sSearchValue) {
        return new Filter({
          path: sServerKey,
          operator: FilterOperator.Contains,
          value1: sSearchValue,
          caseSensitive: false,
        });
      },

      getFilterForNum: function (sServerKey, sSearchValue) {
        return new Filter({
          path: sServerKey,
          operator: FilterOperator.EQ,
          value1: sSearchValue,
          comparator: (a, b) => a - b,
        });
      },

      getProductsSearchFilter: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const sQuery = oAppViewModel.getProperty("/currProductsSearchFilter");

        if (!sQuery) {
          return null;
        }

        const aFilters = [];

        aFilters.push(
          this.getFilterForStr(CONSTANTS.SORT_PROP.NAME.SERVER_KEY, sQuery)
        );
        aFilters.push(
          this.getFilterForNum(CONSTANTS.SORT_PROP.PRICE.SERVER_KEY, sQuery)
        );
        aFilters.push(
          this.getFilterForStr(CONSTANTS.SORT_PROP.SPECS.SERVER_KEY, sQuery)
        );
        aFilters.push(
          this.getFilterForStr(
            CONSTANTS.SORT_PROP.SUPPLIER_INFO.SERVER_KEY,
            sQuery
          )
        );
        aFilters.push(
          this.getFilterForStr(CONSTANTS.SORT_PROP.COUNTRY.SERVER_KEY, sQuery)
        );
        aFilters.push(
          this.getFilterForStr(
            CONSTANTS.SORT_PROP.PROD_COMPANY.SERVER_KEY,
            sQuery
          )
        );
        aFilters.push(
          this.getFilterForNum(CONSTANTS.SORT_PROP.RATING.SERVER_KEY, sQuery)
        );

        return new Filter({ filters: aFilters, and: false });
      },

      getNewSortObj: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oNewSortStatesObj = JSON.parse(
          JSON.stringify(oAppViewModel.getProperty("/productsSortStates"))
        );

        for (const sKey in oNewSortStatesObj) {
          oNewSortStatesObj[sKey] = CONSTANTS.SORT_STATE.DEFAULT;
        }

        return oNewSortStatesObj;
      },

      onSortBtnPress: function (sSortModelKey) {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const sCurrSortState = oAppViewModel.getProperty(
          `/productsSortStates/${sSortModelKey}`
        );
        const oProductsBinding = this.byId(
          CONSTANTS.ID.PRODUCTS_TABLE
        ).getBinding("items");

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

      onCreateProductBtnPress: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oEntryCtx = oODataModel.createEntry("/Products", {
          properties: {
            [CONSTANTS.PRODUCT_PROP.ID]: new Date()
              .getTime()
              .toString()
              .slice(7),
            [CONSTANTS.PRODUCT_PROP.STATUS]: CONSTANTS.STATUS.OK.SERVER_KEY,
            [CONSTANTS.PRODUCT_PROP.STORE_ID]:
              oAppViewModel.getProperty("/currStoreId"),
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

      onEditProductBtnPress: function (oEvent) {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const oCtx = oEvent
          .getSource()
          .getBindingContext(CONSTANTS.MODEL.ODATA);

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

      isProductFormValid: function () {
        if (this.msgManagerHasErrors()) {
          const sMsgError = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.FIX_VALIDATION_ERRORS_MSG
          );
          MessageBox.error(sMsgError);
          return false;
        }

        if (!this.byId(CONSTANTS.ID.INPUT_PRODUCT_NAME).getValue()) {
          const sMsgError = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.FIELD_IS_MANADATORY_MSG,
            [CONSTANTS.FORM_FIELD.NAME]
          );
          MessageBox.error(sMsgError);
          return false;
        }

        if (!this.byId(CONSTANTS.ID.TEXTAREA_PRODUCT_SPECS).getValue()) {
          const sMsgError = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.FIELD_IS_MANADATORY_MSG,
            [CONSTANTS.FORM_FIELD.SPECS]
          );
          MessageBox.error(sMsgError);
          return false;
        }

        return true;
      },

      onProductFormConfirmBtnPress: function () {
        if (!this.isProductFormValid()) {
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

      onProductFormCancelBtnPress: function () {
        this.oForm.close();
      },

      onProductFormAfterClose: function () {
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oProductsBinding = this.byId(
          CONSTANTS.ID.PRODUCTS_TABLE
        ).getBinding("items");

        // This reset called Any time when the dialog is closing (even after confirmation)
        // For some reason my model does not release data after submitChanges(), may be because of server behaviour,
        // so I call resetChanges() after submitChanges() not to duplicate some stores, products or comments
        oODataModel.resetChanges();

        // For some reason server does not update my list (by additional GET request) after submitChanges()
        // That is why I have to refresh it by myself after some time
        setTimeout(() => oProductsBinding.refresh(), 100);

        sap.ui.getCore().getMessageManager().removeAllMessages();
      },

      onDeleteStoreBtnPress: function () {
        const oControllerContext = this;
        const sConfirmationMsg = this.getTextFromResourceModel(
          CONSTANTS.I18N_KEY.STORE_DELETE_CONFIRMATION
        );

        MessageBox.confirm(sConfirmationMsg, {
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              const oODataModel = oControllerContext.getModel(
                CONSTANTS.MODEL.ODATA
              );
              const sKey = oControllerContext.getCurrStorePath();

              oODataModel.remove(sKey, {
                success: function () {
                  const sMsgSuccess =
                    oControllerContext.getTextFromResourceModel(
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

      onDeleteProductBtnPress: function (oEvent) {
        const oControllerContext = this;
        const oCtx = oEvent
          .getSource()
          .getBindingContext(CONSTANTS.MODEL.ODATA);
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
                  const sMsgSuccess =
                    oControllerContext.getTextFromResourceModel(
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

      findServerKeyByModelKey: function (oObjForSearch, sModelKey) {
        for (const sKey in oObjForSearch) {
          if (oObjForSearch[sKey].MODEL_KEY === sModelKey) {
            return oObjForSearch[sKey].SERVER_KEY;
          }
        }
        return null;
      },

      setAllControlsToDefault: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        oAppViewModel.setProperty("/currStoreId", null);
        oAppViewModel.setProperty(
          "/currProductsStatusFilter",
          CONSTANTS.STATUS.ALL.SERVER_KEY
        );
        oAppViewModel.setProperty("/currProductsSearchFilter", "");
        oAppViewModel.setProperty("/productsSortStates", this.getNewSortObj());
        const oProductsBinding = this.byId(
          CONSTANTS.ID.PRODUCTS_TABLE
        ).getBinding("items");
        oProductsBinding.filter([]);
        oProductsBinding.sort([]);
      },

      onStoresListLinkPress: function () {
        this.setAllControlsToDefault();

        this.navTo(CONSTANTS.ROUTE.STORES_OVERVIEW);
      },

      onProductPress: function (oEvent) {
        const nStoreId = this.getBindingContextData(CONSTANTS.STORE_PROP.ID);
        const nProductId = this.getBindingContextData(
          CONSTANTS.PRODUCT_PROP.ID,
          oEvent
        );

        this.setAllControlsToDefault();

        this.navTo(CONSTANTS.ROUTE.PRODUCT_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
          [CONSTANTS.ROUTE.PAYLOAD.PRODUCT_ID]: nProductId,
        });
      },
    });
  }
);
