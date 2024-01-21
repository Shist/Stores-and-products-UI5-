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
        const oProductsBinding = this.byId(
          CONSTANTS.ID.PRODUCTS_TABLE
        ).getBinding("items");
        oProductsBinding.attachDataReceived(this.updateStatusFilters, this);
      },

      onExit: function () {
        this.getRoute(CONSTANTS.ROUTE.STORE_DETAILS).detachPatternMatched(
          this.onRouterPatternMatched,
          this
        );

        const oProductsBinding = this.byId(
          CONSTANTS.ID.PRODUCTS_TABLE
        ).getBinding("items");
        oProductsBinding.detachDataReceived(this.updateStatusFilters, this);
      },

      onRouterPatternMatched: function (oEvent) {
        const oControllerContext = this;
        const sStoreId = oEvent.getParameter("arguments").storeId;
        const oODataModel = this.getODataModel();
        const oAppViewModel = this.getAppViewModel();

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
        const oODataModel = this.getODataModel();
        const sStorePath = oODataModel.createKey(
          "/Stores",
          this.getBindingContextData()
        );
        return sStorePath;
      },

      updateStatusFilters: function () {
        const oODataModel = this.getODataModel();
        const oAppViewModel = this.getAppViewModel();
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
        if (!this.isSearchFieldValid("productsSearch")) {
          MessageBox.warning(
            "Please do not use special symbols while searching: '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']', '{', '}', '\\'"
          );
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
        const oAppViewModel = this.getAppViewModel();
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
        const oAppViewModel = this.getAppViewModel();
        const oNewSortStatesObj = JSON.parse(
          JSON.stringify(oAppViewModel.getProperty("/productsSortStates"))
        );

        for (const sKey in oNewSortStatesObj) {
          oNewSortStatesObj[sKey] = CONSTANTS.SORT_STATE.DEFAULT;
        }

        return oNewSortStatesObj;
      },

      onSortBtnPress: function (sSortModelKey) {
        const oAppViewModel = this.getAppViewModel();
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
        const oODataModel = this.getODataModel();
        const oAppViewModel = this.getAppViewModel();

        this.loadFormFragmentByName("CreateProductForm");

        const oEntryCtx = oODataModel.createEntry("/Products", {
          properties: {
            ID: new Date().getTime().toString().slice(7),
            Status: CONSTANTS.STATUS.OK.SERVER_KEY,
            StoreId: oAppViewModel.getProperty("/currStoreId"),
          },
        });

        this.oDialog.setBindingContext(oEntryCtx);

        this.oDialog.open();
      },

      onProductFormCreateBtnPress: function () {
        const oODataModel = this.getODataModel();
        const oProductsBinding = this.byId(
          CONSTANTS.ID.PRODUCTS_TABLE
        ).getBinding("items");

        oODataModel.submitChanges({
          // These two functions will only be called when we will start using batch
          success: function () {
            MessageToast.show("Product was successfully created!");
          },
          error: function () {
            MessageBox.error("Error while creating product!");
          },
        });

        oProductsBinding.refresh();

        this.oDialog.close();
      },

      onEditProductBtnPress: function (oEvent) {
        // TODO
        // const oCtx = oEvent.getSource().getBindingContext("odata");
        // const oView = this.getView();
        // const oODataModel = this.getODataModel();
        // if (!this.oDialog) {
        //   this.oDialog = sap.ui.xmlfragment(
        //     oView.getId(),
        //     `pavel.zhukouski.view.fragments.ProductFormDialog`,
        //     this
        //   );
        //   oView.addDependent(this.oDialog);
        // }
        // this.oDialog.setBindingContext(oCtx);
        // this.oDialog.setModel(oODataModel);
        // this.oDialog.open();
      },

      onProductFormEditBtnPress: function () {
        // TODO
      },

      onDeleteStoreBtnPress: function () {
        const oControllerContext = this;

        MessageBox.confirm("Are you sure you want to delete store?", {
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              const oODataModel = oControllerContext.getODataModel();
              const sKey = oControllerContext.getCurrStorePath();

              oODataModel.remove(sKey, {
                success: function () {
                  MessageToast.show("Store was successfully deleted!", {
                    closeOnBrowserNavigation: false,
                  });
                  oControllerContext.onStoresListLinkPress();
                },
                error: function () {
                  MessageBox.error("Error while removing store!");
                },
              });
            }
          },
        });
      },

      onDeleteProductBtnPress: function (oEvent) {
        const oCtx = oEvent.getSource().getBindingContext("odata");

        MessageBox.confirm("Are you sure you want to delete product?", {
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              const oODataModel = oCtx.getModel();
              const sKey = oODataModel.createKey("/Products", oCtx.getObject());

              oODataModel.remove(sKey, {
                success: function () {
                  MessageToast.show("Product was successfully deleted!");
                },
                error: function () {
                  MessageBox.error("Error while removing product!");
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
        const oAppViewModel = this.getAppViewModel();
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
