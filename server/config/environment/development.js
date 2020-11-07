'use strict';

// Local Development specific configuration
// ==================================

module.exports = {
  database: {
    username: 'smyjefot',
    password: 'LxWNFTnhxdyq-ZNV13eur9E9kyr84LQj',
    name: 'smyjefot', // DB name
    host: 'ruby.db.elephantsql.com',
    port: 5432,
    dialect: 'postgres',
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    migrationStorageTableSchema: 'custom',
    schema: 'custom',
    connectionLimit: 10,
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
  stripe: 'sk_test_51HaiBLIDwFeEHEEAr8SMmYp9AlbqUhzGTJCkTg40e1XPyS4xdb2FaE0lsPcdmSj1Oz2CmshHMBohLXZT95a9K4J300LWTNBsWJ',
  mail: 'smtp',
  smtp: {
    pool: true,
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'raj309219@gmail.com',
      pass: 'raj309219'
    }
  },

  sessionOptions: {
    origin: 'http://localhost:4200/',
    expiration: 2
  },

  mailOptions: {
    from: 'raj309219@gmail.com',
    replyTo: 'raj309219@gmail.com'
  },

  emailDetails: {
    supportEmail: 'raj309219@gmail.com',
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
      baseURL: '',
      accountName: '',
      key: '',
      connectionString: '',
      containerName: '' // This name may only contain lowercase letters, numbers, and hyphens, and must begin with a letter or a number. Each hyphen must be preceded and followed by a non-hyphen character. The name must also be between 3 and 63 characters long.
    }
  },
  firebase: {
    "dynamicLinkInfo": {
      "domainUriPrefix": "https://preciept.page.link",
      "link": "https://preciept-app.web.app",
      "androidInfo": {
        "androidPackageName": "at.pits.preceipt",
        "androidFallbackLink": "",
        "androidMinPackageVersionCode": ""
      },
      "iosInfo": {
        "iosBundleId": "at.pits.preceipt",
        "iosFallbackLink": "",
        "iosCustomScheme": "",
        "iosIpadFallbackLink": "",
        "iosIpadBundleId": "",
        "iosAppStoreId": ""
      },
      "navigationInfo": {
        "enableForcedRedirect": true
      },
      "analyticsInfo": {
        "googlePlayAnalytics": {
          "utmSource": "",
          "utmMedium": "",
          "utmCampaign": "",
          "utmTerm": "",
          "utmContent": "",
          "gclid": ""
        },
        "itunesConnectAnalytics": {
          "at": "",
          "ct": "",
          "mt": "",
          "pt": ""
        }
      },
      "socialMetaTagInfo": {
        "socialTitle": "",
        "socialDescription": "",
        "socialImageLink": ""
      }
    },
    "suffix": {
      "option": "SHORT"
    }
  }
};
