/*
Dev Identify fetches the name and
profile picture associated with an email address.

Written by Dev Uncoded ( https://github.com/DevUncoded )
And Rohan Rishi ( https://github.com/RohanRishi )

MIT License ( https://opensource.org/licenses/MIT )
*/
const request = require("sync-request")
const md5 = require("md5")

module.exports = devIdentify
module.exports["default"] = devIdentify
module.exports["utility"] = devIdentifyUtility


function devIdentify(email, optionalGooglePlusAPIKey) {
  var dev = new devIdentifyUtility()
  return dev.identify(email, optionalGooglePlusAPIKey)
}


function devIdentifyUtility() {

  /*
  Fetches the name and profile picture
  associated with an email address.
  */
  this.identify = function(email, optionalGooglePlusAPIKey) {
    if(!this.validateEmail(email)) {
      return {success: false, error: "Invalid email format"}
    }
    var gravatar = this.checkGravatar(email)
    if(gravatar.success) {
      return gravatar
    }
    else {
      var google = this.checkGoogle(email)
      if(google.success) {
        var googlePlus = this.checkGooglePlus(google.id, optionalGooglePlusAPIKey)
        if(googlePlus.success) {
          return googlePlus
        }
        return google
      }
    }

    return {success: false, error: "No result found"}
  }



  /*
  Checks if an email address exists on
  Gravatar and returns the name & profile picture.
  */
  this.checkGravatar = function(email) {
    var hash = md5(email)
    var response = request("GET", "https://en.gravatar.com/" + hash + ".json", {
      headers: {
       "user-agent": "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13",
      }
    })
    if(response.statusCode !== 200) {
      return {success: false}
    }
    var response = JSON.parse(response.getBody("utf8"))
    if(!response.entry[0].name.formatted) {
      if(response.entry[0].displayName) {
        var name = response.entry[0].displayName
      }
      else {
        var name = ""
      }
    }
    else {
      var name = response.entry[0].name.formatted
    }

    var image = "https://en.gravatar.com/avatar/" + hash + ".jpg?size=500"
    if(md5(image) == "075087dca3f0792c244ab08e8308dec5") {
      //Default image.
      var image = ""
    }

    return {success: true, name: name, profile_picture: image, source: "Gravatar"}
  }



  /*
  Checks if an email address exists on
  Google and returns the name, Google ID
  & profile picture.
  */
  this.checkGoogle = function(email) {
    var response = request("GET", "https://picasaweb.google.com/data/entry/api/user/" + email + "?alt=json")
    if(response.statusCode !== 200) {
      return {success: false}
    }
    var response = JSON.parse(response.getBody("utf8"))
    var id = response.entry.title.$t
    var name = response.entry.author[0].name.$t
    var image = response.entry.gphoto$thumbnail.$t + "?sz=500"

    return {success: true, id: id, name: name, profile_picture: image, source: "Google"}
  }



  /*
  Get the profile picture and name
  from Google Plus.
  */
  this.checkGooglePlus = function(google_id, optionalGooglePlusAPIKey) {
    if(!optionalGooglePlusAPIKey) { return {success: false} }
    var response = request("GET", "https://www.googleapis.com/plus/v1/people/" + google_id + "?key=" + optionalGooglePlusAPIKey)
    if(response.statusCode !== 200) {
      return {success: false}
    }
    var response = JSON.parse(response.getBody("utf8"))
    if(response.image.isDefault === false) {
      var image = response.image.url + "0"
    }
    else {
      var image = ""
    }

    var name = response.displayName

    return {success: true, name: name, profile_picture: image, source: "Google Plus"}
  }



  /*
  Validates an email address's format.
  */
  this.validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

}
