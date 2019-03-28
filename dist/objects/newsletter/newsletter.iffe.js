var Newsletter = (function () {
  'use strict';

  /**
   * The Utility class
   * @class
   */
  var Utility = function Utility() {
    return this;
  };

  /**
   * Boolean for debug mode
   * @return {boolean} wether or not the front-end is in debug mode.
   */
  Utility.debug = function () {
    return Utility.getUrlParameter(Utility.PARAMS.DEBUG) === '1';
  };

  /**
   * Returns the value of a given key in a URL query string. If no URL query
   * string is provided, the current URL location is used.
   * @param  {string}  name        - Key name.
   * @param  {?string} queryString - Optional query string to check.
   * @return {?string} Query parameter value.
   */
  Utility.getUrlParameter = function (name, queryString) {
    var query = queryString || window.location.search;
    var param = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + param + '=([^&#]*)');
    var results = regex.exec(query);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  /**
   * For translating strings, there is a global LOCALIZED_STRINGS array that
   * is defined on the HTML template level so that those strings are exposed to
   * WPML translation. The LOCALIZED_STRINGS array is composed of objects with a
   * `slug` key whose value is some constant, and a `label` value which is the
   * translated equivalent. This function takes a slug name and returns the
   * label.
   * @param  {string} slug
   * @return {string} localized value
   */
  Utility.localize = function (slug) {
    var text = slug || '';
    var strings = window.LOCALIZED_STRINGS || [];
    var match = strings.filter(function (s) {
      return s.hasOwnProperty('slug') && s['slug'] === slug ? s : false;
    });
    return match[0] && match[0].hasOwnProperty('label') ? match[0].label : text;
  };

  /**
   * Takes a a string and returns whether or not the string is a valid email
   * by using native browser validation if available. Otherwise, does a simple
   * Regex test.
   * @param {string} email
   * @return {boolean}
   */
  Utility.validateEmail = function (email) {
    var input = document.createElement('input');
    input.type = 'email';
    input.value = email;

    return typeof input.checkValidity === 'function' ? input.checkValidity() : /\S+@\S+\.\S+/.test(email);
  };

  /**
   * Map toggled checkbox values to an input.
   * @param  {Object} event The parent click event.
   * @return {Element}      The target element.
   */
  Utility.joinValues = function (event) {
    if (!event.target.matches('input[type="checkbox"]')) {
      return;
    }

    if (!event.target.closest('[data-js-join-values]')) {
      return;
    }

    var el = event.target.closest('[data-js-join-values]');
    var target = document.querySelector(el.dataset.jsJoinValues);

    target.value = Array.from(el.querySelectorAll('input[type="checkbox"]')).filter(function (e) {
      return e.value && e.checked;
    }).map(function (e) {
      return e.value;
    }).join(', ');

    return target;
  };

  /**
   * A simple form validation class that uses native form validation. It will
   * add appropriate form feedback for each input that is invalid and native
   * localized browser messaging.
   *
   * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
   * See https://caniuse.com/#feat=form-validation for support
   *
   * @param  {Event}         event The form submission event.
   * @return {Event/Boolean}       The original event or false if invalid.
   */
  Utility.valid = function (event) {
    event.preventDefault();

    if (Utility.debug())
      // eslint-disable-next-line no-console
      {
        console.dir({ init: 'Validation', event: event });
      }

    var validity = event.target.checkValidity();
    var elements = event.target.querySelectorAll('input[required="true"]');

    for (var i = 0; i < elements.length; i++) {
      // Remove old messaging if it exists
      var el = elements[i];
      var container = el.parentNode;
      var message = container.querySelector('.error-message');

      container.classList.remove('error');
      if (message) {
        message.remove();
      }

      // If this input valid, skip messaging
      if (el.validity.valid) {
        continue;
      }

      // Create the new error message.
      message = document.createElement('div');

      // Get the error message from localized strings.
      if (el.validity.valueMissing) {
        message.innerHTML = Utility.localize('VALID_REQUIRED');
      } else if (!el.validity.valid) {
        message.innerHTML = Utility.localize("VALID_" + el.type.toUpperCase() + "_INVALID");
      } else {
        message.innerHTML = el.validationMessage;
      }

      message.setAttribute('aria-live', 'polite');
      message.classList.add('error-message');

      // Add the error class and error message.
      container.classList.add('error');
      container.insertBefore(message, container.childNodes[0]);
    }

    if (Utility.debug())
      // eslint-disable-next-line no-console
      {
        console.dir({ complete: 'Validation', valid: validity, event: event });
      }

    return validity ? event : validity;
  };

  /**
   * A markdown parsing method. It relies on the dist/markdown.min.js script
   * which is a browser compatible version of markdown-js
   * @url https://github.com/evilstreak/markdown-js
   * @return {Object} The iteration over the markdown DOM parents
   */
  Utility.parseMarkdown = function () {
    if (typeof markdown === 'undefined') {
      return false;
    }

    var mds = document.querySelectorAll(Utility.SELECTORS.parseMarkdown);

    var loop = function loop(i) {
      var element = mds[i];
      fetch(element.dataset.jsMarkdown).then(function (response) {
        if (response.ok) {
          return response.text();
        } else {
          element.innerHTML = '';
          // eslint-disable-next-line no-console
          if (Utility.debug()) {
            console.dir(response);
          }
        }
      }).catch(function (error) {
        // eslint-disable-next-line no-console
        if (Utility.debug()) {
          console.dir(error);
        }
      }).then(function (data) {
        try {
          element.classList.toggle('animated');
          element.classList.toggle('fadeIn');
          element.innerHTML = markdown.toHTML(data);
        } catch (error) {}
      });
    };

    for (var i = 0; i < mds.length; i++) {
      loop(i);
    }
  };

  /**
   * Application parameters
   * @type {Object}
   */
  Utility.PARAMS = {
    DEBUG: 'debug'
  };

  /**
   * Selectors for the Utility module
   * @type {Object}
   */
  Utility.SELECTORS = {
    parseMarkdown: '[data-js="markdown"]'
  };

  function isStringJsonObject(arg) {
      try {
          JSON.parse(arg);
          return true;
      }
      catch (e) { }
      return false;
  }
  function isArray(arg) {
      return Array.isArray(arg);
  }
  function isStringNumber(arg) {
      return typeof arg == 'number' || /^[-+]?\d+([Ee][+-]?\d+)?(\.\d+)?$/.test(arg);
  }
  function isStringInteger(arg) {
      return /^[-+]?\d+([Ee][+-]?\d+)?$/.test(arg);
  }
  function isStringNullOrEmpty(arg) {
      return arg == null || arg.trim() === "";
  }
  var nodeListToArray = function (nodeList) {
      return Array.prototype.slice.call(nodeList);
  };

  var parserList = [
      {
          name: "auto",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  return forceNull ? null : val;
              }
              var result = val.toString().trim();
              if (result.toLowerCase() === "null")
                  { return null; }
              try {
                  result = JSON.parse(result);
                  return result;
              }
              catch (e) {
              }
              var array = result.split(",");
              if (array.length > 1) {
                  result = array.map(function (x) {
                      if (isStringNumber(x)) {
                          return parseFloat(x);
                      }
                      else if (isStringJsonObject(x)) {
                          return JSON.parse(x);
                      }
                      return x.trim();
                  });
              }
              return result;
          }
      },
      {
          name: "number",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  return forceNull ? null : 0;
              }
              if (isStringNumber(val)) {
                  return parseFloat(val);
              }
              return 0;
          }
      },
      {
          name: "boolean",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  return forceNull ? null : false;
              }
              val = val.toString().toLowerCase();
              if (val === "true" || val === "1") {
                  return true;
              }
              return false;
          }
      },
      {
          name: "string",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  return null;
              }
              var result = val.toString().trim();
              if (result.toLowerCase() === "null" || (result === "" && forceNull))
                  { return null; }
              return result;
          }
      },
      {
          name: "array[auto]",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  if (forceNull)
                      { return null; }
                  return [];
              }
              return val.split(",").map(function (x) {
                  var parser = parserList.filter(function (x) { return x.name === "auto"; })[0];
                  return parser.parse(x.trim(), forceNull);
              });
          }
      },
      {
          name: "array[string]",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  if (forceNull)
                      { return null; }
                  return [];
              }
              return val.split(",").map(function (x) { return x.trim().toString(); });
          }
      },
      {
          name: "array[number]",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  if (forceNull)
                      { return null; }
                  return [];
              }
              return val.split(",").map(function (x) { return parseFloat(x.trim()); });
          }
      },
      {
          name: "json",
          parse: function (val, forceNull) {
              if (isStringNullOrEmpty(val)) {
                  if (forceNull)
                      { return null; }
                  return {};
              }
              return JSON.parse(val);
          }
      }
  ];

  var pluginName = "NSerializeJson";

  var NSerializeJson = (function () {
      function NSerializeJson() {
      }
      NSerializeJson.parseValue = function (value, type) {
          if (isStringNullOrEmpty(type)) {
              var autoParser = this.parsers.filter(function (x) { return x.name === "auto"; })[0];
              return autoParser.parse(value, this.options.forceNullOnEmpty);
          }
          var parser = this.parsers.filter(function (x) { return x.name === type; })[0];
          if (parser == null) {
              throw pluginName + ": couldn't find ther parser for type '" + type + "'.";
          }
          return parser.parse(value, this.options.forceNullOnEmpty);
      };
      NSerializeJson.serializeForm = function (htmlFormElement) {
          var _this = this;
          var nodeList = htmlFormElement.querySelectorAll("input, select, textarea");
          var htmlInputElements = nodeListToArray(nodeList);
          var checkedElements = htmlInputElements.filter(function (x) {
              if (x.disabled ||
                  ((x.getAttribute("type") === "radio" && !x.checked) ||
                      (x.getAttribute("type") === "checkbox" && !x.checked))) {
                  return false;
              }
              return true;
          });
          var resultObject = {};
          checkedElements.forEach(function (x) { return _this.serializeIntoObject(resultObject, x); });
          return resultObject;
      };
      NSerializeJson.serializeIntoObject = function (obj, htmlElement) {
          var value = null;
          if (htmlElement.tagName.toLowerCase() === "select") {
              var firstSelectOpt = Array.from(htmlElement.options).filter(function (x) { return x.selected; })[0];
              if (firstSelectOpt) {
                  value = firstSelectOpt.getAttribute("value");
              }
          }
          else {
              value = htmlElement.value;
          }
          var pathStr = htmlElement.getAttribute("name");
          if (isStringNullOrEmpty(pathStr))
              { return obj; }
          var path = [];
          var type = null;
          var typeIndex = pathStr.indexOf(":");
          if (typeIndex > -1) {
              type = pathStr.substring(typeIndex + 1, pathStr.length);
              if (type === "skip") {
                  return obj;
              }
              pathStr = pathStr.substring(0, typeIndex);
          }
          else {
              type = htmlElement.getAttribute("data-value-type");
          }
          if (this.options.onBeforeParseValue != null) {
              value = this.options.onBeforeParseValue(value, type);
          }
          var parsedValue = this.parseValue(value, type);
          var pathLength = 0;
          if (this.options.useDotSeparatorInPath) {
              var addArrayToPath = false;
              path = pathStr.split(".");
              pathLength = path.length;
              path.forEach(function (step, index) {
                  var indexOfBrackets = step.indexOf("[]");
                  if (index !== pathLength - 1) {
                      if (indexOfBrackets > -1) {
                          throw pluginName + ": error in path '" + pathStr + "' empty values in the path mean array and should be at the end.";
                      }
                  }
                  else {
                      if (indexOfBrackets > -1) {
                          path[index] = step.replace("[]", "");
                          addArrayToPath = true;
                      }
                  }
              });
              if (addArrayToPath) {
                  path.push("");
              }
          }
          else {
              path = pathStr.split("[").map(function (x, i) { return x.replace("]", ""); });
              pathLength = path.length;
              path.forEach(function (step, index) {
                  if (index !== pathLength - 1 && isStringNullOrEmpty(step))
                      { throw pluginName + ": error in path '" + pathStr + "' empty values in the path mean array and should be at the end."; }
              });
          }
          this.searchAndSet(obj, path, 0, parsedValue);
          return obj;
      };
      NSerializeJson.searchAndSet = function (currentObj, path, pathIndex, parsedValue, arrayInternalIndex) {
          if (arrayInternalIndex === void 0) { arrayInternalIndex = 0; }
          var step = path[pathIndex];
          var isFinalStep = pathIndex === path.length - 1;
          var nextStep = path[pathIndex + 1];
          if (currentObj == null || typeof currentObj == "string") {
              path = path.map(function (x) { return isStringNullOrEmpty(x) ? "[]" : x; });
              console.log(pluginName + ": there was an error in path '" + path + "' in step '" + step + "'.");
              throw pluginName + ": error.";
          }
          var isArrayStep = isStringNullOrEmpty(step);
          var isIntegerStep = isStringInteger(step);
          var isNextStepAnArray = isStringInteger(nextStep) || isStringNullOrEmpty(nextStep);
          if (isArrayStep) {
              if (isFinalStep) {
                  currentObj.push(parsedValue);
                  return;
              }
              else {
                  if (currentObj[arrayInternalIndex] == null) {
                      currentObj[arrayInternalIndex] = {};
                  }
                  step = arrayInternalIndex;
                  arrayInternalIndex++;
              }
          }
          else if (isIntegerStep && this.options.useNumKeysAsArrayIndex) {
              step = parseInt(step);
              if (!isArray(currentObj)) {
                  currentObj = [];
              }
              if (isFinalStep) {
                  currentObj[step] = parsedValue;
                  return;
              }
              else {
                  if (currentObj[step] == null)
                      { currentObj[step] = {}; }
              }
          }
          else {
              if (isFinalStep) {
                  currentObj[step] = parsedValue;
                  return;
              }
              else {
                  if (this.options.useNumKeysAsArrayIndex) {
                      if (isNextStepAnArray) {
                          if (!isArray(currentObj[step]))
                              { currentObj[step] = []; }
                      }
                      else {
                          if (currentObj[step] == null)
                              { currentObj[step] = {}; }
                      }
                  }
                  else {
                      if (currentObj[step] == null)
                          { currentObj[step] = {}; }
                  }
              }
          }
          pathIndex++;
          this.searchAndSet(currentObj[step], path, pathIndex, parsedValue, arrayInternalIndex);
      };
      NSerializeJson.options = {
          useNumKeysAsArrayIndex: true,
          useDotSeparatorInPath: false,
          forceNullOnEmpty: false
      };
      NSerializeJson.parsers = parserList.slice();
      return NSerializeJson;
  }());

  /**
   * The Newsletter module
   * @class
   */
  var Newsletter = function Newsletter(element) {
    var this$1 = this;

    this._el = element;

    // Map toggled checkbox values to an input.
    this._el.addEventListener('click', Utility.joinValues);

    // This sets the script callback function to a global function that
    // can be accessed by the the requested script.
    window[Newsletter.callback] = function (data) {
      this$1._callback(data);
    };

    this._el.querySelector('form').addEventListener('submit', function (event) {
      return Utility.valid(event) ? this$1._submit(event).then(this$1._onload).catch(this$1._onerror) : false;
    });

    return this;
  };

  /**
   * The form submission method. Requests a script with a callback function
   * to be executed on our page. The callback function will be passed the
   * response as a JSON object (function parameter).
   * @param{Event} event The form submission event
   * @return {Promise}     A promise containing the new script call
   */
  Newsletter.prototype._submit = function _submit(event) {
    event.preventDefault();

    // Store the data.
    this._data = NSerializeJson.serializeForm(event.target);

    // Switch the action to post-json. This creates an endpoint for mailchimp
    // that acts as a script that can be loaded onto our page.
    var action = event.target.action.replace(Newsletter.endpoints.MAIN + "?", Newsletter.endpoints.MAIN_JSON + "?");

    var keys = Object.keys(this._data);
    for (var i = 0; i < keys.length; i++) {
      action = action + "&" + keys[i] + "=" + this._data[keys[i]];
    }

    // Append the callback reference. Mailchimp will wrap the JSON response in
    // our callback method. Once we load the script the callback will execute.
    action = action + "&c=window." + Newsletter.callback;

    // Create a promise that appends the script response of the post-json method
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      document.body.appendChild(script);
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.src = encodeURI(action);
    });
  };

  /**
   * The script onload resolution
   * @param{Event} event The script on load event
   * @return {Class}     The Newsletter class
   */
  Newsletter.prototype._onload = function _onload(event) {
    event.path[0].remove();
    return this;
  };

  /**
   * The script on error resolution
   * @param{Object} error The script on error load event
   * @return {Class}      The Newsletter class
   */
  Newsletter.prototype._onerror = function _onerror(error) {
    // eslint-disable-next-line no-console
    if (Utility.debug()) {
      console.dir(error);
    }
    return this;
  };

  /**
   * The callback function for the MailChimp Script call
   * @param{Object} data The success/error message from MailChimp
   * @return {Class}     The Newsletter class
   */
  Newsletter.prototype._callback = function _callback(data) {
    if (this["_" + data[this._key('MC_RESULT')]]) {
      this["_" + data[this._key('MC_RESULT')]](data.msg);
    } else
      // eslint-disable-next-line no-console
      if (Utility.debug()) {
        console.dir(data);
      }
    return this;
  };

  /**
   * Submission error handler
   * @param{string} msg The error message
   * @return {Class}    The Newsletter class
   */
  Newsletter.prototype._error = function _error(msg) {
    this._elementsReset();
    this._messaging('WARNING', msg);
    return this;
  };

  /**
   * Submission success handler
   * @param{string} msg The success message
   * @return {Class}    The Newsletter class
   */
  Newsletter.prototype._success = function _success(msg) {
    this._elementsReset();
    this._messaging('SUCCESS', msg);
    return this;
  };

  /**
   * Present the response message to the user
   * @param{String} type The message type
   * @param{String} msgThe message
   * @return {Class}     Newsletter
   */
  Newsletter.prototype._messaging = function _messaging(type, msg) {
    if (msg === void 0) msg = 'no message';

    var strings = Object.keys(Newsletter.strings);
    var handled = false;
    var alertBox = this._el.querySelector(Newsletter.selectors[type + "_BOX"]);

    var alertBoxMsg = alertBox.querySelector(Newsletter.selectors.ALERT_BOX_TEXT);

    // Get the localized string, these should be written to the DOM already.
    // The utility contains a global method for retrieving them.
    for (var i = 0; i < strings.length; i++) {
      if (msg.indexOf(Newsletter.strings[strings[i]]) > -1) {
        msg = Utility.localize(strings[i]);
        handled = true;
      }
    }

    // Replace string templates with values from either our form data or
    // the Newsletter strings object.
    for (var x = 0; x < Newsletter.templates.length; x++) {
      var template = Newsletter.templates[x];
      var key = template.replace('{{ ', '').replace(' }}', '');
      var value = this._data[key] || Newsletter.strings[key];
      var reg = new RegExp(template, 'gi');
      msg = msg.replace(reg, value ? value : '');
    }

    if (handled) {
      alertBoxMsg.innerHTML = msg;
    } else if (type === 'ERROR') {
      alertBoxMsg.innerHTML = Utility.localize(Newsletter.strings.ERR_PLEASE_TRY_LATER);
    }

    if (alertBox) {
      this._elementShow(alertBox, alertBoxMsg);
    }

    return this;
  };

  /**
   * The main toggling method
   * @return {Class}       Newsletter
   */
  Newsletter.prototype._elementsReset = function _elementsReset() {
    var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

    var loop = function loop(i) {
      if (!targets[i].classList.contains(Newsletter.classes.HIDDEN)) {
        targets[i].classList.add(Newsletter.classes.HIDDEN);

        Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
          return targets[i].classList.remove(item);
        });

        // Screen Readers
        targets[i].setAttribute('aria-hidden', 'true');
        targets[i].querySelector(Newsletter.selectors.ALERT_BOX_TEXT).setAttribute('aria-live', 'off');
      }
    };

    for (var i = 0; i < targets.length; i++) {
      loop(i);
    }return this;
  };

  /**
   * The main toggling method
   * @param{object} targetMessage container
   * @param{object} content Content that changes dynamically that should
   *                        be announced to screen readers.
   * @return {Class}        Newsletter
   */
  Newsletter.prototype._elementShow = function _elementShow(target, content) {
    target.classList.toggle(Newsletter.classes.HIDDEN);
    Newsletter.classes.ANIMATE.split(' ').forEach(function (item) {
      return target.classList.toggle(item);
    });
    // Screen Readers
    target.setAttribute('aria-hidden', 'true');
    if (content) {
      content.setAttribute('aria-live', 'polite');
    }

    return this;
  };

  /**
   * A proxy function for retrieving the proper key
   * @param{string} key The reference for the stored keys.
   * @return {string}   The desired key.
   */
  Newsletter.prototype._key = function _key(key) {
    return Newsletter.keys[key];
  };

  /** @type {Object} API data keys */
  Newsletter.keys = {
    MC_RESULT: 'result',
    MC_MSG: 'msg'
  };

  /** @type {Object} API endpoints */
  Newsletter.endpoints = {
    MAIN: '/post',
    MAIN_JSON: '/post-json'
  };

  /** @type {String} The Mailchimp callback reference. */
  Newsletter.callback = 'AccessNycNewsletterCallback';

  /** @type {Object} DOM selectors for the instance's concerns */
  Newsletter.selectors = {
    ELEMENT: '[data-js="newsletter"]',
    ALERT_BOXES: '[data-js-newsletter*="alert-box-"]',
    WARNING_BOX: '[data-js-newsletter="alert-box-warning"]',
    SUCCESS_BOX: '[data-js-newsletter="alert-box-success"]',
    ALERT_BOX_TEXT: '[data-js-newsletter="alert-box__text"]'
  };

  /** @type {String} The main DOM selector for the instance */
  Newsletter.selector = Newsletter.selectors.ELEMENT;

  /** @type {Object} String references for the instance */
  Newsletter.strings = {
    ERR_PLEASE_TRY_LATER: 'ERR_PLEASE_TRY_LATER',
    SUCCESS_CONFIRM_EMAIL: 'Almost finished...',
    ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
    ERR_TOO_MANY_RECENT: 'too many',
    ERR_ALREADY_SUBSCRIBED: 'is already subscribed',
    ERR_INVALID_EMAIL: 'looks fake or invalid',
    LIST_NAME: 'ACCESS NYC - Newsletter'
  };

  /** @type {Array} Placeholders that will be replaced in message strings */
  Newsletter.templates = ['{{ EMAIL }}', '{{ LIST_NAME }}'];

  Newsletter.classes = {
    ANIMATE: 'animated fadeInUp',
    HIDDEN: 'hidden'
  };

  return Newsletter;

}());