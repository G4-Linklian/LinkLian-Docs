const envSelect = document.getElementById("envSelect");
const reloadBtn = document.getElementById("reloadBtn");
const content = document.getElementById("content");
const versionNav = document.getElementById("versionNav");
const loading = document.getElementById("loading");

let currentFileList = [];
let currentEnv = "prod";

// ฟังก์ชันหลัก: เริ่มต้นระบบ
async function init(env) {
  currentEnv = env;
  try {
    loading.style.display = "block";
    content.innerHTML = "";
    versionNav.innerHTML = "";

    // 1. โหลดรายชื่อไฟล์ (index.json)
    const res = await fetch(`versions/${env}/index.json`);
    if (!res.ok) throw new Error("Manifest not found");
    currentFileList = await res.json();

    // 2. สร้าง Sidebar Menu
    renderSidebar();

    // 3. โหลด "All Versions" เป็นค่าเริ่มต้น
    loadContent("all");

  } catch (error) {
    console.error(error);
    content.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
  } finally {
    loading.style.display = "none";
  }
}

// สร้าง Sidebar
function renderSidebar() {
  versionNav.innerHTML = "";

  // ปุ่ม "All Versions"
  const allLink = document.createElement("a");
  allLink.textContent = "All Versions";
  allLink.dataset.target = "all";
  allLink.classList.add("active"); // Default active
  allLink.onclick = () => handleNavClick(allLink, "all");
  versionNav.appendChild(allLink);

  // ปุ่มแยกแต่ละไฟล์
  currentFileList.forEach(file => {
    const link = document.createElement("a");
    // ตัด .md หรือ .json ออกเพื่อความสวยงาม (Optional)
    link.textContent = file.replace(/\.(md|json|txt)$/, ""); 
    link.dataset.target = file;
    link.onclick = () => handleNavClick(link, file);
    versionNav.appendChild(link);
  });
}

// จัดการเมื่อคลิกเมนู
function handleNavClick(element, target) {
  // Update Active State
  document.querySelectorAll(".version-list a").forEach(a => a.classList.remove("active"));
  element.classList.add("active");

  // Load Content
  loadContent(target);
}

// โหลดเนื้อหา (ตัวเดียว หรือ ทั้งหมด)
async function loadContent(target) {
  loading.style.display = "block";
  content.innerHTML = "";
  
  try {
    if (target === "all") {
      // โหลดทุกไฟล์
      let combinedHTML = "";
      for (const file of currentFileList) {
        const text = await fetchFile(file);
        combinedHTML += `
          <div class="version-block" id="${file}">
             <div style="color:#666; font-size:0.8em; margin-bottom:10px;">${file}</div>
             ${marked.parse(text)}
          </div>
          <hr class="version-separator" />
        `;
      }
      content.innerHTML = combinedHTML;
    } else {
      // โหลดไฟล์เดียว
      const text = await fetchFile(target);
      content.innerHTML = `
        <div class="version-block">
           <div style="color:#666; font-size:0.8em; margin-bottom:10px;">${target}</div>
           ${marked.parse(text)}
        </div>
      `;
    }
    
    // Highlight Code Blocks
    document.querySelectorAll('pre code').forEach((el) => {
        hljs.highlightElement(el);
    });

  } catch (err) {
    content.innerHTML = `<p>Error loading content.</p>`;
  } finally {
    loading.style.display = "none";
    // เลื่อน Scroll กลับไปบนสุด
    document.querySelector('.content-area').scrollTop = 0;
  }
}

// Helper fetch wrapper
async function fetchFile(filename) {
  const res = await fetch(`versions/${currentEnv}/${filename}`);
  return await res.text();
}

// Event Listeners
envSelect.addEventListener("change", (e) => init(e.target.value));
reloadBtn.addEventListener("click", () => init(envSelect.value));

// Start
init("prod");