sap.ui.define(
  ["sap/ui/core/mvc/Controller", "pavel/zhukouski/model/constants"],
  function (Controller, CONSTANTS) {
    "use strict";

    return Controller.extend("pavel.zhukouski.controller.BaseController", {
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      navTo: function (sRouteName, oPayload) {
        return this.getRouter().navTo(sRouteName, oPayload);
      },

      getRoute: function (sRoute) {
        return this.getRouter().getRoute(sRoute);
      },

      getAppViewModel: function () {
        return this.getView().getModel(CONSTANTS.MODEL.APP_VIEW);
      },

      getODataModel: function () {
        return this.getView().getModel(CONSTANTS.MODEL.ODATA);
      },

      getBindingContextData: function (sProperty, oEvent) {
        if (oEvent) {
          return oEvent
            .getSource()
            .getBindingContext(CONSTANTS.MODEL.ODATA)
            .getObject(sProperty);
        } else {
          return this.getView()
            .getBindingContext(CONSTANTS.MODEL.ODATA)
            .getObject(sProperty);
        }
      },

      registerViewToMessageManager: function () {
        const oMessageManager = sap.ui.getCore().getMessageManager();
        oMessageManager.registerObject(this.getView(), true);
      },

      isSearchFieldValid: function (searchFieldId) {
        const oSearchField = this.byId(searchFieldId);

        return /^[^#%&*()\[\]{}\\]*$/.test(oSearchField.getValue());
      },

      // This function can load one of 3 forms (createStpre, createProduct, editProduct)
      loadFormFragmentByName: function (fragmentName) {
        const oView = this.getView();
        const oODataModel = this.getODataModel();

        if (!this.oDialog) {
          this.oDialog = sap.ui.xmlfragment(
            oView.getId(),
            `pavel.zhukouski.view.fragments.${fragmentName}`,
            this
          );

          oView.addDependent(this.oDialog);
        }

        this.oDialog.setModel(oODataModel);
      },

      // This function is used by all 3 forms (when each of them is closing)
      onFormAfterClose: function () {
        const oODataModel = this.getODataModel();

        // This reset called Any time when the dialog is closing (even after confirmation)
        // For some reason my model does not release data after submitChanges(), may be because of server behaviour,
        // so I call resetChanges() after submitChanges() not to duplicate some stores, products or comments
        oODataModel.resetChanges();

        sap.ui.getCore().getMessageManager().removeAllMessages();
      },
    });
  }
);
