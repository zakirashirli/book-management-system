const API_URL = "";

function getToken() {
    return localStorage.getItem("token");
}

function saveToken(token) {
    localStorage.setItem("token", token);
}

function logout() {
    localStorage.removeItem("token")
    showMessage();
}

function showMessage(elementId, message, success) {
    const element = document.getElementById(elementId);
    element.innerText = message;

    if (success) {
        element.className = "success";
    } else {
        element.className = "error";
    }
}

function getAuthHeaders() {
    const token = getToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

async function registerUser() {
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("registerPassword").value;
    const requestBody = {
        username: username,
        email: email,
        password: password
    };

    try{
        const  response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const text = await response.text();

        if (!response.ok) {
            showMessage("registerMessage", text || "Register Failed", false);
            return;
        }
        showMessage("registerMessage", text || "Register Successful", true);

    } catch (error) {
        showMessage("registerMessage", "Server connection error", false);
        console.error(error);
    }
}


async function verifyOtp() {
    const email = document.getElementById("verifyEmail").value
    const code = document.getElementById("verifyCode").value

    try{
        const response = await fetch(`${API_URL}/api/auth/verify-email?email=${email}&code=${code}`, {
            method: "POST",
        });

        const text = await response.text();

        if (!response.ok) {
            showMessage("verifyMessage", text || "Verification Failed", false);
            return;
        }

        showMessage("verifyMessage", text || "Verification Successful", true);
    } catch (error) {
        showMessage("verifyMessage", "Server connection error", false);
        console.error(error);
    }
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const requestBody = {
        username: username,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            showMessage("loginMessage", "Login Failed", false);
            return;
        }

        const token = await response.text();

        saveToken(token);

        showMessage("loginMessage",  "Login SuccessFul", true);

    } catch (error) {

        showMessage("loginMessage", "Server connection error", false);
        console.error(error);

    }
}












