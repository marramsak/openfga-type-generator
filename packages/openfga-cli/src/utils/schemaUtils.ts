import fga = require("@openfga/syntax-transformer");

/**
 * Converts a DSL string to an authorization model JSON object.
 * @param dsl - The DSL string to be converted.
 * @returns The JSON object representing the authorization model.
 */
export function transformDSLToAuthModel(dsl: string) {
  // Transform the DSL string to a JSON object using the FGA transformer.
  return fga.transformer.transformDSLToJSONObject(dsl);
}

/**
 * Validates a DSL string.
 * @param dsl - The DSL string to be validated.
 * @returns The result of the validation.
 */
/**
 * Validates a DSL string.
 * @param dsl - The DSL string to be validated.
 * @returns The result of the validation.
 */
export function validateDSLString(dsl: string) {
  return fga.validator.validateDSL(dsl);
}
