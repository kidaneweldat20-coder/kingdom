// --- 1. ናይ Menu Toggle ምስራሕ ---
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  
  navLinks.classList.toggle("active");
  menuIcon.classList.toggle("active");
}

// ዝኾነ ሰብ ካብቲ ሜኑ ወጻኢ እንተነኪኡ ንክዕጾ
document.addEventListener('click', function(event) {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  
  if (navLinks && menuIcon) {
    const isClickInside = navLinks.contains(event.target) || menuIcon.contains(event.target);
    if (!isClickInside && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      menuIcon.classList.remove('active');
    }
  }
});

// --- 2. ናይ Backend (Google Sheets + ImgBB) ምስራሕ ---
const googleSheetUrl = "https://script.google.com/macros/s/AKfycbygi375jZ6XAOqkORbhsiiWQ3yX6w2HHdDQayXJ9gxQh-7621kWAQXyh93Wrx_PQ-Of/exec";
const imgbbKey = "470e18bf524a4e7396d4002569e54083";

async function submitBooking(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('name');
    const roomInput = document.getElementById('roomType');
    const imageInput = document.getElementById('receiptImage');
    
    // Check if elements exist
    if (!nameInput || !roomInput || !imageInput) {
        console.error("ሓደ ሓደ HTML elements ኣይተረኽቡን። IDs ቼክ ግበር።");
        return;
    }

    const name = nameInput.value;
    const room = roomInput.value;
    const imageFile = imageInput.files[0];
    
    if (!imageFile) {
        alert("በጃኻ ናይ ክፍሊት ሪሲት ስእሊ ኣእትው (Please upload receipt)");
        return;
    }

    // "Loading" መልእኽቲ ንዓሚል ንምርኣይ
    const originalBtnText = event.target.innerText;
    event.target.innerText = "እናተሰደደ እዩ... (Uploading...)";
    event.target.disabled = true;

    try {
        // A. ነታ ስእሊ ናብ ImgBB ምስዳድ
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: "POST",
            body: formData
        });
        
        const imgData = await imgResponse.json();
        
        if (!imgData.success) {
            throw new Error("ስእሊ ክስቀል ኣይከኣለን።");
        }

        const receiptUrl = imgData.data.url;

        // B. ኩሉ ሓበሬታ ናብ Google Sheet ምስዳድ
        await fetch(googleSheetUrl, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                room: room,
                receiptUrl: receiptUrl
            })
        });

        alert("ብትኽክል ተመዝጊቡ ኣሎ! የቐንየልና።");
        window.location.reload(); 

    } catch (error) {
        console.error("Error:", error);
        alert("ገሊኡ ጸገም ኣጋጢሙ ኣሎ። በጃኻ እንደገና ፈትን።");
        event.target.innerText = originalBtnText;
        event.target.disabled = false;
    }
}
