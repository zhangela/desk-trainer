Workouts = new Meteor.Collection("workouts");

loadRandomWorkout = function () {
  var workout = _.sample(Workouts.find().fetch());

  Session.set("currentWorkout", workout);
  Session.set("timer", workout.duration);
};

if (Meteor.isClient) {
  Session.setDefault("totalTime", 120);

  var workoutCompleted = function () {
    if (Session.get("redirectUrl")) {
      window.location.replace(Session.get("redirectUrl"));
    } else {
      Session.set("playing", false)
      Session.set("done", true);
    }
  };

  var tick = function () {
    if (Session.get("playing")) {
      if (Session.get("timer") > 0) {
        Session.set("timer", Session.get("timer") - 1);
        Session.set("totalTime", Session.get("totalTime") - 1);
      }

      if (Session.get("totalTime") <= 0) {
        workoutCompleted();
        return;
      }

      if (Session.get("timer") <= 0) {
        loadRandomWorkout();
      }
    }
  };

  setInterval(tick, 1000);

  Template.workout.helpers({
    timer: function () {
      return Session.get("timer");
    },
    totalTimer: function () {
      return Session.get("totalTime");
    },
    playing: function () {
      return Session.get("playing");
    },
    currentWorkout: function () {
      return Session.get("currentWorkout");
    },
    done: function () {
      return Session.get("done");
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
    },
    "click .delete": function (event) {
      event.preventDefault();

      Workouts.remove({_id: this._id});
    }
  });

  Template.addWorkout.helpers({
    workouts: function () {
      return Workouts.find().fetch();
    }
  });
}
