(function (exports) {

  "use strict";

  /* global $ */
  /* global AjaxPost */

  function AttachmentViewer(id) {
    this.id = id;
    this.template = "tplAttachments";
    this.type = "archive";
  }

  AttachmentViewer.prototype.getElement = function () {
    return $("#attachments-" + this.id);
  };

  AttachmentViewer.prototype.onEnumerate = function (data) {

    var that = this;
    this.getElement().find(".attachments-list").hide();
    this.getElement().find(".attachments-list-item").empty();

    data.attachments.forEach(function (name) {
      var elm = $("#tplAttachmentItem").find("tr").clone();

      that.onInitItem(elm, name);

      elm.find(".att-item-name")
        .text(name)
        .attr("href", data.path + name)
        //.attr("download")
        .attr("target", "_blank");

      that.getElement().find(".attachments-list").show();
      that.getElement().find(".attachments-list-item").append(elm);
    });
  };

  AttachmentViewer.prototype.enumerate = function () {

    var that = this;

    var action = { action: "" + this.type + ".attachments.enumerate", id: this.id };

    (new AjaxPost())
      .sendJson(action)
      .done(function (data) { that.onEnumerate(data); })
      .fail(function (cause) { alert(cause); });

    return this;
  };

  AttachmentViewer.prototype.onInitItem = function (/*elm, name*/) {
  };

  AttachmentViewer.prototype.onInit = function (/*elm*/) {
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

    this.enumerate();
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

    var action = { action: "drafts.attachments.delete", id: this.id, attachment: name };

    (new AjaxPost())
      .sendJson(action)
      .done(function (data) { that.onEnumerate(data); })
      .fail(function (cause) { alert(cause); });
  };

  AttachmentEditor.prototype.onUploaded = function (data) {

    this.getElement().find(".attachments-upload-progress").hide();
    this.getElement().find(".attachments-upload-input").show();

    this.getElement().find(".attachments-image-input-form")[0].reset();
    this.onEnumerate(data);
  };


  AttachmentEditor.prototype.onUpload = function () {
    var that = this;
    var files = this.getElement().find(".attachments-image-input")[0].files;

    if (!files.length)
      return;

    this.getElement().find(".attachments-upload-progress").show();
    this.getElement().find(".attachments-upload-input").hide();

    var data = new FormData();
    data.append("file", files[0]);
    data.append("action", "drafts.attachments.upload");
    data.append("id", this.id);

    (new AjaxPost())
      .sendForm(data)
      .done(function (data) { that.onUploaded(data); })
      .fail(function (cause) {
        that.getElement().find(".attachments-upload-progress").hide();
        that.getElement().find(".attachments-upload-input").show();

        alert(cause);
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
