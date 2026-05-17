// ==========================================================================
// 1. ቀንዲ መለለዪታት (Configuration - FIXED INVISIBLE CHARACTER ERROR)
// ==========================================================================
// 🛠️ ቪክስ: እቲ ሊንክ ቅድሚ 'https' ዝነበሮ ዘይረአ ፊደል ተኣልዩ ጽፉፍ ኰይኑ ኣሎ!
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxET7X5eFqm1IxtbcR36YkJhtpeIBDrV-qNow4d3vo4UGru7wULWZ-A9jcT9jY3C_KxSQ/exec";
const imgbbKey = "470e18bf524a4e7396d4002569e54083"; 
let selectedRoom = "";

// ናይ ነፍሲ-ወከፍ ክፍሊ ዋጋ ንሓደ ለይቲ (Price per Night)
const ROOM_PRICES = {
    "Single Room": 1250,
    "Double Room": 3000,
    "VIP Suite": 10000
};

// ቋንቋ ካብቲ ናይ HTML Tag ብቐጥታ ንምውሳድ
function getCurrentLang() {
    return document.documentElement.lang || "en";
}

// ==========================================================================
// 2. ሞዳል ንምኽፋት (Open Modal)
// ==========================================================================
function bookRoom(room) {
    selectedRoom = room;
    const isTigrinya = getCurrentLang() === 'ti';
    document.getElementById("roomTitle").innerText = isTigrinya ? "ምዝገባ: " + room : "Booking: " + room;
    
    document.getElementById("modalOverlay").style.display = "flex";
    
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById("checkIn");
    const checkOutInput = document.getElementById("checkOut");
    const submitBtn = document.getElementById("submitBtn");
    const priceBox = document.getElementById("priceSummaryBox");
    
    checkInInput.setAttribute('min', today);
    checkOutInput.setAttribute('min', today);
    
    // መጀመርታ ኩሉ Reset ንምግባር
    if (submitBtn) submitBtn.disabled = true;
    if (priceBox) priceBox.style.display = "none"; 

    // ዕለታት እንተቀይሩ እንደገና ክፈ特ሽ ዋጋን ቡተንን Reset ይግበሩ
    checkInInput.addEventListener('change', function() {
        if (this.value) {
            checkOutInput.setAttribute('min', this.value);
            if (submitBtn) submitBtn.disabled = true; 
            if (priceBox) priceBox.style.display = "none";
            document.getElementById("availabilityStatus").innerText = ""; // Reset status text
        }
    });
    
    checkOutInput.addEventListener('change', function() {
        if (submitBtn) submitBtn.disabled = true;
        if (priceBox) priceBox.style.display = "none";
        document.getElementById("availabilityStatus").innerText = ""; // Reset status text
    });
}

// ==========================================================================
// 3. ሞዳል ንምዕጻው (Close Modal & Reset)
// ==========================================================================
function closeBox() {
    const bookingForm = document.getElementById('bookingForm');
    const status = document.getElementById("availabilityStatus");
    const modal = document.getElementById('modalOverlay');
    const priceBox = document.getElementById("priceSummaryBox");

    if (bookingForm) bookingForm.reset(); 
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
    if (status) status.innerText = "";
    if (priceBox) priceBox.style.display = "none";
    if (modal) modal.style.display = 'none';
}

// ==========================================================================
// 4. ክፍሊ ምህላዉ ንምፍታሽ (Check Availability & Calculate Price)
// ==========================================================================
async function checkRoomAvailability() {
    const room = selectedRoom;
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    const status = document.getElementById("availabilityStatus");
    const submitBtn = document.getElementById("submitBtn");
    const priceBox = document.getElementById("priceSummaryBox");
    const isTi = getCurrentLang() === "ti";

    if (!checkIn || !checkOut) {
        status.innerText = isTi ? "❌ በጃኹም መእተዊን መውጽኢን ዕለታት ምልኡ!" : "❌ Please select both Check-in and Check-out dates!";
        status.style.color = "red";
        if (priceBox) priceBox.style.display = "none";
        return;
    }

    // ናይ መዓልታት ፍልልይ ንምሕሳብ
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        status.innerText = isTi ? "❌ መውጽኢ ዕለት ካብ መእተዊ ዕለት ክዓቢ ኣለዎ!" : "❌ Check-out date must be after Check-in date!";
        status.style.color = "red";
        if (priceBox) priceBox.style.display = "none";
        return;
    }

    status.innerText = isTi ? "ይጻረ ኣሎ... በጃኹም ተጸበዩ..." : "Checking availability... Please wait...";
    status.style.color = "orange";

    try {
        // 🛠️ ፎርማት ፍጹም ጽፉፍ ኰይኑ ናብ Apps Script ይለኣኽ ኣሎ
        const finalUrl = `${SCRIPT_URL}?room=${encodeURIComponent(room)}&checkIn=${checkIn}&checkOut=${checkOut}`;
        const response = await fetch(finalUrl);
        const result = await response.json();

        if (result.available) {
            status.innerText = isTi ? `✅ ክፍሊ ኣሎ! (ትርፊ ክፍሊ: ${result.remaining})` : `✅ Room is Available! (${result.remaining} left)`;
            status.style.color = "green";
            
            // --- ጠቕላላ ክፍሊት ሕሳብ ምስራሕ ---
            const pricePerNight = ROOM_PRICES[room] || 0;
            const totalPrice = pricePerNight * diffDays;

            if (priceBox) {
                document.getElementById("displayDays").innerText = diffDays;
                document.getElementById("displayRate").innerText = pricePerNight.toLocaleString();
                document.getElementById("displayTotal").innerText = totalPrice.toLocaleString();
                
                document.getElementById("labelDays").innerText = isTi ? "ጠቕላላ መዓልታት (Total Days):" : "Total Days:";
                document.getElementById("labelRate").innerText = isTi ? "ዋጋ ንሓደ ለይቲ (Rate per Night):" : "Rate per Night:";
                document.getElementById("labelTotal").innerText = isTi ? "💲 ጠቕላላ ክፍሊት (Total Payment):" : "💲 Total Payment:";
                
                priceBox.style.display = "block"; 
            }

            if (submitBtn) submitBtn.disabled = false; 
        } else {
            status.innerText = isTi ? "❌ ይቕሬታ፡ በቲ ዝሓረኹምዎ ዕለት እዚ ክፍሊ ሙሉእ እዩ!" : "❌ Sorry, this room type is fully booked for the selected dates!";
            status.style.color = "red";
            if (submitBtn) submitBtn.disabled = true; 
            if (priceBox) priceBox.style.display = "none";
        }
    } catch (error) {
        status.innerText = isTi ? "⚠️ ጌጋ ተፈጢሩ፡ ኢንተርነትኩም ኣረጋግጹ።" : "⚠️ An error occurred. Please check your internet connection.";
        status.style.color = "red";
        if (priceBox) priceBox.style.display = "none";
        console.error("Fetch Error Detail:", error);
    }
}

// ==========================================================================
// 5. ምሉእ ምዝገባ ንምልኣኽ (Submit Booking)
// ==========================================================================
async function submitBooking(event) {
    event.preventDefault(); 
    const currentLang = getCurrentLang();
    const isTi = currentLang === "ti";

    if (typeof grecaptcha !== 'undefined') {
        const captchaResponse = grecaptcha.getResponse();
        if (captchaResponse.length === 0) {
            showClientAlert(
                isTi ? "በጃኻ 'I am not a robot' ዝብል ምልክት ግበር!" : "Please check 'I am not a robot'!", 
                "error"
            );
            return;
        }
    }
    
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const submitBtn = document.getElementById("submitBtn");
    const receiptFile = document.getElementById("receiptImage").files[0];

    btnText.innerText = isTi ? "ምስሊ ይስቀል ኣሎ..." : "Uploading image..."; 
    if (spinner) spinner.style.display = "inline-block";
    if (submitBtn) submitBtn.disabled = true;

    try {
        let receiptUrl = "No Image";

        if (receiptFile) {
            const formData = new FormData();
            formData.append("image", receiptFile);
            
            const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
                method: "POST",
                body: formData
            });
            
            if (!imgRes.ok) throw new Error("Image upload failed");
            
            const imgData = await imgRes.json();
            if (imgData.success) {
                receiptUrl = imgData.data.url; 
            } else {
                throw new Error("ImgBB conversion failed");
            }
        }

        btnText.innerText = isTi ? "ዳታ ይለኣኽ ኣሎ..." : "Sending data...";

        const urlParams = new URLSearchParams();
        // 🛠️ ቪክስ: እቲ 'action' ንሓድሽ ምዝገባ ስለ ዘየድሊ ተኣልዩ ኣሎ ንጽረትን ውሕስነትን Backend
        urlParams.append("name", document.getElementById("name").value);
        urlParams.append("email", document.getElementById("customerEmail").value);
        urlParams.append("phone", document.getElementById("phoneNumber").value);
        urlParams.append("room", selectedRoom);
        urlParams.append("receipt", receiptUrl);
        urlParams.append("checkIn", document.getElementById("checkIn").value);
        urlParams.append("checkOut", document.getElementById("checkOut").value);

        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: urlParams.toString() 
        });

        showClientAlert(
            isTi ? "እንቋዕ ሓጎሰካ! ምዝገባኹምን ሪሲትኩምን ብትኽክል ተላኢኹ ኣሎ!" : "Congratulations! Your booking and receipt have been submitted successfully!", 
            "success"
        );

        closeBox(); 

    } catch (error) {
        console.error("Error Detail:", error);
        showClientAlert(
            isTi ? "⚠️ ጌጋ ተፈጢሩ፡ በጃኹም ኢንተርነትኩም ወይ ናይ ሪሲት ምስሊ ኣረጋግጹ።" : "⚠️ An error occurred. Please check your internet connection or receipt image.", 
            "error"
        );
    } finally {
        if (spinner) spinner.style.display = "none";
        btnText.innerText = isTi ? "ምዝገባ ኣረጋግጽ" : "Confirm Booking";
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ==========================================================================
// 6. Mobile Menu Toggle
// ==========================================================================
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    const menuIcon = document.getElementById("menuIcon");
    if (navLinks) navLinks.classList.toggle("active");
    if (menuIcon) menuIcon.classList.toggle("active");
}

function showClientAlert(message, type = "info") {
    const alertBox = document.getElementById("clientAlert");
    const alertMsg = document.getElementById("clientAlertMessage");
    const alertIcon = document.getElementById("clientAlertIcon");
    
    if (!alertBox || !alertMsg || !alertIcon) return;
    
    alertMsg.innerText = message;
    alertIcon.className = "fas client-alert-icon";
    
    if (type === "success") {
        alertIcon.classList.add("fa-check-circle", "success-icon");
    } else if (type === "error") {
        alertIcon.classList.add("fa-exclamation-circle", "error-icon");
    } else {
        alertIcon.classList.add("fa-info-circle");
    }
    
    alertBox.classList.remove("hidden");
}

function closeClientAlert() {
    const alertBox = document.getElementById("clientAlert");
    if (alertBox) {
        alertBox.classList.add("hidden");
    }
}
