/* =========================================================
   SERVER.JS — Local static file server cho ShopeeFood Demo
   Không cần cài thêm thư viện nào (không dùng Express).
   Chỉ dùng module có sẵn của Node.js: http, fs, path.

   Cách chạy:
     1. Mở terminal tại thư mục gốc project (ShopeeFood-Demo)
     2. Gõ:  node server/server.js
     3. Mở trình duyệt: http://localhost:3000
   ========================================================= */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// Thư mục gốc chứa file web = thư mục cha của "server/"
const ROOT_DIR = path.join(__dirname, "..");

// Map đuôi file -> Content-Type tương ứng
const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css":  "text/css; charset=UTF-8",
  ".js":   "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon"
};

const server = http.createServer((req, res)=>{

  // Bỏ query string (?q=...) và giải mã ký tự URL (khoảng trắng, tiếng Việt...)
  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Nếu người dùng vào "/" thì mặc định trả về index.html
  if(urlPath === "/"){
    urlPath = "/index.html";
  }

  // Ghép đường dẫn tuyệt đối, đảm bảo không thoát ra ngoài ROOT_DIR (bảo mật cơ bản)
  const filePath = path.normalize(path.join(ROOT_DIR, urlPath));

  if(!filePath.startsWith(ROOT_DIR)){
    res.writeHead(403);
    res.end("403 Forbidden");
    return;
  }

  fs.readFile(filePath, (err, content)=>{

    if(err){
      if(err.code === "ENOENT"){
        // Không tìm thấy file -> trả 404
        res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
        res.end(`
          <h1>404 - Không tìm thấy trang</h1>
          <p>Đường dẫn <code>${urlPath}</code> không tồn tại.</p>
          <a href="/index.html">⬅ Về trang chủ</a>
        `);
      }else{
        // Lỗi server khác (quyền truy cập, v.v.)
        res.writeHead(500);
        res.end("500 - Lỗi máy chủ: " + err.code);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(PORT, ()=>{
  console.log("=================================================");
  console.log("  ShopeeFood Demo đang chạy tại:");
  console.log("  👉 http://localhost:" + PORT);
  console.log("=================================================");
  console.log("  Nhấn Ctrl + C để dừng server.");
});
