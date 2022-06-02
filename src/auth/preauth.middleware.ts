import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import * as firebase from 'firebase-admin';
import {} from 'firebase-admin';
import * as serviceAccount from './lindoke-9427d-firebase-adminsdk-qhq5n-f78e4e1c3d.json';

const firebaseParams = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
  private defaultApp: any;
  constructor() {
    this.defaultApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebaseParams),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  async use(req, res, next) {
    const token = req.headers.authorization;
    if (token) {
      await this.defaultApp
        .auth()
        .verifyIdToken(token.replace('Bearer ', ''))
        .then(async (decodedToken) => {
          const user = {
            _id: decodedToken.id,
          };
          req['user'] = user;
          next();
        })
        .catch(() => {
          throw new UnauthorizedException();
        });
    } else {
      throw new UnauthorizedException();
    }
  }
}
