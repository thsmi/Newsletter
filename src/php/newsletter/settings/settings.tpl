<?php
 if (Principal::canEdit("settings")) {
?>

<div class="form-horizontal">
  <h3>Directories</h3>

  <div class="form-group">
    <label class="control-label col-sm-2">Drafts</label>
    <div class="col-sm-10">
      <p class="form-control-static" id="newsletter-settings-drafts"></p>
      <p class="form-control-static" id="newsletter-settings-drafts-real"></p>
    </div>
  </div>

  <div class="form-group">
    <label class="control-label col-sm-2">Archive</label>
    <div class="col-sm-10">
      <p class="form-control-static" id="newsletter-settings-archive"></p>
      <p class="form-control-static" id="newsletter-settings-archive-real"></p>
    </div>
  </div>


  <div class="form-group">
    <label class="control-label col-sm-2">Address&nbsp;Book</label>
    <div class="col-sm-10">
      <p class="form-control-static" id="newsletter-settings-addressbook"></p>
      <p class="form-control-static" id="newsletter-settings-addressbook-real"></p>
    </div>
  </div>

  <div class="form-group">
    <label class="control-label col-sm-2">Templates</label>
    <div class="col-sm-10">
      <p class="form-control-static" id="newsletter-settings-templates"></p>
      <p class="form-control-static" id="newsletter-settings-templates-real"></p>
    </div>
  </div>

  <hr/>

  <h3>Mail</h3>
  <div class="form-group">
    <label for="newsletter-settings-template" class="control-label col-sm-2">Template</label>
    <div class="col-sm-9">
      <input class="form-control" type="text" id="newsletter-settings-template">
    </div>
  </div>
  <div class="form-group">
    <label for="newsletter-settings-prefix" class="control-label col-sm-2">Prefix</label>
    <div class="col-sm-9">
      <input class="form-control" type="text" id="newsletter-settings-prefix">
    </div>
  </div>

  <div class="form-group">
    <label for="newsletter-settings-sender" class="control-label col-sm-2">Sender</label>
    <div class="col-sm-9">
      <input class="form-control" type="text" id="newsletter-settings-sender">
    </div>
  </div>
  
  <div class="form-group">
    <label for="example-email-input" class="control-label col-sm-2">From</label>
    <div class="col-sm-9">
      <input class="form-control" type="email" id="newsletter-settings-from">
    </div>
  </div>
  <div class="form-group">
    <label for="example-email-input" class="control-label col-sm-2">Reply To</label>
    <div class="col-sm-9">
      <input class="form-control" type="email" id="newsletter-settings-replyto">
    </div>
  </div>
  <div style="padding-bottom:20px; text-align: right;">
<button id="newsletter-settings-mail-reset" type="button" class="btn btn-default">Reset</button>
<button id="newsletter-settings-mail-save" type="button" class="btn btn-primary">Save</button>
</div>

<hr/>

<h3>Server</h3>
<p>
Configure how to send mails. You can either use sendmail or SMTP.</p>
<p>
SMTP means more overhead but is typically faster than sendmail. SMTP is asynchonous but sendmail is synchnous by definition. 
  </p>

  

  <div class="form-group">
    <label for="example-text-input" class="control-label col-sm-2">Type</label>
    <div class="col-sm-10">
      <!-- Single button -->
<div class="btn-group">
  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    <span id="newsletter-settings-server-type">SMTP</span>
      <span class="caret"></span>
  </button>
  <ul class="dropdown-menu">
    <li><a id="newsletter-settings-server-type-sendmail">Sendmail</a></li>
    <li><a id="newsletter-settings-server-type-smtp">SMTP</a></li>
  </ul>
</div>      
    </div>
  </div>

<!--    <div class="form-group">
    <label for="example-text-input" class="control-label col-sm-2">Timeout</label>
    <div class="col-sm-2">
      <input class="form-control" maxlength="5" type="text" value="" id="example-text-input"> sec
    </div>
  </div>  -->
   
   <div id="newsletter-settings-server-smtp">
  <div class="form-group">
    <label for="newsletter-settings-server-smtp-host" class="control-label col-sm-2">Server Name</label>
    <div class="col-sm-9">
      <input class="form-control" type="text" id="newsletter-settings-server-smtp-host">
    </div>
  </div>

  <div class="form-group">
    <label for="newsletter-settings-server-smtp-port" class="control-label col-sm-2">Port</label>
    <div class="col-sm-2">
      <input class="form-control" maxlength="5" type="text" id="newsletter-settings-server-smtp-port">
    </div>
  </div>    

  <div class="form-group">
    <label for="example-text-input" class="control-label col-sm-2">Security</label>
    <div class="col-sm-9">

<div class="btn-group">
  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    <span id="newsletter-settings-server-smtp-security-type"></span>
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu">
    <li><a id="newsletter-settings-server-smtp-security-type-none">&nbsp;</a></li>
    <li><a id="newsletter-settings-server-smtp-security-type-tls">tls</a></li>
    <li><a id="newsletter-settings-server-smtp-security-type-ssl">ssl</a></li>
  </ul>
</div> 
      
    </div>
  </div>  

  <div class="form-group">
    <label for="example-text-input" class="control-label col-sm-2">Secure Auth</label>
    <div class="col-sm-9">
      <div class="btn-group">

  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    <span id="newsletter-settings-server-smtp-authentication-type"></span>
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu">
    <li><a id="newsletter-settings-server-smtp-authentication-type-true">true</a></li>
    <li><a id="newsletter-settings-server-smtp-authentication-type-false">false</a></li>
  </ul>
</div> 
    </div>
  </div>      

  <div class="form-group">
    <label for="newsletter-settings-server-smtp-username" class="control-label col-sm-2">User name</label>
    <div class="col-sm-9">
      <input class="form-control" type="text" id="newsletter-settings-server-smtp-username">
    </div>
  </div>
    <div class="form-group">
    <label for="newsletter-settings-server-smtp-password" class="control-label col-sm-2">Password</label>
    <div class="col-sm-9">
      <input class="form-control" type="text" id="newsletter-settings-server-smtp-password">
    </div>
  </div>  

    </div>

  <div style="padding-bottom:20px; text-align: right;">
<button id="newsletter-settings-server-reset" type="button" class="btn btn-default">Reset</button>
<button id="newsletter-settings-server-save" type="button" class="btn btn-primary">Save</button>
</div>  

  
<hr/>

<h3>Roles</h3>
<p>
  A comma separated list with the webserver's pricipals. 
  All principals listed below will be elevated to administrators.
  </p>

<p>
  User which can view and edit the settings.
  </p>
  <div class="form-group">
    <label for="newsletter-settings-roles-settings" class="control-label col-sm-2">Settings</label>
    <div class="col-sm-10">
      <input class="form-control" type="text" id="newsletter-settings-roles-settings">
    </div>
  </div>

<p>
  User which can edit the address book.
  </p>
  <div class="form-group">
    <label for="newsletter-settings-roles-addressbook" class="control-label col-sm-2">Address&nbsp;book</label>
    <div class="col-sm-10">
      <input class="form-control" type="text" id="newsletter-settings-roles-addressbook">
    </div>
  </div>

  <div style="padding-bottom:20px; text-align: right;">
<button id="newsletter-settings-roles-reset" type="button" class="btn btn-default">Reset</button>
<button id="newsletter-settings-roles-save" type="button" class="btn btn-primary">Save</button>
</div>  



</div>

<?php
 }
?>