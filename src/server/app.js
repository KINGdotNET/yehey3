import fs from 'fs';
import express from 'express';
import cookieParser from 'cookie-parser';
import Handlebars from 'handlebars';
import paths from '../../scripts/paths';
import createSsrHandler from './handlers/createSsrHandler';
import createAmpHandler from './handlers/createAmpHandler';
import blockchainAPI from './blockchainAPI';
import { sendInviteEmail } from './emailAPI';

const bodyParser = require('body-parser');

const indexPath = `${paths.templates}/index.hbs`;
const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const template = Handlebars.compile(indexHtml);

const ampIndexPath = `${paths.templates}/amp_index.hbs`;
const ampIndexHtml = fs.readFileSync(ampIndexPath, 'utf-8');
const ampTemplate = Handlebars.compile(ampIndexHtml);

const ssrHandler = createSsrHandler(template);
const ampHandler = createAmpHandler(ampTemplate);

const CACHE_AGE = 1000 * 60 * 60 * 24 * 7;

const app = express();

const IS_DEV = process.env.NODE_ENV === 'development';

if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV !== 'prod') {
	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

if (IS_DEV) {
  app.use(express.static(paths.publicRuntime(), { index: false }));
} else {
  app.use(express.static(paths.buildPublicRuntime(), { maxAge: CACHE_AGE, index: false }));
}

app.get('/callback', (req, res) => {
  const accessToken = req.query.access_token;
  const expiresIn = req.query.expires_in;
  const state = req.query.state;
  const next = state && state[0] === '/' ? state : '/';
  if (accessToken && expiresIn) {
    res.cookie('access_token', accessToken, { maxAge: expiresIn * 1000 });
    res.redirect(next);
  } else {
    res.status(401).send({ error: 'access_token or expires_in Missing' });
  }
});

const sendMail = express.Router();
sendMail.post('/mail', async (req, res) => {
  const { email, link, username } = req.body;
  const SEND = await sendInviteEmail(email, link, username)
  .then(res => {console.log("sendMail Success: ", res); return res;})
  .catch(err => console.log("sendMail Error: ", err));
});

app.use('/api/v1/communicate', sendMail);

app.get('/i/@:referral', async (req, res) => {
  try {
    const { referral } = req.params;

    const accounts = await blockchainAPI.sendAsync('get_accounts', [[referral]]).catch(err=>{console.error('err', err)});
    if (accounts[0]) {
      res.cookie('referral', referral, { maxAge: 86400 * 30 * 1000 });
      res.redirect('/about');
    }
  } catch (err) {
    res.redirect('/');
  }
});

app.get('/i/:parent/@:referral/:permlink', async (req, res) => {
  try {
    const { parent, referral, permlink } = req.params;

    const content = await blockchainAPI.sendAsync('get_content', [referral, permlink]).catch(err=>{console.error('err', err)});

    if (content.author) {
      res.cookie('referral', referral, { maxAge: 86400 * 30 * 1000 });
      res.redirect(`/${parent}/@${referral}/${permlink}`);
    } else {
      res.redirect('/');
    }
  } catch (err) {
    res.redirect('/');
  }
});

app.get('/@:author/:permlink/amp', ampHandler);
app.get('/:category/@:author/:permlink/amp', (req, res) => {
  const { author, permlink } = req.params;
  res.redirect(301, `/@${author}/${permlink}/amp`);
});
app.get('/:category/@:author/:permlink', (req, res) => {
  const { author, permlink } = req.params;
  res.redirect(301, `/@${author}/${permlink}`);
});
app.get('/*', ssrHandler);

export default app;
