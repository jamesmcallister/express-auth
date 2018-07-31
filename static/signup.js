let myForm = document.getElementById("my-form");
myForm.addEventListener("submit", function(event) {
  event.preventDefault();

  // @ts-ignore
  const username = document.getElementById("username").value;
  // @ts-ignore
  const password = document.getElementById("password").value;

  fetch("/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    credentials: "same-origin",
    headers: {
      "content-type": "application/json"
    }
  }).then(
    response =>
      response.status === 200
        ? (window.location.pathname = "/login")
        : alert("something when wrong")
  );
});
