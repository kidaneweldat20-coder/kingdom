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
    
    // Elements ምልላይ (እቲ 'bookingDate' ካብ rooms.html ይረኽቦ)
    const nameEl = document.getElementById('name');
    const dateEl = document.getElementById('bookingDate'); 
    const imageEl = document.getElementById('receiptImage');
    const submitBtn = document.getElementById('submitBtn');

    // Validation (ኩሉ ተመሊኡ ምህላዉ ምርግጋጽ)
    if (!nameEl.value || !dateEl.value || !imageEl.files[0]) {
        alert("በጃኻ ኩሉ ቅጥዒ ምልኣዮ (Please fill all fields)");
        return;
    }

    // Button ስራሕ ከም ዝጀመረ ንምርኣይ (ትግርኛን Englishን)
    submitBtn.innerText = "እናተሰደደ እዩ... (Uploading...)";
    submitBtn.disabled = true;

    try {
        // 1. Upload to ImgBB (ስእሊ ናብ ሊንክ ምቕያር)
        const formData = new FormData();
        formData.append("image", imageEl.files[0]);
        
        const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: "POST",
            body: formData
        });
        const imgData = await imgResponse.json();
        const receiptUrl = imgData.data.url;

        // 2. Send to Google Sheets (ዳታ ናብ ሺት ምስዳድ)
        // እቲ 'date' ዝብል Key ምስቲ ኣብ Apps Script ዘሎ data.date ይሰማማዕ
        await fetch(googleSheetUrl, {
            method: "POST",
            mode: "no-cors", 
            body: JSON.stringify({
                name: nameEl.value,
                date: dateEl.value, // እቲ ካብ rooms.html ዝመጸ ዕለት
                room: selectedRoom, // ካብቲ ኣብ HTML ዝተመርጸ ክፍሊ
                receiptUrl: receiptUrl
            })
        });

        // ዓወት!
        alert("ብትኽክል ተመዝጊቡ ኣሎ! የቐንየልና። (Booking Successful!)");
        window.location.reload(); 

    } catch (error) {
        console.error("Error:", error);
        alert("ጸገም ኣጋጢሙ። እንደገና ፈትን። (Error occurred. Please try again.)");
        submitBtn.innerText = "Confirm Booking";
        submitBtn.disabled = false;
    }
}
