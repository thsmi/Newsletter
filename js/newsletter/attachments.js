(function (exports) {

  "use strict";

  var actionURL = "mailer.php";

  function AttachmentViewer(id) {
    this.id = id;
    this.template = "tplAttachments";
    this.type = "archive";
  }

  AttachmentViewer.prototype.getElement = function () {
    return $("#attachments-" + this.id);
  };

  AttachmentViewer.prototype.onList = function (data) {

    var that = this;
    this.getElement().find(".attachments-list").hide();
    this.getElement().find(".attachments-list-item").empty();

    data.attachments.forEach(function (name) {
      var elm = $("#tplAttachmentItem").find("tr").clone();

      that.onInitItem(elm, name);

      elm.find(".att-item-name").text(name);

      that.getElement().find(".attachments-list").show();
      that.getElement().find(".attachments-list-item").append(elm);
    });
  };

  AttachmentViewer.prototype.list = function () {

    var that = this;

    $.post(actionURL, { action: "" + this.type + ".attachments.list", id: this.id }, null, "json")
      .done(function (data) { that.onList(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
    return this;
  };

  AttachmentViewer.prototype.onInitItem = function (elm, name) {
  };

  AttachmentViewer.prototype.onInit = function (elm) {
  };

  AttachmentViewer.prototype.show = function () {

    var that = this;

    var elm = $("#" + this.template).children().first().clone();
    elm.attr("id", "attachments-" + this.id);

    $("#divAttachments")
      .empty()
      .append(elm);

    elm.find(".attachments-list-item").empty();
    elm.find(".attachments-list").hide();
    this.onInit(elm);

    elm.on('hidden.bs.modal', function () { that.getElement().remove(); });
    elm.modal();

    this.list();
    return this;
  };


  function AttachmentEditor(id) {

    AttachmentViewer.call(this, id);
    this.template = "tplAttachments";
    this.type = "drafts";
  }

  AttachmentEditor.prototype = Object.create(AttachmentViewer.prototype);
  AttachmentEditor.prototype.constructor = AttachmentEditor;

  AttachmentEditor.prototype.onDelete = function (name) {

    var that = this;

    $.post(actionURL, { action: "drafts.attachments.delete", id: this.id, attachment: name }, null, "json")
      .done(function (data) { that.onList(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  };

  AttachmentEditor.prototype.onUploaded = function (data) {
    this.getElement().find(".attachments-image-input-form")[0].reset();
    this.onList(JSON.parse(data));
  };

  AttachmentEditor.prototype.onUpload = function () {
    var that = this;
    var files = this.getElement().find(".attachments-image-input")[0].files;

    if (!files.length)
      return;

    var data = new FormData();
    data.append("file", files[0]);
    data.append("action", "drafts.attachments.upload");
    data.append("id", this.id);

    $.ajax({
      data: data,
      type: "POST",
      url: actionURL,
      cache: false,
      contentType: false,
      processData: false
    })
      .done(function (data) { that.onUploaded(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(jqxhr.responseText);
      });
  };

  AttachmentEditor.prototype.onInitItem = function (parent, name) {
    var that = this;

    var elm = $("#tplAttachmentItemAction").children().first().clone();
    elm.click(function () { that.onDelete(name); });

    parent.find(".att-item-action").append(elm);
  };

  AttachmentEditor.prototype.onInit = function (parent) {

    var that = this;
    var elm = $("#tplAttachmentUpload").children().first().clone();
    elm.find(".attachments-upload").click(function () { that.onUpload(); });

    elm.insertBefore(parent.find(".attachments-list"));
  };

  exports.AttachmentViewer = AttachmentViewer;
  exports.AttachmentEditor = AttachmentEditor;

})(window);   