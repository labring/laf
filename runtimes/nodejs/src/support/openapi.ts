import {
  OpenApiBuilder,
  PathsObject,
  PathItemObject,
  SchemaObjectType,
} from 'openapi3-ts/oas30'
import { FunctionCache, ICloudFunctionData } from './engine'
import * as ts from 'typescript'

function extractOpenAPIParams(func: ICloudFunctionData) {
  const sourceFile = ts.createSourceFile(
    func.name,
    func.source.code,
    ts.ScriptTarget.ES2022,
    /*setParentNodes */ true,
  )
  const interfaceDeclarations = sourceFile.statements.filter(
    ts.isInterfaceDeclaration,
  )

  const getPropertiesInfo = (
    properties: ts.NodeArray<ts.TypeElement>,
  ): { name: string; type: string | object; required: boolean }[] => {
    return properties
      .filter(ts.isPropertySignature)
      .filter((prop) => !!prop.type)
      .map((prop) => {
        const type = prop.type!
        let propType = 'object'
        switch (type.kind) {
          case ts.SyntaxKind.StringKeyword:
            propType = 'string'
            break
          case ts.SyntaxKind.BooleanKeyword:
            propType = 'boolean'
            break
          case ts.SyntaxKind.NumberKeyword:
            propType = 'number'
            break
          case ts.SyntaxKind.ObjectKeyword:
            propType = 'object'
            break
          case ts.SyntaxKind.ArrayType:
            propType = 'array'
            break
          default:
            propType = 'object'
            break
        }

        const comments = ts.getTrailingCommentRanges(func.source.code, type.end)
        let desc = ''
        if (comments && comments.length > 0) {
          const comment = func.source.code.slice(
            comments[0].pos,
            comments[0].end,
          )
          desc = comment.slice(2).trim() || ''
        }

        return {
          name: prop.name.getText(),
          type: propType,
          required: !prop.questionToken,
          desc,
        }
      })
  }

  const res: { query: any[]; requestBody: any[]; response: any[] } = {
    query: [],
    requestBody: [],
    response: [],
  }

  const iQueryDeclaration = interfaceDeclarations.find(
    (d) => d.name.getText() === 'IQuery',
  )
  if (iQueryDeclaration) {
    res.query = getPropertiesInfo(iQueryDeclaration.members)
  }

  const iRequestBodyDeclaration = interfaceDeclarations.find(
    (d) => d.name.getText() === 'IRequestBody',
  )
  if (iRequestBodyDeclaration) {
    res.requestBody = getPropertiesInfo(iRequestBodyDeclaration.members)
  }

  const iResponseDeclaration = interfaceDeclarations.find(
    (d) => d.name.getText() === 'IResponse',
  )
  if (iResponseDeclaration) {
    res.response = getPropertiesInfo(iResponseDeclaration.members)
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
  apiVersion: string
}) {
  const paths: PathsObject = {}

  const funcs = FunctionCache.getAll()
  funcs.forEach((func) => {
    const openApi = extractOpenAPIParams(func)
    const path: PathItemObject = {}
    if (func.methods.includes('GET')) {
      path.get = {
        operationId: `${func.name}_GET`,
        summary: func.desc,
        responses: {
          '200': {
            description: 'success',
          },
        },
        parameters: openApi.query.map((v) => ({
          name: v.name,
          in: 'query',
          required: v.required,
          description: v.desc,
          schema: {
            type:
              typeof v.type === 'string'
                ? (v.type as SchemaObjectType)
                : 'object',
          },
        })),
        tags: func.tags,
      }
    }
    ;['POST', 'PUT', 'DELETE', 'PATCH'].forEach((method) => {
      if (func.methods.includes(method)) {
        path[method.toLowerCase()] = {
          operationId: `${func.name}_${method}`,
          summary: func.desc,
          tags: func.tags,
        }

        if (openApi.requestBody.length > 0) {
          path[method.toLowerCase()].requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: openApi.requestBody.reduce((prev, v) => {
                    prev[v.name] = { type: v.type, description: v.desc }
                    return prev
                  }, {}),
                  required: openApi.requestBody
                    .filter((v) => v.required)
                    .map((v) => v.name),
                },
              },
            },
          }
        }
        if (openApi.response.length > 0) {
          path[method.toLowerCase()].responses = {
            default: {
              description: 'success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: openApi.response.reduce((prev, v) => {
                      prev[v.name] = { type: v.type, description: v.desc }
                      return prev
                    }, {}),
                    required: openApi.response
                      .filter((v) => v.required)
                      .map((v) => v.name),
                  },
                },
              },
            },
          }
        }
      }
    })

    paths[`/${func.name}`] = path
  })

  const builder = OpenApiBuilder.create({
    openapi: apiConfig.apiVersion,
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
