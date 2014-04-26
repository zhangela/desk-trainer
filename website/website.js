if (Meteor.isClient) {
  Session.setDefault("timer", 10);

  var tick = function () {
    if (Session.get("playing") && Session.get("timer") > 0) {
      Session.set("timer", Session.get("timer") - 1);
    }
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
}
