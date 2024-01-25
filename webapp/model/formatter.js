sap.ui.define(["pavel/zhukouski/model/constants"], function (CONSTANTS) {
  "use strict";

  return {
    /**
     * Formats the sort button icon based on its state
     * @param {string} sSortState current state of the button (comes from AppViewModel)
     * @returns {string} link to needed sap icon
     * @public
     */
    formatSortBtnIcon: function (sSortState) {
      switch (sSortState) {
        case CONSTANTS.SORT_STATE.DEFAULT:
          return "sap-icon://sort";
        case CONSTANTS.SORT_STATE.ASC:
          return "sap-icon://sort-ascending";
        case CONSTANTS.SORT_STATE.DESC:
          return "sap-icon://sort-descending";
        default:
          console.warn(`Got unknown type of sort state: ${sSortState}`);
          return "sap-icon://sys-help";
      }
    },

    /**
     * Formats the type of sap.tnt.InfoLabel with product status
     * @param {string} sStatus status of the product (comes from ODataModel)
     * @returns {number} value for colorScheme of sap.tnt.InfoLabel
     * @public
     */
    formatBadgeType: function (sStatus) {
      switch (sStatus) {
        case CONSTANTS.STATUS.OK.SERVER_KEY:
          return 8;
        case CONSTANTS.STATUS.STORAGE.SERVER_KEY:
          return 1;
        case CONSTANTS.STATUS.OUT_OF_STOCK.SERVER_KEY:
          return 3;
        default:
          if (sStatus) {
            console.warn(`Got unknown type of product status: ${sStatus}`);
          }
          return 10;
      }
    },
  };
});
