const API_BASE_URL = "http://localhost:8081/api/tasks";

const taskGrid = document.getElementById("taskGrid");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");

const totalTaskCount = document.getElementById("totalTaskCount");
const pendingTaskCount = document.getElementById("pendingTaskCount");
const progressTaskCount = document.getElementById("progressTaskCount");
const completedTaskCount = document.getElementById(
    "completedTaskCount"
);

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const resetFiltersButton = document.getElementById(
    "resetFiltersButton"
);

const taskModal = document.getElementById("taskModal");
const modalOverlay = document.getElementById("modalOverlay");
const openCreateModalButton = document.getElementById(
    "openCreateModalButton"
);
const closeModalButton = document.getElementById("closeModalButton");
const cancelButton = document.getElementById("cancelButton");

const modalTitle = document.getElementById("modalTitle");
const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById(
    "taskDescription"
);
const taskStatusInput = document.getElementById("taskStatus");
const taskPriorityInput = document.getElementById("taskPriority");
const saveTaskButton = document.getElementById("saveTaskButton");
const formErrorMessage = document.getElementById("formErrorMessage");

const deleteModal = document.getElementById("deleteModal");
const deleteModalOverlay = document.getElementById(
    "deleteModalOverlay"
);
const cancelDeleteButton = document.getElementById(
    "cancelDeleteButton"
);
const confirmDeleteButton = document.getElementById(
    "confirmDeleteButton"
);

const notification = document.getElementById("notification");

let allTasks = [];
let selectedTaskIdForDelete = null;
let notificationTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
});

openCreateModalButton.addEventListener("click", openCreateModal);
closeModalButton.addEventListener("click", closeTaskModal);
cancelButton.addEventListener("click", closeTaskModal);
modalOverlay.addEventListener("click", closeTaskModal);

deleteModalOverlay.addEventListener("click", closeDeleteModal);
cancelDeleteButton.addEventListener("click", closeDeleteModal);
confirmDeleteButton.addEventListener("click", deleteSelectedTask);

taskForm.addEventListener("submit", handleTaskSubmit);

searchButton.addEventListener("click", searchTasks);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchTasks();
    }
});

statusFilter.addEventListener("change", filterByStatus);
priorityFilter.addEventListener("change", filterByPriority);
resetFiltersButton.addEventListener("click", resetFilters);

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
        return;
    }

    if (!taskModal.classList.contains("hidden")) {
        closeTaskModal();
    }

    if (!deleteModal.classList.contains("hidden")) {
        closeDeleteModal();
    }
});

/**
 * Loads all tasks from:
 * GET /api/tasks
 */
async function loadTasks() {
    showLoading();

    try {
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error(
                `Failed to load tasks. Status: ${response.status}`
            );
        }

        const tasks = await response.json();

        allTasks = Array.isArray(tasks) ? tasks : [];

        renderTasks(allTasks);
        updateStatistics(allTasks);
    } catch (error) {
        console.error(error);
        showPageError(
            "Could not connect to the backend. Make sure Spring Boot is running on port 8080."
        );
    }
}

/**
 * Sends:
 * GET /api/tasks/search?title=...
 */
async function searchTasks() {
    const title = searchInput.value.trim();

    statusFilter.value = "";
    priorityFilter.value = "";

    if (!title) {
        await loadTasks();
        return;
    }

    showLoading();

    try {
        const response = await fetch(
            `${API_BASE_URL}/search?title=${encodeURIComponent(title)}`
        );

        if (!response.ok) {
            throw new Error(
                `Search failed. Status: ${response.status}`
            );
        }

        const tasks = await response.json();

        renderTasks(tasks);
    } catch (error) {
        console.error(error);
        showPageError("Could not search tasks.");
    }
}

/**
 * Sends:
 * GET /api/tasks/status/{status}
 */
async function filterByStatus() {
    const status = statusFilter.value;

    priorityFilter.value = "";
    searchInput.value = "";

    if (!status) {
        await loadTasks();
        return;
    }

    showLoading();

    try {
        const response = await fetch(
            `${API_BASE_URL}/status/${encodeURIComponent(status)}`
        );

        if (!response.ok) {
            throw new Error(
                `Status filtering failed. Status: ${response.status}`
            );
        }

        const tasks = await response.json();

        renderTasks(tasks);
    } catch (error) {
        console.error(error);
        showPageError("Could not filter tasks by status.");
    }
}

/**
 * Sends:
 * GET /api/tasks/priority/{priority}
 */
async function filterByPriority() {
    const priority = priorityFilter.value;

    statusFilter.value = "";
    searchInput.value = "";

    if (!priority) {
        await loadTasks();
        return;
    }

    showLoading();

    try {
        const response = await fetch(
            `${API_BASE_URL}/priority/${encodeURIComponent(priority)}`
        );

        if (!response.ok) {
            throw new Error(
                `Priority filtering failed. Status: ${response.status}`
            );
        }

        const tasks = await response.json();

        renderTasks(tasks);
    } catch (error) {
        console.error(error);
        showPageError("Could not filter tasks by priority.");
    }
}

async function resetFilters() {
    searchInput.value = "";
    statusFilter.value = "";
    priorityFilter.value = "";

    await loadTasks();
}

/**
 * Sends:
 * POST /api/tasks
 *
 * or:
 *
 * PUT /api/tasks/{id}
 */
async function handleTaskSubmit(event) {
    event.preventDefault();

    hideFormError();

    const id = taskIdInput.value;
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const status = taskStatusInput.value;
    const priority = taskPriorityInput.value;

    if (!title) {
        showFormError("Task title is required.");
        return;
    }

    const requestBody = {
        title,
        description,
        status,
        priority
    };

    const isUpdate = Boolean(id);
    const requestUrl = isUpdate
        ? `${API_BASE_URL}/${id}`
        : API_BASE_URL;

    const requestMethod = isUpdate ? "PUT" : "POST";

    setSaveButtonLoading(true);

    try {
        const response = await fetch(requestUrl, {
            method: requestMethod,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await getErrorMessage(response);

            throw new Error(errorText);
        }

        closeTaskModal();

        showNotification(
            isUpdate
                ? "Task updated successfully."
                : "Task created successfully.",
            "success"
        );

        await loadTasks();
    } catch (error) {
        console.error(error);
        showFormError(error.message || "Could not save the task.");
    } finally {
        setSaveButtonLoading(false);
    }
}

/**
 * Sends:
 * DELETE /api/tasks/{id}
 */
async function deleteSelectedTask() {
    if (!selectedTaskIdForDelete) {
        return;
    }

    confirmDeleteButton.disabled = true;
    confirmDeleteButton.textContent = "Deleting...";

    try {
        const response = await fetch(
            `${API_BASE_URL}/${selectedTaskIdForDelete}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const errorText = await getErrorMessage(response);

            throw new Error(errorText);
        }

        closeDeleteModal();

        showNotification(
            "Task deleted successfully.",
            "success"
        );

        await loadTasks();
    } catch (error) {
        console.error(error);

        showNotification(
            error.message || "Could not delete the task.",
            "error"
        );
    } finally {
        confirmDeleteButton.disabled = false;
        confirmDeleteButton.textContent = "Delete";
    }
}

function renderTasks(tasks) {
    hideLoading();
    hidePageError();

    taskGrid.innerHTML = "";

    if (!Array.isArray(tasks) || tasks.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        taskGrid.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const article = document.createElement("article");

    article.className = "task-card";

    const title = escapeHtml(task.title || "Untitled task");
    const description = escapeHtml(
        task.description || "No description provided."
    );

    const status = task.status || "PENDING";
    const priority = task.priority || "MEDIUM";

    article.innerHTML = `
        <div class="task-card-header">
            <h2 class="task-title">${title}</h2>

            <span class="priority-badge ${getPriorityClass(priority)}">
                ${formatEnumValue(priority)}
            </span>
        </div>

        <p class="task-description">${description}</p>

        <div class="task-footer">
            <span class="status-badge ${getStatusClass(status)}">
                ${formatEnumValue(status)}
            </span>

            <div class="task-actions">
                <button
                    class="icon-button edit-button"
                    type="button"
                >
                    Edit
                </button>

                <button
                    class="icon-button delete-button"
                    type="button"
                >
                    Delete
                </button>
            </div>
        </div>
    `;

    const editButton = article.querySelector(".edit-button");
    const deleteButton = article.querySelector(".delete-button");

    editButton.addEventListener("click", () => {
        openEditModal(task);
    });

    deleteButton.addEventListener("click", () => {
        openDeleteModal(task.id);
    });

    return article;
}

function openCreateModal() {
    taskForm.reset();

    taskIdInput.value = "";
    taskStatusInput.value = "PENDING";
    taskPriorityInput.value = "MEDIUM";

    modalTitle.textContent = "Create Task";
    saveTaskButton.textContent = "Create Task";

    hideFormError();

    taskModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    taskTitleInput.focus();
}

function openEditModal(task) {
    if (!task.id) {
        showNotification(
            "Task ID is missing. Add id to TaskDTO and mapper.",
            "error"
        );

        return;
    }

    taskIdInput.value = task.id;
    taskTitleInput.value = task.title || "";
    taskDescriptionInput.value = task.description || "";
    taskStatusInput.value = task.status || "PENDING";
    taskPriorityInput.value = task.priority || "MEDIUM";

    modalTitle.textContent = "Edit Task";
    saveTaskButton.textContent = "Update Task";

    hideFormError();

    taskModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    taskTitleInput.focus();
}

function closeTaskModal() {
    taskModal.classList.add("hidden");

    taskForm.reset();
    taskIdInput.value = "";

    hideFormError();

    document.body.style.overflow = "";
}

function openDeleteModal(taskId) {
    if (!taskId) {
        showNotification(
            "Task ID is missing. Add id to TaskDTO and mapper.",
            "error"
        );

        return;
    }

    selectedTaskIdForDelete = taskId;

    deleteModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeDeleteModal() {
    selectedTaskIdForDelete = null;

    deleteModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function updateStatistics(tasks) {
    const total = tasks.length;

    const pending = tasks.filter(
        task => task.status === "PENDING"
    ).length;

    const inProgress = tasks.filter(
        task => task.status === "IN_PROGRESS"
    ).length;

    const completed = tasks.filter(
        task => task.status === "COMPLETED"
    ).length;

    totalTaskCount.textContent = total;
    pendingTaskCount.textContent = pending;
    progressTaskCount.textContent = inProgress;
    completedTaskCount.textContent = completed;
}

function getStatusClass(status) {
    const classes = {
        PENDING: "status-pending",
        IN_PROGRESS: "status-in-progress",
        COMPLETED: "status-completed"
    };

    return classes[status] || "status-pending";
}

function getPriorityClass(priority) {
    const classes = {
        LOW: "priority-low",
        MEDIUM: "priority-medium",
        HIGH: "priority-high"
    };

    return classes[priority] || "priority-medium";
}

function formatEnumValue(value) {
    if (!value) {
        return "";
    }

    return value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, character => character.toUpperCase());
}

function showLoading() {
    taskGrid.innerHTML = "";

    loadingMessage.classList.remove("hidden");
    emptyState.classList.add("hidden");
    errorMessage.classList.add("hidden");
}

function hideLoading() {
    loadingMessage.classList.add("hidden");
}

function showPageError(message) {
    hideLoading();

    taskGrid.innerHTML = "";
    emptyState.classList.add("hidden");

    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hidePageError() {
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";
}

function showFormError(message) {
    formErrorMessage.textContent = message;
    formErrorMessage.classList.remove("hidden");
}

function hideFormError() {
    formErrorMessage.textContent = "";
    formErrorMessage.classList.add("hidden");
}

function setSaveButtonLoading(loading) {
    saveTaskButton.disabled = loading;

    if (loading) {
        saveTaskButton.textContent = "Saving...";
        return;
    }

    saveTaskButton.textContent = taskIdInput.value
        ? "Update Task"
        : "Create Task";
}

function showNotification(message, type = "success") {
    if (notificationTimer) {
        clearTimeout(notificationTimer);
    }

    notification.textContent = message;
    notification.className = `notification ${type}`;

    notificationTimer = setTimeout(() => {
        notification.classList.add("hidden");
    }, 3500);
}

async function getErrorMessage(response) {
    try {
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
            const data = await response.json();

            if (data.errors && typeof data.errors === "object") {
                return Object.values(data.errors).join(", ");
            }

            return (
                data.message ||
                data.error ||
                `Request failed with status ${response.status}.`
            );
        }

        const text = await response.text();

        return text || `Request failed with status ${response.status}.`;
    } catch {
        return `Request failed with status ${response.status}.`;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}