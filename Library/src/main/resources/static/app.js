const API_URL = "";

function getToken() {
    return localStorage.getItem("token");
}

function saveToken(token) {
    localStorage.setItem("token", token);
}

function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

function saveRefreshToken(refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
}

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
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
    const role = document.getElementById("registerRole").value;
    const requestBody = {
        username: username,
        email: email,
        password: password,
        role: role
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
            const error = await response.json().catch(() => ({}));

            showMessage(
                "loginMessage",
                error.message || error.detail || `Ошибка входа: ${response.status}`,
                false
            );
            return;
        }

        const data = await response.json();

        saveToken(data.accessToken);
        saveRefreshToken(data.refreshToken);

        showMessage("loginMessage",  "Login SuccessFul", true);

    } catch (error) {

        showMessage("loginMessage", "Server connection error", false);
        console.error(error);

    }
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        showMessage("refreshMessage", "Refresh token not found", false);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refreshToken: refreshToken })
        });

        if (!response.ok) {
            showMessage("refreshMessage", "Refresh token failed", false);
            return;
        }

        const data = await response.json();

        saveToken(data.accessToken);
        saveRefreshToken(data.refreshToken);

        showMessage("refreshMessage", "Access token refreshed", true);
    } catch (error) {
        showMessage("refreshMessage", "Server connection error", false);
        console.error(error);
    }
}

async function logoutUser() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        logout();
        showMessage("logoutMessage", "Logged out", true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refreshToken: refreshToken })
        });

        const text = await response.text();

        logout();

        if (!response.ok) {
            showMessage("logoutMessage", text || "Logout failed", false);
            return;
        }

        showMessage("logoutMessage", text || "Logged out successfully!", true);
    } catch (error) {
        logout();
        showMessage("logoutMessage", "Server connection error", false);
        console.error(error);
    }
}

async function forgotPassword() {
    const email = document.getElementById("forgotEmail").value;

    try {
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const text = await response.text();

        if (!response.ok) {
            showMessage("forgotMessage", text || "Forgot password failed", false);
            return;
        }

        showMessage("forgotMessage", text || "OTP sent to email!", true);
    } catch (error) {
        showMessage("forgotMessage", "Server connection error", false);
        console.error(error);
    }
}

async function resetPassword() {
    const email = document.getElementById("resetEmail").value;
    const code = document.getElementById("resetCode").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                code: code,
                newPassword: newPassword
            })
        });

        const text = await response.text();

        if (!response.ok) {
            showMessage("resetMessage", text || "Password reset failed", false);
            return;
        }

        showMessage("resetMessage", text || "Password changed successfully!", true);
    } catch (error) {
        showMessage("resetMessage", "Server connection error", false);
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


async function filterBooks() {
    const token = getToken();

    if (!token) {
        document.getElementById("filteredBooks").innerHTML = "Please Log In";
        return;
    }

    const title = document.getElementById("filterTitle").value;
    const author = document.getElementById("filterAuthor").value;
    const minPrice = document.getElementById("filterMinPrice").value;
    const maxPrice = document.getElementById("filterMaxPrice").value;

    let url = `${API_URL}/api/books/filter?page=0&size=10&sortBy=title&direction=asc`;

    if (title) {
        url += `&title=${title}`;
    }
    if (author) {
        url += `&author=${author}`;
    }
    if (minPrice) {
        url += `&minPrice=${minPrice}`;
    }
    if (maxPrice) {
        url += `&maxPrice=${maxPrice}`;
    }

    try{
        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            document.getElementById("filteredBooks").innerHTML = "Cannot Filtered Books";
            return;
        }
        const data = await response.json();

        renderBooks(data.content, "filteredBooks");
    } catch (error) {
        document.getElementById("filteredBooks").innerHTML = "Server Error";
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
    const amount = document.getElementById("createAmount").value;
    const requestBody = {
        title: title,
        author: author,
        price: Number(price),
        amount: Number(amount)
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
      document.getElementById("createAmount").value = "";

      getBooks();

    } catch (error) {
        showMessage("createMessage", "Server error", false);
        console.error(error);
    }
}

async function updateBook() {
    const token = getToken();

    if (!token) {
        showMessage("updateMessage", "Please login first!", false);
        return;
    }

    const id = document.getElementById("updateId").value;
    const title = document.getElementById("updateTitle").value;
    const author = document.getElementById("updateAuthor").value;
    const price = document.getElementById("updatePrice").value;
    const amount = document.getElementById("updateAmount").value;

    const requestBody = {
        title: title,
        author: author,
        price: Number(price),
        amount: Number(amount)
    };

    try{
        const response = await fetch(`${API_URL}/api/books/${id}`, {
            method: "PUT",
            headers:getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        const text = await response.text();

        if (!response.ok) {
            showMessage("updateMessage", text || "Book update failed", false);
            return;
        }

        showMessage("updateMessage", text || "Book update successful", true);

        getBooks();
    } catch (error) {
        showMessage("updateMessage", "Server Error", false);
        console.error(error);
    }
}

async function deleteBook() {
    const token = getToken();

    if (!token) {
        showMessage("deleteMessage", "Please login first!", false);
        return;
    }

    const id = document.getElementById("deleteId").value;

    try{
        const response = await fetch(`${API_URL}/api/books/${id}`, {
            method: "DELETE",
            headers:getAuthHeaders()
        });

        const text = await response.text();

        if (!response.ok) {
            showMessage("deleteMessage", text || "Book delete failed", false);
            return;
        }

        showMessage("deleteMessage", text || "Book delete successful", true);

        getBooks();

    } catch (error) {
        showMessage("deleteMessage", "Server Error", false);
        console.error(error);
    }

}


function setupBookFileForm() {
    const form = document.getElementById("bookFileForm");
    if (!form) return;

    const idInput = document.getElementById("uploadBookId");
    const fileInput = document.getElementById("bookPdf");
    const message = document.getElementById("bookFileMessage");
    const downloadButton = document.getElementById("downloadBookPdf");

    function authorizationHeaders() {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Сначала войдите в аккаунт");
        }

        return { Authorization: `Bearer ${token}` };
    }

    async function checkResponse(response) {
        if (response.ok) return;

        const error = await response.json().catch(() => ({}));

        throw new Error(
            error.message || error.detail ||
            `Ошибка запроса: ${response.status}`
        );
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const file = fileInput.files[0];

            if (!file) {
                throw new Error("Выберите PDF-файл");
            }

            if (file.size > 10 * 1024 * 1024) {
                throw new Error("Максимальный размер — 10 МБ");
            }

            const data = new FormData();
            data.append("file", file);

            const response = await fetch(
                `/api/books/${encodeURIComponent(idInput.value)}/file`,
                {
                    method: "POST",
                    headers: authorizationHeaders(),
                    body: data
                }
            );

            await checkResponse(response);
            message.textContent = "Файл успешно загружен";
        } catch (error) {
            message.textContent = error.message;
        }
    });

    downloadButton.addEventListener("click", async () => {
        if (!idInput.reportValidity()) return;

        try {
            const response = await fetch(
                `/api/books/${encodeURIComponent(idInput.value)}/file`,
                { headers: authorizationHeaders() }
            );

            await checkResponse(response);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `book-${idInput.value}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
            message.textContent = "Файл скачан";
        } catch (error) {
            message.textContent = error.message;
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupBookFileForm);
} else {
    setupBookFileForm();
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
            <div class="book-amount">${Number(book.amount).toFixed(0)}</div>
        `;
        booksDiv.appendChild(div);
    });
}
