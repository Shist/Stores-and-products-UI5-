sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.ThirdPage", {
    onNavToFirst: function () {
      this.getOwnerComponent().getRouter().navTo("FirstPage");
    },
  });
});
