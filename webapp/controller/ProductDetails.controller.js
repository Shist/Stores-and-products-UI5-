sap.ui.define(
  [
    "pavel/zhukouski/controller/BaseController",
    "pavel/zhukouski/model/constants",
    "pavel/zhukouski/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, CONSTANTS, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("pavel.zhukouski.controller.ProductDetails", {
      formatter: formatter,

      onInit: function () {
        this.getRoute(CONSTANTS.ROUTE.PRODUCT_DETAILS).attachPatternMatched(
          this.onRouterPatternMatched,
          this
        );
      },

      onExit: function () {
        this.getRoute(CONSTANTS.ROUTE.PRODUCT_DETAILS).detachPatternMatched(
          this.onRouterPatternMatched,
          this
        );
      },

      onRouterPatternMatched: function (oEvent) {
        const oControllerContext = this;
        const sProductId = oEvent.getParameter("arguments").productId;
        const oODataModel = this.getODataModel();

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

      onStoresListLinkPress: function () {
        this.navTo(CONSTANTS.ROUTE.STORES_OVERVIEW);
      },

      onStoreDetailsLinkPress: function () {
        const nStoreId = this.getBindingContextData(
          CONSTANTS.PRODUCT_PROP.STORE_ID
        );

        this.navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
        });
      },
    });
  }
);
