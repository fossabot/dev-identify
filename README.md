# Dev Identify
Dev Identify fetches the name and profile picture associated with an email address. An API is also available at [devidentify.com](https://devidentify.com).

<br />

### Installation

    npm i dev-identify

<br />    

### Usage

   ```javascript
    var devIdentify = require("dev-identify")


    var email = "hello@devuncoded.com"

    var id = devIdentify(email)
```

<br />

## Sources
Currently, Dev Identify fetches data from:

 - Google
 - Gravatar
 - Google Plus ([Requires extra setup](https://github.com/DevUncoded/dev-identify/wiki/Configuring-Google-Plus))

We're working on adding more sources soon.


<br />

## Customizing Dev Identify

Dev Uncoded contains a utility class which you can use to create any feature you can dream of or even change the default source ordering logic.
<br /><br />

```javascript
var dev = new devIdentify.utility()


dev.identify(email, optionalGooglePlusKey) //Identifies email

dev.checkGravatar(email) //Only checks Gravatar.

dev.checkGoogle(email) //Only checks Google.

dev.checkGooglePlus(googleId, googlePlusAPIKey) //Only checks Google Plus.

dev.validateEmail(email) //Validates email address format (BOOL)
```

 <br />   

 All the **dev.check** functions return an associative array with a success boolean.
 If the request was successful, they will also contain name, profile_picture and source key/values.
 <br />

 The **dev.identify()** function returns the same format as the util.check functions except if the request was unsuccessful, it will also contain an error key and value.
 
