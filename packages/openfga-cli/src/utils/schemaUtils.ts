import fga = require("@openfga/syntax-transformer");
import { factory, NodeFlags, SyntaxKind } from "typescript";
import { convertToText } from "./generatorUtils";

/**
 * Converts a DSL string to an authorization model.
 * @param dsl - The DSL string to be converted.
 * @param name - The name of the variable to be created.
 * @returns An object containing the transformed object, JSON, TypeScript code as text, and the TypeScript type node.
 */
export function convertToAuthModel(dsl: string, name: string) {
  // Transform the DSL string to a JSON object using the FGA transformer.
  const object = fga.transformer.transformDSLToJSONObject(dsl);

  // Create a TypeScript variable statement with the transformed JSON object.
  const type = factory.createVariableStatement(
    [factory.createModifier(SyntaxKind.ExportKeyword)], // Export the variable
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(name), // Variable name
          undefined,
          undefined,
          factory.createIdentifier(JSON.stringify(object, undefined, 2)), // Variable value as a JSON string
        ),
      ],
      NodeFlags.Const, // Declare the variable as a constant
    ),
  );

  return {
    object: fga.transformer.transformDSLToJSONObject(dsl), // Transformed object
    json: fga.transformer.transformDSLToJSON(dsl), // Transformed JSON string
    value: convertToText(type), // TypeScript code as text
    type, // TypeScript type node
  };
}

/**
 * Validates a DSL string.
 * @param dsl - The DSL string to be validated.
 * @returns The result of the validation.
 */
export function validateDSL(dsl: string) {
  return fga.validator.validateDSL(dsl);
}
