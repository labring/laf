import {
  OpenApiBuilder,
  PathsObject,
  PathItemObject,
  SchemaObjectType,
} from 'openapi3-ts/oas30'
import { FunctionCache, ICloudFunctionData } from './engine'
import { Project, TypeElementTypes, Node } from 'ts-morph'

function extractOpenAPIParams(func: ICloudFunctionData) {
  const project = new Project()
  const sourceFile = project.createSourceFile(func.name, func.source.code)
  const interfaceDeclarations = sourceFile.getInterfaces()

  const getPropertiesInfo = (
    properties: TypeElementTypes[],
  ): { name: string; type: string | object; required: boolean }[] => {
    return properties.filter(Node.isPropertySignature).map((prop) => {
      const type = prop.getType()
      let propType = 'object'

      if (type.isNumberLiteral()) {
        propType = 'number'
      } else if (type.isStringLiteral()) {
        propType = 'string'
      } else if (type.isBooleanLiteral()) {
        propType = 'boolean'
      } else if (type.isObject()) {
        propType = 'object'
      } else if (type.isArray()) {
        propType = 'array'
      }

      const comments = prop.getTrailingCommentRanges()
      let desc = ''
      if (comments.length > 0) {
        const comment = comments[0].getText()
        desc = comment.slice(2).trim() || ''
      }

      return {
        name: prop.getName(),
        type: propType,
        required: !prop.hasQuestionToken(),
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
    (d) => d.getName() === 'IQuery',
  )
  if (iQueryDeclaration) {
    res.query = getPropertiesInfo(iQueryDeclaration.getMembers())
  }

  const iRequestBodyDeclaration = interfaceDeclarations.find(
    (d) => d.getName() === 'IRequestBody',
  )
  if (iRequestBodyDeclaration) {
    res.requestBody = getPropertiesInfo(iRequestBodyDeclaration.getMembers())
  }

  const iResponseDeclaration = interfaceDeclarations.find(
    (d) => d.getName() === 'IResponse',
  )
  if (iResponseDeclaration) {
    res.response = getPropertiesInfo(iResponseDeclaration.getMembers())
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
          requestBody: {
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
          },
          responses: {
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
          },
          tags: func.tags,
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
