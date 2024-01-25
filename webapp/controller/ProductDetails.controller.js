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
      /**
       * Field for storing formatter that is needed for status InfoLabel formatting
       * @type {Object}
       * @public
       */
      formatter: formatter,

      /**
       * This method is called upon initialization of the View; it is only called once per View instance
       * @public
       */
      onInit: function () {
        this.getRoute(CONSTANTS.ROUTE.PRODUCT_DETAILS).attachPatternMatched(
          this.onRouterPatternMatched,
          this
        );
      },

      /**
       * This method is called upon desctuction of the view
       * @public
       */
      onExit: function () {
        this.getRoute(CONSTANTS.ROUTE.PRODUCT_DETAILS).detachPatternMatched(
          this.onRouterPatternMatched,
          this
        );
      },

      /**
       * Handles the patternMatched event of sap.ui.core.routing.Route; calls every time pattern is matched
       * @param {sap.ui.base.Event} oEvent oEvent event object
       * @public
       */
      onRouterPatternMatched: function (oEvent) {
        const oControllerContext = this;
        const sStoreId = oEvent.getParameter("arguments")[CONSTANTS.ROUTE.PAYLOAD.STORE_ID];
        const sProductId = oEvent.getParameter("arguments")[CONSTANTS.ROUTE.PAYLOAD.PRODUCT_ID];
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);

        oAppViewModel.setProperty("/currStoreId", sStoreId);
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

          oCommentsBinding.filter(
            new Filter({
              path: CONSTANTS.COMMENT_PROP.PRODUCT_ID,
              operator: FilterOperator.EQ,
              value1: sProductId,
            })
          );

          oCommentsBinding.sort(
            new Sorter(CONSTANTS.COMMENT_PROP.POSTED, CONSTANTS.SORT_STATE.ASC)
          );
        });
      },

      /**
       * Handles press event for post button inside FeedInput control
       * @public
       */
      onPostBtnPress: function () {
        const oControllerContext = this;
        const oODataModel = this.getView().getModel(CONSTANTS.MODEL.ODATA);
        const oCommentsBinding = this.byId(CONSTANTS.ID.COMMENTS_LIST).getBinding("items");
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const currAuthor = oAppViewModel.getProperty("/currAuthorName");
        const currMessage = oAppViewModel.getProperty("/currCommentMsg");
        const currRating = oAppViewModel.getProperty("/currCommentRating");

        if (!currAuthor) {
          const sMsgWarning = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.EMPTY_AUTHOR_WARNING
          );
          MessageBox.warning(sMsgWarning);
          return;
        }

        oAppViewModel.setProperty("/currAuthorName", "");
        oAppViewModel.setProperty("/currCommentRating", 0);

        oODataModel.createEntry("/ProductComments", {
          properties: {
            [CONSTANTS.COMMENT_PROP.AUTHOR]: currAuthor,
            [CONSTANTS.COMMENT_PROP.MESSAGE]: currMessage,
            [CONSTANTS.COMMENT_PROP.RATING]: currRating ? currRating : undefined,
            [CONSTANTS.COMMENT_PROP.POSTED]: new Date(),
            [CONSTANTS.COMMENT_PROP.PRODUCT_ID]: oAppViewModel.getProperty("/currProductId"),
          },
        });

        oODataModel.submitChanges({
          // These two functions will only be called when we will start using batch
          success: function () {
            const sMsgSuccess = oControllerContext.getTextFromResourceModel(
              CONSTANTS.I18N_KEY.COMMENT_POST_SUCCESS
            );
            MessageToast.show(sMsgSuccess);
          },
          error: function () {
            const sMsgError = oControllerContext.getTextFromResourceModel(
              CONSTANTS.I18N_KEY.COMMENT_POST_ERROR
            );
            MessageBox.error(sMsgError);
          },
        });

        // For some reason my model does not release data after submitChanges(), may be because of server behaviour,
        // so I call resetChanges() after submitChanges() not to duplicate some stores, products or comments
        oODataModel.resetChanges();

        // For some reason server does not update my list (by additional GET request) after submitChanges()
        // That is why I have to refresh it by myself after some time
        setTimeout(() => oCommentsBinding.refresh(), 200);
      },

      /**
       * Sets all AppViewModel states (and therefore all controls values) to default
       * @public
       */
      setAllControlsToDefault: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        oAppViewModel.setProperty("/currStoreId", null);
        oAppViewModel.setProperty("/currProductId", null);
        oAppViewModel.setProperty("/currAuthorName", "");
        oAppViewModel.setProperty("/currCommentRating", 0);
        oAppViewModel.setProperty("/currCommentMsg", "");
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
       * Handles press event of link to the products table
       * @public
       */
      onStoreDetailsLinkPress: function () {
        const oAppViewModel = this.getModel(CONSTANTS.MODEL.APP_VIEW);
        const nStoreId = oAppViewModel.getProperty("/currStoreId");

        this.setAllControlsToDefault();

        this.navTo(CONSTANTS.ROUTE.STORE_DETAILS, {
          [CONSTANTS.ROUTE.PAYLOAD.STORE_ID]: nStoreId,
        });
      },
    });
  }
);
