/*
Dev Identify fetches the name and
profile picture associated with an email address.

Written by Dev Uncoded ( https://github.com/DevUncoded )
And Rohan Rishi ( https://github.com/RohanRishi )

MIT License ( https://opensource.org/licenses/MIT )
*/
const request = require("then-request")
const md5 = require("md5")

module.exports = devIdentify
module.exports["default"] = devIdentify
module.exports["utility"] = devIdentifyUtility


async function devIdentify(email, optionalGooglePlusAPIKey) {
  var dev = new devIdentifyUtility(optionalGooglePlusAPIKey)
  return dev.identify(email)
}


function devIdentifyUtility(optionalGooglePlusAPIKey) {
  this.gPlusAPIKey = optionalGooglePlusAPIKey

  /*
  Fetches the name and profile picture
  associated with an email address.
  */
  this.identify = async function(email) {
    //First validate the format.
    if(!this.validateEmail(email)) { return {success: false, error: "Invalid email format"} }
    //Start by checking Gravatar.
    var result = await this.checkGravatar(email)
    if(result.success) {
      //Got a result, send it back.
      return result
    }
    //Then check Google.
    var result = await this.checkGoogle(email)
    if(result.success) {
      //Got a result, use it to check Google Plus.
      var gpResult = await this.checkGooglePlus(result.id)
      if(gpResult.success) {
        result = gpResult
      }
      else {
        delete result.id
      }
      return result
    }
    //No result found.
    return {success: false, error: "No result found"}
  }



  /*
  Checks if an email address exists on
  Gravatar and returns the name & profile picture.
  */
  this.checkGravatar = function(email) {
    //Create a promise as a response.
    return new Promise(function(resolve, reject) {
      //Assemble the request and send it to the Gravatar API.
      var hash = md5(email)
      request("GET", "https://en.gravatar.com/" + hash + ".json", {
        headers: {
         "user-agent": "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13"
        }
      })
      .done(function(response) {
        //Validate and standardize response.
        if(response.statusCode !== 200) { return resolve({success: false}) }
        response = JSON.parse(response.getBody("utf8")).entry[0]
        //Select the best available name.
        var name = ""
        if(response.name && response.name.formatted) {
          name = response.name.formatted
        }
        else {
          //Uses the display name if nothing else is available and if it's not the username.
          if(response.displayName && response.displayName !== response.preferredUsername) { name = response.displayName }
        }
        //Validates that the image isn't a default.
        var gravatarImage = "https://en.gravatar.com/avatar/" + hash + ".jpg?size=500"
        request("GET", gravatarImage).done(function(imageResult) {
          //Check if the default image's MD5 checksum matches the default's.
          if(md5(imageResult.getBody()) == "73d9d172659124415e7aa5b0b737a4b4") {
            gravatarImage = ""
          }
          if(!name && !gravatarImage) { return resolve({success: false}) }
          //Return the result.
          return resolve({success: true, name: name, profile_picture: gravatarImage, source: "Gravatar"})
        })
      })
    })
  }



  /*
  Checks if an email address exists on
  Google and returns the name, Google ID
  & profile picture.
  */
  this.checkGoogle = function(email) {
    //Create a promise as a response.
    return new Promise(function(resolve, reject) {
      //Send the request to Google's API.
      request("GET", "https://picasaweb.google.com/data/entry/api/user/" + email + "?alt=json")
      .done(function(response) {
        //Validate and standardize response.
        if(response.statusCode !== 200) { return resolve({success: false}) }
        response = JSON.parse(response.getBody("utf8"))
        var id = response.entry.title.$t
        var name = response.entry.author[0].name.$t
        var image = response.entry.gphoto$thumbnail.$t + "?sz=500"
        //Make sure the name isn't a Google ID.
        if(!isNaN(name)) { name = "" }
        if(!name && !image) { return resolve({success: false}) }
        //Return the result.
        return resolve({success: true, id: id, name: name, profile_picture: image, source: "Google"})
      })
    })
  }



  /*
  Get the profile picture and name
  from Google Plus.
  */
  this.checkGooglePlus = function(googleID) {
    //Create a promise as a response.
    var gPlusAPIKey = this.gPlusAPIKey
    return new Promise(function(resolve, reject) {
      if(!gPlusAPIKey) { return resolve({success: false}) }
      //Send the request to the Google Plus API.
      request("GET", "https://www.googleapis.com/plus/v1/people/" + googleID + "?key=" + gPlusAPIKey)
      .done(function(response) {
        //Validate and standardize response.
        if(response.statusCode !== 200) { return resolve({success: false}) }
        response = JSON.parse(response.getBody("utf8"))
        //Make sure image isn't an auto-generated default.
        if(response.image && response.image.isDefault === false) {
          var image = response.image.url + "0"
        }
        else {
          var image = ""
        }
        var name = response.displayName
        //Make sure the name isn't a Google ID.
        if(!isNaN(name)) { name = "" }
        if(!name && !image) { return resolve({success: false}) }
        //Return the result.
        return resolve({success: true, name: name, profile_picture: image, source: "Google Plus"})
      })
    })
  }



  /*
  Validates an email address's format.
  */
  this.validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

}
