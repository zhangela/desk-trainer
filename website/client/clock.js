function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function arcPath(x, y, radius, startAngle, endAngle) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
      "Z"
    ].join(" ");

    return d;
}

Template.clock.helpers({
  arcPath: function () {
    var degrees = 0;

    if (Session.get("timer")) {
      degrees = 360 - Session.get("timer") /
        Session.get("currentWorkout").duration * 360;
    }

    return arcPath(50, 50, 300, 0, degrees);
  }
});