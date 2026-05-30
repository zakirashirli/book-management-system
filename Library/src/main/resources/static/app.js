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

async function getBooks() {
    const token = getToken();

    if (!token) {
        document.getElementById("books").innerHTML = "Please Login";
        return;
    }

    const page = document.getElementById("page").value;
    const size = document.getElementById("size").value;
    const sortBy = document.getElementById("sortBy").value;
    const direction = document.getElementById("direction").value;

    try{
        const response = await fetch(`${API_URL}/api/books?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok){
            document.getElementById("books").innerHTML = "Cannot load books";
            return;
        }

        const data = await response.json();

        renderBooks(data.content, "books");

    }catch (error) {
        document.getElementById("books").innerHTML = "Server Error";
        console.error(error);
    }
}


async function createBook() {
    const token = getToken();

    if (!token) {
        showMessage("createMessage", "Please login first!", false);
        return;
    }

    const title = document.getElementById("createTitle").value;
    const author = document.getElementById("createAuthor").value;
    const price = document.getElementById("createPrice").value;
    const requestBody = {
        title: title,
        author: author,
        price: Number(price)
    }

    try{
      const response = await fetch(`${API_URL}/api/books`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody)
      });

      const text = await response.text();

      if (!response.ok) {
          showMessage("createMessage", text || "Book creation failed", false);

          return;
      }

      showMessage("createMessage", text || "Book creation successful", true);

      document.getElementById("createTitle").value = "";
      document.getElementById("createAuthor").value = "";
      document.getElementById("createPrice").value = "";

      getBooks();

    } catch (error) {
        showMessage("createMessage", "Server error", false);
        console.error(error);
    }
}

function renderBooks(books, elementId) {
    const booksDiv = document.getElementById(elementId);
    booksDiv.innerHTML = "";

    if (!books || books.length === 0) {
        booksDiv.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:1.5rem 0;">No books found</p>';
        return;
    }

    books.forEach(book => {
        const div = document.createElement("div");
        div.className = "book";
        div.innerHTML = `
            <div class="book-id">ID · ${book.id}</div>
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-price">$${Number(book.price).toFixed(2)}</div>
        `;
        booksDiv.appendChild(div);
    });
}