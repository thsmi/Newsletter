<?php

require_once("php/newsletter/settings/settings.php");
require_once("php/newsletter/security/principal.php");

?>

  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <title>Newsletter</title>
    <link href="./js/bootstrap/bootstrap.css" rel="stylesheet">
    <script src="./js/jquery/jquery.js"></script>
    <script src="./js/bootstrap/bootstrap.js"></script>

    <link href="./js/summernote/summernote.css" rel="stylesheet">
    <script src="./js/summernote/summernote.js"></script>

    <link href="./js/newsletter/newsletter.css" rel="stylesheet">

    <script src="./js/newsletter/attachments.js"></script>
    
    <script src="./js/newsletter/messages.js"></script>
    <script src="./js/newsletter/drafts.js"></script>
    <script src="./js/newsletter/archive.js"></script>

    <?php if (Principal::canEdit("addressbook")) { ?>
    <script src="./js/newsletter/addressbook.js"></script>    
    <?php } ?>

    <?php if (Principal::canEdit("settings")) { ?>
    <script src="./js/newsletter/settings.js"></script>
    <?php } ?>
  </head>

  <body style="background-color: #fafafa;">

    <div id="template" style="display:none">


      <?php require("php/newsletter/attachments/attachments.tpl"); ?>
          <?php require("php/newsletter/messages/messages.tpl") ?>
            <?php require("php/newsletter/addressbook/addressbook.tpl") ?>
    </div>

    <div id="divAttachments"></div>
    <div id="divSettings"></div>

    <div class="container">
      <div>
        <h1>Newsletter</h1>
        <ul class="nav nav-tabs">
          <li class="active"><a data-toggle="tab" href="#drafts">Drafts</a></li>
          <li><a data-toggle="tab" href="#archive">Archive</a></li>
          <?php if (Principal::canEdit("addressbook") ) { ?>
            <li><a data-toggle="tab" href="#addresses">Address Books</a></li>
            <?php } ?>
              <?php if (Principal::canEdit("settings") ) { ?>
                <li><a data-toggle="tab" href="#settings">Settings</a></li>
                <?php } ?>
                  <li><a data-toggle="tab" href="#about">About</a></li>
        </ul>
      </div>

      <div style="border: 1px solid #ddd; border-top: 0px; padding:20px; background-color:white;">

        <div id="tabs" class="tab-content">

          <div id="drafts" class="tab-pane fade in active">

            <div style="padding-bottom:20px; text-align: right">
              <button id="btnNewDraft" type="button" class="btn btn-success">Create New Newsletter</button>
            </div>

            <div id="divDrafts"></div>
          </div>


          <div id="archive" class="tab-pane fade">
            <h3>Archive</h3>
            <div id="divArchives">
            </div>
          </div>

          <?php if (Principal::canEdit("addressbook") ) { ?>
            <div id="addresses" class="tab-pane fade">

              <div style="padding-bottom:20px; text-align: right">
                <button id="btnNewAddresses" type="button" class="btn btn-success">Create New Address Book</button>
              </div>
              <div id="divAddresses"></div>
            </div>
            <?php } ?>

              <?php if (Principal::canEdit("settings") ) { ?>
                <div id="settings" class="tab-pane fade">
                  <?php require("php/newsletter/settings/settings.tpl"); ?>
                    <div id="divSettings">
                    </div>
                </div>
                <?php } ?>

                  <div id="about" class="tab-pane fade">
                    <a href="https://github.com/thsmi/Newsletter">https://github.com/thsmi/Newsletter</a>
                  </div>

        </div>
      </div>


      <script>
        (function(exports) {

          function newDraft() {
            (new Drafts("#divDrafts")).addNew();
          }

          function enumerateDrafts() {
            (new Drafts("#divDrafts")).enumerate();
          }


          function enumerateArchives() {
            (new Archive("#divArchives")).enumerate();
          }


          function newAddresses() {
            (new AddressBook("#divAddresses")).addNew();
          }

          function enumerateAddresses() {
            (new AddressBook("#divAddresses")).enumerate();
          }

          function onRefresh() {
            enumerateArchives();
            enumerateDrafts();
            enumerateAddresses();
          }



          $(document).ready(function() {
            onRefresh();

            $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
              onRefresh();
            })

            $("#btnNewDraft").click(newDraft);
            $('#btnNewAddresses').click(newAddresses);

          });
        })(window);
      </script>


    </div>
  </body>

  </html>