<?php if (Principal::canEdit("addressbook")) { ?>

<div id="tplAddressItem">
  <div class="panel panel-default">
    <div class="panel-heading msg-list-header">
      <span style="font-weight: bold;" class="msg-list-subject"></span>
    </div>
    <div class="panel-body msg-list">
      <p class="msg-list-teaser list-group-item-text"></p>
    </div>
  </div>
</div>


<div id="tplAddressItemEditor">
  <div class="panel-body msg-editor">
    <input class="msg-editor-id" type="hidden" />
    <p>Enter the email addresses separated by linebreaks, commas or semicoli.</p>
    <div class="input-group" style="padding-bottom:10px">
      <span class="input-group-addon" id="basic-addon1">Name</span>
      <input type="text" class="form-control msg-editor-name">
    </div>
    <div>
      <textarea class="form-control msg-editor-textarea" rows=10></textarea>
    </div>
    <div style="text-align: right">
      <button type="button" class="btn msg-editor-delete">Delete</button>
      <button type="button" class="btn msg-editor-save btn-success">Save</button>
    </div>
  </div>
</div>

<?php } ?>