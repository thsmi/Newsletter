(function (exports) {

  "use strict";

  /* global $ */

  function MessagePreviewer(id, type) {
    this.id = id;
    this.type = type;
    this.template = "tplPreview";
  }

  MessagePreviewer.prototype.getElement = function () {
    return $("#preview-" + this.id);
  };

  MessagePreviewer.prototype.show = function () {

    var that = this;

    var elm = $("#" + this.template).children().first().clone();
    elm.attr("id", "preview-" + this.id);

    var url = "./preview.php?";
    url += "id="+this.id;
    url += "&type="+this.type;

    elm.find(".preview-item").attr("src", url);

    elm.on('hidden.bs.modal', function () { that.getElement().remove(); });
    elm.modal();

    return this;
  };

  exports.MessagePreviewer = MessagePreviewer;

})(window);
