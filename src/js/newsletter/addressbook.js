(function (exports) {

  "use strict";

  var actionURL = "mailer.php";

  /* global $ */
  /* global AbstractListItem */

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
      .fail(function (jqxhr/*, textStatus, error*/) {
        alert(jqxhr.responseText);
      });

  };

  AddressBook.prototype.onEnumerate = function (data) {

    var that = this;

    data.sort(function (a, b) { return a.name > b.name; });

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
      .fail(function (jqxhr/*, textStatus, error*/) {
        alert(jqxhr.responseText);
      });
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

  AddressListItem.prototype.onAddressBookDeleted = function (/*data*/) {
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

  exports.AddressBook = AddressBook;

})(window); 