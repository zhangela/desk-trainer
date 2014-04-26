Meteor.publish("workouts", function () {
  return Workouts.find();
});