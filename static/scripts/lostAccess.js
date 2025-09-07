const apiBase = "https://localhost:7124/api/v1/Users";


function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
document.getElementById('lostAccessForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userIdentifier = document.getElementById('userIdentifier').value.trim();
  const alternateEmail = document.getElementById('alternateEmail').value.trim();
  const alternatePhone = document.getElementById('alternatePhone').value.trim();
  const problemDescription = document.getElementById('problemDescription').value.trim();

   if (!isValidEmail(userIdentifier)) {
    return Swal.fire("Error", "Please enter a valid email address.", "error");
  }

  if (!userIdentifier || !problemDescription) {
    return Swal.fire("Error", "Email and problem description are required.", "error");
  }

  try {
    const res = await fetch(`${apiBase}/lost-access-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIdentifier, alternateEmail, alternatePhone, problemDescription })
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Request Submitted!',
        html: `
          Your request has been submitted successfully.<br>
          Please keep in touch with your email.<br>
          Any updates made by the admin regarding your account will be sent to your email.
        `,
        confirmButtonText: 'OK',
        timer: 15000,
        timerProgressBar: true
      }).then(() => document.getElementById('lostAccessForm').reset());
    } else {
      Swal.fire("Error", data.message || "Failed to submit your request.", "error");
    }

  } catch(err) {
    console.error(err);
    Swal.fire("Error", "Something went wrong. Please try again.", "error");
  }
});
