sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "pavel/zhukouski/model/constants",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
  ],
  function (Controller, CONSTANTS, MessageBox, ValueState) {
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
        return this.getModel(CONSTANTS.MODEL.I18N).getResourceBundle().getText(sTextKey, aArgs);
      },

      // Both parameters (sProperty, oEvent) are optional
      getBindingContextData: function (sProperty, oEvent) {
        if (oEvent) {
          return oEvent.getSource().getBindingContext(CONSTANTS.MODEL.ODATA).getObject(sProperty);
        } else {
          return this.getView().getBindingContext(CONSTANTS.MODEL.ODATA).getObject(sProperty);
        }
      },

      getMsgManager: function () {
        return sap.ui.getCore().getMessageManager();
      },

      registerViewToMessageManager: function () {
        this.getMsgManager().registerObject(this.getView(), true);
      },

      isSearchFieldValid: function (sSearchFieldId) {
        return /^[^#%&*()\[\]{}\\]*$/.test(this.byId(sSearchFieldId).getValue());
      },

      msgManagerHasErrors: function () {
        return !!this.getMsgManager().getMessageModel().oData.length;
      },

      onFormFieldChange: function (oEvent) {
        const oField = oEvent.getSource();
        const sEmptyFieldError = this.getTextFromResourceModel(
          CONSTANTS.I18N_KEY.FIELD_IS_MANADATORY
        );

        if (oField.getValueStateText() === sEmptyFieldError) {
          oField.setValueState(ValueState.None);
          oField.setValueStateText(undefined);
        }
      },

      clearFormValueStates(oFormFieldsIDs) {
        Object.values(oFormFieldsIDs).forEach((sFieldId) => {
          const oField = this.byId(sFieldId);

          oField.setValueState(ValueState.None);
          oField.setValueStateText(undefined);
        });
      },

      formHasEmptyFields(oFormFieldsIDs) {
        const sEmptyFieldError = this.getTextFromResourceModel(
          CONSTANTS.I18N_KEY.FIELD_IS_MANADATORY
        );
        let bFormHasEmptyFields = false;

        Object.values(oFormFieldsIDs).forEach((sFieldId) => {
          const oField = this.byId(sFieldId);

          if (oField.getValue() === "") {
            bFormHasEmptyFields = true;

            oField.setValueState(ValueState.Error);
            oField.setValueStateText(sEmptyFieldError);
          }
        });

        return bFormHasEmptyFields;
      },

      isFormValid: function (oFormFieldsIDs) {
        if (this.formHasEmptyFields(oFormFieldsIDs) || this.msgManagerHasErrors()) {
          const sMsgError = this.getTextFromResourceModel(
            CONSTANTS.I18N_KEY.FIX_VALIDATION_ERRORS_MSG
          );
          MessageBox.error(sMsgError);
          return false;
        }

        return true;
      },

      // This function can load one of two forms: StoreForm or ProductForm
      loadFormFragmentByName: function (sFragmentName) {
        const oView = this.getView();

        if (!this.oForm) {
          this.oForm = sap.ui.xmlfragment(
            oView.getId(),
            `pavel.zhukouski.view.fragments.${sFragmentName}`,
            this
          );

          oView.addDependent(this.oForm);
        }

        this.oForm.setModel(this.getModel(CONSTANTS.MODEL.ODATA));
      },
    });
  }
);
