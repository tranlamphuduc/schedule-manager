const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Schedule Manager API',
      version: '1.0.0',
      description: 'API documentation for Schedule Manager application',
      contact: {
        name: 'Schedule Manager Team',
        email: 'support@schedulemanager.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://api.schedulemanager.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Event: {
          type: 'object',
          required: ['title', 'start_time', 'end_time'],
          properties: {
            id: {
              type: 'integer',
              description: 'Event ID'
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Event title'
            },
            description: {
              type: 'string',
              description: 'Event description'
            },
            start_time: {
              type: 'string',
              format: 'date-time',
              description: 'Event start time'
            },
            end_time: {
              type: 'string',
              format: 'date-time',
              description: 'Event end time'
            },
            location: {
              type: 'string',
              description: 'Event location'
            },
            category_id: {
              type: 'integer',
              description: 'Category ID'
            },
            user_id: {
              type: 'integer',
              description: 'User ID who created the event'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Category: {
          type: 'object',
          required: ['name', 'color'],
          properties: {
            id: {
              type: 'integer',
              description: 'Category ID'
            },
            name: {
              type: 'string',
              maxLength: 50,
              description: 'Category name'
            },
            color: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Category color in hex format'
            },
            user_id: {
              type: 'integer',
              description: 'User ID who created the category'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Notification ID'
            },
            title: {
              type: 'string',
              description: 'Notification title'
            },
            message: {
              type: 'string',
              description: 'Notification message'
            },
            type: {
              type: 'string',
              enum: ['info', 'warning', 'error', 'success'],
              description: 'Notification type'
            },
            is_read: {
              type: 'boolean',
              description: 'Whether notification has been read'
            },
            user_id: {
              type: 'integer',
              description: 'User ID'
            },
            event_id: {
              type: 'integer',
              description: 'Related event ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Detailed error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/server.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;
