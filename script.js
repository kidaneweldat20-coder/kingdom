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
// 1. እቲ ካብ Google Sheets ዘውጻእካዮ ሓድሽ Web App URL
const googleSheetUrl = "https://script.google.com/macros/s/AKfycbwhMqCnuo46htUohdvwQA13zlniQIqQir-l4LqlMfgDo54BhPV_mpbmF9stWVIfC6G0/exec";

// 2. እቲ ሕጂ ዝለኣኽካዮ ImgBB API Key
    const imgbbKey = "470e18bf524a4e7396d4002569e54083";
async function submitBooking(event) {
    event.preventDefault();
    
    // Check if the form elements exist
    const nameEl = document.getElementById('name');
    const roomEl = document.getElementById('roomType');
    const imageEl = document.getElementById('receiptImage');

    if (!nameEl || !roomEl || !imageEl || !imageEl.files[0]) {
        alert("በጃኻ ኩሉ ቅጥዒ ብትኽክል ምልኣዮ (Please fill all fields and upload receipt)");
        return;
    }

    const submitBtn = event.target;
    submitBtn.innerText = "እናተሰደደ እዩ... (Uploading...)";
    submitBtn.disabled = true;

    try {
        // A. Upload to ImgBB
        const formData = new FormData();
        formData.append("image", imageEl.files[0]);

        const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: "POST",
            body: formData
        });
        const imgData = await imgResponse.json();
        const receiptUrl = imgData.data.url;

        // B. Send to Google Sheets
        await fetch(googleSheetUrl, {
            method: "POST",
            mode: "no-cors", 
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: nameEl.value,
                room: roomEl.value,
                receiptUrl: receiptUrl
            })
        });

        alert("ብትኽክል ተመዝጊቡ ኣሎ! የቐንየልና።");
        window.location.reload(); 

    } catch (error) {
        console.error("Error:", error);
        alert("ገሊኡ ጸገም ኣጋጢሙ ኣሎ። በጃኻ እንደገና ፈትን።");
        submitBtn.innerText = "Book Now";
        submitBtn.disabled = false;
    }
}
