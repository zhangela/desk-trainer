Router.configure({
  loadingTemplate: "loading"
});

Router.map(function() {

  this.route('home', {
    path: '/',
    template: 'home',
    layoutTemplate: null
  });

  this.route('workout', {
    waitOn: function () {
      // set URL to return to after
      Session.set("redirectUrl", this.params.redirect);
      
      // set duration of workout
      var totalTime = 120;
      if (this.params.duration) {
        totalTime = parseInt(this.params.duration, 10);
      }

      Session.set("workoutDuration", totalTime);
      Session.setDefault("totalTime", totalTime + 10);

      // display message about how long you have slacked off for
      var minutes = this.params.distraction;
      Session.set("distraction", minutes);
      var message = null;
      if (minutes) {
        message = "You've been slacking off for " + minutes + " minutes!";
      }

      // subscribe to workout data and then start the initial rest
      Meteor.subscribe("workouts", function () {
        startRest("Get ready to work out!",
          10,
          "http://i.imgur.com/OXlm6g2.png",
          message);
        Session.set("playing", true);
      });
    }
  });
  this.route('addWorkout', {
    waitOn: function () {
      Meteor.subscribe("workouts");
    }
  });
  this.route('about');
});