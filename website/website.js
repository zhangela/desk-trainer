Workouts = new Meteor.Collection("workouts");

if (Meteor.isClient) {
  Session.setDefault("timer", 10);

  var workoutCompleted = function () {
    // do what????
  };

  var tick = function () {
    if (Session.get("playing") && Session.get("timer") > 0) {
      Session.set("timer", Session.get("timer") - 1);
    }

    workoutCompleted();
  };

  setInterval(tick, 1000);

  Template.workout.helpers({
    timer: function () {
      return Session.get("timer");
    },
    playing: function () {
      return Session.get("playing");
    }
  });

  Template.workout.events({
    "click .start": function () {
      Session.set("playing", true);
    },
    "click .pause": function () {
      Session.set("playing", false);
    }
  });

  Template.addWorkout.events({
    "submit form": function (event) {
      event.preventDefault();
      var formData = FormUtils.serializeForm(event.target);

      Workouts.insert(formData);
    }
  });
}
