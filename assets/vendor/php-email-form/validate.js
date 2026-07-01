/**
* PHP Email Form Validation - v3.9
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    // If the action is a FormSubmit URL, ensure it uses the /ajax/ endpoint for AJAX response
    if (action.includes('formsubmit.co') && !action.includes('/ajax/')) {
      action = action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
    }

    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if( response.ok ) {
        return response.text();
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      
      // Try to parse the response as JSON to support AJAX form services like FormSubmit.co
      try {
        const json = JSON.parse(data);
        if (json.success === 'true' || json.success === true) {
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset(); 
        } else {
          throw new Error(json.message ? json.message : 'Form submission failed');
        }
      } catch (e) {
        // If not a JSON response, fall back to standard text response ('OK' check)
        if (e instanceof SyntaxError) {
          if (data.trim() == 'OK') {
            thisForm.querySelector('.sent-message').classList.add('d-block');
            thisForm.reset(); 
          } else {
            throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
          }
        } else {
          // If it was another error (e.g. from the throw above), propagate it
          throw e;
        }
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
