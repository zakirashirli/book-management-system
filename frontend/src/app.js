const API_URL = "http://localhost:8080";

// --- Navigation & View Transitions Helper ---
function navigate(url) {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      window.location.href = url;
    });
  } else {
    window.location.href = url;
  }
}

// --- Local Storage & Session ---
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
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

function showMessage(elementId, message, success) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.innerText = message;
  element.className = success ? "message success" : "message error";
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// --- Auth APIs ---
async function registerUser() {
  const username = document.getElementById("registerUsername")?.value;
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("registerPassword")?.value;
  const role = document.getElementById("registerRole")?.value || "USER";

  const requestBody = { username, email, password, role };

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();

    if (!response.ok) {
      showMessage("registerMessage", text || "Register Failed", false);
      return;
    }

    showMessage("registerMessage", text || "Register Successful! Redirecting...", true);

    // Smooth transition to verify OTP page
    setTimeout(() => {
      navigate("verify.html");
    }, 600);

  } catch (error) {
    showMessage("registerMessage", "Server connection error", false);
    console.error(error);
  }
}

async function verifyOtp() {
  const email = document.getElementById("verifyEmail")?.value;
  const code = document.getElementById("verifyCode")?.value;

  try {
    const response = await fetch(`${API_URL}/api/auth/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
      method: "POST"
    });

    const text = await response.text();

    if (!response.ok) {
      showMessage("verifyMessage", text || "Verification Failed", false);
      return;
    }

    showMessage("verifyMessage", "Verified! Redirecting to Login...", true);

    // Smooth transition to login
    setTimeout(() => {
      navigate("login.html");
    }, 600);

  } catch (error) {
    showMessage("verifyMessage", "Server connection error", false);
    console.error(error);
  }
}

async function login() {
  const username = document.getElementById("username")?.value;
  const password = document.getElementById("password")?.value;

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      showMessage("loginMessage", error.message || error.detail || `Login error: ${response.status}`, false);
      return;
    }

    const data = await response.json();
    saveToken(data.accessToken);
    saveRefreshToken(data.refreshToken);

    showMessage("loginMessage", "Login Successful! Loading dashboard...", true);

    // Smooth transition to Profile / Dashboard
    setTimeout(() => {
      navigate("profile.html");
    }, 450);

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
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

  try {
    if (refreshToken) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
    }
  } catch (error) {
    console.error("Logout request error:", error);
  } finally {
    logout();
    showMessage("logoutMessage", "Logged out. Redirecting...", true);
    setTimeout(() => {
      navigate("login.html");
    }, 350);
  }
}

async function forgotPassword() {
  const email = document.getElementById("forgotEmail")?.value;

  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const text = await response.text();

    if (!response.ok) {
      showMessage("forgotMessage", text || "Forgot password failed", false);
      return;
    }

    showMessage("forgotMessage", "OTP sent! Redirecting to Reset...", true);

    setTimeout(() => {
      navigate("reset-password.html");
    }, 700);

  } catch (error) {
    showMessage("forgotMessage", "Server connection error", false);
    console.error(error);
  }
}

async function resetPassword() {
  const email = document.getElementById("resetEmail")?.value;
  const code = document.getElementById("resetCode")?.value;
  const newPassword = document.getElementById("newPassword")?.value;

  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword })
    });

    const text = await response.text();

    if (!response.ok) {
      showMessage("resetMessage", text || "Password reset failed", false);
      return;
    }

    showMessage("resetMessage", "Password changed! Redirecting to login...", true);

    setTimeout(() => {
      navigate("login.html");
    }, 700);

  } catch (error) {
    showMessage("resetMessage", "Server connection error", false);
    console.error(error);
  }
}

// --- Books / Catalog APIs ---
async function getBooks() {
  const token = getToken();
  const booksContainer = document.getElementById("books");

  if (!token) {
    if (booksContainer) booksContainer.innerHTML = '<p style="color:#ef4444;">Please Login</p>';
    return;
  }

  const page = document.getElementById("page")?.value || 0;
  const size = document.getElementById("size")?.value || 10;
  const sortBy = document.getElementById("sortBy")?.value || "id";
  const direction = document.getElementById("direction")?.value || "asc";

  try {
    const response = await fetch(`${API_URL}/api/books?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      if (booksContainer) booksContainer.innerHTML = "Cannot load books";
      return;
    }

    const data = await response.json();
    renderBooks(data.content || data, "books");

  } catch (error) {
    if (booksContainer) booksContainer.innerHTML = "Server Error";
    console.error(error);
  }
}

async function filterBooks() {
  const token = getToken();
  const resultsContainer = document.getElementById("filteredBooks");

  if (!token) {
    if (resultsContainer) resultsContainer.innerHTML = "Please Log In";
    return;
  }

  const title = document.getElementById("filterTitle")?.value;
  const author = document.getElementById("filterAuthor")?.value;
  const minPrice = document.getElementById("filterMinPrice")?.value;
  const maxPrice = document.getElementById("filterMaxPrice")?.value;

  let url = `${API_URL}/api/books/filter?page=0&size=10&sortBy=title&direction=asc`;
  if (title) url += `&title=${encodeURIComponent(title)}`;
  if (author) url += `&author=${encodeURIComponent(author)}`;
  if (minPrice) url += `&minPrice=${minPrice}`;
  if (maxPrice) url += `&maxPrice=${maxPrice}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (resultsContainer) resultsContainer.innerHTML = "Cannot Filter Books";
      return;
    }

    const data = await response.json();
    renderBooks(data.content || data, "filteredBooks");

  } catch (error) {
    if (resultsContainer) resultsContainer.innerHTML = "Server Error";
    console.error(error);
  }
}

async function createBook() {
  const token = getToken();

  if (!token) {
    showMessage("createMessage", "Please login first!", false);
    return;
  }

  const titleInput = document.getElementById("createTitle");
  const authorInput = document.getElementById("createAuthor");
  const priceInput = document.getElementById("createPrice");
  const amountInput = document.getElementById("createAmount");

  const requestBody = {
    title: titleInput.value,
    author: authorInput.value,
    price: Number(priceInput.value),
    amount: Number(amountInput.value)
  };

  try {
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

    titleInput.value = "";
    authorInput.value = "";
    priceInput.value = "";
    amountInput.value = "";

    getBooks();

  } catch (error) {
    showMessage("createMessage", "Server error", false);
    console.error(error);
  }
}

function renderBooks(books, elementId) {
  const booksDiv = document.getElementById(elementId);
  if (!booksDiv) return;

  booksDiv.innerHTML = "";

  if (!books || books.length === 0) {
    booksDiv.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:1.5rem 0;grid-column:1/-1;">No books found</p>';
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
      <div class="book-amount">${Number(book.amount).toFixed(0)} in stock</div>
    `;
    booksDiv.appendChild(div);
  });
}

// --- PDF Form Setup ---
function setupBookFileForm() {
  const form = document.getElementById("bookFileForm");
  const downloadButton = document.getElementById("downloadBookPdf");
  const idInput = document.getElementById("uploadBookId");
  const fileInput = document.getElementById("bookPdf");
  const message = document.getElementById("bookFileMessage");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = getToken();

    if (!token) {
      message.textContent = "Please login first";
      return;
    }

    try {
      const file = fileInput.files[0];
      if (!file) throw new Error("Select a PDF file");
      if (file.size > 10 * 1024 * 1024) throw new Error("Max size is 10 MB");

      const data = new FormData();
      data.append("file", file);

      const response = await fetch(`${API_URL}/api/books/${encodeURIComponent(idInput.value)}/file`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data
      });

      if (!response.ok) throw new Error(`Upload error: ${response.status}`);
      message.textContent = "PDF successfully uploaded!";
    } catch (error) {
      message.textContent = error.message;
    }
  });

  if (downloadButton) {
    downloadButton.addEventListener("click", async () => {
      const token = getToken();
      if (!token) {
        message.textContent = "Please login first";
        return;
      }
      if (!idInput.reportValidity()) return;

      try {
        const response = await fetch(`${API_URL}/api/books/${encodeURIComponent(idInput.value)}/file`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Download failed: ${response.status}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `book-${idInput.value}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        message.textContent = "File downloaded!";
      } catch (error) {
        message.textContent = error.message;
      }
    });
  }
}

// --- Lifecycle Router Guard ---
function initRoute() {
  const path = window.location.pathname;

  // Protect profile page
  if (path.includes("profile.html")) {
    if (!getToken()) {
      navigate("login.html");
      return;
    }
    if (document.getElementById("books")) {
      getBooks();
    }
  }

  // Redirect away from login/register if already authenticated
  if ((path.includes("login.html") || path.includes("register.html")) && getToken()) {
    navigate("profile.html");
    return;
  }

  setupBookFileForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRoute);
} else {
  initRoute();
}