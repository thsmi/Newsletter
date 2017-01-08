(function (exports) {

  "use strict";

  var actionURL = "mailer.php";

  function onPathsSettingsLoaded(data) {
    $("#newsletter-settings-archive").text(data.archive);
    $("#newsletter-settings-drafts").text(data.drafts);
    $("#newsletter-settings-addressbook").text(data.addressbook);
  }

  function loadPathsSettings() {
    $.post(actionURL, { action: "settings.paths.get" }, null, "json")
      .done(function (data) { onPathsSettingsLoaded(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  }

  function onMailSettingsLoaded(data) {
    $("#newsletter-settings-template").val(data.template);
    $("#newsletter-settings-prefix").val(data.prefix);
    $("#newsletter-settings-from").val(data.from);
    $("#newsletter-settings-replyto").val(data.replyto);
    $("#newsletter-settings-sender").val(data.sender);
  }



  function loadMailSettings() {
    $.post(actionURL, { action: "settings.mail.get", subject: "Unnamed" }, null, "json")
      .done(function (data) { onMailSettingsLoaded(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  }

  function saveMailSettings() {

    var request = {
      action: "settings.mail.set",
      template: $("#newsletter-settings-template").val(),
      prefix: $("#newsletter-settings-prefix").val(),
      from: $("#newsletter-settings-from").val(),
      replyto: $("#newsletter-settings-replyto").val(),
      sender : $("#newsletter-settings-sender").val()
    };

    $.post(actionURL, request, null, "json")
      .done(function (data) { })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  }

  function onServerTypeChange() {
    var value = $("#newsletter-settings-server-type").text().toLowerCase();

    if (value === "sendmail") {
      $("#newsletter-settings-server-smtp").hide();
    }

    if (value === "smtp") {
      $("#newsletter-settings-server-smtp").show();
      loadServerSmtpSettings();
    }
  }


  function onServerSettingsLoaded(data) {
    $("#newsletter-settings-server-type").text(data["server.type"]);
    //$("#newsletter-settings-server-timeout").val(data["server.type"]);

    onServerTypeChange();
  }

  function loadServerSettings() {

    $.post(actionURL, { action: "settings.server.get" }, null, "json")
      .done(function (data) { onServerSettingsLoaded(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  }

  function saveServerSmtpSettings() {
    var request = {
      "action": "settings.server.smtp.set",
      "host": $("#newsletter-settings-server-smtp-host").val(),
      "port": $("#newsletter-settings-server-smtp-port").val(),
      "security": $("#newsletter-settings-server-smtp-security-type").text(),
      "authentication": $("#newsletter-settings-server-smtp-authentication-type").text(),
            "username": $("#newsletter-settings-server-smtp-username").val(),
      "password": $("#newsletter-settings-server-smtp-password").val(),            
    };

    $.post(actionURL, request, null, "json")
      .done(function (data) { })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  }

  function saveServerSettings() {

    var value = $("#newsletter-settings-server-type").text().toLowerCase();

    var request = {
      "action": "settings.server.set",
      "type": value
    };

    $.post(actionURL, request, null, "json")
      .done(function (data) {
    if (value === "smtp")
      saveServerSmtpSettings();
       })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });

  }

  function onServerSmtpSettingsLoaded(data) {

    $("#newsletter-settings-server-smtp-host").val(data.host);
    $("#newsletter-settings-server-smtp-port").val(data.port);
    $("#newsletter-settings-server-smtp-security-type").text(data.security);
    $("#newsletter-settings-server-smtp-authentication-type").text(data.authentication);
    $("#newsletter-settings-server-smtp-username").val(data.username);
    $("#newsletter-settings-server-smtp-password").val(data.password);
  }

  function loadServerSmtpSettings() {

    $.post(actionURL, { action: "settings.server.smtp.get" }, null, "json")
      .done(function (data) { onServerSmtpSettingsLoaded(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });
  }

  function onRolesLoaded(data) {
    $("#newsletter-settings-roles-settings").val(data.settings);
    $("#newsletter-settings-roles-addressbook").val(data.addressbook);
  }

  function loadRolesSettings() {
    $.post(actionURL, { action: "settings.roles.get" }, null, "json")
      .done(function (data) { onRolesLoaded(data); })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });    

  }

  function saveRolesSettings() {
    var request = {
      "action": "settings.roles.set",
      "settings": $("#newsletter-settings-roles-settings").val(),
      "addressbook": $("#newsletter-settings-roles-addressbook").val()
    };

    $.post(actionURL, request, null, "json")
      .done(function (data) { })
      .fail(function (jqxhr, textStatus, error) {
        alert(textStatus);
      });

  }

  $(document).ready(function () {
    loadPathsSettings();
    loadMailSettings();
    loadServerSettings();
    loadRolesSettings();

    $("#newsletter-settings-server-type-sendmail").click(function () {
      $("#newsletter-settings-server-type").text("Sendmail");
      onServerTypeChange();
    });

    $("#newsletter-settings-server-type-smtp").click(function () {
      $("#newsletter-settings-server-type").text("SMTP");
      onServerTypeChange();
    });


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

    $("#newsletter-settings-mail-reset").click(function () {
      loadMailSettings();
    });

    $("#newsletter-settings-mail-save").click(function () {
      saveMailSettings();
    });

    $("#newsletter-settings-server-reset").click(function () {
      loadServerSettings();
    });

    $("#newsletter-settings-server-save").click(function () {
      saveServerSettings();
    });

    $("#newsletter-settings-roles-reset").click(function () {
      loadRolesSettings();
    });

    $("#newsletter-settings-roles-save").click(function () {
      saveRolesSettings();
    });    

  });
})(window);