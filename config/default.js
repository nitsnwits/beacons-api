// config file for the app
module.exports = {
  app: {
    name: 'Salesman',
    baseurl: '/api/v1',
    domain: 'http://salesman-betasjsu.rhcloud.com',
    passwordLength: 8,
    defaultPhoto: '/default-user-avatar.png'
  },
  database: {
    name: 'mongodb',
    mongo: {
      // fall back to localhost if not deploying to openshift
      url: process.env.OPENSHIFT_NODEJS_IP
          ? 'mongodb://admin:I6NumDATJ4qC@127.13.147.130:27017/salesman'
          : 'mongodb://localhost/salesman'
    }
  },
  cache: {
    name: 'redis',
    openshift: process.env.OPENSHIFT_REDIS_HOST
            ? 'ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5'
            : undefined,
    port: process.env.OPENSHIFT_REDIS_PORT || 6379,
    ip: process.env.OPENSHIFT_REDIS_HOST || '127.0.0.1'
  },
  server: {
    ip: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8000,
    secure: false,
    validateSchemas: false,
    env: 'development',
    debug: true,
    resetPasswordLinkExpiry: 300
  },
  mailer: {
    email: 'salesman.betasjsu@gmail.com',
    password: 'Salesman',
    service: 'gmail'    
  },
  aws: {
    region: 'us-west-1',
    s3: {
      bucketName: 'Salesman-Photos',
      acl: 'public-read',
      baseUrl: 'http://s3.amazonaws.com'
    }
  }
}