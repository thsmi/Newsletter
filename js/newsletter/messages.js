(function (exports) {

  "use strict";

  var actionURL = "mailer.php";

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
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
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
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  };


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
        alert(textStatus);
      });
  };

  function AddressBook(id) {
    this.id = id;
  }

  AddressBook.prototype.onNew = function (data) {

    (new AddressListItem(data.id))
      .init(this.id)
      .setSubject(data.name)
      .setTeaser(data.teaser)
      .showEditor();

    this.enumerate();
  };

  AddressBook.prototype.addNew = function () {

    var that = this;

    $.post(actionURL, { action: "addresses.new", name: "Unnamed" }, null, "json")
      .done(function (data) { that.onNew(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });

  };

  AddressBook.prototype.onEnumerate = function (data) {

    var that = this;

    data.forEach(function (item) {

      (new AddressListItem(item.id))
        .init(that.id)
        .setSubject(item.name)
        .setTeaser(item.teaser);
    });
  };

  AddressBook.prototype.enumerate = function () {
    var that = this;

    $.post(actionURL, { action: "addresses.enumerate" }, null, "json")
      .done(function (data) { that.onEnumerate(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  };



  function AbstractListItem(id, template) {
    this.id = id;
    this.template = template;
  }

  AbstractListItem.prototype.init = function (parent) {

    // The element exists we can skip init right here...
    if ($("#" + this.id).length)
      return this;

    var elm = $(this.template).children().first().clone();
    elm.attr("id", this.id);

    this.onInit(elm);

    $(parent).prepend(elm);

    return this;
  };

  AbstractListItem.prototype.setSubject = function (value) {

    $("#" + this.id)
      .find(".msg-list-subject")
      .text(value);

    return this;
  };

  AbstractListItem.prototype.setTeaser = function (value) {

    $("#" + this.id)
      .find(".msg-list-teaser")
      .html(value + "...");

    return this;
  };

  AbstractListItem.prototype.onError = function (msg) {
    alert("Error" + msg);
  };

  // populate the send button..
  AbstractListItem.prototype.sendRequest = function (msg, callback) {
    var that = this;
    $.post(actionURL, msg, null, "json")
      .done(callback)
      .fail(function (jqXHR, textStatus, error) { that.onError(jqXHR.responseText); });

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

    elm.find(".msg-archive-attachments").click( function() { (new AttachmentViewer(that.id)).show(); });          

    $("#" + this.id).append(elm);
    

    elm.find(".dropdown").on('show.bs.dropdown', function () { that.populateSend(); });

    //msg-list-details
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


  function AddressListItem(id) {
    AbstractListItem.call(this, id, "#tplAddressItem");
  }

  AddressListItem.prototype = Object.create(AbstractListItem.prototype);
  AddressListItem.prototype.constructor = AddressListItem;

  AddressListItem.prototype.onInit = function (element) {
    var that = this;

    element.find(".msg-list-header").click(function () { that.toggle(); });
    element.find(".msg-list").click(function () { that.showEditor(); });
  };

  AddressListItem.prototype.toggle = function () {

    if ($("#" + this.id + "-editor").length) {
      this.showTeaser();
      return;
    }

    this.showEditor();
    return;
  };

  AddressListItem.prototype.onAddressBookLoaded = function (data) {

    var that = this;

    $("#" + this.id)
      .children(".msg-list")
      .hide();

    var editor = $("#tplAddressItemEditor").children().first().clone();
    editor
      .attr("id", "" + this.id + "-editor");

    editor
      .find(".msg-editor-id")
      .val(data.id);

    editor
      .find(".msg-editor-name")
      .val(data.name);

    editor
      .find(".msg-editor-textarea")
      .val(data.addresses);

    $("#" + this.id).append(editor);

    editor.find(".msg-editor-delete").click(function () { that.delete(); });
    editor.find(".msg-editor-save").click(function () { that.save(); });
  };

  AddressListItem.prototype.onAddressBookSaved = function (data) {
    this.setTeaser(data.teaser);
    this.setSubject(data.name);

    this.showTeaser();
  };

  AddressListItem.prototype.onAddressBookDeleted = function (data) {
    $("#" + this.id).remove();
  };

  AddressListItem.prototype.showTeaser = function () {
    $("#" + this.id + "-editor")
      .remove();

    $("#" + this.id)
      .children(".msg-list")
      .show();
  };

  AddressListItem.prototype.showEditor = function () {

    var that = this;

    this.sendRequest(
      { action: "addresses.load", id: this.id },
      function (data) { that.onAddressBookLoaded(data); });
  };

  AddressListItem.prototype.save = function () {

    var addresses = $("#" + this.id)
      .find(".msg-editor-textarea")
      .val();

    var name = $("#" + this.id)
      .find(".msg-editor-name")
      .val();

    var data = {
      action: "addresses.save",

      id: this.id,
      addresses: addresses,
      name: name
    };

    var that = this;

    this.sendRequest(
      data,
      function (data) { that.onAddressBookSaved(data); });
  };

  AddressListItem.prototype.delete = function () {
    var that = this;

    this.sendRequest(
      { action: "addresses.delete", id: this.id },
      function (data) { that.onAddressBookDeleted(data); });
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

  DraftItem.prototype.delete = function (data) {

    var that = this;

    this.sendRequest(
      { action: "drafts.delete", id: this.id },
      function (data) { that.remove(); });
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

  DraftItem.prototype.onSend = function (data) {
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

    editor.find(".msg-editor-delete").click(function () { that.delete(); });
    editor.find(".msg-editor-save").click(function () { that.save(); });
    editor.find(".msg-editor-attachments").click( function() { (new AttachmentEditor(that.id)).show(); });

    editor.find(".dropdown").on('show.bs.dropdown', function () { that.populateSend(); });

    editor.appendTo("#" + this.id);
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
      .fail(function (jqxhr, textStatus, error) {
        alert(jqxhr.responseText);
      });
  };

  exports.Drafts = Drafts;
  exports.Archive = Archive;
  exports.AddressBook = AddressBook;

})(window);        