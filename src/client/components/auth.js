import wehelpjs from 'wehelpjs';
import fetch from 'isomorphic-fetch';
import { decode } from 'wehelpjs/lib/auth/memo';
import { key_utils } from 'wehelpjs/lib/auth/ecc';
import { getAccounts } from './localStorage';
import uuidv4 from 'uuid/v4';
import _ from 'lodash';


export const login = ({ username, wif, role = 'posting' }, cb) => {
  fetch(`https://auth.weyoume.io/api/login/challenge?username=${username}&role=${role}`)
    .then(res => res.json())
    .then(data => {
      let token;
      try {
        token = decode(wif, data.code).substring(1);
      } catch (err) {
        console.log(err);
      };
      if (token) {
        localStorage.setItem('token', token);
        cb(null, data);
      } else {
        cb('Login challenge failed', null);
      }
    })
    .catch(err => {console.error("Error:", err), cb(err, null)});
    
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://auth.weyoume.io/api/me', {
        method: 'POST',
        headers: new Headers({ Authorization: token }),
        })
        .then(res => res.json())
        .then((data) => {
            const accounts = getAccounts();
            const idx = accounts.findIndex(acc => acc.username === data.name);
            if (idx >= 0) {
              accounts[idx].postingAuths = data.account.posting.account_auths;
            } else {
              accounts.push({
                username: data.name,
                token,
                postingAuths: data.account.posting.account_auths,
              });
            };
            localStorage.setItem('accounts', JSON.stringify(accounts));
            })
        .catch(err => console.error("Error:", err));
    };
    let firstLogin = false;
    if (_.isEmpty(localStorage.getItem('userid'))){
      localStorage.setItem('userid', uuidv4());
      firstLogin = true;
    }
    const userID = localStorage.getItem('userid');
    if (window.analytics) {
    window.analytics.identify(userID, {
      username: username, 
      }); 
    }
    if (mixpanel) {
      mixpanel.identify(userID);
      mixpanel.people.set({
        username: username, 
        });
      mixpanel.people.increment("logins"); 
    }
    if (firstLogin) {
      window.location = '/about';
    }
  }

export const hasAuthority = (user, clientId, role = 'posting') => {
  const auths = user[role].account_auths.map(auth => auth[0]);
  return auths.indexOf(clientId) !== -1;
};

export const addPostingAuthority = ({ username, wif, clientId }, cb) => {
  wehelpjs.api.getAccounts([username], (err, result) => {
    const { posting, memoKey, json, owner, active } = result[0];
    let postingNew = posting;
    if (!hasAuthority(result[0], clientId)) {
      postingNew.account_auths.push([clientId, parseInt(posting.weight_threshold, 10)]);
      wehelpjs.broadcast.accountUpdate(
        wif,
        username,
        owner,
        active,
        postingNew,
        memoKey,
        json,
        (errA, resultA) => { cb(errA, resultA) });
    } else {
      cb(null, {});
    }
  });
};

export const authorize = ({ clientId, scope, responseType = 'token' }, cb) => {
  const token = localStorage.getItem('token');
  fetch(`https://auth.weyoume.io/api/oauth2/authorize?client_id=${clientId}&scope=${scope}&response_type=${responseType}`, {
    headers: new Headers({ Authorization: token }),
  })
    .then(res => res.json())
    .then(data => cb(null, data))
    .catch(err => {console.error("Error:", err), cb(err, null)});
};

// https://github.com/WeYouMe/weauth/blob/634c13cd0d2fafa28592e9d5f43589e201198248/app/components/elements/SuggestPassword.jsx#L97
export const createSuggestedPassword = () => {
  const PASSWORD_LENGTH = 32;
  const privateKey = key_utils.get_random_key();
  return privateKey.toWif().substring(3, 3 + PASSWORD_LENGTH);
};

export const getAccountCreationFee = async () => {
  const chainConfig = await wehelpjs.api.getConfigAsync();
  const chainProps = await wehelpjs.api.getChainPropertiesAsync();
  const accountCreationFee = chainProps.account_creation_fee;
  const priceModifier = chainConfig.CREATE_ACCOUNT_WITH_TME_MODIFIER;
  const accountCreationFeeInTME = parseFloat(accountCreationFee.split(' ')[0]) * priceModifier;
  return `${accountCreationFeeInTME.toFixed(3)} TME`;
};
