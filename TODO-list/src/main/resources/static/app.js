const API_BASE_URL = "http://localhost:8081/api/tasks";

const taskGrid = document.getElementById("taskGrid");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");

const totalTaskCount = document.getElementById("totalTaskCount");
const todoTaskCount = document.getElementById("todoTaskCount");
const progressTaskCount = document.getElementById(
    "progressTaskCount"
);
const doneTaskCount = document.getElementById("doneTaskCount");
const overdueTaskCount = document.getElementById(
    "overdueTaskCount"
);

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const resetFiltersButton = document.getElementById(
    "resetFiltersButton"
);

const openCreateModalButton = document.getElementById(
    "openCreateModalButton"
);

const taskModal = document.getElementById("taskModal");
const taskModalOverlay = document.getElementById(
    "taskModalOverlay"
);
const closeTaskModalButton = document.getElementById(
    "closeTaskModalButton"
);
const cancelTaskButton = document.getElementById(
    "cancelTaskButton"
);

const taskModalTitle = document.getElementById(
    "taskModalTitle"
);
const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById(
    "taskDescription"
);
const taskDeadlineInput = document.getElementById(
    "taskDeadline"
);
const taskStatusInput = document.getElementById("taskStatus");
const taskPriorityInput = document.getElementById(
    "taskPriority"
);
const saveTaskButton = document.getElementById(
    "saveTaskButton"
);
const formErrorMessage = document.getElementById(
    "formErrorMessage"
);

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
let automaticRefreshTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadTasks();

    automaticRefreshTimer = setInterval(() => {
        refreshCurrentView();
    }, 10000);
});

window.addEventListener("beforeunload", () => {
    if (automaticRefreshTimer) {
        clearInterval(automaticRefreshTimer);
    }
});

openCreateModalButton.addEventListener(
    "click",
    openCreateModal
);

closeTaskModalButton.addEventListener(
    "click",
    closeTaskModal
);

cancelTaskButton.addEventListener(
    "click",
    closeTaskModal
);

taskModalOverlay.addEventListener(
    "click",
    closeTaskModal
);

deleteModalOverlay.addEventListener(
    "click",
    closeDeleteModal
);

cancelDeleteButton.addEventListener(
    "click",
    closeDeleteModal
);

confirmDeleteButton.addEventListener(
    "click",
    deleteSelectedTask
);

taskForm.addEventListener(
    "submit",
    handleTaskSubmit
);

searchButton.addEventListener(
    "click",
    searchTasks
);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchTasks();
    }
});

statusFilter.addEventListener(
    "change",
    filterByStatus
);

priorityFilter.addEventListener(
    "change",
    filterByPriority
);

resetFiltersButton.addEventListener(
    "click",
    resetFilters
);

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

async function loadTasks(showLoader = true) {
    if (showLoader) {
        showLoading();
    }

    try {
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error(
                `Could not load tasks. Status: ${response.status}`
            );
        }

        const tasks = await response.json();

        allTasks = Array.isArray(tasks)
            ? tasks
            : [];

        renderTasks(allTasks);
        updateStatistics(allTasks);
    } catch (error) {
        console.error(error);

        showPageError(
            "Could not connect to the backend. Make sure Spring Boot is running on port 8080."
        );
    }
}

async function searchTasks(showLoader = true) {
    const title = searchInput.value.trim();

    statusFilter.value = "";
    priorityFilter.value = "";

    if (!title) {
        await loadTasks(showLoader);
        return;
    }

    if (showLoader) {
        showLoading();
    }

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
        await refreshStatistics();
    } catch (error) {
        console.error(error);

        showPageError(
            error.message || "Could not search tasks."
        );
    }
}

async function filterByStatus(showLoader = true) {
    const status = statusFilter.value;

    searchInput.value = "";
    priorityFilter.value = "";

    if (!status) {
        await loadTasks(showLoader);
        return;
    }

    if (showLoader) {
        showLoading();
    }

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
        await refreshStatistics();
    } catch (error) {
        console.error(error);

        showPageError(
            error.message ||
            "Could not filter tasks by status."
        );
    }
}

async function filterByPriority(showLoader = true) {
    const priority = priorityFilter.value;

    searchInput.value = "";
    statusFilter.value = "";

    if (!priority) {
        await loadTasks(showLoader);
        return;
    }

    if (showLoader) {
        showLoading();
    }

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
        await refreshStatistics();
    } catch (error) {
        console.error(error);

        showPageError(
            error.message ||
            "Could not filter tasks by priority."
        );
    }
}

async function resetFilters() {
    searchInput.value = "";
    statusFilter.value = "";
    priorityFilter.value = "";

    await loadTasks();
}

async function refreshCurrentView() {
    if (
        !taskModal.classList.contains("hidden") ||
        !deleteModal.classList.contains("hidden")
    ) {
        return;
    }

    if (searchInput.value.trim()) {
        await searchTasks(false);
        return;
    }

    if (statusFilter.value) {
        await filterByStatus(false);
        return;
    }

    if (priorityFilter.value) {
        await filterByPriority(false);
        return;
    }

    await loadTasks(false);
}

async function refreshStatistics() {
    try {
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            return;
        }

        const tasks = await response.json();

        allTasks = Array.isArray(tasks)
            ? tasks
            : [];

        updateStatistics(allTasks);
    } catch (error) {
        console.error("Statistics refresh failed:", error);
    }
}

async function handleTaskSubmit(event) {
    event.preventDefault();

    hideFormError();

    const id = taskIdInput.value.trim();
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const deadlineValue = taskDeadlineInput.value;
    const status = taskStatusInput.value;
    const priority = taskPriorityInput.value;

    if (!title) {
        showFormError("Task title is required.");
        return;
    }

    if (!deadlineValue) {
        showFormError("Task deadline is required.");
        return;
    }

    const deadlineDate = new Date(deadlineValue);

    if (Number.isNaN(deadlineDate.getTime())) {
        showFormError("Deadline is invalid.");
        return;
    }

    const requestBody = {
        title,
        description,
        deadline: deadlineDate.toISOString(),
        status,
        priority
    };

    const isUpdate = Boolean(id);

    const requestUrl = isUpdate
        ? `${API_BASE_URL}/${id}`
        : API_BASE_URL;

    const requestMethod = isUpdate
        ? "PUT"
        : "POST";

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
            const message = await getErrorMessage(response);
            throw new Error(message);
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

        showFormError(
            error.message || "Could not save the task."
        );
    } finally {
        setSaveButtonLoading(false);
    }
}

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
            const message = await getErrorMessage(response);
            throw new Error(message);
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

async function changeTaskStatus(
    taskId,
    action,
    clickedButton
) {
    if (!taskId) {
        showNotification(
            "Task ID is missing.",
            "error"
        );

        return;
    }

    const allowedActions = [
        "start",
        "complete",
        "cancel"
    ];

    if (!allowedActions.includes(action)) {
        showNotification(
            "Unsupported task action.",
            "error"
        );

        return;
    }

    const originalButtonText = clickedButton.textContent;

    clickedButton.disabled = true;
    clickedButton.textContent = "Processing...";

    try {
        const response = await fetch(
            `${API_BASE_URL}/${taskId}/${action}`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            const message = await getErrorMessage(response);
            throw new Error(message);
        }

        const messages = {
            start: "Task started successfully.",
            complete: "Task completed successfully.",
            cancel: "Task returned to TODO."
        };

        showNotification(
            messages[action],
            "success"
        );

        await refreshCurrentView();
    } catch (error) {
        console.error(error);

        showNotification(
            error.message ||
            "Could not change task status.",
            "error"
        );
    } finally {
        clickedButton.disabled = false;
        clickedButton.textContent = originalButtonText;
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
        taskGrid.appendChild(
            createTaskCard(task)
        );
    });
}

function createTaskCard(task) {
    const article = document.createElement("article");

    article.className = "task-card";

    if (task.status === "OVERDUE") {
        article.classList.add("overdue-card");
    }

    const title = escapeHtml(
        task.title || "Untitled task"
    );

    const description = escapeHtml(
        task.description || "No description provided."
    );

    const status = task.status || "TODO";
    const priority = task.priority || "MEDIUM";
    const deadline = formatDeadline(task.deadline);

    const deadlineClass = status === "OVERDUE"
        ? "deadline-overdue"
        : "";

    article.innerHTML = `
        <div class="task-card-header">

            <h2 class="task-title">
                ${title}
            </h2>

            <span class="priority-badge ${getPriorityClass(priority)}">
                ${formatEnumValue(priority)}
            </span>

        </div>

        <p class="task-description">
            ${description}
        </p>

        <div class="task-deadline ${deadlineClass}">
            <span>Deadline</span>
            <strong>${deadline}</strong>
        </div>

        <div class="task-information">

            <span class="status-badge ${getStatusClass(status)}">
                ${formatEnumValue(status)}
            </span>

        </div>

        <div class="status-actions">
            ${createStatusButtons(task)}
        </div>

        <div class="task-management-actions">

            <button
                    class="card-button edit-task-button"
                    type="button"
            >
                Edit
            </button>

            <button
                    class="card-button delete-card-button delete-task-button"
                    type="button"
            >
                Delete
            </button>

        </div>
    `;

    const editButton = article.querySelector(
        ".edit-task-button"
    );

    const deleteButton = article.querySelector(
        ".delete-task-button"
    );

    const startButton = article.querySelector(
        ".start-button"
    );

    const completeButton = article.querySelector(
        ".complete-button"
    );

    const cancelStatusButton = article.querySelector(
        ".cancel-status-button"
    );

    editButton.addEventListener("click", () => {
        openEditModal(task);
    });

    deleteButton.addEventListener("click", () => {
        openDeleteModal(task.id);
    });

    if (startButton) {
        startButton.addEventListener("click", () => {
            changeTaskStatus(
                task.id,
                "start",
                startButton
            );
        });
    }

    if (completeButton) {
        completeButton.addEventListener("click", () => {
            changeTaskStatus(
                task.id,
                "complete",
                completeButton
            );
        });
    }

    if (cancelStatusButton) {
        cancelStatusButton.addEventListener("click", () => {
            changeTaskStatus(
                task.id,
                "cancel",
                cancelStatusButton
            );
        });
    }

    return article;
}

function createStatusButtons(task) {
    if (!task.id) {
        return "";
    }

    if (task.status === "TODO") {
        return `
            <button
                    class="status-action-button start-button"
                    type="button"
            >
                Start Task
            </button>
        `;
    }

    if (task.status === "IN_PROGRESS") {
        return `
            <button
                    class="status-action-button complete-button"
                    type="button"
            >
                Complete
            </button>

            <button
                    class="status-action-button cancel-status-button"
                    type="button"
            >
                Return to TODO
            </button>
        `;
    }

    if (task.status === "DONE") {
        return `
            <button
                    class="status-action-button cancel-status-button"
                    type="button"
            >
                Return to TODO
            </button>
        `;
    }

    if (task.status === "OVERDUE") {
        return `
            <div class="overdue-warning">
                Deadline has passed
            </div>
        `;
    }

    return "";
}

function openCreateModal() {
    taskForm.reset();

    taskIdInput.value = "";
    taskStatusInput.value = "TODO";
    taskPriorityInput.value = "MEDIUM";
    taskDeadlineInput.value = getDefaultDeadlineValue();

    taskModalTitle.textContent = "Create Task";
    saveTaskButton.textContent = "Create Task";

    hideFormError();

    taskModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    taskTitleInput.focus();
}

function openEditModal(task) {
    if (!task.id) {
        showNotification(
            "Task ID is missing in TaskDTO.",
            "error"
        );

        return;
    }

    taskIdInput.value = task.id;
    taskTitleInput.value = task.title || "";
    taskDescriptionInput.value = task.description || "";
    taskDeadlineInput.value = toDateTimeLocalValue(
        task.deadline
    );

    taskStatusInput.value = normalizeEditableStatus(
        task.status
    );

    taskPriorityInput.value = task.priority || "MEDIUM";

    taskModalTitle.textContent = "Edit Task";
    saveTaskButton.textContent = "Update Task";

    hideFormError();

    taskModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    taskTitleInput.focus();
}

function normalizeEditableStatus(status) {
    if (status === "OVERDUE") {
        return "TODO";
    }

    return status || "TODO";
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
            "Task ID is missing in TaskDTO.",
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
    totalTaskCount.textContent = tasks.length;

    todoTaskCount.textContent = tasks.filter(
        task => task.status === "TODO"
    ).length;

    progressTaskCount.textContent = tasks.filter(
        task => task.status === "IN_PROGRESS"
    ).length;

    doneTaskCount.textContent = tasks.filter(
        task => task.status === "DONE"
    ).length;

    overdueTaskCount.textContent = tasks.filter(
        task => task.status === "OVERDUE"
    ).length;
}

function getStatusClass(status) {
    const classes = {
        TODO: "status-todo",
        IN_PROGRESS: "status-in-progress",
        DONE: "status-done",
        OVERDUE: "status-overdue"
    };

    return classes[status] || "status-todo";
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
        .replace(
            /\b\w/g,
            character => character.toUpperCase()
        );
}

function formatDeadline(deadline) {
    if (!deadline) {
        return "No deadline";
    }

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
        return "Invalid deadline";
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function toDateTimeLocalValue(deadline) {
    if (!deadline) {
        return "";
    }

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const hours = String(
        date.getHours()
    ).padStart(2, "0");

    const minutes = String(
        date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultDeadlineValue() {
    const date = new Date();

    date.setDate(date.getDate() + 1);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return toDateTimeLocalValue(date.toISOString());
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
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
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

function showNotification(
    message,
    type = "success"
) {
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
        const contentType = response.headers.get(
            "content-type"
        );

        if (contentType?.includes("application/json")) {
            const data = await response.json();

            if (
                data.errors &&
                typeof data.errors === "object"
            ) {
                return Object.values(data.errors).join(", ");
            }

            return (
                data.message ||
                data.error ||
                `Request failed with status ${response.status}.`
            );
        }

        const text = await response.text();

        return (
            text ||
            `Request failed with status ${response.status}.`
        );
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