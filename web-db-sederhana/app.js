const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");  

const app = express();
const PORT = 3000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));  

// database
const db = new sqlite3.Database("database.db");

// buat tabel
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT
  )
`);

db.run("ALTER TABLE items ADD COLUMN kelas INTEGER", (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Error:", err.message);
  } else if (!err) {
    console.log("Kolom kelas berhasil ditambahkan");
  }
});

// halaman utama
app.get("/", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    let html = `
    <html>
    <head>
      <title>Data Siswa Kelas XI</title>
      <link rel="stylesheet" href="/style.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
      <div class="container">
        <h1><i class="fas fa-users"></i> Data Siswa Kelas XI</h1>

        <form method="POST" action="/tambah">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input type="text" name="nama" placeholder="Masukkan nama" required>
          </div>
          <div class="input-group">
            <i class="fas fa-school"></i>
            <input type="text" name="kelas" placeholder="Masukkan kelas" required>
          </div>
          <button type="submit"><i class="fas fa-plus"></i> Tambah</button>
        </form>

        <ul>
    `;

    rows.forEach((item) => {
      html += `
        <li>
          <span class="nama">
            <i class="fas fa-graduation-cap"></i>
            ${item.nama} - Kelas: ${item.kelas || '-'}
          </span>
          <div class="aksi">
            <a href="/edit/${item.id}" class="edit"><i class="fas fa-edit"></i> Edit</a>
            <a href="/hapus/${item.id}" class="hapus" onclick="return confirm('Yakin hapus?')"><i class="fas fa-trash"></i> Hapus</a>
          </div>
        </li>
      `;
    });

    html += `
        </ul>
        
        <!-- FOOTER -->
        <footer class="footer">
          <p><i class="fas fa-database"></i> Data Siswa Kelas XI | Dibuat oleh NPS</p>
          <p><i class="fas fa-users"></i> Total Siswa: ${rows.length}</p>
          <div class="social-links">
            <a href="https://github.com/MuhammadNafeezKh" target="_blank"><i class="fab fa-github"></i> GitHub</a>
            <a href="https://www.instagram.com/_nafietzsche/" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>
            <a href="https://tokita.nlfts.dev/" target="_blank"><i class="fas fa-briefcase"></i> Portfolio</a>
          </div>
          <div class="support">
            <a href="https://saweria.co/Tokita" target="_blank" class="support-btn">
              <i class="fas fa-coffee"></i> Support Me
            </a>
          </div>
        </footer>
        <!-- END FOOTER -->
        
      </div>
    </body>
    </html>
    `;

    res.send(html);
  });
});

// tambah
app.post("/tambah", (req, res) => {
  const { nama, kelas } = req.body;
  db.run("INSERT INTO items (nama, kelas) VALUES (?, ?)", [nama, kelas]);
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
    const html = `
    <html>
    <head>
      <title>Edit Data</title>
      <link rel="stylesheet" href="/style.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
      <div class="container">
        <h1><i class="fas fa-edit"></i> Edit Data</h1>

        <form method="POST" action="/update/${row.id}">
          <label><i class="fas fa-user"></i> Nama:</label>
          <input type="text" name="nama" value="${row.nama}" required>
          
          <label><i class="fas fa-school"></i> Kelas:</label>
          <input type="text" name="kelas" value="${row.kelas || ''}" required>
          
          <button type="submit"><i class="fas fa-save"></i> Update</button>
        </form>

        <a href="/" class="kembali"><i class="fas fa-arrow-left"></i> Kembali</a>
        
        <footer class="footer">
          <p><i class="fas fa-code"></i> NPS Developer</p>
          <div class="support">
            <a href="https://saweria.co/Tokita" target="_blank" class="support-btn">
              <i class="fas fa-coffee"></i> Support Creator
            </a>
          </div>
        </footer>
      </div>
    </body>
    </html>
    `;

    res.send(html);
  });
});

// update data
app.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nama, kelas } = req.body;
  
  db.run("UPDATE items SET nama = ?, kelas = ? WHERE id = ?", [nama, kelas, id], (err) => {
    if (err) {
      console.error(err.message);
    }
    res.redirect("/");
  });
});

// hapus
app.get("/hapus/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM items WHERE id = ?", [id]);
  res.redirect("/");
});

// jalankan server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});