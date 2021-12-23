
export const rules_schemas = [
  {
    uri: 'http://less/permission.json', // id of the first schema
    fileMatch: ['*'], // associate with our model
    schema: {
      type: 'object',
      properties: {
        read: {
          $ref: 'http://less/permission-config.json'
        },
        update: {
          $ref: 'http://less/permission-config-for-data.json'
        },
        add: {
          $ref: 'http://less/permission-config-for-data.json'
        },
        remove: {
          $ref: 'http://less/permission-config.json'
        },
        count: {
          $ref: 'http://less/permission-config.json'
        },
        '$schema': {
          $ref: 'http://less/data.schema.json'
        }
      }
    }
  },
  {
    uri: 'http://less/permission-config.json', // id of the second schema
    schema: {
      type: ['boolean', 'string', 'object'],
      properties: {
        condition: {
          type: ['string', 'boolean']
        },
        cond: {
          type: ['string', 'boolean']
        },
        query: {
          $ref: 'http://less/data.schema.json'
        },
        multi: {
          type: ['boolean', 'string']
        }
      }
    }
  },
  {
    uri: 'http://less/permission-config-for-data.json', // id of the second schema
    schema: {
      type: ['boolean', 'string', 'object'],
      properties: {
        condition: {
          type: ['string', 'boolean']
        },
        cond: {
          type: ['string', 'boolean']
        },
        query: {
          $ref: 'http://less/data.schema.json'
        },
        data: {
          $ref: 'http://less/data.schema.json'
        },
        multi: {
          type: ['boolean', 'string']
        }
      }
    }
  },
  {
    uri: 'http://less/data.schema.json', // id of the second schema
    schema: {
      type: ['object', 'boolean', 'string'],
      patternProperties: {
        '.*': {
          $ref: 'http://less/constraints.json'
        }
      }
    }
  },
  {
    uri: 'http://less/constraints.json', // id of the second schema
    schema: {
      type: 'object',
      properties: {
        condition: {
          type: ['string', 'boolean']
        },
        required: { type: 'boolean' },
        default: { type: ['string', 'boolean', 'number', 'array', 'object'] },
        unique: { type: 'boolean' },
        number: {
          type: 'array',
          items: [
            { type: 'number' },
            { type: 'number' }
          ]
        },
        length: {
          type: 'array',
          items: [
            { type: 'integer' },
            { type: 'integer' }
          ]
        },
        in: { type: 'array' },
        match: { type: 'string' },
        exists: { type: 'string' },
        notExists: { type: 'string' }
      }
    }
  }
]
