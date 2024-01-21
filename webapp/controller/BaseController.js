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

      loadFormDialog: function (fragmentName, entryPath) {
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

        const oEntryCtx = oODataModel.createEntry(entryPath, {
          properties: {
            ID: new Date().getTime().toString().slice(7),
          },
        });

        this.oDialog.setBindingContext(oEntryCtx);

        this.oDialog.setModel(oODataModel);

        this.oDialog.open();
      },

      onDialogCreateBtnPress: function () {
        const oODataModel = this.getODataModel();

        oODataModel.submitChanges();

        this.oDialog.close();
      },

      onDialogCancelBtnPress: function () {
        const oODataModel = this.getODataModel();
        const oCtx = this.oDialog.getBindingContext();

        oODataModel.deleteCreatedEntry(oCtx);

        this.oDialog.close();
      },

      onDialogAfterClose: function () {
        sap.ui.getCore().getMessageManager().removeAllMessages();
      },
    });
  }
);
