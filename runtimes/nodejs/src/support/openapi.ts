import { OpenApiBuilder, PathsObject, PathItemObject } from 'openapi3-ts/oas31'
import { FunctionCache, ICloudFunctionData } from './engine'
import * as ts from 'typescript'

function extractOpenAPIParams(func: ICloudFunctionData) {
  const sourceFile = ts.createSourceFile(
    func.name,
    func.source.code,
    ts.ScriptTarget.ES2022,
    /*setParentNodes */ true,
  )

  const getInterface = (
    properties: ts.NodeArray<ts.TypeElement>,
  ): { name: string; type: string | object }[] => {
    const res = []
    properties.forEach((v) => {
      if (ts.isPropertyDeclaration(v)) {
        if (ts.isIdentifier(v.name)) {
          //  'integer' | 'number' | 'string' | 'boolean' | 'object' | 'null' | 'array';
          let type
          switch (v.type.kind) {
            case ts.SyntaxKind.NumberKeyword:
              type = 'number'
              break
            case ts.SyntaxKind.StringKeyword:
              type = 'string'
              break
            case ts.SyntaxKind.BooleanKeyword:
              type = 'boolean'
              break
            case ts.SyntaxKind.ObjectKeyword:
              type = 'object'
              break
            case ts.SyntaxKind.NullKeyword:
              type = 'null'
              break
            case ts.SyntaxKind.ArrayType:
              type = 'array'
              break
            case ts.SyntaxKind.TypeLiteral:
              type = ts.isTypeLiteralNode(v.type)
                ? getInterface(v.type.members)
                : 'object'
              break
            default:
              type = 'object'
              break
          }
          res.push({
            name: v.name.escapedText.toString(),
            type,
          })
        }
      }
    })
    return res
  }

  const res = {
    query: [] as { name: string; type: string | object }[],
    requestBody: [] as { name: string; type: string | object }[],
  }

  const queryStatement = sourceFile.statements.find(
    (v) => ts.isInterfaceDeclaration(v) && v.name.escapedText === 'IQuery',
  )
  if (ts.isInterfaceDeclaration(queryStatement)) {
    const type = getInterface(queryStatement.members)
    res.query = type
  }

  const requestBodyStatement = sourceFile.statements.find(
    (v) =>
      ts.isInterfaceDeclaration(v) && v.name.escapedText === 'IRequestBody',
  )
  if (ts.isInterfaceDeclaration(requestBodyStatement)) {
    const type = getInterface(requestBodyStatement.members)
    res.requestBody = type
  }

  return res
}

export function buildOpenAPIDefinition(apiConfig: {
  title: string
  version: string
  description?: string
  contact?: {
    name: string
    email: string
  }
  host: string
}) {
  const paths: PathsObject = {}

  const funcs = FunctionCache.getAll()
  funcs.forEach((func) => {
    const openApi = extractOpenAPIParams(func)
    const path: PathItemObject = {}
    if (func.methods.includes('GET')) {
      path.get = {
        operationId: func.name,
        responses: {
          '200': {
            description: func.desc,
          },
        },
        parameters: openApi.query.map((v) => ({
          name: v.name,
          in: 'query',
        })),
      }
    }
    ;['POST', 'PUT', 'DELETE', 'PATCH'].forEach((method) => {
      if (func.methods.includes(method)) {
        path[method.toLowerCase()] = {
          operationId: func.name,
          responses: {
            '200': {
              description: func.desc,
            },
          },
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: openApi.requestBody.reduce((prev, v) => {
                    prev[v.name] = { type: v.type }
                    return prev
                  }, {}),
                },
              },
            },
          },
        }
      }
    })

    paths[`/${func.name}`] = path
  })

  const builder = OpenApiBuilder.create({
    openapi: '3.1.0',
    info: {
      title: apiConfig.title,
      version: apiConfig.version,
      description: apiConfig.description,
      contact: apiConfig.contact,
    },
    paths,
    servers: [
      {
        url: apiConfig.host,
      },
    ],
  })

  return builder.getSpec()
}
