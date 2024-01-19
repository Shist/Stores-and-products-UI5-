sap.ui.define(
  [
    "pavel/zhukouski/data/constants",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (CONSTANTS, Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("pavel.zhukouski.controller.ProductDetails", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute(CONSTANTS.ROUTE.PRODUCT_DETAILS)
          .attachPatternMatched(this.onRouterPatternMatched, this);
      },

      onExit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute(CONSTANTS.ROUTE.PRODUCT_DETAILS)
          .detachPatternMatched(this.onRouterPatternMatched, this);
      },

      onRouterPatternMatched: function (oEvent) {
        const oControllerContext = this;
        const sProductId = oEvent.getParameter("arguments").productId;
        const oODataModel = this.getView().getModel(CONSTANTS.MODEL.ODATA);

        oODataModel.metadataLoaded().then(function () {
          const sKey = oODataModel.createKey("/Products", { id: sProductId });

          oControllerContext.getView().bindObject({
            path: sKey,
            model: CONSTANTS.MODEL.ODATA,
          });

          const oCommentsBinding = oControllerContext
            .byId(CONSTANTS.ID.COMMENTS_LIST)
            .getBinding("items");

          oCommentsBinding.refresh();

          oCommentsBinding.filter(
            new Filter({
              path: CONSTANTS.COMMENT_PROP.PRODUCT_ID,
              operator: FilterOperator.EQ,
              value1: sProductId,
              comparator: (a, b) => a - b,
            })
          );
        });
      },

      formatBadgeType: function (sStatus) {
        switch (sStatus) {
          case CONSTANTS.STATUS.OK.SERVER_KEY:
            return 8;
          case CONSTANTS.STATUS.STORAGE.SERVER_KEY:
            return 1;
          case CONSTANTS.STATUS.OUT_OF_STOCK.SERVER_KEY:
            return 3;
          default:
            if (sStatus) {
              console.warn(`Got unknown type of product status: ${sStatus}`);
            }
            return 10;
        }
      },

      onStoresListLinkPress: function () {
        this.getOwnerComponent()
          .getRouter()
          .navTo(CONSTANTS.ROUTE.STORES_OVERVIEW);
      },

      onStoreDetailsLinkPress: function () {
        const nStoreId = this.getView()
          .getBindingContext(CONSTANTS.MODEL.ODATA)
          .getObject(CONSTANTS.PRODUCT_PROP.STORE_ID);

        this.getOwnerComponent()
          .getRouter()
          .navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
            [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
          });
      },
    });
  }
);
