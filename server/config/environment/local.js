'use strict';

// Local Development specific configuration
// ==================================

module.exports = {
  database: {
    username: 'testocr',
    password: 'vivek$15',
    name: 'testocr', // DB name
    host: 'testocr.database.windows.net',
    port: 1433,
    dialect: 'mssql',
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    migrationStorageTableSchema: 'test',
    schema: 'test',
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
  // },
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
    from: 'qdeveloper@quanteon.in',
    replyTo: 'qdeveloper@quanteon.in'
  },

  emailDetails: {
    supportEmail: 'qdeveloper@quanteon.in',
    appName: 'App'
  },

  host: 'http://localhost:4001/client',
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
    storage: {
      baseURL: 'https://atbr.blob.core.windows.net',
      accountName: 'atbr',
      key: '7yG/F53eUmuVr9NVayUT8lUq+qUqsum4Jp3CohO+BD//qsrN5ObxYl5Hewe+MXqDkkmYPyxcAssy2VYV0urfFg==',
      connectionString: 'DefaultEndpointsProtocol=https;AccountName=atbr;AccountKey=7yG/F53eUmuVr9NVayUT8lUq+qUqsum4Jp3CohO+BD//qsrN5ObxYl5Hewe+MXqDkkmYPyxcAssy2VYV0urfFg==;EndpointSuffix=core.windows.net',
      containerName: 'atbr' // This name may only contain lowercase letters, numbers, and hyphens, and must begin with a letter or a number. Each hyphen must be preceded and followed by a non-hyphen character. The name must also be between 3 and 63 characters long.
    }
  }
};
