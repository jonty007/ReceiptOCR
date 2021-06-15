'use strict';

// Local Development specific configuration
// ==================================

module.exports = {
  database: {
    username: 'vivek',
    password: '*',
    name: '*', // DB name
    host: '*',
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
  stripe: '*',
  mail: 'smtp',
  smtp: {
    pool: true,
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false,
    auth: {
      user: '*',
      pass: '*'
    }
  },

  sessionOptions: {
    origin: 'http://localhost:4200/',
    expiration: 2
  },

  mailOptions: {
    from: '*',
    replyTo: '*'
  },

  emailDetails: {
    supportEmail: '*',
    appName: 'App'
  },

  host: 'http://localhost:4001/client',
  serverUrl: '*',
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
    baseGraphURL: '*',
    userInfo: '/v1.0/me',
    recognizer: {
      endpoint: '*',
      key: '*'
    },
    vision: {
      key: '*',
      endpoint: '*'
    },
    storage: {
      baseURL: '*',
      accountName: '*',
      key: '*',
      connectionString: '*',
      containerName: '*' // This name may only contain lowercase letters, numbers, and hyphens, and must begin with a letter or a number. Each hyphen must be preceded and followed by a non-hyphen character. The name must also be between 3 and 63 characters long.
    }
  },
  firebase: {
    api: "*",
    link: "*",
    config: {
      "dynamicLinkInfo": {
        "domainUriPrefix": "*",
        "link": "*",
        "androidInfo": {
          "androidPackageName": "*",
        },
        "iosInfo": {
          "iosBundleId": "*",
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
