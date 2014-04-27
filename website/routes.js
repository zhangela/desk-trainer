Router.configure({
  loadingTemplate: "loading"
});

Router.map(function() {
  this.route('workout', {
    waitOn: function () {
      Session.set("redirectUrl", this.params.redirect);
      Meteor.subscribe("workouts", loadRandomWorkout);
    }
  });
  this.route('addWorkout');
  this.route('about');
});