// 1. ቀንዲ መለለዪታት (Configuration)
// ናትካ Google Apps Script URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxET7X5eFqm1IxtbcR36YkJhtpeIBDrV-qNow4d3vo4UGru7wULWZ-A9jcT9jY3C_KxSQ/exec";
// ናትካ ImgBB API Key
const imgbbKey = "YOUR_IMGBB_API_KEY_HERE"; 
let selectedRoom = "";

// 2. ሞዳል ንምኽፋት (Open Modal)
function bookRoom(room) {
    selectedRoom = room;
    const isTigrinya = document.documentElement.lang === 'ti';
    // ዓይነት ክፍሊ ኣብቲ ኣርእስቲ ንምጽሓፍ
    document.getElementById("roomTitle").innerText = isTigrinya ? "ምዝገባ: " + room : "Booking: " + room;
    
    // ሞዳል ንምርኣይ
    document.getElementById("modalOverlay").style.display = "flex";
    
    // ዕለታት ካብ ሎሚ ንድሕሪት ንከይኸዱ (Disable past dates)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("checkIn").setAttribute('min', today);
    document.getElementById("checkOut").setAttribute('min', today);
}

// 3. ሞዳል ንምዕጻው (Close Modal & Reset)
function closeBox() {
    const bookingForm = document.getElementById('bookingForm');
    const status = document.getElementById("availabilityStatus");
    const modal = document.getElementById('modalOverlay');

    // ፎርም ኩሉ ዳታኡ ባዶ ንምግባር
    if (bookingForm) bookingForm.reset(); 
    
    // reCAPTCHA ንምሕዳስ (Refresh)
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

    // ናይ ምርግጋጽ መልእኽቲ ንምድምሳስ
    if (status) status.innerText = "";

    // ሞዳል ንምዕጻው
    if (modal) modal.style.display = 'none';
}

// 4. ክፍሊ ምህላዉ ንምፍታሽ (Check Availability)
async function checkRoomAvailability() {
    const room = selectedRoom;
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    const status = document.getElementById("availabilityStatus");
    const submitBtn = document.getElementById("submitBtn");

    // ዕለታት እንተዘይተመሊኦም መጠንቀቕታ ንምሃብ
    if (!checkIn || !checkOut) {
        status.innerText = "በጃኹም ዕለታት ምልኡ (Please select dates)";
        status.style.color = "red";
        return;
    }

    status.innerText = "ይጻረ ኣሎ... (Checking...)";
    status.style.color = "orange";

    try {
        // ናብ Backend (GET request) ብምልኣኽ ትርፊ ክፍሊ እንተሃሊዩ ምርኣይ
        const response = await fetch(`${SCRIPT_URL}?room=${encodeURIComponent(room)}&checkIn=${checkIn}&checkOut=${checkOut}`);
        const result = await response.json();

        if (result.available) {
            status.innerText = `✅ ክፍሊ ኣሎ! (Available: ${result.remaining} rooms left)`;
            status.style.color = "green";
            submitBtn.disabled = false; // ምዝገባ ንክፍቀድ
        } else {
            status.innerText = "❌ ይቕሬታ፡ በቲ ዝሓረኹምዎ ዕለት ክፍሊ የለን (Full)";
            status.style.color = "red";
            submitBtn.disabled = true; // ምዝገባ ንከይፍቀድ
        }
    } catch (error) {
        status.innerText = "ጌጋ ተፈጢሩ፡ ኢንተርነትኩም ኣረጋግጹ።";
        console.error(error);
    }
}

// 5. ምሉእ ምዝገባ ንምልኣኽ (Submit Booking)
async function submitBooking(event) {
    event.preventDefault(); // ፎርም ብባዕሉ ሪፈረሽ ንከይገብር

    // reCAPTCHA ምርግጋጽ (ሰብ ምዃኑ ንምፍላጥ)
    const captchaResponse = grecaptcha.getResponse();
    if (captchaResponse.length === 0) {
        alert("በጃኻ 'I am not a robot' ዝብል ምልክት ግበር!");
        return;
    }
    
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const submitBtn = document.getElementById("submitBtn");
    const receiptFile = document.getElementById("receiptImage").files[0];

    // Loading State: ዓሚል ዳታ ይለኣኽ ከምዘሎ ንክፈልጥ
    btnText.innerText = "ምስሊ ይስቀል ኣሎ (Uploading image)..."; 
    if (spinner) spinner.style.display = "inline-block";
    submitBtn.disabled = true;

    try {
        let receiptUrl = "No Image";

        // ሀ. ምስሊ ሪሲት ናብ ImgBB ምስቃል
        if (receiptFile) {
            const formData = new FormData();
            formData.append("image", receiptFile);
            
            const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
                method: "POST",
                body: formData
            });
            const imgData = await imgRes.json();
            if (imgData.success) receiptUrl = imgData.data.url; 
        }

        btnText.innerText = "ዳታ ይለኣኽ ኣሎ (Sending data)...";

        // ለ. ኩሉ ዳታ (ስልኪ ሓዊሱ) ንምድላው
        const bookingData = {
            action: "newBooking", // Backend ንክፈልጦ
            name: document.getElementById("name").value,
            email: document.getElementById("customerEmail").value,
            phone: document.getElementById("phoneNumber").value, // *** ተወሳኺ ቁጽሪ ስልኪ ***
            room: selectedRoom,
            checkIn: document.getElementById("checkIn").value,
            checkOut: document.getElementById("checkOut").value,
            receipt: receiptUrl 
        };

        // ሐ. ናብ Google Script ምስዳድ (POST request)
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // CORS ጸገም ንከይመጽእ
            body: JSON.stringify(bookingData)
        });

        alert("እንቋዕ ሓጎሰካ! ምዝገባኹምን ሪሲትኩምን ብትኽክል ተላኢኹ ኣሎ!");
        
        // ኩሉ Reset ምግባርን ሞዳል ምዕጻውን
        closeBox(); 

    } catch (error) {
        console.error("Error:", error);
        alert("ጌጋ ተፈጢሩ፡ በጃኹም ኢንተርነትኩም ኣረጋግጹ።");
    } finally {
        // ኩሉ ምስ ተዛዘመ ነቲ Button ናብ ዝነበሮ ምምላስ
        if (spinner) spinner.style.display = "none";
        btnText.innerText = "Confirm Booking";
        submitBtn.disabled = false;
    }
}

// 6. Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    const menuIcon = document.getElementById("menuIcon");
    navLinks.classList.toggle("active");
    menuIcon.classList.toggle("active");
}
