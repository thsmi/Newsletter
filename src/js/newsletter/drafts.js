(function (exports) {

  "use strict";

  var actionURL = "mailer.php";

  /* global $ */
  /* global AbstractListItem */
  /* global MessagePreviewer */
  /* global AttachmentEditor */

  function Drafts(id) {
    this.id = id;
  }

  Drafts.prototype.onNew = function (data) {

    (new DraftItem(data.id))
      .init(this.id)
      .setSubject(data.subject)
      .setTeaser(data.teaser)
      .setModified(data.modified)
      .showEditor();

    this.enumerate();
  };

  Drafts.prototype.addNew = function () {
    var that = this;

    $.post(actionURL, { action: "drafts.new", subject: "Unnamed" }, null, "json")
      .done(function (data) { that.onNew(data); })
      .fail(function (jqxhr/*, textStatus, error*/) {
        alert(jqxhr.responseText);
      });
  };

  Drafts.prototype.onEnumerate = function (data) {

    var that = this;

    data.sort(function (a, b) { return a.modified > b.modified; });

    data.forEach(function (item) {

      (new DraftItem(item.id))
        .init(that.id)
        .setSubject(item.subject)
        .setTeaser(item.teaser)
        .setModified(item.modified);
    });
  };

  Drafts.prototype.enumerate = function () {
    var that = this;
    $.post(actionURL, { action: "drafts.enumerate" }, null, "json")
      .done(function (data) { that.onEnumerate(data); })
      .fail(function (jqxhr/*, textStatus, error*/) {
        alert(jqxhr.responseText);
      });
  };

  function DraftItem(id) {
    AbstractListItem.call(this, id, "#tplDraftItem");
  }

  DraftItem.prototype = Object.create(AbstractListItem.prototype);
  DraftItem.prototype.constructor = DraftItem;

  DraftItem.prototype.onInit = function (element) {

    var that = this;


    element.find(".msg-list-header").click(function () { that.toggle(); });
    element.find(".msg-list").click(function () { that.showEditor(); });

    return this;
  };

  DraftItem.prototype.toggle = function () {

    if ($("#" + this.id + "-editor").length) {
      this.showTeaser();
      return;
    }

    this.showEditor();
    return;
  };

  DraftItem.prototype.onError = function (message) {
    alert(message);
  };

  DraftItem.prototype.getSubject = function () {

    return $("#" + this.id)
      .find(".msg-editor-subject")
      .val();
  };


  DraftItem.prototype.getMessage = function () {

    return $("#" + this.id)
      .find(".msg-editor-summernote")
      .summernote('code');
  };

  DraftItem.prototype.setMessage = function (value) {

    $("#" + this.id)
      .find(".msg-editor-summernote")
      .summernote('code', value);

    return this;
  };

  DraftItem.prototype.setModified = function (timestamp) {

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

  DraftItem.prototype.remove = function () {
    $("#" + this.id + "-summernote").summernote('destroy');
    $("#" + this.id).remove();
  };

  DraftItem.prototype.delete = function (/*data*/) {

    var that = this;

    this.sendRequest(
      { action: "drafts.delete", id: this.id },
      function (/*data*/) { that.remove(); });
  };

  DraftItem.prototype.save = function (callback) {

    var data = {
      action: "drafts.save",

      id: this.id,
      message: this.getMessage(),
      subject: this.getSubject()
    };

    if (callback === null || typeof (callback) === "undefined") {
      callback = function (data) {
        that.setTeaser(data.teaser);
        that.setSubject(data.subject);
        that.setModified(data.modified);
      };
    }

    var that = this;

    this.sendRequest(data, callback);
  };

  DraftItem.prototype.onSend = function (/*data*/) {
    this.remove();
  };

  DraftItem.prototype.send = function (addresses) {
    var that = this;

    var callback = function () {
      // populate the Archive button..
      that.sendRequest(
        { action: "drafts.send", id: that.id, addresses: addresses },
        function (data) { that.onSend(data); });
    };

    this.save(callback);
  };

  DraftItem.prototype.onSendPopulated = function (data) {
    var that = this;

    data.sort(function (a, b) { return a.name > b.name; });

    data.forEach(function (item) {

      var elm = $("<a/>")
        .text(item.name)
        .click(function () { that.send(item.id); });

      elm = $("<li/>").append(elm);

      $("#" + that.id).find(".msg-editor-send .dropdown-menu").append(elm);
    });
  };

  DraftItem.prototype.populateSend = function () {

    var that = this;
    $("#" + this.id).find(".msg-editor-send .dropdown-menu").empty();
    // show create a wait icon.

    this.sendRequest(
      { action: "addresses.enumerate" },
      function (data) { that.onSendPopulated(data); });
  };

  DraftItem.prototype.onShowEditor = function (data) {

    var that = this;

    $("#" + this.id)
      .children(".msg-list")
      .hide();

    var editor = $("#tplEditor")
      .children().first().clone()
      .attr("id", "" + this.id + "-editor");

    editor
      .find(".msg-editor-id")
      .val(data.id);

    editor
      .find(".msg-editor-subject")
      .val(data.subject);

    editor
      .find(".msg-editor-summernote").summernote({
        /*height: 150,
        minHeight: 150,
        maxHeight: 150,*/
        styleWithSpan: false,
        focus: true,
        toolbar: [
          ['fontsize', ["style", 'fontname', 'fontsize']],
          ['style', ['bold', 'italic', 'underline', 'color', 'clear']],
          ['bla', ["undo", "redo"]],
          ['para', ["paragraph", 'ul', 'ol']],
          ["blubb", ["picture"]]
        ],
        dialogsFade: true,
        disableDragAndDrop: true,
        callbacks: {
          onImageUpload: function (files) { that.onImageUpload(files); }
        }
      });

    editor
      .find(".msg-editor-summernote")
      .summernote('code', data.message);

    editor.find(".msg-editor-preview").click(function () { that.preview(); });
    editor.find(".msg-editor-delete").click(function () { that.delete(); });
    editor.find(".msg-editor-save").click(function () { that.save(); });
    editor.find(".msg-editor-attachments").click(function () { that.showAttachments(); });

    editor.find(".dropdown").on('show.bs.dropdown', function () { that.populateSend(); });

    editor.appendTo("#" + this.id);
  };

  DraftItem.prototype.preview = function () {
    (new MessagePreviewer(this.id, "draft")).show();
  };

  DraftItem.prototype.showAttachments = function () {
    (new AttachmentEditor(this.id)).show();
  };

  DraftItem.prototype.showEditor = function () {

    var that = this;

    this.sendRequest(
      { action: "drafts.load", id: this.id },
      function (data) { that.onShowEditor(data); });
  };

  DraftItem.prototype.showTeaser = function () {
    $("#" + this.id)
      .find(".msg-list")
      .show();
    // Save message...
    // destroy summernote

    $("#" + this.id + "-summernote").summernote('destroy');
    $("#" + this.id + "-editor").remove();
  };

  DraftItem.prototype.onImageUpload = function (files) {

    var that = this;

    var data = new FormData();
    data.append("file", files[0]);
    data.append("action", "drafts.images.upload");
    data.append("id", this.id);

    $.ajax({
      data: data,
      type: "POST",
      url: actionURL,
      cache: false,
      contentType: false,
      processData: false
    })
      .done(function (data) {
        $("#" + that.id)
          .find(".msg-editor-summernote")
          .summernote('insertImage', JSON.parse(data).src);
      })
      .fail(function (jqxhr/*, textStatus, error*/) {
        alert(jqxhr.responseText);
      });
  };

  exports.Drafts = Drafts;

})(window); 