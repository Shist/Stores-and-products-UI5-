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

      // onDialogCancelPress: function () {
      //   if (this.oDialog) {
      //     console.log("closing dialog from baseController!!!");
      //     this.oDialog.close();
      //   }
      // },
    });
  }
);
