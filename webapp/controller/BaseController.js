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

      loadFragmentByName: function (sFragmentName) {
        const oView = this.getView();

        if (!this.oDialog) {
          this.oDialog = sap.ui.xmlfragment(
            oView.getId(),
            `pavel.zhukouski.view.fragments.${sFragmentName}`,
            this
          );

          oView.addDependent(this.oDialog);
        }

        this.oDialog.open();
      },

      onDialogCancelBtnPress: function () {
        if (this.oDialog) {
          this.oDialog.close();
        }
      },

      onDialogAfterClose: function (sAppViewPath) {
        const oAppViewModel = this.getAppViewModel();
        const oNewFormStatesObj = JSON.parse(
          JSON.stringify(oAppViewModel.getProperty(sAppViewPath))
        );

        for (const sKey in oNewFormStatesObj) {
          oNewFormStatesObj[sKey] = "";
        }
        oAppViewModel.setProperty(sAppViewPath, oNewFormStatesObj);

        sap.ui.getCore().getMessageManager().removeAllMessages();
      },
    });
  }
);
