sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.FirstPage", {
    onNavToSecond: function () {
      this.getOwnerComponent().getRouter().navTo("SecondPage", { firstId: 1 });
    },
  });
});
