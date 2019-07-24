weauthjs.prototype.message = function message(sender, recipient, messageText, time, id, cb) {
    var params = {
      required_auths: [],
      required_posting_auths: [sender],
      id: 'message',
      json: JSON.stringify(['message', {
        sender: sender, 
        recipient: recipient, 
        messageText: messageText, 
        time: time, 
        id: id,
      }])
    };
    return this.broadcast([['customJson', params]], cb);
  };  