(function (/*exports*/) {

  "use strict";

  var actionURL = "mailer.php";

  /* global $ */  

  function AbstractSettings() {
  }

  AbstractSettings.prototype.getLoadAction = function () {
  };

  AbstractSettings.prototype.getSaveAction = function () {
  };

  AbstractSettings.prototype.init = function () {
    this.load();
    return this;
  };

  AbstractSettings.prototype.load = function () {
    var that = this;
    this.send(this.onLoad(), function (data) { that.onLoaded(data); });

    return this;
  };

  AbstractSettings.prototype.onLoad = function () {
    return undefined;
  };

  AbstractSettings.prototype.onLoaded = function (/*data*/) {
  };

  AbstractSettings.prototype.save = function () {
    var that = this;
    this.send(this.onSave(), function (data) { that.onSaved(data); });

    return this;
  };

  AbstractSettings.prototype.send = function (request, callback) {

    if (request === null || typeof (request) === "undefined")
      return;

    if (!("action" in request))
      return;

    $.post(actionURL, request, null, "json")
      .done(callback)
      .fail(function (jqxhr/*, textStatus, error*/) {
        alert(jqxhr.responseText);
      });

    return this;
  };

  AbstractSettings.prototype.onSave = function () {
  };

  AbstractSettings.prototype.onSaved = function (/*data*/) {
  };

  function PathSettings() {
  }

  PathSettings.prototype = Object.create(AbstractSettings.prototype);
  PathSettings.prototype.constructor = PathSettings;

  PathSettings.prototype.onLoad = function () {
    return { action: "settings.paths.get" };
  };

  PathSettings.prototype.onLoaded = function (data) {
    $("#newsletter-settings-archive").text(data.archive);
    $("#newsletter-settings-drafts").text(data.drafts);
    $("#newsletter-settings-addressbook").text(data.addressbook);
    $("#newsletter-settings-templates").text(data.templates);

    $("#newsletter-settings-archive-real").text(data["archive.real"]);
    $("#newsletter-settings-drafts-real").text(data["drafts.real"]);
    $("#newsletter-settings-addressbook-real").text(data["addressbook.real"]);
    $("#newsletter-settings-templates-real").text(data["templates.real"]);
  };


  function MailSettings() {
  }

  MailSettings.prototype = Object.create(AbstractSettings.prototype);
  MailSettings.prototype.constructor = MailSettings;

  MailSettings.prototype.init = function () {
    var that = this;

    $("#newsletter-settings-mail-reset").click(function () {
      that.load();
    });

    $("#newsletter-settings-mail-save").click(function () {
      that.save();
    });

    this.load();
    return this;
  };

  MailSettings.prototype.onLoad = function () {
    return { action: "settings.mail.get" };
  };

  MailSettings.prototype.onLoaded = function (data) {
    $("#newsletter-settings-template").val(data.template);
    $("#newsletter-settings-prefix").val(data.prefix);
    $("#newsletter-settings-from").val(data.from);
    $("#newsletter-settings-replyto").val(data.replyto);
    $("#newsletter-settings-sender").val(data.sender);
  };

  MailSettings.prototype.onSave = function () {
    return {
      action: "settings.mail.set",
      template: $("#newsletter-settings-template").val(),
      prefix: $("#newsletter-settings-prefix").val(),
      from: $("#newsletter-settings-from").val(),
      replyto: $("#newsletter-settings-replyto").val(),
      sender: $("#newsletter-settings-sender").val()
    };
  };



  function ServerSettings(/*id*/) {
  }

  ServerSettings.prototype = Object.create(AbstractSettings.prototype);
  ServerSettings.prototype.constructor = ServerSettings;

  ServerSettings.prototype.init = function () {
    var that = this;

    (new SmtpSettings(/*this.id+"-smtp"*/)).init();

    $("#newsletter-settings-server-type-sendmail").click(function () {
      $("#newsletter-settings-server-type").text("Sendmail");
      that.onServerTypeChange();
    });

    $("#newsletter-settings-server-type-smtp").click(function () {
      $("#newsletter-settings-server-type").text("SMTP");
      that.onServerTypeChange();
    });

    this.load();
    return this;
  };

  ServerSettings.prototype.onLoad = function () {
    return { action: "settings.server.get" };
  };

  ServerSettings.prototype.onLoaded = function (data) {
    //$("#newsletter-settings-server-timeout").val(data["server.type"]);
    $("#newsletter-settings-server-type").text(data["server.type"]);
    this.onServerTypeChange();
  };

  ServerSettings.prototype.onSave = function () {
    var value = $("#newsletter-settings-server-type").text().toLowerCase();

    return {
      "action": "settings.server.set",
      "type": value
    };
  };

  ServerSettings.prototype.onSaved = function (/*data*/) {
    var value = $("#newsletter-settings-server-type").text().toLowerCase();   
    if (value === "smtp")
      (new SmtpSettings()).save();
  };

  ServerSettings.prototype.onServerTypeChange = function () {
    var value = $("#newsletter-settings-server-type").text().toLowerCase();

    if (value === "sendmail") {
      $("#newsletter-settings-server-smtp").hide();
    }

    if (value === "smtp") {
      $("#newsletter-settings-server-smtp").show();
      (new SmtpSettings()).load();
    }
  };


  function SmtpSettings(/*id*/) {
  }

  SmtpSettings.prototype = Object.create(AbstractSettings.prototype);
  SmtpSettings.prototype.constructor = SmtpSettings;

  SmtpSettings.prototype.init = function () {
    var that = this;

    $("#newsletter-settings-server-smtp-security-type-none").click(function () {
      $("#newsletter-settings-server-smtp-security-type").text("");
    });

    $("#newsletter-settings-server-smtp-security-type-tls").click(function () {
      $("#newsletter-settings-server-smtp-security-type").text("tls");
    });

    $("#newsletter-settings-server-smtp-security-type-ssl").click(function () {
      $("#newsletter-settings-server-smtp-security-type").text("ssl");
    });


    $("#newsletter-settings-server-smtp-authentication-type-true").click(function () {
      $("#newsletter-settings-server-smtp-authentication-type").text("true");
    });

    $("#newsletter-settings-server-smtp-authentication-type-false").click(function () {
      $("#newsletter-settings-server-smtp-authentication-type").text("false");
    });


    $("#newsletter-settings-server-reset").click(function () {
      that.load();
    });

    $("#newsletter-settings-server-save").click(function () {
      that.save();
    });

    this.load();
    return this;
  };

  SmtpSettings.prototype.onSave = function () {
    return {
      "action": "settings.server.smtp.set",
      "host": $("#newsletter-settings-server-smtp-host").val(),
      "port": $("#newsletter-settings-server-smtp-port").val(),
      "security": $("#newsletter-settings-server-smtp-security-type").text(),
      "authentication": $("#newsletter-settings-server-smtp-authentication-type").text(),
      "username": $("#newsletter-settings-server-smtp-username").val(),
      "password": $("#newsletter-settings-server-smtp-password").val(),
    };
  };

  SmtpSettings.prototype.onLoad = function () {
    return { action: "settings.server.smtp.get" };
  };

  SmtpSettings.prototype.onLoaded = function (data) {
    $("#newsletter-settings-server-smtp-host").val(data.host);
    $("#newsletter-settings-server-smtp-port").val(data.port);
    $("#newsletter-settings-server-smtp-security-type").text(data.security);
    $("#newsletter-settings-server-smtp-authentication-type").text(data.authentication);
    $("#newsletter-settings-server-smtp-username").val(data.username);
    $("#newsletter-settings-server-smtp-password").val(data.password);
  };

  function RoleSettings(/*id*/) {
  }

  RoleSettings.prototype = Object.create(AbstractSettings.prototype);
  RoleSettings.prototype.constructor = RoleSettings;

  RoleSettings.prototype.init = function () {
    var that = this;

    $("#newsletter-settings-roles-reset").click(function () {
      that.load();
    });

    $("#newsletter-settings-roles-save").click(function () {
      that.save();
    });

    this.load();
    return this;
  };

  RoleSettings.prototype.onLoad = function() {
    return { action: "settings.roles.get" };
  };

  RoleSettings.prototype.onLoaded = function(data) {
    $("#newsletter-settings-roles-settings").val(data.settings);
    $("#newsletter-settings-roles-addressbook").val(data.addressbook);
  };

  RoleSettings.prototype.onSave = function() {
    return {
      "action": "settings.roles.set",
      "settings": $("#newsletter-settings-roles-settings").val(),
      "addressbook": $("#newsletter-settings-roles-addressbook").val()
    };
  };


  $(document).ready(function () {

    (new PathSettings("newsletter-paths"))
      .init();
    (new MailSettings("newsletter-mail"))
      .init();

    (new ServerSettings("newsletter-server"))
      .init();

    (new RoleSettings("newsletter-roles"))
      .init();

  });
})(window);