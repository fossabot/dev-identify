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


function devIdentify(email, callback, optionalGooglePlusAPIKey) {
  var dev = new devIdentifyUtility(optionalGooglePlusAPIKey)
  dev.identify(email, callback)
}


function devIdentifyUtility(optionalGooglePlusAPIKey) {
  this.optionalGooglePlusAPIKey = optionalGooglePlusAPIKey

  /*
  Fetches the name and profile picture
  associated with an email address.
  */
  this.identify = function(email, callback) {
    if(!this.validateEmail(email)) {
      callback({success: false, error: "Invalid email format"})
      return
    }
    xthis = this
    this.checkGravatar(email, function(result) {
      if(result.success) {
        callback(result)
        return
      }
      xthis.checkGoogle(email, function(result) {
        if(result.success) {
          xthis.checkGooglePlus(result.id, function(gpResult) {
            if(gpResult.success) {
              callback(gpResult)
            }
            else {
              delete result.id;
              callback(result)
            }
            return
          })
        }
        else {
          callback({success: false, error: "No result found"})
          return
        }
      })
    })
  }



  /*
  Checks if an email address exists on
  Gravatar and returns the name & profile picture.
  */
  this.checkGravatar = function(email, callback) {
    var hash = md5(email)
    request("GET", "https://en.gravatar.com/" + hash + ".json", {
      headers: {
       "user-agent": "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13",
      }
    }).done(function(response) {
      if(response.statusCode !== 200) {
        callback({success: false})
        return
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
      gravatarImage = "https://en.gravatar.com/avatar/" + hash + ".jpg?size=500"
      request("GET", gravatarImage).done(function(imageResult) {
        if(md5(imageResult.getBody()) == "73d9d172659124415e7aa5b0b737a4b4") {
          gravatarImage = ""
        }
        if(!name && !gravatarImage) {
          callback({success: false})
          return
        }

        callback({success: true, name: name, profile_picture: gravatarImage, source: "Gravatar"})
      })
    })
  }



  /*
  Checks if an email address exists on
  Google and returns the name, Google ID
  & profile picture.
  */
  this.checkGoogle = function(email, callback) {
    request("GET", "https://picasaweb.google.com/data/entry/api/user/" + email + "?alt=json")
    .done(function(response) {
      if(response.statusCode !== 200) {
        callback({success: false})
        return
      }
      var response = JSON.parse(response.getBody("utf8"))
      var id = response.entry.title.$t
      var name = response.entry.author[0].name.$t
      var image = response.entry.gphoto$thumbnail.$t + "?sz=500"
      if(!isNaN(name)) {
        var name = ""
      }
      if(!name && !image) {
        callback({success: false})
        return
      }

      callback({success: true, id: id, name: name, profile_picture: image, source: "Google"})
    })
  }



  /*
  Get the profile picture and name
  from Google Plus.
  */
  this.checkGooglePlus = function(googleID, callback) {
    if(!this.optionalGooglePlusAPIKey) {
      callback({success: false})
      return
    }
    request("GET", "https://www.googleapis.com/plus/v1/people/" + googleID + "?key=" + this.optionalGooglePlusAPIKey)
    .done(function(response) {
      if(response.statusCode !== 200) {
        callback({success: false})
        return
      }
      var response = JSON.parse(response.getBody("utf8"))
      if(response.image.isDefault === false) {
        var image = response.image.url + "0"
      }
      else {
        var image = ""
      }
      var name = response.displayName
      if(!isNaN(name)) {
        var name = ""
      }
      if(!name && !image) {
        callback({success: false})
        return
      }

      callback({success: true, name: name, profile_picture: image, source: "Google Plus"})
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
