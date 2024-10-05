import { RelationReference } from "@openfga/sdk";
import {
  createPrinter,
  createSourceFile,
  EmitHint,
  factory,
  LiteralTypeNode,
  PropertySignature,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  TemplateLiteralTypeNode,
  TypeAliasDeclaration,
  TypeLiteralNode,
} from "typescript";
import { ParsedAuthModel } from ".";

function convertToText(typeDeclaration: TypeAliasDeclaration) {
  const sourceFile = createSourceFile("", "", ScriptTarget.Latest, false, ScriptKind.TS);

  const printer = createPrinter();
  return printer.printNode(EmitHint.Unspecified, typeDeclaration, sourceFile);
}

export function generateTypes(parsedAuthModel: ParsedAuthModel, name: string, skipNonDrt = true) {
  const types = parsedAuthModel
    .map(({ type, relations }) => {
      const objectType = factory.createTemplateLiteralType(factory.createTemplateHead(type + ":"), [
        factory.createTemplateLiteralTypeSpan(
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          factory.createTemplateTail(""),
        ),
      ]);

      const filteredRelationTypes = relations
        .map(({ associatedTypes, relationName }) => {
          const filteredUserType = associatedTypes
            .map(({ type, relation, wildcard, drt }: RelationReference & { drt?: boolean }) => {
              if (skipNonDrt && !drt) {
                return undefined;
              }
              const defaultType = factory.createTemplateLiteralType(factory.createTemplateHead(type + ":"), [
                factory.createTemplateLiteralTypeSpan(
                  factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                  factory.createTemplateTail(""),
                ),
              ]);

              const wildcardType = wildcard
                ? factory.createLiteralTypeNode(factory.createStringLiteral(type + ":*"))
                : undefined;

              const relationType = relation
                ? factory.createTemplateLiteralType(factory.createTemplateHead(type), [
                    factory.createTemplateLiteralTypeSpan(
                      factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                      factory.createTemplateTail(":#" + relation),
                    ),
                  ])
                : undefined;

              return wildcardType ?? relationType ?? defaultType;
            })
            .filter((userType) => userType !== undefined) as (LiteralTypeNode | TemplateLiteralTypeNode)[];

          if (filteredUserType.length < 1) return undefined;

          const userType = factory.createUnionTypeNode(filteredUserType);

          const relationType = factory.createLiteralTypeNode(factory.createStringLiteral(relationName));

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

  return {
    value: convertToText(type),
    Object: type,
  };
}
