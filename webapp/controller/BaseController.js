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
      /**
       * Gets the router of current owner component
       * @returns {sap.ui.core.routing.Router} the router instance
       * @public
       */
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * Navigates to a specific route with given payload
       * @param {string} sRouteName the name of the route
       * @param {Object} [oPayload] the payload for the route
       * @returns {sap.ui.core.routing.Router} self object (for chaining ability)
       * @public
       */
      navTo: function (sRouteName, oPayload) {
        return this.getRouter().navTo(sRouteName, oPayload);
      },

      /**
       * Returns the route with the given name or undefined if no route is found
       * @param {string} sRoute name of the route
       * @returns {sap.ui.core.routing.Route|undefined} route with the provided name or undefined
       * @public
       */
      getRoute: function (sRoute) {
        return this.getRouter().getRoute(sRoute);
      },

      /**
       * Gets the model to be used for data bindings with the given model name
       * @param {string} sModelName name of the model to be retrieved
       * @returns {sap.ui.model.Model|undefined} oModel or undefined when there is no such model
       * @public
       */
      getModel: function (sModelName) {
        return this.getView().getModel(sModelName);
      },

      /**
       * Returns a locale-specific string value for the given key sTextKey and arguments aArgs
       * @param {string} sTextKey key to retrieve the text for
       * @param {Array.<*>} [aArgs] List of parameter values which should replace the placeholders
       * "{n}" (n is the index) in the found locale-specific string value
       * @returns {string|undefined} The value belonging to the key, if found; otherwise the key itself
       * or undefined depending on bIgnoreKeyFallback
       * @public
       */
      getTextFromResourceModel: function (sTextKey, aArgs) {
        return this.getModel(CONSTANTS.MODEL.I18N).getResourceBundle().getText(sTextKey, aArgs);
      },

      /**
       * Gets the (model dependent) object the context points to or the object with the given relative binding path,
       * if an optional oEvent argument is passed, then the context is taken not from the View, but from the event object
       * @param {string} [sProperty] the binding path with needed property
       * @param {sap.ui.base.Event} [oEvent] oEvent event object
       * @returns {Object|undefined} The context object or undefined if there is no context or no object
       * or undefined depending on bIgnoreKeyFallback
       * @public
       */
      getBindingContextData: function (sProperty, oEvent) {
        if (oEvent) {
          return oEvent.getSource().getBindingContext(CONSTANTS.MODEL.ODATA)?.getObject(sProperty);
        } else {
          return this.getView().getBindingContext(CONSTANTS.MODEL.ODATA)?.getObject(sProperty);
        }
      },

      /**
       * Returns the Messaging module
       * @returns {sap.ui.core.Messaging} the Messaging module
       * @public
       */
      getMsgManager: function () {
        return sap.ui.getCore().getMessageManager();
      },

      /**
       * Registers current view to the messageManager setting bHandleValidation as 'true'
       * @public
       */
      registerViewToMessageManager: function () {
        this.getMsgManager().registerObject(this.getView(), true);
      },

      /**
       * Checks if value of search input valid or not
       * @param {string} sSearchFieldId the identifier of search input to check
       * @returns {boolean} valid or not
       * @public
       */
      isSearchFieldValid: function (sSearchFieldId) {
        return /^[^#%&*()\[\]{}\\]*$/.test(this.byId(sSearchFieldId).getValue());
      },

      /**
       * Checks if messageManager has any errors at the moment
       * @returns {boolean} messageManager has any errors or not
       * @public
       */
      msgManagerHasErrors: function () {
        return !!this.getMsgManager().getMessageModel().oData.length;
      },

      /**
       * Handles change event for the form field, the main idea of this function
       * is to clear error state and message if it was that the field is manadatory;
       * in other error cases messageManager will clear state without our intervention
       * @param {sap.ui.base.Event} oEvent oEvent event object
       * @public
       */
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

      /**
       * Clears states and state messages for all fields of needed form; this function is needed for those
       * states and state messages that were not set by messageManager (errors about emptiness of fields)
       * @param {Object.<string, string>} oFormFieldsIDs object with constants containing fields identifiers of needed form
       * @public
       */
      clearFormValueStates(oFormFieldsIDs) {
        Object.values(oFormFieldsIDs).forEach((sFieldId) => {
          const oField = this.byId(sFieldId);

          oField.setValueState(ValueState.None);
          oField.setValueStateText(undefined);
        });
      },

      /**
       * Checks if the needed form has any empty fields; this function is needed for checking
       * emptiness of fields as messageManager can not register this error without user intercation
       * @param {Object.<string, string>} oFormFieldsIDs object with constants containing fields identifiers of needed form
       * @returns {boolean} the needed form has any empty fields or not
       * @public
       */
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

      /**
       * Checks if needed form has any errors (either about emptiness or messageManager errors)
       * @param {Object.<string, string>} oFormFieldsIDs object with constants containing fields identifiers of needed form
       * @returns {boolean} is needed form valid or not
       * @public
       */
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

      /**
       * Loads a fragment with given sFragmentName, adds it to current view and sets OData model for it
       * @param {string} sFragmentName the name of a fragment to be loaded
       * @public
       */
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
