var mailgun = require('mailgun.js');
var mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});
var domain = process.env.MAILGUN_DOMAIN;

/**
 * Sends an email to a given address, with a username and an invitation link.
 * @param {string} email - The recipients Email address.
 * @param {string} link - The invitation link.
 * @param {string} username - The Username of the sender.
 */
exports.sendInviteEmail = (email, link, username) => 
  new Promise((resolve, reject) => {
      const data = 
      {
        "from": "Invite <invite@mail.weyoume.io>",
        "to": email,
        "subject": `You have been invited to join WeYouMe by your friend ${username}`,
        "template": "inviteemail",
        "v:userName": username,
        "v:inviteLink": link,
      };
      mg.messages.create(domain, data)
      .then(msg => {resolve(msg)})
      .catch(err => {reject(Error(err))});
      });
