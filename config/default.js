// config file for the app
module.exports = {
  app: {
    name: 'Salesman',
    baseurl: '/api/v1',
    domain: 'http://salesman-betasjsu.rhcloud.com',
    passwordLength: 8,
    defaultPhoto: '/default-user-avatar.png',
    defaultProductPhoto: '/default-product.png',
    updateCategories: true
  },
  database: {
    name: 'mongodb',
    mongo: {
      // fall back to localhost if not deploying to openshift
      url: process.env.OPENSHIFT_NODEJS_IP
          ? ''
          : ''
    }
  },
  cache: {
    name: 'redis',
    openshift: process.env.OPENSHIFT_REDIS_HOST
            ? ''
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
    password: '',
    service: 'gmail'    
  },
  aws: {
    region: 'us-west-1',
    s3: {
      bucketName: 'Salesman-Photos',
      acl: 'public-read',
      baseUrl: 'http://s3.amazonaws.com'
    }
  },
  semantics: {
    baseurl: ''
  }
}