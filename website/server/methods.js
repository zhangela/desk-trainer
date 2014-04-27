Meteor.methods({
  updateContact: function (email, workoutDuration, distactionTime) {
    this.unblock();

    var result = HTTP.call("GET",
      "https://api.constantcontact.com/v2/contacts",
      {
        params: {
          api_key: "9wqpdy49wktm3bah6h9kjnmu",
          email: email,
          limit: 1
        },
        headers: {
          "Authorization": "Bearer 0a7de326-bb8d-4453-a7ec-55e2b36d6a1a"
        }
      });

    var contact;
    if (result.data && result.data.results && result.data.results.length > 0) {
      contact = result.data.results[0];
    }

    var oldWorkoutDuration = 0;
    var oldDistractionTime = 0;
    if (contact && contact.custom_fields) {
      var CustomField1 = _.where(contact.custom_fields, {name: "CustomField1"});
      var CustomField2 = _.where(contact.custom_fields, {name: "CustomField2"});

      console.log(CustomField1);
      console.log(CustomField2);

      if (CustomField1.length > 0) {
        CustomField1 = CustomField1[0].value;
        oldWorkoutDuration = parseInt(CustomField1, 10);
        console.log("oldWorkoutDuration: " + oldWorkoutDuration);
      }

      if (CustomField2.length > 0) {
        CustomField2 = CustomField2[0].value;
        oldDistractionTime = parseInt(CustomField2, 10);
        console.log("oldDistractionTime: " + oldDistractionTime);
      }
    }

    var newWorkoutDuration = oldWorkoutDuration + workoutDuration + "";
    var newDistractionTime = oldDistractionTime + distactionTime + "";

    if (contact) {
      var result = HTTP.call("PUT",
        "https://api.constantcontact.com/v2/contacts/" + contact.id,
        {
          params: {
            api_key: "9wqpdy49wktm3bah6h9kjnmu",
            action_by: "ACTION_BY_VISITOR"
          },
          headers: {
            "Authorization": "Bearer 0a7de326-bb8d-4453-a7ec-55e2b36d6a1a"
          },
          data: {
              "lists": [
                  {
                      "id": "1673774891"
                  }
              ],
              "email_addresses": [
                  {
                      "email_address": email
                  }
              ],
              "custom_fields": [
                  {
                      "name": "CustomField1",
                      "value": newWorkoutDuration
                  },
                  {
                      "name": "CustomField2",
                      "value": newDistractionTime
                  }
              ]
          }
        });
    } else {
      var result = HTTP.call("POST",
        "https://api.constantcontact.com/v2/contacts",
        {
          params: {
            api_key: "9wqpdy49wktm3bah6h9kjnmu",
            action_by: "ACTION_BY_VISITOR"
          },
          headers: {
            "Authorization": "Bearer 0a7de326-bb8d-4453-a7ec-55e2b36d6a1a"
          },
          data: {
              "lists": [
                  {
                      "id": "1673774891"
                  }
              ],
              "email_addresses": [
                  {
                      "email_address": email
                  }
              ],
              "custom_fields": [
                  {
                      "name": "CustomField1",
                      "value": newWorkoutDuration
                  },
                  {
                      "name": "CustomField2",
                      "value": newDistractionTime
                  }
              ]
          }
        });
    }
  }
});