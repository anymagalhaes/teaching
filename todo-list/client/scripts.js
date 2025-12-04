const API = "http://127.0.0.1:8000";

// =========================
//      AUTH
// =========================

const postUser = async () => {
    const payload = {
        name: document.getElementById("user").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    try {
        const response = await fetch(`${API}/auth/signup`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });

        await response.json();

        alert("Usuário criado com sucesso!");
        window.location.href = "tasks.html";  // <<<<<< AQUI
    } catch (err) {
        console.error(err);
        alert("Erro ao registrar.");
    }
};

const loginUser = async () => {
    const payload = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
    };

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (!data.access_token) {
            alert("Login incorreto!");
            return;
        }

        localStorage.setItem("token", data.access_token);

        alert("Login realizado!");
        window.location.href = "tasks.html";  // <<<<<< AQUI
    } catch (err) {
        console.error(err);
        alert("Erro ao fazer login.");
    }
};

// =========================
//   REDIRECIONAMENTO GERAL
// =========================

window.onload = () => {
    if (location.pathname.includes("tasks.html")) {
        loadTasks();
    }
};

const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
};


// =========================
//      TASK FUNCTIONS
// =========================

const addTask = async () => {
    const text = document.getElementById("taskText").value;

    if (text.trim() === "") return alert("Digite uma tarefa!");

    const token = localStorage.getItem("token");
    const payload = { description: text };

    try {
        await fetch(`${API}/tasks`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        document.getElementById("taskText").value = "";
        loadTasks();

    } catch (err) {
        console.error(err);
        alert("Erro ao adicionar tarefa.");
    }
};

const loadTasks = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const tasks = await response.json();

        const list = document.getElementById("taskList");
        list.innerHTML = "";

        if (tasks.length === 0) {
            list.innerHTML = `<p class="empty">Nenhuma tarefa cadastrada...</p>`;
            return;
        }

        tasks.forEach(task => {
            const item = document.createElement("div");
            item.classList.add("task");

            item.innerHTML = `
                <div class="left">
                    <input type="text" value="${task.description}" id="task-${task.id}">
                </div>

                <div class="actions">
                    <button onclick="updateTask(${task.id})">Salvar</button>
                    <button class="logout" onclick="deleteTask(${task.id})">Excluir</button>
                </div>
            `;

            list.appendChild(item);
        });

    } catch (err) {
        console.error(err);
        alert("Erro ao carregar tarefas.");
    }
};

const updateTask = async (id) => {
    const token = localStorage.getItem("token");
    const text = document.getElementById(`task-${id}`).value;

    const payload = { description: text };

    try {
        await fetch(`${API}/tasks/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        alert("Tarefa atualizada!");
    } catch (err) {
        console.error(err);
        alert("Erro ao atualizar tarefa.");
    }
};

const deleteTask = async (id) => {
    const token = localStorage.getItem("token");

    try {
        await fetch(`${API}/tasks/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        loadTasks();

    } catch (err) {
        console.error(err);
        alert("Erro ao excluir tarefa.");
    }
};
