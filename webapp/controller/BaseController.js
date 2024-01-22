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

      getModel: function (sModelName) {
        return this.getView().getModel(sModelName);
      },

      // aArgs parameter is optional and used for i18n strings with placeholders
      getTextFromResourceModel: function (sTextKey, aArgs) {
        return this.getModel(CONSTANTS.MODEL.I18N)
          .getResourceBundle()
          .getText(sTextKey, aArgs);
      },

      // Both parameters (sProperty, oEvent) are optional
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
        sap.ui
          .getCore()
          .getMessageManager()
          .registerObject(this.getView(), true);
      },

      isSearchFieldValid: function (sSearchFieldId) {
        return /^[^#%&*()\[\]{}\\]*$/.test(
          this.byId(sSearchFieldId).getValue()
        );
      },

      msgManagerHasErrors: function () {
        if (
          sap.ui.getCore().getMessageManager().getMessageModel().oData.length
        ) {
          return true;
        } else {
          return false;
        }
      },

      // This function can load one of 3 forms (createStpre, createProduct, editProduct)
      loadFormFragmentByName: function (sFragmentName) {
        const oView = this.getView();

        if (!this.oDialog) {
          this.oDialog = sap.ui.xmlfragment(
            oView.getId(),
            `pavel.zhukouski.view.fragments.${sFragmentName}`,
            this
          );

          oView.addDependent(this.oDialog);
        }

        this.oDialog.setModel(this.getModel(CONSTANTS.MODEL.ODATA));
      },
    });
  }
);
