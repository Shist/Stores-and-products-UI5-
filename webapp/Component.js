sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
  "use strict";

  return UIComponent.extend("pavel.zhukouski.Component", {
    metadata: {
      manifest: "json",
    },

    init: function () {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      this.getRouter().initialize();

      window.oDataModel = this.getModel("odata"); // <-- TODO: Remove this after debugging
      window.appViewModel = this.getModel("appView"); // <-- TODO: Remove this after debugging
    },
  });
});
