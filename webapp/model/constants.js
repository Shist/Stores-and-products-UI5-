sap.ui.define([], function () {
  "use strict";

  return {
    MODEL: {
      ODATA: "odataClientMode",
      APP_VIEW: "appView",
      I18N: "i18n",
    },
    ROUTE: {
      STORES_OVERVIEW: "StoresOverview",
      STORE_DETAILS: "StoreDetails",
      PRODUCT_DETAILS: "ProductDetails",
      PAYLOAD: {
        STORE_ID: "storeId",
        PRODUCT_ID: "productId",
      },
    },
    ID: {
      STORES_LIST: "storesList",
      STORES_SEARCH: "storesSearch",
      PRODUCTS_TABLE: "productsTable",
      PRODUCTS_SEARCH: "productsSearch",
      ICON_TAB_BAR: "iconTabBar",
      COMMENTS_LIST: "commentsList",
    },
    I18N_KEY: {
      SEARCH_VALIDATION_WARNING: "searchValidationWarning",
      FIX_VALIDATION_ERRORS_MSG: "fixValidationErrorsMsg",
      FIELD_IS_MANADATORY_MSG: "msgFieldIsManadatory",
      STORE_CREATE_SUCCESS: "storeCreatedSuccessfully",
      STORE_CREATE_ERROR: "storeCreatedWithError",
      STORE_DELETE_CONFIRMATION: "deleteStoreConfirmationMsg",
      STORE_DELETE_SUCCESS: "storeDeletedSuccessfully",
      STORE_DELETE_ERROR: "storeDeletedWithError",
      CREATE_NEW_PRODUCT: "createNewProduct",
      CREATE: "create",
      EDIT_PRODUCT: "editProduct",
      EDIT: "edit",
      PRODUCT_CREATE_SUCCESS: "productCreatedSuccessfully",
      PRODUCT_CREATE_ERROR: "productCreatedWithError",
      PRODUCT_EDIT_SUCCESS: "productEditedSuccessfully",
      PRODUCT_EDIT_ERROR: "productEditedWithError",
      PRODUCT_DELETE_CONFIRMATION: "deleteProductConfirmationMsg",
      PRODUCT_DELETE_SUCCESS: "productDeletedSuccessfully",
      PRODUCT_DELETE_ERROR: "productDeletedWithError",
      EMPTY_AUTHOR_WARNING: "emptyAuthorWarningMsg",
      COMMENT_POST_SUCCESS: "commentPostedSuccessfully",
      COMMENT_POST_ERROR: "commentPostedWithError",
    },
    FORM_NAME: {
      STORE: "StoreForm",
      PRODUCT: "ProductForm",
    },
    FORM_FIELD: {
      STORE: {
        NAME: {
          ID: "inputStoreName",
          LABEL: "Name",
        },
        EMAIL: {
          ID: "inputStoreEmail",
          LABEL: "Email",
        },
        PHONE_NUMBER: {
          ID: "inputStorePhone",
          LABEL: "Phone number",
        },
      },
      PRODUCT: {
        NAME: {
          ID: "inputProductName",
          LABEL: "Name",
        },
        SPECS: {
          ID: "textAreaProductSpecs",
          LABEL: "Specs",
        },
      },
    },
    STORE_PROP: {
      ID: "id",
      NAME: "Name",
      EMAIL: "Email",
      PHONE_NUMBER: "PhoneNumber",
      ADDRESS: "Address",
      ESTABLISHED: "Established",
      FLOOR_AREA: "FloorArea",
    },
    PRODUCT_PROP: {
      ID: "id",
      NAME: "Name",
      PRICE: "Price",
      PHOTO: "Photo",
      SPECS: "Specs",
      RATING: "Rating",
      SUPPLIER_INFO: "SupplierInfo",
      COUNTRY: "MadeIn",
      PROD_COMPANY: "ProductionCompanyName",
      STATUS: "Status",
      STORE_ID: "StoreId",
    },
    COMMENT_PROP: {
      ID: "Id",
      AUTHOR: "Author",
      MESSAGE: "Message",
      RATING: "Rating",
      POSTED: "Posted",
      PRODUCT_ID: "ProductId",
    },
    STATUS: {
      ALL: {
        MODEL_KEY: "all",
        SERVER_KEY: "ALL",
      },
      OK: {
        MODEL_KEY: "ok",
        SERVER_KEY: "OK",
      },
      STORAGE: {
        MODEL_KEY: "storage",
        SERVER_KEY: "STORAGE",
      },
      OUT_OF_STOCK: {
        MODEL_KEY: "outOfStock",
        SERVER_KEY: "OUT_OF_STOCK",
      },
    },
    SORT_STATE: {
      DEFAULT: "DEFAULT",
      ASC: "ASC",
      DESC: "DESC",
    },
    SORT_PROP: {
      NAME: {
        MODEL_KEY: "name",
        SERVER_KEY: "Name",
        IS_NUM: false,
      },
      PRICE: {
        MODEL_KEY: "price",
        SERVER_KEY: "Price",
        IS_NUM: true,
      },
      SPECS: {
        MODEL_KEY: "specs",
        SERVER_KEY: "Specs",
        IS_NUM: false,
      },
      SUPPLIER_INFO: {
        MODEL_KEY: "supplierInfo",
        SERVER_KEY: "SupplierInfo",
        IS_NUM: false,
      },
      COUNTRY: {
        MODEL_KEY: "country",
        SERVER_KEY: "MadeIn",
        IS_NUM: false,
      },
      PROD_COMPANY: {
        MODEL_KEY: "prodCompany",
        SERVER_KEY: "ProductionCompanyName",
        IS_NUM: false,
      },
      RATING: {
        MODEL_KEY: "rating",
        SERVER_KEY: "Rating",
        IS_NUM: true,
      },
    },
  };
});
