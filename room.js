// 1. ቀንዲ መለለዪታት (Configuration)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxET7X5eFqm1IxtbcR36YkJhtpeIBDrV-qNow4d3vo4UGru7wULWZ-A9jcT9jY3C_KxSQ/exec";
const imgbbKey = "470e18bf524a4e7396d4002569e54083"; 
let selectedRoom = "";

// ቋንቋ ካብቲ ናይ HTML Tag ብቐጥታ ንምውሳድ (Automatic language detection)
function getCurrentLang() {
    return document.documentElement.lang || "en";
}

// 2. ሞዳል ንምኽፋት (Open Modal)
function bookRoom(room) {
    selectedRoom = room;
    const isTigrinya = getCurrentLang() === 'ti';
    document.getElementById("roomTitle").innerText = isTigrinya ? "ምዝገባ: " + room : "Booking: " + room;
    
    document.getElementById("modalOverlay").style.display = "flex";
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("checkIn").setAttribute('min', today);
    document.getElementById("checkOut").setAttribute('min', today);
}

// 3. ሞዳል ንምዕጻው (Close Modal & Reset)
function closeBox() {
    const bookingForm = document.getElementById('bookingForm');
    const status = document.getElementById("availabilityStatus");
    const modal = document.getElementById('modalOverlay');

    if (bookingForm) bookingForm.reset(); 
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
    if (status) status.innerText = "";
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
        const response = await fetch(`${SCRIPT_URL}?room=${encodeURIComponent(room)}&checkIn=${checkIn}&checkOut=${checkOut}`);
        const result = await response.json();

        if (result.available) {
            status.innerText = `✅ ክፍሊ ኣሎ! (Available: ${result.remaining} rooms left)`;
            status.style.color = "green";
            submitBtn.disabled = false; 
        } else {
            status.innerText = "❌ ይቕሬታ፡ በቲ ዝሓረኹምዎ ዕለት ክፍሊ የለን (Full)";
            status.style.color = "red";
            submitBtn.disabled = true; 
        }
    } catch (error) {
        status.innerText = getCurrentLang() === "ti" ? "ጌጋ ተፈጢሩ፡ ኢንተርነትኩም ኣረጋግጹ።" : "An error occurred. Please check your internet connection.";
        status.style.color = "red";
        console.error(error);
    }
}

// 5. ምሉእ ምዝገባ ንምልኣኽ (Submit Booking)
async function submitBooking(event) {
    event.preventDefault(); 

    // reCAPTCHA ምርግጋጽ
    if (typeof grecaptcha !== 'undefined') {
        const captchaResponse = grecaptcha.getResponse();
        if (captchaResponse.length === 0) {
            alert(getCurrentLang() === "ti" ? "በጃኻ 'I am not a robot' ዝብል ምልክት ግበር!" : "Please check 'I am not a robot'!");
            return;
        }
    }
    
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const submitBtn = document.getElementById("submitBtn");
    const receiptFile = document.getElementById("receiptImage").files[0];
    const currentLang = getCurrentLang();

    // Loading State
    btnText.innerText = currentLang === "ti" ? "ምስሊ ይስቀል ኣሎ..." : "Uploading image..."; 
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

        btnText.innerText = currentLang === "ti" ? "ዳታ ይለኣኽ ኣሎ..." : "Sending data...";

        // ለ. URL Search Params 
        const urlParams = new URLSearchParams();
        urlParams.append("action", "newBooking");
        urlParams.append("name", document.getElementById("name").value);
        urlParams.append("email", document.getElementById("customerEmail").value);
        urlParams.append("phone", document.getElementById("phoneNumber").value);
        urlParams.append("room", selectedRoom);
        urlParams.append("receipt", receiptUrl);
        urlParams.append("checkIn", document.getElementById("checkIn").value);
        urlParams.append("checkOut", document.getElementById("checkOut").value);

        // ሐ. ናብ Google Script ምስዳድ
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlParams.toString() 
        });

        // ዓወት መልእኽቲ
        if (currentLang === "ti") {
            alert("እንቋዕ ሓጎሰካ! ምዝገባኹምን ሪሲትኩምን ብትኽክል ተላኢኹ ኣሎ!");
        } else {
            alert("Congratulations! Your booking and receipt have been submitted successfully!");
        }

        closeBox(); 

    } catch (error) {
        console.error("Error:", error);
        // ጌጋ መልእኽቲ
        if (currentLang === "ti") {
            alert("ጌጋ ተፈጢሩ፡ በጃኹም ኢንተርነትኩም ኣረጋግጹ።");
        } else {
            alert("An error occurred. Please check your internet connection.");
        }
    } finally {
        if (spinner) spinner.style.display = "none";
        btnText.innerText = currentLang === "ti" ? "ምዝገባ ኣረጋግጽ" : "Confirm Booking";
        submitBtn.disabled = false;
    }
}

// 6. Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    const menuIcon = document.getElementById("menuIcon");
    if (navLinks) navLinks.classList.toggle("active");
    if (menuIcon) menuIcon.classList.toggle("active");
}
