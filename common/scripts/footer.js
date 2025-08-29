  
  function initFooter(){
  const form = document.getElementById('newsletterForm');

  form.addEventListener('submit', function(e) {
    e.preventDefault();  

    const emailInput = form.querySelector('input').value;

    if(!emailInput || !/\S+@\S+\.\S+/.test(emailInput)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a valid email!'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Subscribed!',
      text: 'You have successfully subscribed to our newsletter.',
      timer: 2000,
      showConfirmButton: false
    });

    form.querySelector('input').value = '';
  })};

