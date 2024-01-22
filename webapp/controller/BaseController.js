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

      getModel: function (modelName) {
        return this.getView().getModel(modelName);
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

      msgManagerHasErrors: function () {
        const oMessageManager = sap.ui.getCore().getMessageManager();
        if (oMessageManager.getMessageModel().oData.length) {
          return true;
        } else {
          return false;
        }
      },

      // This function can load one of 3 forms (createStpre, createProduct, editProduct)
      loadFormFragmentByName: function (fragmentName) {
        const oView = this.getView();
        const oODataModel = this.getModel(CONSTANTS.MODEL.ODATA);

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
    });
  }
);
