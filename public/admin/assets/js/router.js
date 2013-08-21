var ajaxSettings, api_req;

RT.API = {
  me: root_path + "user/CurrentData",
  getUser: root_path + "user",
  getUserList: root_path + "user",
  addUser: root_path + "user",
  DeleteUser: root_path + "user",
  getUserApps: root_path + "WebAPI/index.php/API/Auth/getUserList",
  getWebsyncList: root_path + "WebAPI/index.php/API/Auth/getWebsyncList",
  getWebSync: root_path + "WebAPI/index.php/API/Auth/getWebSync",
  getAppList: root_path + "WebAPI/index.php/API/App/getAppList",
  getAppInfo: root_path + "WebAPI/index.php/API/App/getAppInfo",
  getGroupList: root_path + "WebAPI/index.php/API/Auth/getGroupList",
  getGroupInfo: root_path + "WebAPI/index.php/API/Auth/getGroup",
  getAcls: root_path + "WebAPI/index.php/API/Acl/AclList",
  getLogList: root_path + "WebAPI/index.php/API/Log/List"
};

RT.dialogs = {
  loading: function(action) {
    if (action !== "close") {
      return $("#loading").show();
    } else {
      return $("#loading").hide();
    }
  }
};

RT.show_message = function(id, type, message) {
  var html;
  $(".alert").remove();
  html = "<div class=\"alert\" style=\"display:none;\"><a class=\"close\" data-dismiss=\"alert\">×</a><span class=\"message\"></span></div>";
  type = type || "alert-success";
  message = message || "";
  if (message === "" || id === undefined) {
    return false;
  }
  $(html).insertBefore(id);
  $(".message").text(message);
  return $(".alert").addClass(type).fadeIn("slow", function() {
    return setTimeout((function(e) {
      return $(".alert").fadeOut("slow");
    }), 10000);
  });
};

RT.update_table = function() {
  $(".tablesorter").tablesorter({
    headers: {
      0: {
        sorter: false
      }
    },
    selectorHeaders: "> thead th",
    theme: 'blue'
  });
  $("table").trigger("update");
  return $("#sidebar").equalHeight();
};

RT.generateSerial = function(len) {
  var chars, letterOrNumber, newNum, randomstring, rnum, string_length, x;
  chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  string_length = (len === undefined || isNaN(parseInt(len)) || len === "" ? 32 : parseInt(len));
  randomstring = "";
  x = 0;
  while (x < string_length) {
    letterOrNumber = Math.floor(Math.random() * 2);
    if (letterOrNumber === 0) {
      newNum = Math.floor(Math.random() * 9);
      randomstring += newNum;
    } else {
      rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    x++;
  }
  return randomstring;
};

ajaxSettings = {
  dataType: "json"
};

api_req = function(name, callback, settings) {
  settings = (!settings ? {} : settings);
  return $.ajax($.extend({}, ajaxSettings, {
    url: name,
    type: (settings.data ? "POST" : "GET"),
    success: callback,
    error: function(xhr, status, errorThrown) {
      var error, message;
      message = "Unknown error. Please try again later.";
      switch (status) {
        case "timeout":
          message = "Server timeout. Please try again later.";
          break;
        case "error":
        case "parsererror":
          message = "Server experienced some difficulty. Please try again later.";
          break;
        case "abort":
          message = "Aborted.";
      }
      try {
        return alertify.error($.parseJSON(xhr.responseText).error_text);
      } catch (_error) {
        error = _error;
        return alertify.error(message);
      }
    }
  }, settings));
};

RT.api = {
  GET: function(path, data, callback, settings) {
    settings = settings || {};
    data = data || {};
    if (navigator.userAgent.indexOf("MSIE") !== -1) {
      $.extend(settings, {
        cache: false
      });
    }
    return api_req(path, callback, $.extend({
      type: "GET",
      data: data
    }, settings));
  },
  POST: function(path, data, callback, settings) {
    settings = settings || {};
    data = data || {};
    return api_req(path, callback, $.extend({
      type: "POST",
      data: data
    }, settings));
  },
  PUT: function(path, data, callback, settings) {
    settings = settings || {};
    data = data || {};
    return api_req(path, callback, $.extend({
      type: "PUT",
      data: data
    }, settings));
  },
  DELETE: function(path, data, callback, settings) {
    settings = settings || {};
    data = data || {};
    return api_req(path, callback, $.extend({
      type: "DELETE",
      data: data
    }, settings));
  }
};

define(["jquery", "underscore", "backbone", 'alertify', "models/me", "models/user", "views/view", "views/users/list", "views/users/edit", "moment", "jquery.serialize", "jquery.tablesorter", "jquery.ui", "bootstrap.modal", "bootstrap.tab", "jquery.equalHeight", "handlebars", "libs/handlebars-helper", "templates"], function($, _, Backbone, alertify, ModelMe, ModelUser, View, ViewUsers, ViewUser) {
  var AppRouter, initialize;
  AppRouter = Backbone.Router.extend({
    site_name: "Motel 後台管理",
    routes: {
      "": "home",
      "!/home": "home",
      "!/motel/:action": "motel",
      "!/motel/:action/:id": "motel",
      "!/user/:action": "user",
      "!/user/:action/:id": "user"
    },
    initialize: function() {
      this.me = new ModelMe();
      this.me.bind("change", this.update_user, this);
      this.me.fetch();
      if (!this.user_model) {
        return this.user_model = new ModelUser();
      }
    },
    update_title: function(title) {
      if (title) {
        document.title = title + " | " + this.site_name;
        return $(".section_title").text(title);
      } else {
        document.title = this.site_name;
        return $(".section_title").text("");
      }
    },
    user: function(action, id) {
      this.reset();
      RT.dialogs.loading("open");
      $("#main").html("");
      switch (action) {
        case "list":
          this.page = id || 1;
          this.update_title("帳號列表");
          if (!this.view_users_list) {
            this.view_users_list = new ViewUsers({
              el: "#main",
              collection: this.user_model.lists,
              model_name: this.user_model,
              page: this.page
            });
          }
          this.view_users_list.options.page = this.page;
          this.user_model.set_params({
            page: this.page
          });
          this.user_model.lists.fetch({
            reset: true
          });
          return console.log('a');
        case "add":
          this.update_title("新增帳號");
          if (!this.view_users_add) {
            this.view_users_add = new View({
              template_name: "user_edit",
              el: "#main"
            });
          }
          return this.view_users_add.render();
        case "edit":
          this.update_title("修改帳號");
          if (!this.view_user) {
            this.view_user = new ViewUser({
              el: "#main",
              model: this.user_model
            });
          } else {
            if (!this.user_model.hasChanged()) {
              this.user_model.trigger("change");
            }
          }
          this.user_model.id = id;
          return this.user_model.fetch();
      }
    },
    update_user: function() {
      new View({
        template_name: "user_me",
        el: "#display_username",
        model: this.me
      }).render();
      if (!this.me.get("logged_in")) {
        return $("#login_pannel").modal({
          backdrop: "static",
          keyboard: false
        });
      }
    },
    home: function() {
      return RT.dialogs.loading("close");
    },
    reset: function() {
      if (typeof this.user !== "undefined" && typeof this.user.reset !== "undefined") {
        return this.user.reset();
      }
    }
  });
  initialize = function() {
    var enablePushState, pushState;
    $(document).on("click", ".navigate_menu", function(ev) {
      var url;
      ev.preventDefault();
      url = '!/' + $(this).data('url');
      return RT.Router.navigate(url, {
        trigger: true
      });
    }).on("click", ".auto_generate", function(ev) {
      var name, random_serial;
      ev.preventDefault();
      name = $(this).data("field");
      random_serial = RT.generateSerial(32);
      return $(":input[name=" + name + "]").val(random_serial);
    }).on("click", ".close", function(ev) {
      ev.preventDefault();
      return $(this).parent().fadeOut("slow");
    }).on("click", ".check_all", function(ev) {
      ev.preventDefault();
      return $("input[type=checkbox]").each(function() {
        var checked;
        checked = $(this).attr("checked");
        if (checked) {
          return $(this).attr("checked", false);
        } else {
          return $(this).attr("checked", true);
        }
      });
    });
    $(".tablesorter").tablesorter({
      headers: {
        0: {
          sorter: false
        }
      }
    });
    $(".tab_content").hide();
    $("ul.tabs li:first").addClass("active").show();
    $(".tab_content:first").show();
    $("ul.tabs li").click(function() {
      var activeTab;
      $("ul.tabs li").removeClass("active");
      $(this).addClass("active");
      $(".tab_content").hide();
      activeTab = $(this).find("a").attr("href");
      $(activeTab).fadeIn();
      return false;
    });
    $(".tablesorter").tablesorter({
      headers: {
        0: {
          sorter: false
        }
      }
    });
    $(".column").equalHeight();
    RT.Router = new AppRouter;
    enablePushState = true;
    pushState = !!(enablePushState && window.history && window.history.pushState);
    return Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});