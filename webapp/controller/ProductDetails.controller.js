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

          oCommentsBinding.sort(new Sorter("Posted", CONSTANTS.SORT_STATE.ASC));
        });
      },

      onPostBtnPress: function () {
        const oODataModel = this.getODataModel();
        const oCommentsBinding = this.byId(
          CONSTANTS.ID.COMMENTS_LIST
        ).getBinding("items");
        const oAppViewModel = this.getAppViewModel();
        const currAuthor = oAppViewModel.getProperty("/currAuthorName");
        const currMessage = oAppViewModel.getProperty("/currCommentMsg");
        const currRating = oAppViewModel.getProperty("/currRating");

        if (!currAuthor) {
          MessageBox.warning("You should enter your name before making post!");
          return;
        }

        oAppViewModel.setProperty("/currAuthorName", "");
        oAppViewModel.setProperty("/currRating", 0);

        oODataModel.createEntry("/ProductComments", {
          properties: {
            ID: new Date().getTime().toString().slice(7),
            Author: currAuthor,
            Message: currMessage,
            Rating: currRating ? currRating : undefined,
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

      setAllControlsToDefault: function () {
        const oAppViewModel = this.getAppViewModel();
        oAppViewModel.setProperty("/currProductId", null);
        oAppViewModel.setProperty("/currAuthorName", "");
        oAppViewModel.setProperty("/currRating", 0);
        oAppViewModel.setProperty("/currCommentMsg", "");
      },

      onStoresListLinkPress: function () {
        this.setAllControlsToDefault();

        this.navTo(CONSTANTS.ROUTE.STORES_OVERVIEW);
      },

      onStoreDetailsLinkPress: function () {
        const nStoreId = this.getBindingContextData(
          CONSTANTS.PRODUCT_PROP.STORE_ID
        );

        this.setAllControlsToDefault();

        this.navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
        });
      },
    });
  }
);
