// import ts from "typescript";
// import { FgaSchema } from "../Types";
// import { convertToText } from "../Utils";

// export function generateTypes(json: string) {
//   const model = JSON.parse(json) as FgaSchema;

//   const tuples = model.type_definitions.flatMap((typeDefinition) => {
//     const relations = Object.entries(typeDefinition.relations);
//     const metadata = new Map(Object.entries(typeDefinition.metadata?.relations ?? {}));

//     const typeName = typeDefinition.type;

//     return relations
//       .flatMap(([relation]) => {
//         const relationMetadata = metadata.get(relation);
//         const relatedUserTypes = relationMetadata?.directly_related_user_types;

//         if (relatedUserTypes?.length === 0) return null as unknown as ts.TypeLiteralNode;

//         const entityTypes = ts.factory.createUnionTypeNode(
//           relatedUserTypes?.map(({ type, wildcard, relation }) => {
//             const defaultType = ts.factory.createTemplateLiteralType(ts.factory.createTemplateHead(type + ":"), [
//               ts.factory.createTemplateLiteralTypeSpan(
//                 ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
//                 ts.factory.createTemplateTail(""),
//               ),
//             ]);

//             const wildcardType = wildcard
//               ? ts.factory.createTemplateLiteralType(ts.factory.createTemplateHead(type + ":"), [
//                   ts.factory.createTemplateLiteralTypeSpan(
//                     ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("*")),
//                     ts.factory.createTemplateTail(""),
//                   ),
//                 ])
//               : undefined;

//             const relationType = relation
//               ? ts.factory.createTemplateLiteralType(ts.factory.createTemplateHead(type), [
//                   ts.factory.createTemplateLiteralTypeSpan(
//                     ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
//                     ts.factory.createTemplateTail("#" + relation),
//                   ),
//                 ])
//               : undefined;

//             return wildcardType ?? relationType ?? defaultType;
//           }) ?? [],
//         );

//         const relationType = ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(relation));

//         const objectType = ts.factory.createTemplateLiteralType(ts.factory.createTemplateHead(typeName + ":"), [
//           ts.factory.createTemplateLiteralTypeSpan(
//             ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
//             ts.factory.createTemplateTail(""),
//           ),
//         ]);

//         return ts.factory.createTypeLiteralNode([
//           ts.factory.createPropertySignature(undefined, ts.factory.createIdentifier("user"), undefined, entityTypes),
//           ts.factory.createPropertySignature(
//             undefined,
//             ts.factory.createIdentifier("relation"),
//             undefined,
//             relationType,
//           ),
//           ts.factory.createPropertySignature(undefined, ts.factory.createIdentifier("object"), undefined, objectType),
//         ]);
//       })
//       .filter((x) => x);
//   });

//   return convertToText(
//     ts.factory.createTypeAliasDeclaration(
//       [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
//       ts.factory.createIdentifier("Tuple"),
//       undefined,
//       ts.factory.createUnionTypeNode(tuples),
//     ),
//   );
// }
