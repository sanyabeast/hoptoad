# Hoptoad
A tool that allows you to remotely get access to terminal over xmpp protocol (aka jabber).
Thanks to [simple-xmpp](https://github.com/simple-xmpp/node-simple-xmpp) and [node-xmpp](https://github.com/tonyskn/node-xmpp)

## Using
1. Create a jabber account for Hoptoad.
2. Add the account as friend to your own account.
3. Clone repo.
4. Run Hoptoad: node hoptoad.js "hoptoad_acc@jabber.xxx" "hoptoad_acc_password" "access_password"
5. Use. 

![screen](screen.jpg?raw=true "")

## Issues
1. Windows cmd's encoding issue (Seems like it`s unfixable because of Microsoft's guys' lack of brain. Better use linux.) [Details](https://github.com/nodejs/node-v0.x-archive/issues/2190)
2. Connection keeping alive mechanism
3. Encryption and security
