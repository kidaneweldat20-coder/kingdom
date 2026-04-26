<script>
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  
  // ነቲ ተንቀሳቃሺ ሊንክታትን ምልክት ሜኑን Active ይገብሮ
  navLinks.classList.toggle("active");
  menuIcon.classList.toggle("active");
}

// ዝኾነ ሰብ ካብቲ ሜኑ ወጻኢ እንተነኪኡ ንክዕጾ (ንጽሬት)
document.addEventListener('click', function(event) {
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");
  const isClickInside = navLinks.contains(event.target) || menuIcon.contains(event.target);

  if (!isClickInside && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    menuIcon.classList.remove('active');
  }
});
</script>
