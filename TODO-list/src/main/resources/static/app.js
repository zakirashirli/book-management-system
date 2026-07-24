const API_BASE_URL = "http://localhost:8081/api/tasks";

/*
|--------------------------------------------------------------------------
| HTML elements
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Application state
|--------------------------------------------------------------------------
*/

let allTasks = [];
let selectedTaskIdForDelete = null;
let notificationTimer = null;

/*
|--------------------------------------------------------------------------
| Initial load
|--------------------------------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
});

/*
|--------------------------------------------------------------------------
| Event listeners
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| GET all tasks
|--------------------------------------------------------------------------
|
| GET /api/tasks
|
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

/*
|--------------------------------------------------------------------------
| Search tasks
|--------------------------------------------------------------------------
|
| GET /api/tasks/search?title=java
|
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

        showPageError(
            error.message || "Could not search tasks."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Filter by status
|--------------------------------------------------------------------------
|
| GET /api/tasks/status/TODO
| GET /api/tasks/status/IN_PROGRESS
| GET /api/tasks/status/DONE
|
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
            `${API_BASE_URL}/${encodeURIComponent(status)}/status`
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

        showPageError(
            error.message ||
            "Could not filter tasks by status."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Filter by priority
|--------------------------------------------------------------------------
|
| GET /api/tasks/priority/LOW
| GET /api/tasks/priority/MEDIUM
| GET /api/tasks/priority/HIGH
|
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
            `${API_BASE_URL}/${encodeURIComponent(priority)}/priority`
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

        showPageError(
            error.message ||
            "Could not filter tasks by priority."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Reset filters
|--------------------------------------------------------------------------
*/

async function resetFilters() {
    searchInput.value = "";
    statusFilter.value = "";
    priorityFilter.value = "";

    await loadTasks();
}

/*
|--------------------------------------------------------------------------
| Create or update task
|--------------------------------------------------------------------------
|
| POST /api/tasks
| PUT /api/tasks/{id}
|
*/

async function handleTaskSubmit(event) {
    event.preventDefault();

    hideFormError();

    const id = taskIdInput.value.trim();

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

/*
|--------------------------------------------------------------------------
| Delete task
|--------------------------------------------------------------------------
|
| DELETE /api/tasks/{id}
|
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

/*
|--------------------------------------------------------------------------
| Change task status
|--------------------------------------------------------------------------
|
| PATCH /api/tasks/{id}/start
| PATCH /api/tasks/{id}/complete
| PATCH /api/tasks/{id}/cancel
|
*/

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

    const originalButtonText = clickedButton
        ? clickedButton.textContent
        : "";

    if (clickedButton) {
        clickedButton.disabled = true;
        clickedButton.textContent = "Processing...";
    }

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

        await loadTasks();
    } catch (error) {
        console.error(error);

        showNotification(
            error.message ||
            "Could not change the task status.",
            "error"
        );
    } finally {
        if (clickedButton) {
            clickedButton.disabled = false;
            clickedButton.textContent = originalButtonText;
        }
    }
}

/*
|--------------------------------------------------------------------------
| Render tasks
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Create a task card
|--------------------------------------------------------------------------
*/

function createTaskCard(task) {
    const article = document.createElement("article");

    article.className = "task-card";

    const title = escapeHtml(
        task.title || "Untitled task"
    );

    const description = escapeHtml(
        task.description || "No description provided."
    );

    const status = task.status || "TODO";
    const priority = task.priority || "MEDIUM";

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

/*
|--------------------------------------------------------------------------
| Create status buttons based on current status
|--------------------------------------------------------------------------
*/

function createStatusButtons(task) {
    if (!task.id) {
        return `
            <p class="missing-id-message">
                Task ID is missing.
            </p>
        `;
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
                Cancel
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

    return "";
}

/*
|--------------------------------------------------------------------------
| Create modal
|--------------------------------------------------------------------------
*/

function openCreateModal() {
    taskForm.reset();

    taskIdInput.value = "";
    taskStatusInput.value = "TODO";
    taskPriorityInput.value = "MEDIUM";

    taskModalTitle.textContent = "Create Task";
    saveTaskButton.textContent = "Create Task";

    hideFormError();

    taskModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    taskTitleInput.focus();
}

/*
|--------------------------------------------------------------------------
| Edit modal
|--------------------------------------------------------------------------
*/

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
    taskStatusInput.value = task.status || "TODO";
    taskPriorityInput.value = task.priority || "MEDIUM";

    taskModalTitle.textContent = "Edit Task";
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

/*
|--------------------------------------------------------------------------
| Delete modal
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

function updateStatistics(tasks) {
    const total = tasks.length;

    const todo = tasks.filter(
        task => task.status === "TODO"
    ).length;

    const inProgress = tasks.filter(
        task => task.status === "IN_PROGRESS"
    ).length;

    const done = tasks.filter(
        task => task.status === "DONE"
    ).length;

    totalTaskCount.textContent = total;
    todoTaskCount.textContent = todo;
    progressTaskCount.textContent = inProgress;
    doneTaskCount.textContent = done;
}

/*
|--------------------------------------------------------------------------
| CSS class helpers
|--------------------------------------------------------------------------
*/

function getStatusClass(status) {
    const classes = {
        TODO: "status-todo",
        IN_PROGRESS: "status-in-progress",
        DONE: "status-done"
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

/*
|--------------------------------------------------------------------------
| Format enum
|--------------------------------------------------------------------------
|
| IN_PROGRESS -> In Progress
|
*/

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

/*
|--------------------------------------------------------------------------
| Loading and error states
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Form errors
|--------------------------------------------------------------------------
*/

function showFormError(message) {
    formErrorMessage.textContent = message;
    formErrorMessage.classList.remove("hidden");
}

function hideFormError() {
    formErrorMessage.textContent = "";
    formErrorMessage.classList.add("hidden");
}

/*
|--------------------------------------------------------------------------
| Save button loading state
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Read backend error
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Protect HTML output
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}