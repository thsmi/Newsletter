(function (exports) {

  "use strict";

  var actionURL = "mailer.php";


  function Archive(id) {
    this.id = id;
  }

  Archive.prototype.onEnumerate = function (data) {

    var that = this;

    data.sort(function (a, b) { return a.modified > b.modified; });

    data.forEach(function (item) {

      (new ArchiveItem(item.id))
        .init(that.id)
        .setSubject(item.subject)
        .setTeaser(item.teaser)
        .setModified(item.modified);
    });
  };

  Archive.prototype.enumerate = function () {
    var that = this;
    $.post(actionURL, { action: "archive.enumerate" }, null, "json")
      .done(function (data) { that.onEnumerate(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(jqxhr.responseText);
      });
  };


  function ArchiveItem(id) {
    AbstractListItem.call(this, id, "#tplArchiveItem");
  }

  ArchiveItem.prototype = Object.create(AbstractListItem.prototype);
  ArchiveItem.prototype.constructor = ArchiveItem;

  ArchiveItem.prototype.onInit = function (element) {

    var that = this;

    element.find(".msg-list-header").click(function () { that.toggle(); });
    element.find(".msg-list").click(function () { that.showDetails(); });
  };

  ArchiveItem.prototype.toggle = function () {

    if ($("#" + this.id + "-editor").length) {
      this.showTeaser();
      return;
    }

    this.showDetails();
    return;
  };

  ArchiveItem.prototype.setModified = function (timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(0 + timestamp * 1000);

    var hours = ("0" + date.getHours()).substr(-2);
    var minutes = ("0" + date.getMinutes()).substr(-2);
    var year = ("000" + date.getFullYear()).substr(-4);
    var month = ("0" + (date.getMonth() + 1)).substr(-2);
    var day = ("0" + date.getDate()).substr(-2);

    var formattedTime = "" + year + "-" + month + "-" + day + " " + hours + ':' + minutes;

    $("#" + this.id)
      .find(".msg-list-modified")
      .text(formattedTime);

    return this;
  };

  ArchiveItem.prototype.onSendPopulated = function (data) {
    var that = this;

    data.sort(function (a, b) { return a.name > b.name; });

    data.forEach(function (item) {

      var elm = $("<a/>")
        .text(item.name)
        .click(function () { that.send(item.id); });

      elm = $("<li/>").append(elm);

      $("#" + that.id).find(".msg-archive-send .dropdown-menu").append(elm);
    });
  };

  ArchiveItem.prototype.populateSend = function () {

    var that = this;
    $("#" + this.id).find(".msg-archive-send .dropdown-menu").empty();
    // show create a wait icon.

    this.sendRequest(
      { action: "addresses.enumerate" },
      function (data) { that.onSendPopulated(data); }
    );

  };

  ArchiveItem.prototype.onSend = function (data) {
  };

  ArchiveItem.prototype.send = function (addresses) {
    var that = this;

    this.sendRequest(
      { action: "archive.send", id: that.id, addresses: addresses },
      function (data) { that.onSend(data); });
  };

  ArchiveItem.prototype.onMessageLoaded = function (data) {

    var that = this;

    $("#" + this.id)
      .children(".msg-list")
      .hide();

    var elm = $("#tplArchiveItemDetail").children().first().clone();
    elm
      .attr("id", "" + this.id + "-editor");

    elm.find(".msg-list-details-msg")
      .html(data.message)
      .click(function () { that.showTeaser(); });

    elm.find(".msg-archive-attachments").click(function () { that.showAttachments(); });

    elm.find(".msg-archive-preview").click(function () { that.preview(); });

    $("#" + this.id).append(elm);


    elm.find(".dropdown").on('show.bs.dropdown', function () { that.populateSend(); });

    //msg-list-details
  };

  ArchiveItem.prototype.showAttachments = function () {
    (new AttachmentViewer(this.id)).show();
  };

  ArchiveItem.prototype.preview = function () {
    (new MessagePreviewer(this.id, "archive")).show();
  };

  ArchiveItem.prototype.showTeaser = function () {

    $("#" + this.id + "-editor")
      .remove();

    $("#" + this.id)
      .children(".msg-list")
      .show();
  };

  ArchiveItem.prototype.showDetails = function () {

    var that = this;
    this.sendRequest({ action: "archive.load", id: this.id },
      function (data) { that.onMessageLoaded(data); });
  };

  exports.Archive = Archive;

})(window);
