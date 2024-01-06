sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("pavel.zhukouski.controller.SecondPage", {
    onNavToThird: function () {
      this.getOwnerComponent()
        .getRouter()
        .navTo("ThirdPage", { firstId: 1, secondId: 2 });
    },
    onNavToFirst: function () {
      this.getOwnerComponent().getRouter().navTo("FirstPage");
    },
  });
});
