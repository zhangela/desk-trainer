if (! localStorage.visitCount) {
  localStorage.visitCount = 0;
}

localStorage.visitCount = parseInt(localStorage.visitCount, 10) + 1;
console.log(window.location, localStorage.visitCount);

if (window.location.host.indexOf("facebook") >= 0) {
    window.location = "http://meteor.com";
}
