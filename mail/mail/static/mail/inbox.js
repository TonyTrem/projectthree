document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // add event listener to button to send email
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  //clear the emails-view
  document.querySelector('#emails-view').innerHTML = '';

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';


  fetch('/emails/' + mailbox)

  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // create a list of emails in the mailbox
    emails.forEach(email => {
      
      //change background color of email if it has been read
      let background;
      if (email.read == true) {
        background = 'lightgrey';
      } else {
        background = 'white';
      }

      //create a div element for each email
      const element = document.createElement('div');
      element.innerHTML = `
      <div class="card" style="background-color: ${background}">
        <div class="card-body">
          <h5 class="card-title">${email.subject}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${email.recipients}</h6>
          <p class="card-text">${email.timestamp}</p>
        </div>
      </div>`;

      //add event listener to each email to view it
      element.addEventListener('click', () => view_email(email.id));

      document.querySelector('#emails-view').append(element);
    });
  });
}

function send_email(event) {

  // Prevent default action of form
  event.preventDefault();
  
  // POST to API route 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => load_mailbox('sent'))
}

function view_email(email_id) {
  //clear the emails-view
  document.querySelector('#emails-view').innerHTML = '';

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // GET email from API route 
  fetch('/emails/' + email_id)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    //create a div element for each email
    const element = document.createElement('div');
    element.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${email.subject}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${email.recipients}</h6>
        <p class="card-text">${email.timestamp}</p>
        <p class="card-text">${email.body}</p>
        <p class="card-text">${email.sender}</p>
        <p class="card-text">${email.read}</p>
        <button type="button" class="btn btn-primary" id="reply">Reply</button>
        <button type="button" class="btn btn-primary" id="archive">Archive</button>
        <button type="button" class="btn btn-primary" id="read">Mark as </button>
      </div>
    </div>`;

    // add event listener for button that replies to email
    element.querySelector('#reply').addEventListener('click', () => reply_email(email.id));

    // add event listener for button that archives email
    element.querySelector('#archive').addEventListener('click', () => archive_email(email.id));

    // add event listener for read button
    element.querySelector('#read').addEventListener('click', () => toggle_read(email.id));

    document.querySelector('#emails-view').append(element);
  });
}

function archive_email(email_id) {
  // PUT to API route 
  fetch('/emails/' + email_id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
}

function unarchive_email(email_id) {
  // PUT to API route 
  fetch('/emails/' + email_id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
}

function reply_email(email_id) {
  // GET email from API route 
  fetch('/emails/' + email_id)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = email.subject;
    document.querySelector('#compose-body').value = email.body;
  });
}

function toggle_read(email_id) {
  if (email.read == true) {
    email.read = false;
  } else {
    email.read = true;
  }

  // PUT to API route
  fetch('/emails/' + email_id, {
    method: 'PUT',
    body: JSON.stringify({
        read: email.read
    })
  })

  // reload 
}