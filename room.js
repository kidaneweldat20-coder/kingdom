// 1. ቀንዲ መለለዪታት (Configuration)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxySwaR6zkmTedIuFIrTCp9eLy4Opy5oBmqrnrTWDfFyrD8zvA3s_411jmWfuAM4pJhbA/exec";
let selectedRoom = "";

// 2. ሞዳል ንምኽፋት (Open Modal)
function bookRoom(room) {
    selectedRoom = room;
    const isTigrinya = document.documentElement.lang === 'ti';
    document.getElementById("roomTitle").innerText = isTigrinya ? "ምዝገባ: " + room : "Booking: " + room;
    
    // ሞዳል ንምርኣይ (flex ትጥቀም ስለዘለኻ)
    document.getElementById("modalOverlay").style.display = "flex";
    
    // ዕለታት ካብ ሎሚ ንድሕሪት ንከይኸዱ
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("checkIn").setAttribute('min', today);
    document.getElementById("checkOut").setAttribute('min', today);
}

// 3. ሞዳል ንምዕጻው (Close Modal & Reset)
function closeBox() {
    const bookingForm = document.getElementById('bookingForm');
    const status = document.getElementById("availabilityStatus");
    const modal = document.getElementById('modalOverlay');

    // ፎርም ባዶ ንምግባር
    if (bookingForm) bookingForm.reset(); 
    
    // reCAPTCHA ንምሕዳስ
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

    // ጽሑፍ ምርግጋጽ ንምድምሳስ
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

    if (!checkIn || !checkOut) {
        status.innerText = "በጃኹም ዕለታት ምልኡ (Please select dates)";
        status.style.color = "red";
        return;
    }

    status.innerText = "ይጻረ ኣሎ... (Checking...)";
    status.style.color = "orange";

    try {
        const response = await fetch(`${SCRIPT_URL}?room=${room}&checkIn=${checkIn}&checkOut=${checkOut}`);
        const result = await response.json();

        if (result.available) {
            status.innerText = `✅ (available) ክፍሊ ኣሎ! (${result.remaining} ተሪፎም)`;
            status.style.color = "green";
            submitBtn.disabled = false; 
        } else {
            status.innerText = "❌ ይቕሬታ፡ በቲ ዝሓረኹምዎ ዕለት ክፍሊ የለን (Full)";
            status.style.color = "red";
            submitBtn.disabled = true; 
        }
    } catch (error) {
        status.innerText = "ጌጋ ተፈጢሩ፡ ኢንተርነትኩም ኣረጋግጹ።";
        console.error(error);
    }
}

// 5. ምሉእ ምዝገባ ንምልኣኽ (Submit Booking)
async function submitBooking(event) {
    event.preventDefault(); // ፎርም ባዕሉ ንከይኸይድ

    // reCAPTCHA ምርግጋጽ
    const captchaResponse = grecaptcha.getResponse();
    if (captchaResponse.length === 0) {
        alert("በጃኻ 'I am not a robot' ዝብል ምልክት ግበር!");
        return;
    }
    
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const submitBtn = document.getElementById("submitBtn");
    const receiptFile = document.getElementById("receiptImage").files[0];
    const bookingForm = document.getElementById("bookingForm");
    const status = document.getElementById("availabilityStatus");

    // Loading State (ምጅማር)
    btnText.innerText = "ምስሊ ይስቀል ኣሎ..."; 
    if (spinner) spinner.style.display = "inline-block";
    submitBtn.disabled = true;

    try {
        let receiptUrl = "No Image";

        // ምስሊ ናብ ImgBB ምስቃል
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

        btnText.innerText = "ዳታ ይለኣኽ ኣሎ...";

        // ዳታ ምድላው
        const bookingData = {
            name: document.getElementById("name").value,
            email: document.getElementById("customerEmail").value,
            room: selectedRoom,
            checkIn: document.getElementById("checkIn").value,
            checkOut: document.getElementById("checkOut").value,
            receipt: receiptUrl 
        };

        // ናብ Google Script ምስዳድ
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(bookingData)
        });

        alert("እንቋዕ ሓጎሰካ! ምዝገባኹምን ሪሲትኩምን ብትኽክል ተላኢኹ ኣሎ!");
        
        // ኩሉ Reset ምግባር
        closeBox(); 

    } catch (error) {
        console.error("Error:", error);
        alert("ጌጋ ተፈጢሩ፡ በጃኹም ኢንተርነትኩም ኣረጋግጹ።");
    } finally {
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
