/* ============================================================
   AUTH — login / signup form logic
   ============================================================ */

function showAlert(el, msg) {
  el.textContent = msg;
  el.classList.add("show");
}
function hideAlert(el) {
  el.classList.remove("show");
}

function setFieldError(fieldEl, msg) {
  const input = fieldEl.querySelector("input");
  const err = fieldEl.querySelector(".field-error");
  if (msg) {
    input.classList.add("invalid");
    err.textContent = msg;
  } else {
    input.classList.remove("invalid");
    err.textContent = "";
  }
}

function setLoading(btn, loading, labelDefault, labelLoading) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="loader"><span></span><span></span><span></span><span></span></span> ${labelLoading}`
    : labelDefault;
}

/* ---------- Login page ---------- */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  const alertEl = document.getElementById("login-alert");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const emailField = document.getElementById("field-email");
    const passField = document.getElementById("field-password");
    const email = emailField.querySelector("input").value.trim();
    const password = passField.querySelector("input").value;

    let valid = true;
    if (!email) { setFieldError(emailField, "Enter a valid User Id"); valid = false; }
    else setFieldError(emailField, "");
    if (!password) { setFieldError(passField, "Enter your password"); valid = false; }
    else setFieldError(passField, "");
    if (!valid) return;

    const btn = document.getElementById("login-submit");
    setLoading(btn, true, "Log in", "Logging in…");
    console.log("Login")
    fetch(`http://127.0.0.1:8000/signInAccount?user_id=${email}&password=${password}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "True"
      }
    })
      .then(response => response.json())
      .then((data) => {
        console.log(data)
        if (data.Response) {
          window.location.href = "dashboard.html"
          sessionStorage.setItem("user_id", data.Response)
          close()
        }
        else {
          showAlert(alertEl, "Invalid UserName Or Password")
        }
      })
      .catch(error => console.error('Error:', error));
  });
}

/* ---------- Signup page ---------- */
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  const alertEl = document.getElementById("signup-alert");
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const nameField = document.getElementById("field-name");
    const passField = document.getElementById("field-password");
    const name = nameField.querySelector("input").value.trim();
    const password = passField.querySelector("input").value;

    let valid = true;
    if (name.length < 2) { setFieldError(nameField, "Enter your full name"); valid = false; }
    else setFieldError(nameField, "");
    if (password.length < 6) { setFieldError(passField, "Use at least 6 characters"); valid = false; }
    else setFieldError(passField, "");
    if (!valid) return;

    const btn = document.getElementById("signup-submit");
    setLoading(btn, true, "Create account", "Creating account…");
    res = fetch(`http://127.0.0.1:8000/createAccount?user_name=${name}&password=${password}`, {
      "method": "POST"
    }).then((response) => {
      response.json().then(data => {
        if (data) {
          sessionStorage.setItem("user_id", data.Response)
          alert(`Your User ID is: ${data.Response}. Save it`)
          window.location.href = 'dashboard.html'
        }
        else {
          showAlert(alertEl, "Couldn't create your account. Try again.")
        }
      })
    })
  });
}