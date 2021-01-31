'use strict';

// Local Development specific configuration
// ==================================

module.exports = {
  database: {
    username: 'vivek',
    password: 'testocr$15',
    name: 'preceipttest', // DB name
    host: 'preceipt.database.windows.net',
    port: 1433,
    dialect: 'mssql',
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    migrationStorageTableSchema: 'dbo',
    schema: 'dbo',
    connectionLimit: 10,
    dialectOptions: {
      options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: true
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false,
    // operatorsAliases: false,
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true,
      updatedAt: 'modified_at',
      createdAt: 'created_at',
      deletedAt: 'deleted_at'
    }
  },
  // aws: {
  //   AWS_ACCESS_KEY_ID: // access key,
  //   AWS_SECRET_ACCESS_KEY: // secret key,
  //   region: // region,
  //   s3: {
  //     bucket: // bucket name
  //   }
  // },
  // awsEncryption: {
  //   algorithm: // algo: aes-256-gcm
  //   nonce: // non key
  //   secret_key: // secret key
  //  },
  stripe: 'sk_test_51HbrXVFJ4dMQPQR28zRrfi3wnNASSlgOn2KCYZAfsdjcYKJ3EF6zpAMZhd6DyHHrkJ48vXtVj8qva57H24yPQqkm00X6G1msrB',
  mail: 'smtp',
  smtp: {
    pool: true,
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false,
    auth: {
      user: 'vivek.singh@quanteon.in',
      pass: 'MGQHfka0zE5cTBxt'
    }
  },

  sessionOptions: {
    origin: 'http://localhost:4200/',
    expiration: 2
  },

  mailOptions: {
    from: 'vivek.singh@quanteon.in',
    replyTo: 'vivek.singh@quanteon.in'
  },

  emailDetails: {
    supportEmail: 'vivek.singh@quanteon.in',
    appName: 'App'
  },

  host: 'http://localhost:4001/client',
  serverUrl: 'http://localhost:4001/api/v1',
  https: false,
  http: {},
  client: true,
  clientBundle: {
    path: '../web-build',
    fileName: 'index.html'
  },
  apidoc: true,
  azure: {
    appInfo: {
      clientId: '',
      tenantId: ''
    },
    baseGraphURL: 'https://graph.microsoft.com',
    userInfo: '/v1.0/me',
    recognizer: {
      endpoint: 'https://preceiptocrdev.cognitiveservices.azure.com/',
      key: '59a64e59ea9b458c95025a3017faa84f'
    },
    vision: {
      key: '9391b7d7d43449c58f27c173147df09a',
      endpoint: 'https://preceiptvision.cognitiveservices.azure.com/'
    },
    storage: {
      baseURL: 'https://pdocs.blob.core.windows.net',
      accountName: 'pdocs',
      key: 'TYHLdNmnPbYqR9M31m4mv2jsqMzvt77pHY7AJJS7lb6WHNU+GCwn23cn+QuF7NuDc5RwIx5JNIK/R5YpCLtdMw==',
      connectionString: 'DefaultEndpointsProtocol=https;AccountName=pdocs;AccountKey=TYHLdNmnPbYqR9M31m4mv2jsqMzvt77pHY7AJJS7lb6WHNU+GCwn23cn+QuF7NuDc5RwIx5JNIK/R5YpCLtdMw==;EndpointSuffix=core.windows.net',
      containerName: 'pdocs' // This name may only contain lowercase letters, numbers, and hyphens, and must begin with a letter or a number. Each hyphen must be preceded and followed by a non-hyphen character. The name must also be between 3 and 63 characters long.
    }
  },
  firebase: {
    api: "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyCRciNM3ESX_8Sj3ezMPZcdpd_82gj9Dq0",
    link: "https://preceipt-app.web.app",
    config: {
      "dynamicLinkInfo": {
        "domainUriPrefix": "https://preceipt.page.link",
        "link": "https://preceipt-app.web.app",
        "androidInfo": {
          "androidPackageName": "at.pits.preceipt",
        },
        "iosInfo": {
          "iosBundleId": "at.pits.preceipt",
        },
        "navigationInfo": {
          "enableForcedRedirect": true
        }
      },
      "suffix": {
        "option": "SHORT"
      }
    }
  }
};
