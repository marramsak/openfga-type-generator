import { AuthorizationModel, RelationReference } from "@openfga/sdk";
import {
  factory,
  LiteralTypeNode,
  NodeFlags,
  PropertySignature,
  SyntaxKind,
  TemplateLiteralTypeNode,
  TypeLiteralNode,
} from "typescript";
import { convertToText } from "../utils";
import { ParsedAuthModel } from ".";

/**
 * Generates TypeScript types based on the parsed authorization model.
 *
 * @param parsedAuthModel - The parsed authorization model.
 * @param name - The name of the generated type alias.
 * @param skipNonDrt - Flag to skip non-DRT (Direct Relation Type) entries.
 * @returns An object containing the generated type as text and its AST node.
 */
export function generateAuthModelTypes(parsedAuthModel: ParsedAuthModel, name: string, skipNonDrt = true) {
  // Map over the parsed authorization model to generate types for each entry.
  const types = parsedAuthModel
    .map(({ type, relations }) => {
      // Create a template literal type for the object type.
      const objectType = factory.createTemplateLiteralType(factory.createTemplateHead(type + ":"), [
        factory.createTemplateLiteralTypeSpan(
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          factory.createTemplateTail(""),
        ),
      ]);

      // Filter and map over the relations to generate relation types.
      const filteredRelationTypes = relations
        .map(({ associatedTypes, relationName }) => {
          // Map over associated types to generate user types.
          const filteredUserType = associatedTypes
            .map(({ type, relation, wildcard, drt }: RelationReference & { drt?: boolean }) => {
              if (skipNonDrt && !drt) {
                return undefined;
              }

              // Create default type for the user.
              const defaultType = factory.createTemplateLiteralType(factory.createTemplateHead(type + ":"), [
                factory.createTemplateLiteralTypeSpan(
                  factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                  factory.createTemplateTail(""),
                ),
              ]);

              // Create wildcard type if applicable.
              const wildcardType = wildcard
                ? factory.createLiteralTypeNode(factory.createStringLiteral(type + ":*"))
                : undefined;

              // Create relation type if applicable.
              const relationType = relation
                ? factory.createTemplateLiteralType(factory.createTemplateHead(type + ":"), [
                    factory.createTemplateLiteralTypeSpan(
                      factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                      factory.createTemplateTail("#" + relation),
                    ),
                  ])
                : undefined;

              // Return the appropriate type, prioritizing wildcard, then relation, then default.
              return wildcardType ?? relationType ?? defaultType;
            })
            .filter((userType) => userType !== undefined) as (LiteralTypeNode | TemplateLiteralTypeNode)[];

          if (filteredUserType.length < 1) return undefined;

          // Create a union type for the user types.
          const userType = factory.createUnionTypeNode(filteredUserType);

          // Create a literal type for the relation name.
          const relationType = factory.createLiteralTypeNode(factory.createStringLiteral(relationName));

          // Create a type literal node for the relation type.
          return factory.createTypeLiteralNode(
            [
              factory.createPropertySignature(undefined, factory.createIdentifier("user"), undefined, userType),
              factory.createPropertySignature(undefined, factory.createIdentifier("relation"), undefined, relationType),
              factory.createPropertySignature(undefined, factory.createIdentifier("object"), undefined, objectType),
            ].filter((sign) => sign !== undefined) as PropertySignature[],
          );
        })
        .filter((relationType) => relationType !== undefined) as TypeLiteralNode[];

      return filteredRelationTypes.length > 0 ? factory.createUnionTypeNode(filteredRelationTypes) : undefined;
    })
    .filter((type) => type !== undefined);

  const type = factory.createTypeAliasDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    factory.createIdentifier(name),
    undefined,
    factory.createUnionTypeNode(types),
  );

  return convertToText(type);
}

/**
 * Generates a constant variable declaration based on the parsed authorization model.
 *
 * @param authModel - The authorization model.
 * @param name - The name of the generated constant variable.
 * @returns An object containing the generated constant as text and its AST node.
 */
export function generateAuthModelConst(authModel: Omit<AuthorizationModel, "id">, name: string) {
  // Create a variable statement with the export keyword.
  const type = factory.createVariableStatement(
    [factory.createModifier(SyntaxKind.ExportKeyword)], // Export the variable
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(name), // Variable name
          undefined,
          undefined,
          factory.createIdentifier(JSON.stringify(authModel, undefined, 2)), // Variable value as a JSON string
        ),
      ],
      NodeFlags.Const, // Declare the variable as a constant
    ),
  );

  return convertToText(type);
}
