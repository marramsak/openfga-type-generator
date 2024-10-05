import fga = require("@openfga/syntax-transformer");

export function convertToAuthModel(dsl: string) {
  return {
    object: fga.transformer.transformDSLToJSONObject(dsl),
    json: fga.transformer.transformDSLToJSON(dsl),
  };
}

export function validateDSL(dsl: string) {
  return fga.validator.validateDSL(dsl);
}
