sap.ui.define(
  [
    "pavel/zhukouski/controller/BaseController",
    "pavel/zhukouski/model/constants",
    "pavel/zhukouski/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    BaseController,
    CONSTANTS,
    formatter,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator
  ) {
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
        const oAppViewModel = this.getAppViewModel();

        oAppViewModel.setProperty("/currProductId", sProductId);

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

      onPostBtnPress: function () {
        const oODataModel = this.getODataModel();
        const oAppViewModel = this.getAppViewModel();
        const oCommentsBinding = this.byId(
          CONSTANTS.ID.COMMENTS_LIST
        ).getBinding("items");

        oODataModel.createEntry("/ProductComments", {
          properties: {
            ID: new Date().getTime().toString().slice(7),
            Author: this.byId("authorInput").getValue(),
            Message: this.byId("feedInput").getValue(),
            Rating: this.byId("ratingIndicator").getValue(),
            Posted: new Date(),
            ProductId: oAppViewModel.getProperty("/currProductId"),
          },
        });

        oODataModel.submitChanges({
          // These two functions will only be called when we will start using batch
          success: function () {
            MessageToast.show("Your comment was successfully posted!");
          },
          error: function () {
            MessageBox.error("Error while posting comment!");
          },
        });

        // For some reason my model does not release data after submitChanges(), may be because of server behaviour,
        // so I call resetChanges() after submitChanges() not to duplicate some stores, products or comments
        oODataModel.resetChanges();

        oCommentsBinding.refresh();
      },

      onStoresListLinkPress: function () {
        const oAppViewModel = this.getAppViewModel();

        oAppViewModel.setProperty("/currProductId", null);

        this.navTo(CONSTANTS.ROUTE.STORES_OVERVIEW);
      },

      onStoreDetailsLinkPress: function () {
        const oAppViewModel = this.getAppViewModel();
        const nStoreId = this.getBindingContextData(
          CONSTANTS.PRODUCT_PROP.STORE_ID
        );

        oAppViewModel.setProperty("/currProductId", null);

        this.navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
        });
      },
    });
  }
);
