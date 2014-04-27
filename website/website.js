Workouts = new Meteor.Collection("workouts");

var startWorkout = function (workout) {
  Session.set("currentWorkout", workout);
  Session.set("timer", Math.min(workout.duration, Session.get("totalTime")));
};

startRest = function (name, restTime, imageUrl, description) {
  startWorkout({
    name: name || "Rest",
    duration: restTime || 5,
    imageUrl: imageUrl ||
      "https://hollywoodspinster.files.wordpress.com/2011/11/homer_sleeping_on_sofa_wallpaper_-_1280x800.jpg",
    rest: true,
    description: description
  });
};

var restOrRandomWorkout = function () {
  if (Session.get("currentWorkout") &&
    Session.get("currentWorkout").rest) {
      loadRandomWorkout();
    } else {
      startRest("Rest", 5);
    }
};

var loadRandomWorkout = function () {
  var workout = _.sample(Workouts.find().fetch());

  startWorkout(workout);
};

if (Meteor.isClient) {
  Session.setDefault("muted", amplify.store("muted"));

  var tickSound = new Audio("tick.mp3");
  tickSound.volume = 0.5;
  var dingSound = new Audio("ding.mp3");

  var workoutCompleted = function () {
    if (Session.get("redirectUrl")) {
      window.location.replace(Session.get("redirectUrl"));
    } else {
      Session.set("playing", false);
      Session.set("done", true);
    }
  };

  var tick = function () {
    if (Session.get("playing")) {
      if (Session.get("timer") > 0) {
        if (! Session.get("muted")) {
          tickSound.play();
        }

        Session.set("timer", Session.get("timer") - 1);
        Session.set("totalTime", Session.get("totalTime") - 1);
      }

      if (Session.get("totalTime") <= 0) {
        if (! Session.get("muted")) {
          dingSound.play();
        }

        workoutCompleted();
        return;
      }

      if (Session.get("timer") <= 0) {
        if (! Session.get("muted")) {
          dingSound.play();
        }

        restOrRandomWorkout();
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
    },
    muted: function () {
      return Session.get("muted");
    }
  });

  Template.workout.events({
    "click .start": function () {
      Session.set("playing", true);
    },
    "click .pause": function () {
      Session.set("playing", false);
    },
    "click .mute": function () {
      Session.set("muted", true);
      amplify.store("muted", true);
    },
    "click .unmute": function () {
      Session.set("muted", false);
      amplify.store("muted", false);
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
