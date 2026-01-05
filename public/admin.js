async function login() {
  const password = document.getElementById("password").value;

  const res = await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  if (res.ok) {
    document.getElementById("login").style.display = "none";
    document.getElementById("panel").style.display = "block";
    loadUsers();
  } else {
    alert("Access denied");
  }
}

async function loadUsers() {
  const res = await fetch("/api/admin/users");
  const users = await res.json();

  const container = document.getElementById("users");
  container.innerHTML = "";

  users.forEach(u => {
    const div = document.createElement("div");
    div.innerHTML = `
      <b>${u.id}</b> — Coins: ${u.coins}
      <button onclick="freeze('${u.id}')">Freeze</button>
      <button onclick="unfreeze('${u.id}')">Unfreeze</button>
      <button onclick="ban('${u.id}')">Ban</button>
      <hr>
    `;
    container.appendChild(div);
  });
}

async function freeze(id) {
  await fetch("/api/admin/freeze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  loadUsers();
}

async function unfreeze(id) {
  await fetch("/api/admin/unfreeze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  loadUsers();
}

async function ban(id) {
  await fetch("/api/admin/ban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  loadUsers();
    }
