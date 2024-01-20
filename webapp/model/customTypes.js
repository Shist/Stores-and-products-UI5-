sap.ui.define(
  [
    "pavel/zhukouski/model/constants",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
  ],
  function (CONSTANTS, SimpleType, ValidateException) {
    "use strict";

    return {
      customEmailType: SimpleType.extend("email", {
        formatValue: function (oValue) {
          return oValue;
        },

        parseValue: function (oValue) {
          return oValue;
        },

        validateValue: function (oValue) {
          if (!oValue) {
            throw new ValidateException(CONSTANTS.ERROR.EMAIL.EMPTY);
          }

          if (oValue.length > 30) {
            throw new ValidateException(CONSTANTS.ERROR.EMAIL.TOO_LONG);
          }

          const rexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!oValue.match(rexMail)) {
            throw new ValidateException(CONSTANTS.ERROR.EMAIL.INVALID);
          }
        },
      }),

      customTelType: SimpleType.extend("tel", {
        formatValue: function (oValue) {
          return oValue;
        },

        parseValue: function (oValue) {
          return oValue;
        },

        validateValue: function (oValue) {
          if (!oValue) {
            throw new ValidateException(CONSTANTS.ERROR.TEL.EMPTY);
          }

          if (oValue.length > 30) {
            throw new ValidateException(CONSTANTS.ERROR.TEL.TOO_LONG);
          }

          const rexMail = /^[\d\+\-\(\)x\ ]+$/;
          if (!oValue.match(rexMail)) {
            throw new ValidateException(CONSTANTS.ERROR.TEL.INVALID);
          }
        },
      }),
    };
  }
);
