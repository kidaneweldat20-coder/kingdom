
  // እቲ ናይ Google Apps Script URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxqOmmdx4eW5Q9GT4HJujB7tyVWnS0dRIe8VCvbFE2Nk8tkeEV6FIoJwthCSUtSaejktA/exec";
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
  const bookingForm = document.getElementById("bookingForm");
  const status = document.getElementById("availabilityStatus");

  // 1. Loading State
  btnText.innerText = "ምስሊ ይስቀል ኣሎ..."; 
  spinner.style.display = "inline-block";
  submitBtn.disabled = true;

  try {
    let receiptUrl = "No Image";

    // 2. ነቲ ምስሊ ናብ ImgBB ምስቃል
    if (receiptFile) {
      const formData = new FormData();
      formData.append("image", receiptFile);
      
      const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: formData
      });
      const imgData = await imgRes.json();
      if (imgData.success) {
        receiptUrl = imgData.data.url; 
      }
    }

    btnText.innerText = "ዳታ ይለኣኽ ኣሎ...";

    // 3. ዳታ ምድላው
    const bookingData = {
      name: document.getElementById("name").value,
      email: document.getElementById("customerEmail").value,
      room: selectedRoom,
      checkIn: document.getElementById("checkIn").value,
      checkOut: document.getElementById("checkOut").value,
      receipt: receiptUrl 
    };

    // 4. ናብ Google Script ምስዳድ (እዚ እዩ እቲ ትኽክለኛ መንገዲ)
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // እዚ ኣገዳሲ እዩ
      body: JSON.stringify(bookingData)
    });

    // 5. ዓወት ምርግጋጽ (ኣብ ሓደ መስመር ግበሮ)
    alert("ምዝገባኹምን ሪሲትኩምን ብትኽክል ተላኢኹ ኣሎ!");
    
    // --- AUTOMATIC RESET ---
    bookingForm.reset(); 
    status.innerText = ""; 
    submitBtn.disabled = true; 
    closeBox(); 

  } catch (error) {
    console.error("Error:", error);
    alert("ጌጋ ተፈጢሩ፡ በጃኹም ኢንተርነትኩም ኣረጋግጹ።");
  } finally {
    spinner.style.display = "none";
    btnText.innerText = "Confirm Booking";
  }
}

function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  
  // 'active' ዝብል class ንኽልቲኦም ይውስኸሎም ወይ የልግሰሎም
  navLinks.classList.toggle("active");
  menuIcon.classList.toggle("active");
}
