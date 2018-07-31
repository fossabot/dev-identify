# Dev Identify
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FSociallyDev%2Fdev-identify.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FSociallyDev%2Fdev-identify?ref=badge_shield)

Dev Identify fetches the name and profile picture associated with an email address. An API is also available at [devidentify.com](https://devidentify.com).

<br />

### Installation

    npm i dev-identify

<br />    

### Usage

   ```javascript
   var devIdentify = require("dev-identify")


   var email = "hello@devuncoded.com"

   devIdentify(email)
   .then(function(result) {
     console.log(result)
   })
```
<br />

Interested in hosting your own API? You can read about it [here](https://github.com/SociallyDev/dev-identify/wiki/Replicating-The-Whole-Dev-Identify-API) or directly download our complete API package [here](https://github.com/SociallyDev/dev-identify/releases).

<br />

## Sources
Currently, Dev Identify fetches data from:

 - Google
 - Gravatar
 - Google Plus ([Requires extra setup](https://github.com/SociallyDev/dev-identify/wiki/Configuring-Google-Plus))

We're working on adding more sources soon.


<br />

## Customizing Dev Identify

Dev Identify contains a utility class which you can use to create any feature you can dream of or even change the default source ordering logic.
<br /><br />

```javascript
var dev = new devIdentify.utility(optionalGooglePlusKey)


dev.identify(email) //Identifies email

dev.checkGravatar(email) //Only checks Gravatar.

dev.checkGoogle(email) //Only checks Google.

dev.checkGooglePlus(googleId) //Only checks Google Plus.

dev.validateEmail(email) //Validates email address format (BOOL)
```

 <br />   

 All the **dev.check** functions return an associative array with a success boolean.
 If the request was successful, they will also contain name, profile_picture and source key/values.
 <br />

 The **dev.identify()** function returns the same format as the dev.check functions except if the request was unsuccessful, it will also contain an error key and value.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FSociallyDev%2Fdev-identify.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FSociallyDev%2Fdev-identify?ref=badge_large)