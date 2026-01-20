const API = "http://127.0.0.1:5000/api";

let editingAuthorId = null;
let editingBookId = null;


/*=================Sorthing ===================*/
function loadBooksSorted(sort, order) {

    // force books tab open
    showSection(
        "book-section",
        document.querySelectorAll(".tab-btn")[1]
    );

    fetch(`http://127.0.0.1:5000/api/books-with-sorting?sort=${sort}&order=${order}`)
        .then(res => {
            if (!res.ok) throw new Error("API not reachable");
            return res.json();
        })
        .then(data => {
            const tbody = document.getElementById("book-list");
            tbody.innerHTML = "";

            data.forEach(b => {
                tbody.innerHTML += `
                <tr>
                    <td>${b.id}</td>
                    <td>${b.title}</td>
                    <td>${b.author}</td> 
                    <td>${b.year || ""}</td>
                    <td>${b.category || ""}</td>
                    <td>${b.isbn || ""}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-1"
                                onclick="editBook(${b.id})">Edit</button>
                        <button class="btn btn-danger btn-sm"
                                onclick="deleteBook(${b.id})">Delete</button>
                    </td>
                </tr>`;
            });

            document.getElementById("total-books").innerText = data.length;
        })
        .catch(err => alert(err.message));
}



/* ================= TAB SWITCH ================= */

function showSection(sectionId, btn) {
    document.getElementById("author-section").classList.add("d-none");
    document.getElementById("book-section").classList.add("d-none");

    document.querySelectorAll(".tab-btn")
        .forEach(b => b.classList.remove("active", "btn-primary"));

    document.getElementById(sectionId).classList.remove("d-none");
    btn.classList.add("active", "btn-primary");
}
/* =================Search Functionality ==================*/
function searchTable() {
    const input = document.getElementById("searchInput").value.toLowerCase();

    // Check which section is visible
    const authorSection = document.getElementById("author-section");
    const bookSection = document.getElementById("book-section");

    let rows;

    if (!authorSection.classList.contains("d-none")) {
        // AUTHOR TABLE
        rows = document.querySelectorAll("#author-list tr");
    } else {
        // BOOK TABLE
        rows = document.querySelectorAll("#book-list tr");
    }

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}


/* ================= AUTHORS ================= */

async function loadAuthors() {
    const res = await fetch(`${API}/authors`);
    const data = await res.json();

    const tbody = document.getElementById("author-list");
    const select = document.getElementById("book-author-id");

    tbody.innerHTML = "";
    select.innerHTML = `<option value="">-- Select Author --</option>`;

    data.authors.forEach(a => {
        tbody.innerHTML += `
        <tr>
            <td>${a.id}</td>
            <td>${a.name}</td>
            <td>${a.city || ""}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1"
                        onclick="editAuthor(${a.id})">Edit</button>
                <button class="btn btn-danger btn-sm"
                        onclick="deleteAuthor(${a.id})">Delete</button>
            </td>
        </tr>`;

        select.innerHTML += `
        <option value="${a.id}">${a.name}</option>`;
    });

    document.getElementById("total-authors").innerText = data.count;
}

async function addAuthor() {
    const name = document.getElementById("auth-name").value;
    const city = document.getElementById("auth-city").value;
    const bio  = document.getElementById("auth-bio").value;

    if (!name) {
        alert("Name required");
        return;
    }

    await fetch(`${API}/authors`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, city, bio })
    });

    resetAuthorForm();
    loadAuthors();
}

async function editAuthor(id) {
    const res = await fetch(`${API}/authors/${id}`);
    const a = await res.json();

    editingAuthorId = id;

    document.getElementById("auth-name").value = a.name;
    document.getElementById("auth-city").value = a.city || "";
    document.getElementById("auth-bio").value = a.bio || "";

    const btn = document.querySelector("#author-section button.btn-success");
    btn.innerText = "Update Author";
    btn.onclick = updateAuthor;
}

async function updateAuthor() {
    const data = {
        name: document.getElementById("auth-name").value,
        city: document.getElementById("auth-city").value,
        bio: document.getElementById("auth-bio").value
    };

    await fetch(`${API}/authors/${editingAuthorId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    resetAuthorForm();
    loadAuthors();
}

function resetAuthorForm() {
    editingAuthorId = null;

    document.getElementById("auth-name").value = "";
    document.getElementById("auth-city").value = "";
    document.getElementById("auth-bio").value = "";

    const btn = document.querySelector("#author-section button.btn-success");
    btn.innerText = "Create Author";
    btn.onclick = addAuthor;
}

async function deleteAuthor(id) {
    if (!confirm("Delete author?")) return;
    await fetch(`${API}/authors/${id}`, { method: "DELETE" });
    loadAuthors();
}

/* ================= BOOKS ================= */

async function loadBooks() {
    const res = await fetch(`${API}/books`);
    const data = await res.json();

    const tbody = document.getElementById("book-list");
    tbody.innerHTML = "";

    data.books.forEach(b => {
        tbody.innerHTML += `
        <tr>
            <td>${b.id}</td>
            <td>${b.title}</td>
            <td>${b.author}</td> 
            <td>${b.year || ""}</td>
            <td>${b.category || ""}</td>
            <td>${b.isbn || ""}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1"
                        onclick="editBook(${b.id})">Edit</button>
                <button class="btn btn-danger btn-sm"
                        onclick="deleteBook(${b.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("total-books").innerText = data.count;
}

async function addBook() {
    const data = {
        title: document.getElementById("book-title").value,
        author_id: Number(document.getElementById("book-author-id").value),
        year: document.getElementById("book-year").value,
        isbn: document.getElementById("book-isbn").value,
        category: document.getElementById("book-category").value
    };

    if (!data.title || !data.author_id) {
        alert("Title & Author required");
        return;
    }

    await fetch(`${API}/books`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    resetBookForm();
    loadBooks();
}

async function editBook(id) {
    const res = await fetch(`${API}/books/${id}`);
    const data = await res.json();

    const b = data.book;   // ✅ IMPORTANT FIX

    editingBookId = id;

    document.getElementById("book-title").value = b.title;
    document.getElementById("book-author-id").value = b.author_id;
    document.getElementById("book-year").value = b.year || "";
    document.getElementById("book-isbn").value = b.isbn || "";
    document.getElementById("book-category").value = b.category || "";

    const btn = document.querySelector("#book-section button.btn-success");
    btn.innerText = "Update Book";
    btn.onclick = updateBook;

    showSection(
        "book-section",
        document.querySelectorAll(".tab-btn")[1]
    );
}


async function updateBook() {
    const data = {
        title: document.getElementById("book-title").value,
        author_id: Number(document.getElementById("book-author-id").value),
        year: document.getElementById("book-year").value,
        isbn: document.getElementById("book-isbn").value,
        category: document.getElementById("book-category").value
    };

    await fetch(`${API}/books/${editingBookId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    resetBookForm();
    loadBooks();
}

function resetBookForm() {
    editingBookId = null;

    document.querySelectorAll("#book-section input")
        .forEach(i => i.value = "");
    document.getElementById("book-author-id").value = "";

    const btn = document.querySelector("#book-section button.btn-success");
    btn.innerText = "Create Book";
    btn.onclick = addBook;
}

async function deleteBook(id) {
    if (!confirm("Delete book?")) return;
    await fetch(`${API}/books/${id}`, { method: "DELETE" });
    loadBooks();
}

/* ================= INIT ================= */

window.onload = () => {
    loadAuthors();
    loadBooks();
    showSection("author-section",
        document.querySelector(".tab-btn"));
};
