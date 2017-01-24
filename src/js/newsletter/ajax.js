(function (exports) {

  "use strict";

  function JsonDeferred(xhr) {
    this.xhr = xhr;
    this.offset = 0;

    this.callbacks = {};
  }

  // returns whether the HTTP request was successful
  JsonDeferred.prototype.isRequestSuccessful = function (httpRequest) {
    // IE: sometimes 1223 instead of 204
    return (httpRequest.status === 0 ||
      (httpRequest.status >= 200 && httpRequest.status < 300) ||
      httpRequest.status === 304 || httpRequest.status === 1223);
  };


  JsonDeferred.prototype.done = function (callback) {
    this.callbacks.onDone = callback;
    return this;
  };

  JsonDeferred.prototype.progress = function (callback) {
    this.callbacks.onProgress = callback;
    return this;
  };

  JsonDeferred.prototype.fail = function (callback) {
    this.callbacks.onFail = callback;
    return this;
  };

  JsonDeferred.prototype.isLoading = function () {
    var response = this.xhr.responseText;

    if (response.length - this.offset <= 12)
      return false;

    return (response.substr(this.offset, 1) === "3");
  };

  JsonDeferred.prototype.isDone = function () {
    var response = this.xhr.responseText;

    if (response.length - this.offset <= 12)
      return false;

    return (response.substr(this.offset, 1) === "4");
  };

  JsonDeferred.prototype.hasNextResponse = function () {
    if (this.xhr.responseText.length > this.offset)
      return true;

    return false;
  };

  JsonDeferred.prototype.getNextResponse = function () {

    if (!this.isRequestSuccessful(this.xhr))
      throw new Error("Request returned an error: " + this.xhr.responseText);

    var response = this.xhr.responseText;

    if (response.length - this.offset <= 12)
      throw new Error("Invalid Request, request too short");

    if (response[this.offset + 12] !== ":")
      throw new Error("Invalid Request, no length separator");

    var length = response.substr(this.offset + 2, 10);

    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(length) === false)
      throw new Error("Invalid Request, length is not a number");

    length = parseInt(length, 10);

    if (Number.isNaN(length))
      throw new Error("Invalid length, is not a number");

    var data = response.substr(this.offset + 13, length);
    this.offset += 13 + length;

    if (data === "")
      return [];

    return JSON.parse(data);
  };


  JsonDeferred.prototype.onLoading = function (data) {

    if (this.callbacks.onProgress === null || typeof (this.callbacks.onProgress) === "undefined")
      return;

    this.callbacks.onProgress(data);
    return;
  };


  JsonDeferred.prototype.onDone = function (data) {
    if (this.callbacks.onDone === null || typeof (this.callbacks.onDone) === "undefined")
      return;

    this.callbacks.onDone(data);
  };

  JsonDeferred.prototype.onRequest = function (xhr) {
    try {

      // first parse all progress message then expect one done.
      while (this.hasNextResponse()) {

        if (this.isLoading()) {
          this.onLoading(this.getNextResponse());
          continue;
        }

        if (this.isDone()) {
          this.onDone(this.getNextResponse());
          return;
        }

        // no handler so skip
        throw new Error("Invalid Response");
      }

    } catch (ex) {

      if (this.callbacks.onFail === null || typeof (this.callbacks.onFail) === "undefined")
        return;

      this.offset = xhr.responseText.length;
      this.callbacks.onFail(xhr.responseText);
      return;
    }

    return;
  };

  JsonDeferred.prototype.onReadyStateChange = function () {

    // 4 = The operation is complete
    if (this.xhr.readyState !== 4 && this.xhr.readyState !== 3)
      return;

    this.onRequest(this.xhr);
    return;

    /*
    0	UNSENT	Client has been created. open() not called yet.
1	OPENED	open() has been called.
2	HEADERS_RECEIVED	send() has been called, and headers and status are available.
*/
  };



  function AjaxPost() {
  }

  AjaxPost.prototype.sendForm = function (data) {
    return this.send(data);
  };

  AjaxPost.prototype.sendJson = function (data) {
    return this.send(JSON.stringify(data), "application/json");
  };

  AjaxPost.prototype.send = function (data, type) {
    var xhr = new XMLHttpRequest();
    var request = new JsonDeferred(xhr);

    xhr.onreadystatechange = function () { request.onReadyStateChange(); };

    xhr.open("POST", "mailer.php", true);

    if (type !== null && typeof (type) !== "undefined")
      xhr.setRequestHeader("Content-Type", type);

    xhr.send(data);

    return request;
  };

  exports.AjaxPost = AjaxPost;

})(window);
