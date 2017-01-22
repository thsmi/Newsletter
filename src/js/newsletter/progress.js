(function (exports) {

  "use strict";

  /* global $ */

  function ProgressDialog(id) {
    this.id = id;
    this.template = "tplProgress";
  }

  ProgressDialog.prototype.getElement = function () {
    return $("#progress-" + this.id);
  };

  ProgressDialog.prototype.update = function (progress, total) {

    if ((progress === null) || typeof (progress) === "undefined") {
      this.getElement()
        .find(".progress-bar")
        .css('width', "0%")
        .text("");

      return this;
    }

    var value = Math.floor(((100 / total) * progress));
    this.getElement()
      .find(".progress-bar")
      .css('width', "" + value + "%")
      .text("" + progress + " / " + total);

    return this;
  };

  ProgressDialog.prototype.hide = function () {
    this.getElement().modal('hide');
    return this;
  };

  ProgressDialog.prototype.show = function () {
    var that = this;

    var elm = $("#" + this.template).children().first().clone();
    elm.attr("id", "progress-" + this.id);

    elm.on('hidden.bs.modal', function () { that.getElement().remove(); });
    elm.modal({
      backdrop: 'static',
      keyboard: false
    });

    return this;
  };



  exports.ProgressDialog = ProgressDialog;

})(window);   