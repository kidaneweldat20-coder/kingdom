// --- 1. Menu Toggle ---
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  navLinks.classList.toggle("active");
  menuIcon.classList.toggle("active");
}

// --- 2. Backend Logic ---
const googleSheetUrl = "https://script.google.com/macros/s/AKfycbwhMqCnuo46htUohdvwQA13zlniQIqQir-l4LqlMfgDo54BhPV_mpbmF9stWVIfC6G0/exec";
const imgbbKey = "470e18bf524a4e7396d4002569e54083";

async function submitBooking(event) {
    event.preventDefault();
    
    const nameEl = document.getElementById('name');
    const imageEl = document.getElementById('receiptImage');
    const submitBtn = document.getElementById('submitBtn');

    if (!nameEl.value || !imageEl.files[0]) {
        alert("በጃኻ ኩሉ ቅጥዒ ምልኣዮ");
        return;
    }

    submitBtn.innerText = "እናተሰደደ እዩ...";
    submitBtn.disabled = true;

    try {
        // 1. Upload to ImgBB
        const formData = new FormData();
        formData.append("image", imageEl.files[0]);

        const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: "POST",
            body: formData
        });
        const imgData = await imgResponse.json();
        const receiptUrl = imgData.data.url;

        // 2. Send to Google Sheets
        await fetch(googleSheetUrl, {
            method: "POST",
            mode: "no-cors", 
            body: JSON.stringify({
                name: nameEl.value,
                room: selectedRoom, // ካብቲ HTML ዝመጸ
                receiptUrl: receiptUrl
            })
        });

        alert("ብትኽክል ተመዝጊቡ ኣሎ! የቐንየልና።");
        closeBox();
        window.location.reload(); 

    } catch (error) {
        alert("ጸገም ኣጋጢሙ። እንደገና ፈትን።");
        submitBtn.innerText = "Confirm Booking";
        submitBtn.disabled = false;
    }
}
