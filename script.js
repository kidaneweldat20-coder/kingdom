function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  
  // Console log ተጠቐም ንምፍታን
  console.log("Menu toggled!"); 
  
  navLinks.classList.toggle("active");
  menuIcon.classList.toggle("active");
}
let selectedRoom = "";

function bookRoom(room) {
  selectedRoom = room;
  const isTigrinya = document.documentElement.lang === 'ti';
  document.getElementById("roomTitle").innerText = isTigrinya ? "ምዝገባ: " + room : "Booking: " + room;
  document.getElementById("modalOverlay").style.display = "flex";
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("checkIn").setAttribute('min', today);
  document.getElementById("checkOut").setAttribute('min', today);
}

function closeBox() {
  document.getElementById("modalOverlay").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById("modalOverlay");
  if (event.target == modal) closeBox();
}
//
  // እቲ ናይ Google Apps Script URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKWSpHn_Jx3pHyntNX24IN5-SI63vUh4NDbUDgOvEPqa0pK142CcTw8ARNrXwrmJNl_g/exec";
const imgbbKey = "470e18bf524a4e7396d4002569e54083";
  let selectedRoom = "";

  // ሞዳል ንምኽፋት ዝሕግዝ
  function bookRoom(room) {
    selectedRoom = room;
    const isTigrinya = document.documentElement.lang === 'ti';
    document.getElementById("roomTitle").innerText = isTigrinya ? "ምዝገባ: " + room : "Booking: " + room;
    document.getElementById("modalOverlay").style.display = "flex";
    
    // ዕለታት ካብ ሎሚ ንድሕሪት ንከይኸዱ
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("checkIn").setAttribute('min', today);
    document.getElementById("checkOut").setAttribute('min', today);
  }

  // ሞዳል ንምዕጻው
  function closeBox() {
    document.getElementById("modalOverlay").style.display = "none";
  }
async function checkRoomAvailability() {
  const room = selectedRoom; // እቲ ዝተሓረየ ክፍሊ
  const checkIn = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;
  const status = document.getElementById("availabilityStatus");
  const submitBtn = document.getElementById("submitBtn");

  // 1. ዕለታት ምምላኦም ምርግጋጽ
  if (!checkIn || !checkOut) {
    status.innerText = "በጃኹም ዕለታት ምልኡ (Please select dates)";
    status.style.color = "red";
    return;
  }

  status.innerText = "ይጻረ ኣሎ... (Checking...)";
  status.style.color = "orange";

  try {
    // 2. ናብ Google Script ጥርዓን ምስዳድ (GET request)
    // እቲ URL እቲ ናትካ Deploy ዝገበርካዮ ክኸውን ኣለዎ
    const response = await fetch(`${SCRIPT_URL}?room=${room}&checkIn=${checkIn}&checkOut=${checkOut}`);
    const result = await response.json();

    // 3. ውጽኢት ምርኣይ
    if (result.available) {
      status.innerText = `✅  (available) ክፍሊ ኣሎ! (${result.remaining} ተሪፎም)`;
      status.style.color = "green";
      submitBtn.disabled = false; // "Confirm" ቁልፊ ይበራበር
    } else {
      status.innerText = "❌ ይቕሬታ፡ በቲ ዝሓረኹምዎ ዕለት ክፍሊ የለን (Full)";
      status.style.color = "red";
      submitBtn.disabled = true; // "Confirm" ቁልፊ ይዕጸው
    }
  } catch (error) {
    status.innerText = "ጌጋ ተፈጢሩ፡ ኢንተርነትኩም ኣረጋግጹ።";
    console.error(error);
  }
}

async function submitBooking(event) {
  event.preventDefault();
  
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("spinner");
  const submitBtn = document.getElementById("submitBtn");
  const receiptFile = document.getElementById("receiptImage").files[0];

  // Loading State
  btnText.innerText = "(image uploding)ምስሊ ይስቀል ኣሎ..."; 
  spinner.style.display = "inline-block";
  submitBtn.disabled = true;

  try {
    let receiptUrl = "No Image";

    // 1. ነቲ ምስሊ ናብ ImgBB ምስቃል
    if (receiptFile) {
      const formData = new FormData();
      formData.append("image", receiptFile);
      
      const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: formData
      });
      const imgData = await imgRes.json();
      if (imgData.success) {
        receiptUrl = imgData.data.url; // እቲ ናይቲ ምስሊ ሊንክ
      }
    }

    btnText.innerText = "(data sending)ዳታ ይለኣኽ ኣሎ...";

    // 2. ነቲ ኩሉ ዳታ (ምስቲ ሊንክ ሓዊስካ) ናብ Google Apps Script ምስዳድ
    const bookingData = {
      name: document.getElementById("name").value,
      email: document.getElementById("customerEmail").value,
      room: selectedRoom,
      checkIn: document.getElementById("checkIn").value,
      checkOut: document.getElementById("checkOut").value,
      receipt: receiptUrl // እቲ ሊንክ ኣብዚ ኣሎ
    };

    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    alert("ምዝገባኹምን ሪሲትኩምን ብትኽክል ተላኢኹ ኣሎ!");
    closeBox();
    document.getElementById("bookingForm").reset(); 

  } catch (error) {
    console.error("Error:", error);
    alert("ጌጋ ተፈጢሩ፡ በጃኹም ኢንተርነትኩም ኣረጋግጹ።");
  } finally {
    spinner.style.display = "none";
    btnText.innerText = "Confirm Booking";
    submitBtn.disabled = false;
  }
}
async function submitBooking(event) {
  event.preventDefault();
  
  // UI logic: spinner show...
  document.getElementById("btnText").innerText = "Sending...";
  document.getElementById("spinner").style.display = "inline-block";
  document.getElementById("submitBtn").disabled = true;

  // ... (ናብ Google Script ዳታ ዝሰደሉ ኮድ ኣብዚ ይመጽእ) ...

  setTimeout(() => {
    alert("Booking Sent Successfully!");
    
    // --- RESET LOGIC ---
    document.getElementById("bookingForm").reset(); // ፎርም Reset
    document.getElementById("availabilityStatus").innerText = ""; // መልእኽቲ Reset
    document.getElementById("submitBtn").disabled = true; // Button መሊስካ ዕጸዎ
    // -------------------

    document.getElementById("spinner").style.display = "none";
    document.getElementById("btnText").innerText = "Confirm Booking";
    closeBox();
  }, 2000);
}

function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  
  // 'active' ዝብል class ንኽልቲኦም ይውስኸሎም ወይ የልግሰሎም
  navLinks.classList.toggle("active");
  menuIcon.classList.toggle("active");
}


