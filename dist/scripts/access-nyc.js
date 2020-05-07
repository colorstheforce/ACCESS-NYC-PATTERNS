var AccessNyc = (function () {
  'use strict';

  /**
   * Utilities for Form components
   * @class
   */
  var Forms = function Forms(form) {
    if ( form === void 0 ) form = false;

    this.FORM = form;

    this.strings = Forms.strings;

    this.submit = Forms.submit;

    this.classes = Forms.classes;

    this.markup = Forms.markup;

    this.selectors = Forms.selectors;

    this.attrs = Forms.attrs;

    this.FORM.setAttribute('novalidate', true);

    return this;
  };

  /**
   * Map toggled checkbox values to an input.
   * @param{Object} event The parent click event.
   * @return {Element}    The target element.
   */
  Forms.prototype.joinValues = function joinValues (event) {
    if (!event.target.matches('input[type="checkbox"]'))
      { return; }

    if (!event.target.closest('[data-js-join-values]'))
      { return; }

    var el = event.target.closest('[data-js-join-values]');
    var target = document.querySelector(el.dataset.jsJoinValues);

    target.value = Array.from(
        el.querySelectorAll('input[type="checkbox"]')
      )
      .filter(function (e) { return (e.value && e.checked); })
      .map(function (e) { return e.value; })
      .join(', ');

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
   * @param{Event}       event The form submission event
   * @return {Class/Boolean}     The form class or false if invalid
   */
  Forms.prototype.valid = function valid (event) {
    var validity = event.target.checkValidity();
    var elements = event.target.querySelectorAll(this.selectors.REQUIRED);

    for (var i = 0; i < elements.length; i++) {
      // Remove old messaging if it exists
      var el = elements[i];

      this.reset(el);

      // If this input valid, skip messaging
      if (el.validity.valid) { continue; }

      this.highlight(el);
    }

    return (validity) ? this : validity;
  };

  /**
   * Adds focus and blur events to inputs with required attributes
   * @param {object}formPassing a form is possible, otherwise it will use
   *                        the form passed to the constructor.
   * @return{class}       The form class
   */
  Forms.prototype.watch = function watch (form) {
      var this$1 = this;
      if ( form === void 0 ) form = false;

    this.FORM = (form) ? form : this.FORM;

    var elements = this.FORM.querySelectorAll(this.selectors.REQUIRED);

    /** Watch Individual Inputs */
    var loop = function ( i ) {
      // Remove old messaging if it exists
      var el = elements[i];

      el.addEventListener('focus', function () {
        this$1.reset(el);
      });

      el.addEventListener('blur', function () {
        if (!el.validity.valid)
          { this$1.highlight(el); }
      });
    };

      for (var i = 0; i < elements.length; i++) loop( i );

    /** Submit Event */
    this.FORM.addEventListener('submit', function (event) {
      event.preventDefault();

      if (this$1.valid(event) === false)
        { return false; }

      this$1.submit(event);
    });

    return this;
  };

  /**
   * Removes the validity message and classes from the message.
   * @param {object}elThe input element
   * @return{class}     The form class
   */
  Forms.prototype.reset = function reset (el) {
    var container = (this.selectors.ERROR_MESSAGE_PARENT)
      ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

    var message = container.querySelector('.' + this.classes.ERROR_MESSAGE);

    // Remove old messaging if it exists
    container.classList.remove(this.classes.ERROR_CONTAINER);
    if (message) { message.remove(); }

    // Remove error class from the form
    container.closest('form').classList.remove(this.classes.ERROR_CONTAINER);

    // Remove dynamic attributes from the input
    el.removeAttribute(this.attrs.ERROR_INPUT[0]);
    el.removeAttribute(this.attrs.ERROR_LABEL);

    return this;
  };

  /**
   * Displays a validity message to the user. It will first use any localized
   * string passed to the class for required fields missing input. If the
   * input is filled in but doesn't match the required pattern, it will use
   * a localized string set for the specific input type. If one isn't provided
   * it will use the default browser provided message.
   * @param {object}elThe invalid input element
   * @return{class}     The form class
   */
  Forms.prototype.highlight = function highlight (el) {
    var container = (this.selectors.ERROR_MESSAGE_PARENT)
      ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

    // Create the new error message.
    var message = document.createElement(this.markup.ERROR_MESSAGE);
    var id = (el.getAttribute('id')) + "-" + (this.classes.ERROR_MESSAGE);

    // Get the error message from localized strings (if set).
    if (el.validity.valueMissing && this.strings.VALID_REQUIRED)
      { message.innerHTML = this.strings.VALID_REQUIRED; }
    else if (!el.validity.valid &&
      this.strings[("VALID_" + (el.type.toUpperCase()) + "_INVALID")]) {
      var stringKey = "VALID_" + (el.type.toUpperCase()) + "_INVALID";
      message.innerHTML = this.strings[stringKey];
    } else
      { message.innerHTML = el.validationMessage; }

    // Set aria attributes and css classes to the message
    message.setAttribute('id', id);
    message.setAttribute(this.attrs.ERROR_MESSAGE[0],
      this.attrs.ERROR_MESSAGE[1]);
    message.classList.add(this.classes.ERROR_MESSAGE);

    // Add the error class and error message to the dom.
    container.classList.add(this.classes.ERROR_CONTAINER);
    container.insertBefore(message, container.childNodes[0]);

    // Add the error class to the form
    container.closest('form').classList.add(this.classes.ERROR_CONTAINER);

    // Add dynamic attributes to the input
    el.setAttribute(this.attrs.ERROR_INPUT[0], this.attrs.ERROR_INPUT[1]);
    el.setAttribute(this.attrs.ERROR_LABEL, id);

    return this;
  };

  /**
   * A dictionairy of strings in the format.
   * {
   *   'VALID_REQUIRED': 'This is required',
   *   'VALID_{{ TYPE }}_INVALID': 'Invalid'
   * }
   */
  Forms.strings = {};

  /** Placeholder for the submit function */
  Forms.submit = function() {};

  /** Classes for various containers */
  Forms.classes = {
    'ERROR_MESSAGE': 'error-message', // error class for the validity message
    'ERROR_CONTAINER': 'error', // class for the validity message parent
    'ERROR_FORM': 'error'
  };

  /** HTML tags and markup for various elements */
  Forms.markup = {
    'ERROR_MESSAGE': 'div',
  };

  /** DOM Selectors for various elements */
  Forms.selectors = {
    'REQUIRED': '[required="true"]', // Selector for required input elements
    'ERROR_MESSAGE_PARENT': false
  };

  /** Attributes for various elements */
  Forms.attrs = {
    'ERROR_MESSAGE': ['aria-live', 'polite'], // Attribute for valid error message
    'ERROR_INPUT': ['aria-invalid', 'true'],
    'ERROR_LABEL': 'aria-describedby'
  };

  /**
   * The Simple Toggle class. This will toggle the class 'active' and 'hidden'
   * on target elements, determined by a click event on a selected link or
   * element. This will also toggle the aria-hidden attribute for targeted
   * elements to support screen readers. Target settings and other functionality
   * can be controlled through data attributes.
   *
   * This uses the .matches() method which will require a polyfill for IE
   * https://polyfill.io/v2/docs/features/#Element_prototype_matches
   *
   * @class
   */
  var Toggle = function Toggle(s) {
    var this$1 = this;

    // Create an object to store existing toggle listeners (if it doesn't exist)
    if (!window.hasOwnProperty('ACCESS_TOGGLES'))
      { window.ACCESS_TOGGLES = []; }

    s = (!s) ? {} : s;

    this.settings = {
      selector: (s.selector) ? s.selector : Toggle.selector,
      namespace: (s.namespace) ? s.namespace : Toggle.namespace,
      inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
      activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
      before: (s.before) ? s.before : false,
      after: (s.after) ? s.after : false
    };

    this.element = (s.element) ? s.element : false;

    if (this.element) {
      this.element.addEventListener('click', function (event) {
        this$1.toggle(event);
      });
    } else {
      // If there isn't an existing instantiated toggle, add the event listener.
      if (!window.ACCESS_TOGGLES.hasOwnProperty(this.settings.selector))
        { document.querySelector('body').addEventListener('click', function (event) {
          if (!event.target.matches(this$1.settings.selector))
            { return; }

          this$1.toggle(event);
        }); }
    }

    // Record that a toggle using this selector has been instantiated. This
    // prevents double toggling.
    window.ACCESS_TOGGLES[this.settings.selector] = true;

    return this;
  };

  /**
   * Logs constants to the debugger
   * @param{object} eventThe main click event
   * @return {object}      The class
   */
  Toggle.prototype.toggle = function toggle (event) {
      var this$1 = this;

    var el = event.target;
    var target = false;

    event.preventDefault();

    /** Anchor Links */
    target = (el.hasAttribute('href')) ?
      document.querySelector(el.getAttribute('href')) : target;

    /** Toggle Controls */
    target = (el.hasAttribute('aria-controls')) ?
      document.querySelector(("#" + (el.getAttribute('aria-controls')))) : target;

    /** Main Functionality */
    if (!target) { return this; }
    this.elementToggle(el, target);

    /** Undo */
    if (el.dataset[((this.settings.namespace) + "Undo")]) {
      var undo = document.querySelector(
        el.dataset[((this.settings.namespace) + "Undo")]
      );

      undo.addEventListener('click', function (event) {
        event.preventDefault();
        this$1.elementToggle(el, target);
        undo.removeEventListener('click');
      });
    }

    return this;
  };

  /**
   * The main toggling method
   * @param{object} el   The current element to toggle active
   * @param{object} target The target element to toggle active/hidden
   * @return {object}      The class
   */
  Toggle.prototype.elementToggle = function elementToggle (el, target) {
      var this$1 = this;

    var i = 0;
    var attr = '';
    var value = '';

    // Get other toggles that might control the same element
    var others = document.querySelectorAll(
      ("[aria-controls=\"" + (el.getAttribute('aria-controls')) + "\"]"));

    /**
     * Toggling before hook.
     */
    if (this.settings.before) { this.settings.before(this); }

    /**
     * Toggle Element and Target classes
     */
    if (this.settings.activeClass) {
      el.classList.toggle(this.settings.activeClass);
      target.classList.toggle(this.settings.activeClass);

      // If there are other toggles that control the same element
      if (others) { others.forEach(function (other) {
        if (other !== el) { other.classList.toggle(this$1.settings.activeClass); }
      }); }
    }

    if (this.settings.inactiveClass)
      { target.classList.toggle(this.settings.inactiveClass); }

    /**
     * Target Element Aria Attributes
     */
    for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
      attr = Toggle.targetAriaRoles[i];
      value = target.getAttribute(attr);

      if (value != '' && value)
        { target.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
    }

    /**
     * Jump Links
     */
    if (el.hasAttribute('href')) {
      // Reset the history state, this will clear out
      // the hash when the jump item is toggled closed.
      history.pushState('', '',
        window.location.pathname + window.location.search);

      // Target element toggle.
      if (target.classList.contains(this.settings.activeClass)) {
        window.location.hash = el.getAttribute('href');

        target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
      } else
        { target.removeAttribute('tabindex'); }
    }

    /**
     * Toggle Element (including multi toggles) Aria Attributes
     */
    for (i = 0; i < Toggle.elAriaRoles.length; i++) {
      attr = Toggle.elAriaRoles[i];
      value = el.getAttribute(attr);

      if (value != '' && value)
        { el.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }

      // If there are other toggles that control the same element
      if (others) { others.forEach(function (other) {
        if (other !== el && other.getAttribute(attr))
          { other.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
      }); }
    }

    /**
     * Toggling complete hook.
     */
    if (this.settings.after) { this.settings.after(this); }

    return this;
  };

  /** @type {String} The main selector to add the toggling function to */
  Toggle.selector = '[data-js*="toggle"]';

  /** @type {String} The namespace for our data attribute settings */
  Toggle.namespace = 'toggle';

  /** @type {String} The hide class */
  Toggle.inactiveClass = 'hidden';

  /** @type {String} The active class */
  Toggle.activeClass = 'active';

  /** @type {Array} Aria roles to toggle true/false on the toggling element */
  Toggle.elAriaRoles = ['aria-pressed', 'aria-expanded'];

  /** @type {Array} Aria roles to toggle true/false on the target element */
  Toggle.targetAriaRoles = ['aria-hidden'];

  /**
   * The Icon module
   * @class
   */
  var Icons = function Icons(path) {
    path = (path) ? path : Icons.path;

    fetch(path)
      .then(function (response) {
        if (response.ok)
          { return response.text(); }
        else
          // eslint-disable-next-line no-console
          { console.dir(response); }
      })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        { console.dir(error); }
      })
      .then(function (data) {
        var sprite = document.createElement('div');
        sprite.innerHTML = data;
        sprite.setAttribute('aria-hidden', true);
        sprite.setAttribute('style', 'display: none;');
        document.body.appendChild(sprite);
      });

    return this;
  };

  /** @type {String} The path of the icon file */
  Icons.path = 'svg/icons.svg';

  /**
   * Tracking bus for Google analytics and Webtrends.
   */
  var Track = function Track(s) {
    var this$1 = this;

    var body = document.querySelector('body');

    s = (!s) ? {} : s;

    this._settings = {
      selector: (s.selector) ? s.selector : Track.selector,
    };

    this.desinations = Track.destinations;

    body.addEventListener('click', function (event) {
      if (!event.target.matches(this$1._settings.selector))
        { return; }

      var key = event.target.dataset.trackKey;
      var data = JSON.parse(event.target.dataset.trackData);

      this$1.track(key, data);
    });

    return this;
  };

  /**
   * Tracking function wrapper
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   *
   * @return {Object}          The final data object
   */
  Track.prototype.track = function track (key, data) {
    // Set the path name based on the location
    var d = data.map(function (el) {
        if (el.hasOwnProperty(Track.key))
          { el[Track.key] = (window.location.pathname) + "/" + (el[Track.key]); }
        return el;
      });

    var wt = this.webtrends(key, d);
    var ga = this.gtag(key, d);

    /* eslint-disable no-console */
    { console.dir({'Track': [wt, ga]}); }
    /* eslint-enable no-console */

    return d;
  };
  /**
   * Data bus for tracking views in Webtrends and Google Analytics
   *
   * @param{String}    app The name of the Single Page Application to track
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.view = function view (app, key, data) {
    var wt = this.webtrends(key, data);
    var ga = this.gtagView(app, key);

    /* eslint-disable no-console */
    { console.dir({'Track': [wt, ga]}); }
    /* eslint-enable no-console */
  };
  /**
   * Push Events to Webtrends
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.webtrends = function webtrends (key, data) {
    if (
      typeof Webtrends === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('webtrends')
    ) {
      return false;
    }

    var event = [{
      'WT.ti': key
    }];

    if (data[0] && data[0].hasOwnProperty(Track.key)) {
      event.push({
        'DCS.dcsuri': data[0][Track.key]
      });
    } else {
      Object.assign(event, data);
    }

    // Format data for Webtrends
    var wtd = {argsa: event.flatMap(function (e) {
      return Object.keys(e).flatMap(function (k) { return [k, e[k]]; });
    })};

    // If 'action' is used as the key (for gtag.js), switch it to Webtrends
    var action = data.argsa.indexOf('action');

    if (action) { data.argsa[action] = 'DCS.dcsuri'; }

    // Webtrends doesn't send the page view for MultiTrack, add path to url
    var dcsuri = data.argsa.indexOf('DCS.dcsuri');

    if (dcsuri) {
      data.argsa[dcsuri + 1] = window.location.pathname +
        data.argsa[dcsuri + 1];
    }

    /* eslint-disable no-undef */
    if (typeof Webtrends !== 'undefined')
      { Webtrends.multiTrack(wtd); }
    /* eslint-disable no-undef */

    return ['Webtrends', wtd];
  };
  /**
   * Push Click Events to Google Analytics
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.gtag = function gtag$1 (key, data) {
    if (
      typeof gtag === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('gtag')
    ) {
      return false;
    }

    var uri = data.find(function (element) { return element.hasOwnProperty(Track.key); });

    var event = {
      'event_category': key
    };

    /* eslint-disable no-undef */
    gtag(Track.key, uri[Track.key], event);
    /* eslint-enable no-undef */

    return ['gtag', Track.key, uri[Track.key], event];
  };
  /**
   * Push Screen View Events to Google Analytics
   *
   * @param{String}appThe name of the application
   * @param{String}keyThe key or event of the data
   */
  Track.prototype.gtagView = function gtagView (app, key) {
    if (
      typeof gtag === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('gtag')
    ) {
      return false;
    }

    var view = {
      app_name: app,
      screen_name: key
    };

    /* eslint-disable no-undef */
    gtag('event', 'screen_view', view);
    /* eslint-enable no-undef */

    return ['gtag', Track.key, 'screen_view', view];
  };

  /** @type {String} The main selector to add the tracking function to */
  Track.selector = '[data-js*="track"]';

  /** @type {String} The main event tracking key to map to Webtrends DCS.uri */
  Track.key = 'event';

  /** @type {Array} What destinations to push data to */
  Track.destinations = [
    'webtrends',
    'gtag'
  ];

  /**
   * Copy to Clipboard Helper
   *
   * <input data-copy-target="web-share-url" id="web-share-url" name="web-share-url" type="text" value="https://myurl" />
   *
   * <button aria-pressed="false" data-copy="web-share-url" data-js="copy">
   *   Copy to Clipboard
   * </button>
   */
  var Copy = function Copy() {
    var this$1 = this;

    // Set attributes
    this.selector = Copy.selector;

    this.aria = Copy.aria;

    this.notifyTimeout = Copy.notifyTimeout;

    // Select the entire text when it's focused on
    document.querySelectorAll(Copy.selectors.TARGETS).forEach(function (item) {
      item.addEventListener('focus', function () { return this$1.select(item); });
      item.addEventListener('click', function () { return this$1.select(item); });
    });

    // The main click event for the class
    document.querySelector('body').addEventListener('click', function (event) {
      if (!event.target.matches(this$1.selector))
        { return; }

      this$1.element = event.target;

      this$1.element.setAttribute(this$1.aria, false);

      this$1.target = this$1.element.dataset.copy;

      if (this$1.copy(this$1.target)) {
        this$1.element.setAttribute(this$1.aria, true);

        clearTimeout(this$1.element['timeout']);

        this$1.element['timeout'] = setTimeout(function () {
          this$1.element.setAttribute(this$1.aria, false);
        }, this$1.notifyTimeout);
      }
    });

    return this;
  };

  /**
   * The click event handler
   *
   * @param {String}targetContent of target data attribute
   *
   * @return{Boolean}       Wether copy was successful or not
   */
  Copy.prototype.copy = function copy (target) {
    var selector = Copy.selectors.TARGETS.replace(']', ("=\"" + target + "\"]"));

    var input = document.querySelector(selector);

    this.select(input);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value);
    } else if (document.execCommand) {
      document.execCommand('copy');
    } else {
      return false;
    }

    return true;
  };

  /**
   * Handler for the text selection method
   *
   * @param {Object}inputThe input with content to select
   */
  Copy.prototype.select = function select (input) {
    input.select();

    input.setSelectionRange(0, 99999);
  };

  /** The main element selector */
  Copy.selector = '[data-js*="copy"]';

  /** Class selectors */
  Copy.selectors = {
    TARGETS: '[data-copy-target]'
  };

  /** Button aria role to toggle */
  Copy.aria = 'aria-pressed';

  /** Timeout for the "Copied!" notification */
  Copy.notifyTimeout = 1500;

  /**
   * Creates a tooltips. The constructor is passed an HTML element that serves as
   * the trigger to show or hide the tooltips. The tooltip should have an
   * `aria-describedby` attribute, the value of which is the ID of the tooltip
   * content to show or hide.
   */

  var Tooltips = function Tooltips(el) {
    var this$1 = this;

    this.trigger = el;
    this.tooltip = document.getElementById(el.getAttribute('aria-describedby'));
    this.active = false;
    this.tooltip.classList.add(Tooltips.CssClass.TOOLTIP);
    this.tooltip.classList.add(Tooltips.CssClass.HIDDEN);
    this.tooltip.setAttribute('aria-hidden', 'true');
    this.tooltip.setAttribute('role', 'tooltip'); // Stop click propagation so clicking on the tip doesn't trigger a
    // click on body, which would close the tooltips.

    this.tooltip.addEventListener('click', function (event) {
      event.stopPropagation();
    });
    document.querySelector('body').appendChild(this.tooltip);
    this.trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      this$1.toggle();
    });
    window.addEventListener('hashchange', function () {
      this$1.hide();
    });
    Tooltips.AllTips.push(this);
    return this;
  };
  /**
   * Displays the tooltips. Sets a one-time listener on the body to close the
   * tooltip when a click event bubbles up to it.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.show = function show () {
      var this$1 = this;

    Tooltips.hideAll();
    this.tooltip.classList.remove(Tooltips.CssClass.HIDDEN);
    this.tooltip.setAttribute('aria-hidden', 'false');
    var body = document.querySelector('body');

    var hideTooltipOnce = function () {
      this$1.hide();
      body.removeEventListener('click', hideTooltipOnce);
    };

    body.addEventListener('click', hideTooltipOnce);
    window.addEventListener('resize', function () {
      this$1.reposition();
    });
    this.reposition();
    this.active = true;
    return this;
  };
  /**
   * Hides the tooltip and removes the click event listener on the body.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.hide = function hide () {
    this.tooltip.classList.add(Tooltips.CssClass.HIDDEN);
    this.tooltip.setAttribute('aria-hidden', 'true');
    this.active = false;
    return this;
  };
  /**
   * Toggles the state of the tooltips.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.toggle = function toggle () {
    if (this.active) {
      this.hide();
    } else {
      this.show();
    }

    return this;
  };
  /**
   * Positions the tooltip beneath the triggering element.
   * @method
   * @return {this} Tooltip
   */


  Tooltips.prototype.reposition = function reposition () {
    var pos = {
      'position': 'absolute',
      'left': 'auto',
      'right': 'auto',
      'top': 'auto',
      'bottom': 'auto',
      'width': ''
    };

    var style = function (attrs) { return Object.keys(attrs).map(function (key) { return (key + ": " + (attrs[key])); }).join('; '); };

    var g = 8; // Gutter. Minimum distance from screen edge.

    var tt = this.tooltip;
    var tr = this.trigger;
    var w = window; // Reset

    this.tooltip.setAttribute('style', style(pos)); // Determine left or right alignment.

    if (tt.offsetWidth >= w.innerWidth - 2 * g) {
      // If the tooltip is wider than the screen minus gutters, then position
      // the tooltip to extend to the gutters.
      pos.left = g + 'px';
      pos.right = g + 'px';
      pos.width = 'auto';
    } else if (tr.offsetLeft + tt.offsetWidth + g > w.innerWidth) {
      // If the tooltip, when left aligned with the trigger, would cause the
      // tip to go offscreen (determined by taking the trigger left offset and
      // adding the tooltip width and the left gutter) then align the tooltip
      // to the right side of the trigger element.
      pos.left = 'auto';
      pos.right = w.innerWidth - (tr.offsetLeft + tr.offsetWidth) + 'px';
    } else {
      // Align the tooltip to the left of the trigger element.
      pos.left = tr.offsetLeft + 'px';
      pos.right = 'auto';
    } // Position TT on top if the trigger is below the middle of the window


    if (tr.offsetTop - w.scrollY > w.innerHeight / 2) {
      pos.top = tr.offsetTop - tt.offsetHeight - g + 'px';
    } else {
      pos.top = tr.offsetTop + tr.offsetHeight + g + 'px';
    }

    this.tooltip.setAttribute('style', style(pos));
    return this;
  };

  Tooltips.selector = '[data-js*="tooltip"]';
  /**
   * Array of all the instantiated tooltips.
   * @type {Array<Tooltip>}
   */

  Tooltips.AllTips = [];
  /**
   * Hide all Tooltips.
   * @public
   */

  Tooltips.hideAll = function () {
    Tooltips.AllTips.forEach(function (element) {
      element.hide();
    });
  };
  /**
   * CSS classes used by this component.
   * @enum {string}
   */


  Tooltips.CssClass = {
    HIDDEN: 'hidden',
    TOOLTIP: 'tooltip-bubble'
  };

  /**
   * The Accordion module
   * @class
   */

  var Accordion = function Accordion() {
    this._toggle = new Toggle({
      selector: Accordion.selector
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  Accordion.selector = '[data-js*="accordion"]';

  /* eslint-env browser */

  var Disclaimer = function Disclaimer() {
    var this$1 = this;

    this.selector = Disclaimer.selector;
    this.selectors = Disclaimer.selectors;
    this.classes = Disclaimer.classes;
    document.querySelector('body').addEventListener('click', function (event) {
      if (!event.target.matches(this$1.selectors.TOGGLE)) { return; }
      this$1.toggle(event);
    });
  };
  /**
   * Toggles the disclaimer to be visible or invisible.
   * @param {object}eventThe body click event
   * @return{object}       The disclaimer class
   */


  Disclaimer.prototype.toggle = function toggle (event) {
    event.preventDefault();
    var id = event.target.getAttribute('aria-describedby');
    var selector = "[aria-describedby=\"" + id + "\"]." + (this.classes.ACTIVE);
    var triggers = document.querySelectorAll(selector);
    var disclaimer = document.querySelector(("#" + id));

    if (triggers.length > 0 && disclaimer) {
      disclaimer.classList.remove(this.classes.HIDDEN);
      disclaimer.classList.add(this.classes.ANIMATED);
      disclaimer.classList.add(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', false); // Scroll-to functionality for mobile

      if (window.scrollTo && window.innerWidth < 960) {
        var offset = event.target.offsetTop - event.target.dataset.scrollOffset;
        window.scrollTo(0, offset);
      }
    } else {
      disclaimer.classList.add(this.classes.HIDDEN);
      disclaimer.classList.remove(this.classes.ANIMATED);
      disclaimer.classList.remove(this.classes.ANIMATION);
      disclaimer.setAttribute('aria-hidden', true);
    }

    return this;
  };

  Disclaimer.selector = '[data-js="disclaimer"]';
  Disclaimer.selectors = {
    TOGGLE: '[data-js*="disclaimer-control"]'
  };
  Disclaimer.classes = {
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    ANIMATED: 'animated',
    ANIMATION: 'fadeInUp'
  };

  /**
   * The Filter module
   * @class
   */

  var Filter = function Filter() {
    this._toggle = new Toggle({
      selector: Filter.selector,
      namespace: Filter.namespace,
      inactiveClass: Filter.inactiveClass
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  Filter.selector = '[data-js*="filter"]';
  /**
   * The namespace for the components JS options
   * @type {String}
   */

  Filter.namespace = 'filter';
  /**
   * The incactive class name
   * @type {String}
   */

  Filter.inactiveClass = 'inactive';

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Built-in value references. */
  var Symbol = root.Symbol;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Built-in value references. */
  var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag$1 && symToStringTag$1 in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /** Used for built-in method references. */
  var funcProto = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e$1) {}
    }
    return '';
  }

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype,
      objectProto$2 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$2.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }

  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max;

  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */
  function constant(value) {
    return function() {
      return value;
    };
  }

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString = !defineProperty ? identity : function(func, string) {
    return defineProperty(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant(string),
      'writable': true
    });
  };

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 800,
      HOT_SPAN = 16;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeNow = Date.now;

  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */
  function shortOut(func) {
    var count = 0,
        lastCalled = 0;

    return function() {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }

  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var setToString = shortOut(baseSetToString);

  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + '');
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return eq(object[index], value);
    }
    return false;
  }

  /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return baseRest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = (assigner.length > 3 && typeof customizer == 'function')
        ? (length--, customizer)
        : undefined;

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$4.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty$3.call(value, 'callee') &&
      !propertyIsEnumerable.call(value, 'callee');
  };

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? root.Buffer : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /** Detect free variable `exports`. */
  var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports$1 && freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$4.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$6;

    return value === proto;
  }

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$5.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  /**
   * This method is like `_.assignIn` except that it accepts `customizer`
   * which is invoked to produce the assigned values. If `customizer` returns
   * `undefined`, assignment is handled by the method instead. The `customizer`
   * is invoked with five arguments: (objValue, srcValue, key, object, source).
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @alias extendWith
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} sources The source objects.
   * @param {Function} [customizer] The function to customize assigned values.
   * @returns {Object} Returns `object`.
   * @see _.assignWith
   * @example
   *
   * function customizer(objValue, srcValue) {
   *   return _.isUndefined(objValue) ? srcValue : objValue;
   * }
   *
   * var defaults = _.partialRight(_.assignInWith, customizer);
   *
   * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
  var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
    copyObject(source, keysIn(source), object, customizer);
  });

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  /** Built-in value references. */
  var getPrototype = overArg(Object.getPrototypeOf, Object);

  /** `Object#toString` result references. */
  var objectTag$1 = '[object Object]';

  /** Used for built-in method references. */
  var funcProto$2 = Function.prototype,
      objectProto$8 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$2 = funcProto$2.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

  /** Used to infer the `Object` constructor. */
  var objectCtorString = funcToString$2.call(Object);

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * @static
   * @memberOf _
   * @since 0.8.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag$1) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty$6.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor &&
      funcToString$2.call(Ctor) == objectCtorString;
  }

  /** `Object#toString` result references. */
  var domExcTag = '[object DOMException]',
      errorTag$1 = '[object Error]';

  /**
   * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
   * `SyntaxError`, `TypeError`, or `URIError` object.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
   * @example
   *
   * _.isError(new Error);
   * // => true
   *
   * _.isError(Error);
   * // => false
   */
  function isError(value) {
    if (!isObjectLike(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == errorTag$1 || tag == domExcTag ||
      (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
  }

  /**
   * Attempts to invoke `func`, returning either the result or the caught error
   * object. Any additional arguments are provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Util
   * @param {Function} func The function to attempt.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {*} Returns the `func` result or error object.
   * @example
   *
   * // Avoid throwing errors for invalid selectors.
   * var elements = _.attempt(function(selector) {
   *   return document.querySelectorAll(selector);
   * }, '>_>');
   *
   * if (_.isError(elements)) {
   *   elements = [];
   * }
   */
  var attempt = baseRest(function(func, args) {
    try {
      return apply(func, undefined, args);
    } catch (e) {
      return isError(e) ? e : new Error(e);
    }
  });

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
  function baseValues(object, props) {
    return arrayMap(props, function(key) {
      return object[key];
    });
  }

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

  /**
   * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
   * of source objects to the destination object for all destination properties
   * that resolve to `undefined`.
   *
   * @private
   * @param {*} objValue The destination value.
   * @param {*} srcValue The source value.
   * @param {string} key The key of the property to assign.
   * @param {Object} object The parent object of `objValue`.
   * @returns {*} Returns the value to assign.
   */
  function customDefaultsAssignIn(objValue, srcValue, key, object) {
    if (objValue === undefined ||
        (eq(objValue, objectProto$9[key]) && !hasOwnProperty$7.call(object, key))) {
      return srcValue;
    }
    return objValue;
  }

  /** Used to escape characters for inclusion in compiled string literals. */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /**
   * Used by `_.template` to escape characters for inclusion in compiled string literals.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = overArg(Object.keys, Object);

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$8.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  /** Used to match template delimiters. */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyOf(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  var escapeHtmlChar = basePropertyOf(htmlEscapes);

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + '';
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /** Used to match HTML entities and HTML characters. */
  var reUnescapedHtml = /[&<>"']/g,
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /**
   * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
   * corresponding HTML entities.
   *
   * **Note:** No other characters are escaped. To escape additional
   * characters use a third-party library like [_he_](https://mths.be/he).
   *
   * Though the ">" character is escaped for symmetry, characters like
   * ">" and "/" don't need escaping in HTML and have no special meaning
   * unless they're part of a tag or unquoted attribute value. See
   * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
   * (under "semi-related fun fact") for more details.
   *
   * When working with HTML you should always
   * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
   * XSS vectors.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('fred, barney, & pebbles');
   * // => 'fred, barney, &amp; pebbles'
   */
  function escape$1(string) {
    string = toString(string);
    return (string && reHasUnescapedHtml.test(string))
      ? string.replace(reUnescapedHtml, escapeHtmlChar)
      : string;
  }

  /** Used to match template delimiters. */
  var reEscape = /<%-([\s\S]+?)%>/g;

  /** Used to match template delimiters. */
  var reEvaluate = /<%([\s\S]+?)%>/g;

  /**
   * By default, the template delimiters used by lodash are like those in
   * embedded Ruby (ERB) as well as ES2015 template strings. Change the
   * following template settings to use alternative delimiters.
   *
   * @static
   * @memberOf _
   * @type {Object}
   */
  var templateSettings = {

    /**
     * Used to detect `data` property values to be HTML-escaped.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'escape': reEscape,

    /**
     * Used to detect code to be evaluated.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'evaluate': reEvaluate,

    /**
     * Used to detect `data` property values to inject.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'interpolate': reInterpolate,

    /**
     * Used to reference the data object in the template text.
     *
     * @memberOf _.templateSettings
     * @type {string}
     */
    'variable': '',

    /**
     * Used to import variables into the compiled template.
     *
     * @memberOf _.templateSettings
     * @type {Object}
     */
    'imports': {

      /**
       * A reference to the `lodash` function.
       *
       * @memberOf _.templateSettings.imports
       * @type {Function}
       */
      '_': { 'escape': escape$1 }
    }
  };

  /** Used to match empty string literals in compiled template source. */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match
   * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to ensure capturing order of template delimiters. */
  var reNoMatch = /($^)/;

  /** Used to match unescaped characters in compiled string literals. */
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

  /**
   * Creates a compiled template function that can interpolate data properties
   * in "interpolate" delimiters, HTML-escape interpolated data properties in
   * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
   * properties may be accessed as free variables in the template. If a setting
   * object is given, it takes precedence over `_.templateSettings` values.
   *
   * **Note:** In the development build `_.template` utilizes
   * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
   * for easier debugging.
   *
   * For more information on precompiling templates see
   * [lodash's custom builds documentation](https://lodash.com/custom-builds).
   *
   * For more information on Chrome extension sandboxes see
   * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The template string.
   * @param {Object} [options={}] The options object.
   * @param {RegExp} [options.escape=_.templateSettings.escape]
   *  The HTML "escape" delimiter.
   * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
   *  The "evaluate" delimiter.
   * @param {Object} [options.imports=_.templateSettings.imports]
   *  An object to import into the template as free variables.
   * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
   *  The "interpolate" delimiter.
   * @param {string} [options.sourceURL='templateSources[n]']
   *  The sourceURL of the compiled template.
   * @param {string} [options.variable='obj']
   *  The data object variable name.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Function} Returns the compiled template function.
   * @example
   *
   * // Use the "interpolate" delimiter to create a compiled template.
   * var compiled = _.template('hello <%= user %>!');
   * compiled({ 'user': 'fred' });
   * // => 'hello fred!'
   *
   * // Use the HTML "escape" delimiter to escape data property values.
   * var compiled = _.template('<b><%- value %></b>');
   * compiled({ 'value': '<script>' });
   * // => '<b>&lt;script&gt;</b>'
   *
   * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
   * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
   * compiled({ 'users': ['fred', 'barney'] });
   * // => '<li>fred</li><li>barney</li>'
   *
   * // Use the internal `print` function in "evaluate" delimiters.
   * var compiled = _.template('<% print("hello " + user); %>!');
   * compiled({ 'user': 'barney' });
   * // => 'hello barney!'
   *
   * // Use the ES template literal delimiter as an "interpolate" delimiter.
   * // Disable support by replacing the "interpolate" delimiter.
   * var compiled = _.template('hello ${ user }!');
   * compiled({ 'user': 'pebbles' });
   * // => 'hello pebbles!'
   *
   * // Use backslashes to treat delimiters as plain text.
   * var compiled = _.template('<%= "\\<%- value %\\>" %>');
   * compiled({ 'value': 'ignored' });
   * // => '<%- value %>'
   *
   * // Use the `imports` option to import `jQuery` as `jq`.
   * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
   * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
   * compiled({ 'users': ['fred', 'barney'] });
   * // => '<li>fred</li><li>barney</li>'
   *
   * // Use the `sourceURL` option to specify a custom sourceURL for the template.
   * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
   * compiled(data);
   * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
   *
   * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
   * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
   * compiled.source;
   * // => function(data) {
   * //   var __t, __p = '';
   * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
   * //   return __p;
   * // }
   *
   * // Use custom template delimiters.
   * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
   * var compiled = _.template('hello {{ user }}!');
   * compiled({ 'user': 'mustache' });
   * // => 'hello mustache!'
   *
   * // Use the `source` property to inline compiled templates for meaningful
   * // line numbers in error messages and stack traces.
   * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
   *   var JST = {\
   *     "main": ' + _.template(mainText).source + '\
   *   };\
   * ');
   */
  function template(string, options, guard) {
    // Based on John Resig's `tmpl` implementation
    // (http://ejohn.org/blog/javascript-micro-templating/)
    // and Laura Doktorova's doT.js (https://github.com/olado/doT).
    var settings = templateSettings.imports._.templateSettings || templateSettings;

    if (guard && isIterateeCall(string, options, guard)) {
      options = undefined;
    }
    string = toString(string);
    options = assignInWith({}, options, settings, customDefaultsAssignIn);

    var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
        importsKeys = keys(imports),
        importsValues = baseValues(imports, importsKeys);

    var isEscaping,
        isEvaluating,
        index = 0,
        interpolate = options.interpolate || reNoMatch,
        source = "__p += '";

    // Compile the regexp to match each delimiter.
    var reDelimiters = RegExp(
      (options.escape || reNoMatch).source + '|' +
      interpolate.source + '|' +
      (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
      (options.evaluate || reNoMatch).source + '|$'
    , 'g');

    // Use a sourceURL for easier debugging.
    // The sourceURL gets injected into the source that's eval-ed, so be careful
    // with lookup (in case of e.g. prototype pollution), and strip newlines if any.
    // A newline wouldn't be a valid sourceURL anyway, and it'd enable code injection.
    var sourceURL = hasOwnProperty$9.call(options, 'sourceURL')
      ? ('//# sourceURL=' +
         (options.sourceURL + '').replace(/[\r\n]/g, ' ') +
         '\n')
      : '';

    string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
      interpolateValue || (interpolateValue = esTemplateValue);

      // Escape characters that can't be included in string literals.
      source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

      // Replace delimiters with snippets.
      if (escapeValue) {
        isEscaping = true;
        source += "' +\n__e(" + escapeValue + ") +\n'";
      }
      if (evaluateValue) {
        isEvaluating = true;
        source += "';\n" + evaluateValue + ";\n__p += '";
      }
      if (interpolateValue) {
        source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
      }
      index = offset + match.length;

      // The JS engine embedded in Adobe products needs `match` returned in
      // order to produce the correct `offset` value.
      return match;
    });

    source += "';\n";

    // If `variable` is not specified wrap a with-statement around the generated
    // code to add the data object to the top of the scope chain.
    // Like with sourceURL, we take care to not check the option's prototype,
    // as this configuration is a code injection vector.
    var variable = hasOwnProperty$9.call(options, 'variable') && options.variable;
    if (!variable) {
      source = 'with (obj) {\n' + source + '\n}\n';
    }
    // Cleanup code by stripping empty strings.
    source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
      .replace(reEmptyStringMiddle, '$1')
      .replace(reEmptyStringTrailing, '$1;');

    // Frame code as the function body.
    source = 'function(' + (variable || 'obj') + ') {\n' +
      (variable
        ? ''
        : 'obj || (obj = {});\n'
      ) +
      "var __t, __p = ''" +
      (isEscaping
         ? ', __e = _.escape'
         : ''
      ) +
      (isEvaluating
        ? ', __j = Array.prototype.join;\n' +
          "function print() { __p += __j.call(arguments, '') }\n"
        : ';\n'
      ) +
      source +
      'return __p\n}';

    var result = attempt(function() {
      return Function(importsKeys, sourceURL + 'return ' + source)
        .apply(undefined, importsValues);
    });

    // Provide the compiled function's source by its `toString` method or
    // the `source` property as a convenience for inlining compiled templates.
    result.source = source;
    if (isError(result)) {
      throw result;
    }
    return result;
  }

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * Creates a base function for methods like `_.forIn` and `_.forOwn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  /**
   * The base implementation of `baseForOwn` which iterates over `object`
   * properties returned by `keysFunc` and invokes `iteratee` for each property.
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = createBaseFor();

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */
  var baseEach = createBaseEach(baseForOwn);

  /**
   * Casts `value` to `identity` if it's not a function.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {Function} Returns cast function.
   */
  function castFunction(value) {
    return typeof value == 'function' ? value : identity;
  }

  /**
   * Iterates over elements of `collection` and invokes `iteratee` for each element.
   * The iteratee is invoked with three arguments: (value, index|key, collection).
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * **Note:** As with other "Collections" methods, objects with a "length"
   * property are iterated like arrays. To avoid this behavior use `_.forIn`
   * or `_.forOwn` for object iteration.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @alias each
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   * @see _.forEachRight
   * @example
   *
   * _.forEach([1, 2], function(value) {
   *   console.log(value);
   * });
   * // => Logs `1` then `2`.
   *
   * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
   *   console.log(key);
   * });
   * // => Logs 'a' then 'b' (iteration order is not guaranteed).
   */
  function forEach(collection, iteratee) {
    var func = isArray(collection) ? arrayEach : baseEach;
    return func(collection, castFunction(iteratee));
  }

  /**
   * The NearbyStops Module
   * @class
   */

  var NearbyStops = function NearbyStops() {
    var this$1 = this;

    /** @type {Array} Collection of nearby stops DOM elements */
    this._elements = document.querySelectorAll(NearbyStops.selector);
    /** @type {Array} The collection all stops from the data */

    this._stops = [];
    /** @type {Array} The currated collection of stops that will be rendered */

    this._locations = []; // Loop through DOM Components.

    forEach(this._elements, function (el) {
      // Fetch the data for the element.
      this$1._fetch(el, function (status, data) {
        if (status !== 'success') { return; }
        this$1._stops = data; // Get stops closest to the location.

        this$1._locations = this$1._locate(el, this$1._stops); // Assign the color names from patterns stylesheet.

        this$1._locations = this$1._assignColors(this$1._locations); // Render the markup for the stops.

        this$1._render(el, this$1._locations);
      });
    });
    return this;
  };
  /**
   * This compares the latitude and longitude with the Subway Stops data, sorts
   * the data by distance from closest to farthest, and returns the stop and
   * distances of the stations.
   * @param{object} el  The DOM Component with the data attr options
   * @param{object} stops All of the stops data to compare to
   * @return {object}     A collection of the closest stops with distances
   */


  NearbyStops.prototype._locate = function _locate (el, stops) {
    var amount = parseInt(this._opt(el, 'AMOUNT')) || NearbyStops.defaults.AMOUNT;
    var loc = JSON.parse(this._opt(el, 'LOCATION'));
    var geo = [];
    var distances = []; // 1. Compare lat and lon of current location with list of stops

    for (var i = 0; i < stops.length; i++) {
      geo = stops[i][this._key('ODATA_GEO')][this._key('ODATA_COOR')];
      geo = geo.reverse();
      distances.push({
        'distance': this._equirectangular(loc[0], loc[1], geo[0], geo[1]),
        'stop': i // index of stop in the data

      });
    } // 2. Sort the distances shortest to longest


    distances.sort(function (a, b) { return a.distance < b.distance ? -1 : 1; });
    distances = distances.slice(0, amount); // 3. Return the list of closest stops (number based on Amount option)
    // and replace the stop index with the actual stop data

    for (var x = 0; x < distances.length; x++) { distances[x].stop = stops[distances[x].stop]; }

    return distances;
  };
  /**
   * Fetches the stop data from a local source
   * @param{object} el     The NearbyStops DOM element
   * @param{function} callback The function to execute on success
   * @return {funciton}        the fetch promise
   */


  NearbyStops.prototype._fetch = function _fetch (el, callback) {
    var headers = {
      'method': 'GET'
    };
    return fetch(this._opt(el, 'ENDPOINT'), headers).then(function (response) {
      if (response.ok) { return response.json(); }else {
        // eslint-disable-next-line no-console
        { console.dir(response); }
        callback('error', response);
      }
    }).catch(function (error) {
      // eslint-disable-next-line no-console
      { console.dir(error); }
      callback('error', error);
    }).then(function (data) { return callback('success', data); });
  };
  /**
   * Returns distance in miles comparing the latitude and longitude of two
   * points using decimal degrees.
   * @param{float} lat1 Latitude of point 1 (in decimal degrees)
   * @param{float} lon1 Longitude of point 1 (in decimal degrees)
   * @param{float} lat2 Latitude of point 2 (in decimal degrees)
   * @param{float} lon2 Longitude of point 2 (in decimal degrees)
   * @return {float}    [description]
   */


  NearbyStops.prototype._equirectangular = function _equirectangular (lat1, lon1, lat2, lon2) {
    Math.deg2rad = function (deg) { return deg * (Math.PI / 180); };

    var alpha = Math.abs(lon2) - Math.abs(lon1);
    var x = Math.deg2rad(alpha) * Math.cos(Math.deg2rad(lat1 + lat2) / 2);
    var y = Math.deg2rad(lat1 - lat2);
    var R = 3959; // earth radius in miles;

    var distance = Math.sqrt(x * x + y * y) * R;
    return distance;
  };
  /**
   * Assigns colors to the data using the NearbyStops.truncks dictionary.
   * @param{object} locations Object of closest locations
   * @return {object}         Same object with colors assigned to each loc
   */


  NearbyStops.prototype._assignColors = function _assignColors (locations) {
    var locationLines = [];
    var line = 'S';
    var lines = ['S']; // Loop through each location that we are going to display

    for (var i = 0; i < locations.length; i++) {
      // assign the line to a variable to lookup in our color dictionary
      locationLines = locations[i].stop[this._key('ODATA_LINE')].split('-');

      for (var x = 0; x < locationLines.length; x++) {
        line = locationLines[x];

        for (var y = 0; y < NearbyStops.trunks.length; y++) {
          lines = NearbyStops.trunks[y]['LINES'];
          if (lines.indexOf(line) > -1) { locationLines[x] = {
            'line': line,
            'trunk': NearbyStops.trunks[y]['TRUNK']
          }; }
        }
      } // Add the trunk to the location


      locations[i].trunks = locationLines;
    }

    return locations;
  };
  /**
   * The function to compile and render the location template
   * @param{object} element The parent DOM element of the component
   * @param{object} data  The data to pass to the template
   * @return {object}       The NearbyStops class
   */


  NearbyStops.prototype._render = function _render (element, data) {
    var compiled = template(NearbyStops.templates.SUBWAY, {
      'imports': {
        '_each': forEach
      }
    });
    element.innerHTML = compiled({
      'stops': data
    });
    return this;
  };
  /**
   * Get data attribute options
   * @param{object} element The element to pull the setting from.
   * @param{string} opt   The key reference to the attribute.
   * @return {string}       The setting of the data attribute.
   */


  NearbyStops.prototype._opt = function _opt (element, opt) {
    return element.dataset[("" + (NearbyStops.namespace) + (NearbyStops.options[opt]))];
  };
  /**
   * A proxy function for retrieving the proper key
   * @param{string} key The reference for the stored keys.
   * @return {string}   The desired key.
   */


  NearbyStops.prototype._key = function _key (key) {
    return NearbyStops.keys[key];
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  NearbyStops.selector = '[data-js="nearby-stops"]';
  /**
   * The namespace for the component's JS options. It's primarily used to lookup
   * attributes in an element's dataset.
   * @type {String}
   */

  NearbyStops.namespace = 'nearbyStops';
  /**
   * A list of options that can be assigned to the component. It's primarily used
   * to lookup attributes in an element's dataset.
   * @type {Object}
   */

  NearbyStops.options = {
    LOCATION: 'Location',
    AMOUNT: 'Amount',
    ENDPOINT: 'Endpoint'
  };
  /**
   * The documentation for the data attr options.
   * @type {Object}
   */

  NearbyStops.definition = {
    LOCATION: 'The current location to compare distance to stops.',
    AMOUNT: 'The amount of stops to list.',
    ENDPOINT: 'The endopoint for the data feed.'
  };
  /**
   * [defaults description]
   * @type {Object}
   */

  NearbyStops.defaults = {
    AMOUNT: 3
  };
  /**
   * Storage for some of the data keys.
   * @type {Object}
   */

  NearbyStops.keys = {
    ODATA_GEO: 'the_geom',
    ODATA_COOR: 'coordinates',
    ODATA_LINE: 'line'
  };
  /**
   * Templates for the Nearby Stops Component
   * @type {Object}
   */

  NearbyStops.templates = {
    SUBWAY: ['<% _each(stops, function(stop) { %>', '<div class="c-nearby-stops__stop">', '<% var lines = stop.stop.line.split("-") %>', '<% _each(stop.trunks, function(trunk) { %>', '<% var exp = (trunk.line.indexOf("Express") > -1) ? true : false %>', '<% if (exp) trunk.line = trunk.line.split(" ")[0] %>', '<span class="', 'c-nearby-stops__subway ', 'icon-subway<% if (exp) { %>-express<% } %> ', '<% if (exp) { %>border-<% } else { %>bg-<% } %><%- trunk.trunk %>', '">', '<%- trunk.line %>', '<% if (exp) { %> <span class="sr-only">Express</span><% } %>', '</span>', '<% }); %>', '<span class="c-nearby-stops__description">', '<%- stop.distance.toString().slice(0, 3) %> Miles, ', '<%- stop.stop.name %>', '</span>', '</div>', '<% }); %>'].join('')
  };
  /**
   * Color assignment for Subway Train lines, used in cunjunction with the
   * background colors defined in config/tokens.js.
   * Based on the nomenclature described here;
   * @url // https://en.wikipedia.org/wiki/New_York_City_Subway#Nomenclature
   * @type {Array}
   */

  NearbyStops.trunks = [{
    TRUNK: 'eighth-avenue',
    LINES: ['A', 'C', 'E']
  }, {
    TRUNK: 'sixth-avenue',
    LINES: ['B', 'D', 'F', 'M']
  }, {
    TRUNK: 'crosstown',
    LINES: ['G']
  }, {
    TRUNK: 'canarsie',
    LINES: ['L']
  }, {
    TRUNK: 'nassau',
    LINES: ['J', 'Z']
  }, {
    TRUNK: 'broadway',
    LINES: ['N', 'Q', 'R', 'W']
  }, {
    TRUNK: 'broadway-seventh-avenue',
    LINES: ['1', '2', '3']
  }, {
    TRUNK: 'lexington-avenue',
    LINES: ['4', '5', '6', '6 Express']
  }, {
    TRUNK: 'flushing',
    LINES: ['7', '7 Express']
  }, {
    TRUNK: 'shuttles',
    LINES: ['S']
  }];

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var NumeralFormatter = function (numeralDecimalMark,
                                   numeralIntegerScale,
                                   numeralDecimalScale,
                                   numeralThousandsGroupStyle,
                                   numeralPositiveOnly,
                                   stripLeadingZeroes,
                                   prefix,
                                   signBeforePrefix,
                                   delimiter) {
      var owner = this;

      owner.numeralDecimalMark = numeralDecimalMark || '.';
      owner.numeralIntegerScale = numeralIntegerScale > 0 ? numeralIntegerScale : 0;
      owner.numeralDecimalScale = numeralDecimalScale >= 0 ? numeralDecimalScale : 2;
      owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
      owner.numeralPositiveOnly = !!numeralPositiveOnly;
      owner.stripLeadingZeroes = stripLeadingZeroes !== false;
      owner.prefix = (prefix || prefix === '') ? prefix : '';
      owner.signBeforePrefix = !!signBeforePrefix;
      owner.delimiter = (delimiter || delimiter === '') ? delimiter : ',';
      owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';
  };

  NumeralFormatter.groupStyle = {
      thousand: 'thousand',
      lakh:     'lakh',
      wan:      'wan',
      none:     'none'    
  };

  NumeralFormatter.prototype = {
      getRawValue: function (value) {
          return value.replace(this.delimiterRE, '').replace(this.numeralDecimalMark, '.');
      },

      format: function (value) {
          var owner = this, parts, partSign, partSignAndPrefix, partInteger, partDecimal = '';

          // strip alphabet letters
          value = value.replace(/[A-Za-z]/g, '')
              // replace the first decimal mark with reserved placeholder
              .replace(owner.numeralDecimalMark, 'M')

              // strip non numeric letters except minus and "M"
              // this is to ensure prefix has been stripped
              .replace(/[^\dM-]/g, '')

              // replace the leading minus with reserved placeholder
              .replace(/^\-/, 'N')

              // strip the other minus sign (if present)
              .replace(/\-/g, '')

              // replace the minus sign (if present)
              .replace('N', owner.numeralPositiveOnly ? '' : '-')

              // replace decimal mark
              .replace('M', owner.numeralDecimalMark);

          // strip any leading zeros
          if (owner.stripLeadingZeroes) {
              value = value.replace(/^(-)?0+(?=\d)/, '$1');
          }

          partSign = value.slice(0, 1) === '-' ? '-' : '';
          if (typeof owner.prefix != 'undefined') {
              if (owner.signBeforePrefix) {
                  partSignAndPrefix = partSign + owner.prefix;
              } else {
                  partSignAndPrefix = owner.prefix + partSign;
              }
          } else {
              partSignAndPrefix = partSign;
          }
          
          partInteger = value;

          if (value.indexOf(owner.numeralDecimalMark) >= 0) {
              parts = value.split(owner.numeralDecimalMark);
              partInteger = parts[0];
              partDecimal = owner.numeralDecimalMark + parts[1].slice(0, owner.numeralDecimalScale);
          }

          if(partSign === '-') {
              partInteger = partInteger.slice(1);
          }

          if (owner.numeralIntegerScale > 0) {
            partInteger = partInteger.slice(0, owner.numeralIntegerScale);
          }

          switch (owner.numeralThousandsGroupStyle) {
          case NumeralFormatter.groupStyle.lakh:
              partInteger = partInteger.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + owner.delimiter);

              break;

          case NumeralFormatter.groupStyle.wan:
              partInteger = partInteger.replace(/(\d)(?=(\d{4})+$)/g, '$1' + owner.delimiter);

              break;

          case NumeralFormatter.groupStyle.thousand:
              partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, '$1' + owner.delimiter);

              break;
          }

          return partSignAndPrefix + partInteger.toString() + (owner.numeralDecimalScale > 0 ? partDecimal.toString() : '');
      }
  };

  var NumeralFormatter_1 = NumeralFormatter;

  var DateFormatter = function (datePattern, dateMin, dateMax) {
      var owner = this;

      owner.date = [];
      owner.blocks = [];
      owner.datePattern = datePattern;
      owner.dateMin = dateMin
        .split('-')
        .reverse()
        .map(function(x) {
          return parseInt(x, 10);
        });
      if (owner.dateMin.length === 2) { owner.dateMin.unshift(0); }

      owner.dateMax = dateMax
        .split('-')
        .reverse()
        .map(function(x) {
          return parseInt(x, 10);
        });
      if (owner.dateMax.length === 2) { owner.dateMax.unshift(0); }
      
      owner.initBlocks();
  };

  DateFormatter.prototype = {
      initBlocks: function () {
          var owner = this;
          owner.datePattern.forEach(function (value) {
              if (value === 'Y') {
                  owner.blocks.push(4);
              } else {
                  owner.blocks.push(2);
              }
          });
      },

      getISOFormatDate: function () {
          var owner = this,
              date = owner.date;

          return date[2] ? (
              date[2] + '-' + owner.addLeadingZero(date[1]) + '-' + owner.addLeadingZero(date[0])
          ) : '';
      },

      getBlocks: function () {
          return this.blocks;
      },

      getValidatedDate: function (value) {
          var owner = this, result = '';

          value = value.replace(/[^\d]/g, '');

          owner.blocks.forEach(function (length, index) {
              if (value.length > 0) {
                  var sub = value.slice(0, length),
                      sub0 = sub.slice(0, 1),
                      rest = value.slice(length);

                  switch (owner.datePattern[index]) {
                  case 'd':
                      if (sub === '00') {
                          sub = '01';
                      } else if (parseInt(sub0, 10) > 3) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > 31) {
                          sub = '31';
                      }

                      break;

                  case 'm':
                      if (sub === '00') {
                          sub = '01';
                      } else if (parseInt(sub0, 10) > 1) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > 12) {
                          sub = '12';
                      }

                      break;
                  }

                  result += sub;

                  // update remaining string
                  value = rest;
              }
          });

          return this.getFixedDateString(result);
      },

      getFixedDateString: function (value) {
          var owner = this, datePattern = owner.datePattern, date = [],
              dayIndex = 0, monthIndex = 0, yearIndex = 0,
              dayStartIndex = 0, monthStartIndex = 0, yearStartIndex = 0,
              day, month, year, fullYearDone = false;

          // mm-dd || dd-mm
          if (value.length === 4 && datePattern[0].toLowerCase() !== 'y' && datePattern[1].toLowerCase() !== 'y') {
              dayStartIndex = datePattern[0] === 'd' ? 0 : 2;
              monthStartIndex = 2 - dayStartIndex;
              day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);

              date = this.getFixedDate(day, month, 0);
          }

          // yyyy-mm-dd || yyyy-dd-mm || mm-dd-yyyy || dd-mm-yyyy || dd-yyyy-mm || mm-yyyy-dd
          if (value.length === 8) {
              datePattern.forEach(function (type, index) {
                  switch (type) {
                  case 'd':
                      dayIndex = index;
                      break;
                  case 'm':
                      monthIndex = index;
                      break;
                  default:
                      yearIndex = index;
                      break;
                  }
              });

              yearStartIndex = yearIndex * 2;
              dayStartIndex = (dayIndex <= yearIndex) ? dayIndex * 2 : (dayIndex * 2 + 2);
              monthStartIndex = (monthIndex <= yearIndex) ? monthIndex * 2 : (monthIndex * 2 + 2);

              day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
              year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

              fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

              date = this.getFixedDate(day, month, year);
          }

          // mm-yy || yy-mm
          if (value.length === 4 && (datePattern[0] === 'y' || datePattern[1] === 'y')) {
              monthStartIndex = datePattern[0] === 'm' ? 0 : 2;
              yearStartIndex = 2 - monthStartIndex;
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
              year = parseInt(value.slice(yearStartIndex, yearStartIndex + 2), 10);

              fullYearDone = value.slice(yearStartIndex, yearStartIndex + 2).length === 2;

              date = [0, month, year];
          }

          // mm-yyyy || yyyy-mm
          if (value.length === 6 && (datePattern[0] === 'Y' || datePattern[1] === 'Y')) {
              monthStartIndex = datePattern[0] === 'm' ? 0 : 4;
              yearStartIndex = 2 - 0.5 * monthStartIndex;
              month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
              year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

              fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

              date = [0, month, year];
          }

          date = owner.getRangeFixedDate(date);
          owner.date = date;

          var result = date.length === 0 ? value : datePattern.reduce(function (previous, current) {
              switch (current) {
              case 'd':
                  return previous + (date[0] === 0 ? '' : owner.addLeadingZero(date[0]));
              case 'm':
                  return previous + (date[1] === 0 ? '' : owner.addLeadingZero(date[1]));
              case 'y':
                  return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], false) : '');
              case 'Y':
                  return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], true) : '');
              }
          }, '');

          return result;
      },

      getRangeFixedDate: function (date) {
          var owner = this,
              datePattern = owner.datePattern,
              dateMin = owner.dateMin || [],
              dateMax = owner.dateMax || [];

          if (!date.length || (dateMin.length < 3 && dateMax.length < 3)) { return date; }

          if (
            datePattern.find(function(x) {
              return x.toLowerCase() === 'y';
            }) &&
            date[2] === 0
          ) { return date; }

          if (dateMax.length && (dateMax[2] < date[2] || (
            dateMax[2] === date[2] && (dateMax[1] < date[1] || (
              dateMax[1] === date[1] && dateMax[0] < date[0]
            ))
          ))) { return dateMax; }

          if (dateMin.length && (dateMin[2] > date[2] || (
            dateMin[2] === date[2] && (dateMin[1] > date[1] || (
              dateMin[1] === date[1] && dateMin[0] > date[0]
            ))
          ))) { return dateMin; }

          return date;
      },

      getFixedDate: function (day, month, year) {
          day = Math.min(day, 31);
          month = Math.min(month, 12);
          year = parseInt((year || 0), 10);

          if ((month < 7 && month % 2 === 0) || (month > 8 && month % 2 === 1)) {
              day = Math.min(day, month === 2 ? (this.isLeapYear(year) ? 29 : 28) : 30);
          }

          return [day, month, year];
      },

      isLeapYear: function (year) {
          return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
      },

      addLeadingZero: function (number) {
          return (number < 10 ? '0' : '') + number;
      },

      addLeadingZeroForYear: function (number, fullYearMode) {
          if (fullYearMode) {
              return (number < 10 ? '000' : (number < 100 ? '00' : (number < 1000 ? '0' : ''))) + number;
          }

          return (number < 10 ? '0' : '') + number;
      }
  };

  var DateFormatter_1 = DateFormatter;

  var TimeFormatter = function (timePattern, timeFormat) {
      var owner = this;

      owner.time = [];
      owner.blocks = [];
      owner.timePattern = timePattern;
      owner.timeFormat = timeFormat;
      owner.initBlocks();
  };

  TimeFormatter.prototype = {
      initBlocks: function () {
          var owner = this;
          owner.timePattern.forEach(function () {
              owner.blocks.push(2);
          });
      },

      getISOFormatTime: function () {
          var owner = this,
              time = owner.time;

          return time[2] ? (
              owner.addLeadingZero(time[0]) + ':' + owner.addLeadingZero(time[1]) + ':' + owner.addLeadingZero(time[2])
          ) : '';
      },

      getBlocks: function () {
          return this.blocks;
      },

      getTimeFormatOptions: function () {
          var owner = this;
          if (String(owner.timeFormat) === '12') {
              return {
                  maxHourFirstDigit: 1,
                  maxHours: 12,
                  maxMinutesFirstDigit: 5,
                  maxMinutes: 60
              };
          }

          return {
              maxHourFirstDigit: 2,
              maxHours: 23,
              maxMinutesFirstDigit: 5,
              maxMinutes: 60
          };
      },

      getValidatedTime: function (value) {
          var owner = this, result = '';

          value = value.replace(/[^\d]/g, '');

          var timeFormatOptions = owner.getTimeFormatOptions();

          owner.blocks.forEach(function (length, index) {
              if (value.length > 0) {
                  var sub = value.slice(0, length),
                      sub0 = sub.slice(0, 1),
                      rest = value.slice(length);

                  switch (owner.timePattern[index]) {

                  case 'h':
                      if (parseInt(sub0, 10) > timeFormatOptions.maxHourFirstDigit) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > timeFormatOptions.maxHours) {
                          sub = timeFormatOptions.maxHours + '';
                      }

                      break;

                  case 'm':
                  case 's':
                      if (parseInt(sub0, 10) > timeFormatOptions.maxMinutesFirstDigit) {
                          sub = '0' + sub0;
                      } else if (parseInt(sub, 10) > timeFormatOptions.maxMinutes) {
                          sub = timeFormatOptions.maxMinutes + '';
                      }
                      break;
                  }

                  result += sub;

                  // update remaining string
                  value = rest;
              }
          });

          return this.getFixedTimeString(result);
      },

      getFixedTimeString: function (value) {
          var owner = this, timePattern = owner.timePattern, time = [],
              secondIndex = 0, minuteIndex = 0, hourIndex = 0,
              secondStartIndex = 0, minuteStartIndex = 0, hourStartIndex = 0,
              second, minute, hour;

          if (value.length === 6) {
              timePattern.forEach(function (type, index) {
                  switch (type) {
                  case 's':
                      secondIndex = index * 2;
                      break;
                  case 'm':
                      minuteIndex = index * 2;
                      break;
                  case 'h':
                      hourIndex = index * 2;
                      break;
                  }
              });

              hourStartIndex = hourIndex;
              minuteStartIndex = minuteIndex;
              secondStartIndex = secondIndex;

              second = parseInt(value.slice(secondStartIndex, secondStartIndex + 2), 10);
              minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
              hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

              time = this.getFixedTime(hour, minute, second);
          }

          if (value.length === 4 && owner.timePattern.indexOf('s') < 0) {
              timePattern.forEach(function (type, index) {
                  switch (type) {
                  case 'm':
                      minuteIndex = index * 2;
                      break;
                  case 'h':
                      hourIndex = index * 2;
                      break;
                  }
              });

              hourStartIndex = hourIndex;
              minuteStartIndex = minuteIndex;

              second = 0;
              minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
              hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

              time = this.getFixedTime(hour, minute, second);
          }

          owner.time = time;

          return time.length === 0 ? value : timePattern.reduce(function (previous, current) {
              switch (current) {
              case 's':
                  return previous + owner.addLeadingZero(time[2]);
              case 'm':
                  return previous + owner.addLeadingZero(time[1]);
              case 'h':
                  return previous + owner.addLeadingZero(time[0]);
              }
          }, '');
      },

      getFixedTime: function (hour, minute, second) {
          second = Math.min(parseInt(second || 0, 10), 60);
          minute = Math.min(minute, 60);
          hour = Math.min(hour, 60);

          return [hour, minute, second];
      },

      addLeadingZero: function (number) {
          return (number < 10 ? '0' : '') + number;
      }
  };

  var TimeFormatter_1 = TimeFormatter;

  var PhoneFormatter = function (formatter, delimiter) {
      var owner = this;

      owner.delimiter = (delimiter || delimiter === '') ? delimiter : ' ';
      owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

      owner.formatter = formatter;
  };

  PhoneFormatter.prototype = {
      setFormatter: function (formatter) {
          this.formatter = formatter;
      },

      format: function (phoneNumber) {
          var owner = this;

          owner.formatter.clear();

          // only keep number and +
          phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

          // strip non-leading +
          phoneNumber = phoneNumber.replace(/^\+/, 'B').replace(/\+/g, '').replace('B', '+');

          // strip delimiter
          phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

          var result = '', current, validated = false;

          for (var i = 0, iMax = phoneNumber.length; i < iMax; i++) {
              current = owner.formatter.inputDigit(phoneNumber.charAt(i));

              // has ()- or space inside
              if (/[\s()-]/g.test(current)) {
                  result = current;

                  validated = true;
              } else {
                  if (!validated) {
                      result = current;
                  }
                  // else: over length input
                  // it turns to invalid number again
              }
          }

          // strip ()
          // e.g. US: 7161234567 returns (716) 123-4567
          result = result.replace(/[()]/g, '');
          // replace library delimiter with user customized delimiter
          result = result.replace(/[\s-]/g, owner.delimiter);

          return result;
      }
  };

  var PhoneFormatter_1 = PhoneFormatter;

  var CreditCardDetector = {
      blocks: {
          uatp:          [4, 5, 6],
          amex:          [4, 6, 5],
          diners:        [4, 6, 4],
          discover:      [4, 4, 4, 4],
          mastercard:    [4, 4, 4, 4],
          dankort:       [4, 4, 4, 4],
          instapayment:  [4, 4, 4, 4],
          jcb15:         [4, 6, 5],
          jcb:           [4, 4, 4, 4],
          maestro:       [4, 4, 4, 4],
          visa:          [4, 4, 4, 4],
          mir:           [4, 4, 4, 4],
          unionPay:      [4, 4, 4, 4],
          general:       [4, 4, 4, 4]
      },

      re: {
          // starts with 1; 15 digits, not starts with 1800 (jcb card)
          uatp: /^(?!1800)1\d{0,14}/,

          // starts with 34/37; 15 digits
          amex: /^3[47]\d{0,13}/,

          // starts with 6011/65/644-649; 16 digits
          discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,

          // starts with 300-305/309 or 36/38/39; 14 digits
          diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

          // starts with 51-55/2221–2720; 16 digits
          mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,

          // starts with 5019/4175/4571; 16 digits
          dankort: /^(5019|4175|4571)\d{0,12}/,

          // starts with 637-639; 16 digits
          instapayment: /^63[7-9]\d{0,13}/,

          // starts with 2131/1800; 15 digits
          jcb15: /^(?:2131|1800)\d{0,11}/,

          // starts with 2131/1800/35; 16 digits
          jcb: /^(?:35\d{0,2})\d{0,12}/,

          // starts with 50/56-58/6304/67; 16 digits
          maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,

          // starts with 22; 16 digits
          mir: /^220[0-4]\d{0,12}/,

          // starts with 4; 16 digits
          visa: /^4\d{0,15}/,

          // starts with 62; 16 digits
          unionPay: /^62\d{0,14}/
      },

      getStrictBlocks: function (block) {
        var total = block.reduce(function (prev, current) {
          return prev + current;
        }, 0);

        return block.concat(19 - total);
      },

      getInfo: function (value, strictMode) {
          var blocks = CreditCardDetector.blocks,
              re = CreditCardDetector.re;

          // Some credit card can have up to 19 digits number.
          // Set strictMode to true will remove the 16 max-length restrain,
          // however, I never found any website validate card number like
          // this, hence probably you don't want to enable this option.
          strictMode = !!strictMode;

          for (var key in re) {
              if (re[key].test(value)) {
                  var matchedBlocks = blocks[key];
                  return {
                      type: key,
                      blocks: strictMode ? this.getStrictBlocks(matchedBlocks) : matchedBlocks
                  };
              }
          }

          return {
              type: 'unknown',
              blocks: strictMode ? this.getStrictBlocks(blocks.general) : blocks.general
          };
      }
  };

  var CreditCardDetector_1 = CreditCardDetector;

  var Util = {
      noop: function () {
      },

      strip: function (value, re) {
          return value.replace(re, '');
      },

      getPostDelimiter: function (value, delimiter, delimiters) {
          // single delimiter
          if (delimiters.length === 0) {
              return value.slice(-delimiter.length) === delimiter ? delimiter : '';
          }

          // multiple delimiters
          var matchedDelimiter = '';
          delimiters.forEach(function (current) {
              if (value.slice(-current.length) === current) {
                  matchedDelimiter = current;
              }
          });

          return matchedDelimiter;
      },

      getDelimiterREByDelimiter: function (delimiter) {
          return new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
      },

      getNextCursorPosition: function (prevPos, oldValue, newValue, delimiter, delimiters) {
        // If cursor was at the end of value, just place it back.
        // Because new value could contain additional chars.
        if (oldValue.length === prevPos) {
            return newValue.length;
        }

        return prevPos + this.getPositionOffset(prevPos, oldValue, newValue, delimiter ,delimiters);
      },

      getPositionOffset: function (prevPos, oldValue, newValue, delimiter, delimiters) {
          var oldRawValue, newRawValue, lengthOffset;

          oldRawValue = this.stripDelimiters(oldValue.slice(0, prevPos), delimiter, delimiters);
          newRawValue = this.stripDelimiters(newValue.slice(0, prevPos), delimiter, delimiters);
          lengthOffset = oldRawValue.length - newRawValue.length;

          return (lengthOffset !== 0) ? (lengthOffset / Math.abs(lengthOffset)) : 0;
      },

      stripDelimiters: function (value, delimiter, delimiters) {
          var owner = this;

          // single delimiter
          if (delimiters.length === 0) {
              var delimiterRE = delimiter ? owner.getDelimiterREByDelimiter(delimiter) : '';

              return value.replace(delimiterRE, '');
          }

          // multiple delimiters
          delimiters.forEach(function (current) {
              current.split('').forEach(function (letter) {
                  value = value.replace(owner.getDelimiterREByDelimiter(letter), '');
              });
          });

          return value;
      },

      headStr: function (str, length) {
          return str.slice(0, length);
      },

      getMaxLength: function (blocks) {
          return blocks.reduce(function (previous, current) {
              return previous + current;
          }, 0);
      },

      // strip prefix
      // Before type  |   After type    |     Return value
      // PEFIX-...    |   PEFIX-...     |     ''
      // PREFIX-123   |   PEFIX-123     |     123
      // PREFIX-123   |   PREFIX-23     |     23
      // PREFIX-123   |   PREFIX-1234   |     1234
      getPrefixStrippedValue: function (value, prefix, prefixLength, prevResult, delimiter, delimiters, noImmediatePrefix) {
          // No prefix
          if (prefixLength === 0) {
            return value;
          }

          // Pre result prefix string does not match pre-defined prefix
          if (prevResult.slice(0, prefixLength) !== prefix) {
            // Check if the first time user entered something
            if (noImmediatePrefix && !prevResult && value) { return value; }

            return '';
          }

          var prevValue = this.stripDelimiters(prevResult, delimiter, delimiters);

          // New value has issue, someone typed in between prefix letters
          // Revert to pre value
          if (value.slice(0, prefixLength) !== prefix) {
            return prevValue.slice(prefixLength);
          }

          // No issue, strip prefix for new value
          return value.slice(prefixLength);
      },

      getFirstDiffIndex: function (prev, current) {
          var index = 0;

          while (prev.charAt(index) === current.charAt(index)) {
              if (prev.charAt(index++) === '') {
                  return -1;
              }
          }

          return index;
      },

      getFormattedValue: function (value, blocks, blocksLength, delimiter, delimiters, delimiterLazyShow) {
          var result = '',
              multipleDelimiters = delimiters.length > 0,
              currentDelimiter;

          // no options, normal input
          if (blocksLength === 0) {
              return value;
          }

          blocks.forEach(function (length, index) {
              if (value.length > 0) {
                  var sub = value.slice(0, length),
                      rest = value.slice(length);

                  if (multipleDelimiters) {
                      currentDelimiter = delimiters[delimiterLazyShow ? (index - 1) : index] || currentDelimiter;
                  } else {
                      currentDelimiter = delimiter;
                  }

                  if (delimiterLazyShow) {
                      if (index > 0) {
                          result += currentDelimiter;
                      }

                      result += sub;
                  } else {
                      result += sub;

                      if (sub.length === length && index < blocksLength - 1) {
                          result += currentDelimiter;
                      }
                  }

                  // update remaining string
                  value = rest;
              }
          });

          return result;
      },

      // move cursor to the end
      // the first time user focuses on an input with prefix
      fixPrefixCursor: function (el, prefix, delimiter, delimiters) {
          if (!el) {
              return;
          }

          var val = el.value,
              appendix = delimiter || (delimiters[0] || ' ');

          if (!el.setSelectionRange || !prefix || (prefix.length + appendix.length) < val.length) {
              return;
          }

          var len = val.length * 2;

          // set timeout to avoid blink
          setTimeout(function () {
              el.setSelectionRange(len, len);
          }, 1);
      },

      // Check if input field is fully selected
      checkFullSelection: function(value) {
        try {
          var selection = window.getSelection() || document.getSelection() || {};
          return selection.toString().length === value.length;
        } catch (ex) {
          // Ignore
        }

        return false;
      },

      setSelection: function (element, position, doc) {
          if (element !== this.getActiveElement(doc)) {
              return;
          }

          // cursor is already in the end
          if (element && element.value.length <= position) {
            return;
          }

          if (element.createTextRange) {
              var range = element.createTextRange();

              range.move('character', position);
              range.select();
          } else {
              try {
                  element.setSelectionRange(position, position);
              } catch (e) {
                  // eslint-disable-next-line
                  console.warn('The input element type does not support selection');
              }
          }
      },

      getActiveElement: function(parent) {
          var activeElement = parent.activeElement;
          if (activeElement && activeElement.shadowRoot) {
              return this.getActiveElement(activeElement.shadowRoot);
          }
          return activeElement;
      },

      isAndroid: function () {
          return navigator && /android/i.test(navigator.userAgent);
      },

      // On Android chrome, the keyup and keydown events
      // always return key code 229 as a composition that
      // buffers the user’s keystrokes
      // see https://github.com/nosir/cleave.js/issues/147
      isAndroidBackspaceKeydown: function (lastInputValue, currentInputValue) {
          if (!this.isAndroid() || !lastInputValue || !currentInputValue) {
              return false;
          }

          return currentInputValue === lastInputValue.slice(0, -1);
      }
  };

  var Util_1 = Util;

  /**
   * Props Assignment
   *
   * Separate this, so react module can share the usage
   */
  var DefaultProperties = {
      // Maybe change to object-assign
      // for now just keep it as simple
      assign: function (target, opts) {
          target = target || {};
          opts = opts || {};

          // credit card
          target.creditCard = !!opts.creditCard;
          target.creditCardStrictMode = !!opts.creditCardStrictMode;
          target.creditCardType = '';
          target.onCreditCardTypeChanged = opts.onCreditCardTypeChanged || (function () {});

          // phone
          target.phone = !!opts.phone;
          target.phoneRegionCode = opts.phoneRegionCode || 'AU';
          target.phoneFormatter = {};

          // time
          target.time = !!opts.time;
          target.timePattern = opts.timePattern || ['h', 'm', 's'];
          target.timeFormat = opts.timeFormat || '24';
          target.timeFormatter = {};

          // date
          target.date = !!opts.date;
          target.datePattern = opts.datePattern || ['d', 'm', 'Y'];
          target.dateMin = opts.dateMin || '';
          target.dateMax = opts.dateMax || '';
          target.dateFormatter = {};

          // numeral
          target.numeral = !!opts.numeral;
          target.numeralIntegerScale = opts.numeralIntegerScale > 0 ? opts.numeralIntegerScale : 0;
          target.numeralDecimalScale = opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : 2;
          target.numeralDecimalMark = opts.numeralDecimalMark || '.';
          target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';
          target.numeralPositiveOnly = !!opts.numeralPositiveOnly;
          target.stripLeadingZeroes = opts.stripLeadingZeroes !== false;
          target.signBeforePrefix = !!opts.signBeforePrefix;

          // others
          target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

          target.uppercase = !!opts.uppercase;
          target.lowercase = !!opts.lowercase;

          target.prefix = (target.creditCard || target.date) ? '' : (opts.prefix || '');
          target.noImmediatePrefix = !!opts.noImmediatePrefix;
          target.prefixLength = target.prefix.length;
          target.rawValueTrimPrefix = !!opts.rawValueTrimPrefix;
          target.copyDelimiter = !!opts.copyDelimiter;

          target.initValue = (opts.initValue !== undefined && opts.initValue !== null) ? opts.initValue.toString() : '';

          target.delimiter =
              (opts.delimiter || opts.delimiter === '') ? opts.delimiter :
                  (opts.date ? '/' :
                      (opts.time ? ':' :
                          (opts.numeral ? ',' :
                              (opts.phone ? ' ' :
                                  ' '))));
          target.delimiterLength = target.delimiter.length;
          target.delimiterLazyShow = !!opts.delimiterLazyShow;
          target.delimiters = opts.delimiters || [];

          target.blocks = opts.blocks || [];
          target.blocksLength = target.blocks.length;

          target.root = (typeof commonjsGlobal === 'object' && commonjsGlobal) ? commonjsGlobal : window;
          target.document = opts.document || target.root.document;

          target.maxLength = 0;

          target.backspace = false;
          target.result = '';

          target.onValueChanged = opts.onValueChanged || (function () {});

          return target;
      }
  };

  var DefaultProperties_1 = DefaultProperties;

  /**
   * Construct a new Cleave instance by passing the configuration object
   *
   * @param {String | HTMLElement} element
   * @param {Object} opts
   */
  var Cleave = function (element, opts) {
      var owner = this;
      var hasMultipleElements = false;

      if (typeof element === 'string') {
          owner.element = document.querySelector(element);
          hasMultipleElements = document.querySelectorAll(element).length > 1;
      } else {
        if (typeof element.length !== 'undefined' && element.length > 0) {
          owner.element = element[0];
          hasMultipleElements = element.length > 1;
        } else {
          owner.element = element;
        }
      }

      if (!owner.element) {
          throw new Error('[cleave.js] Please check the element');
      }

      if (hasMultipleElements) {
        try {
          // eslint-disable-next-line
          console.warn('[cleave.js] Multiple input fields matched, cleave.js will only take the first one.');
        } catch (e) {
          // Old IE
        }
      }

      opts.initValue = owner.element.value;

      owner.properties = Cleave.DefaultProperties.assign({}, opts);

      owner.init();
  };

  Cleave.prototype = {
      init: function () {
          var owner = this, pps = owner.properties;

          // no need to use this lib
          if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.time && !pps.date && (pps.blocksLength === 0 && !pps.prefix)) {
              owner.onInput(pps.initValue);

              return;
          }

          pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);

          owner.isAndroid = Cleave.Util.isAndroid();
          owner.lastInputValue = '';

          owner.onChangeListener = owner.onChange.bind(owner);
          owner.onKeyDownListener = owner.onKeyDown.bind(owner);
          owner.onFocusListener = owner.onFocus.bind(owner);
          owner.onCutListener = owner.onCut.bind(owner);
          owner.onCopyListener = owner.onCopy.bind(owner);

          owner.element.addEventListener('input', owner.onChangeListener);
          owner.element.addEventListener('keydown', owner.onKeyDownListener);
          owner.element.addEventListener('focus', owner.onFocusListener);
          owner.element.addEventListener('cut', owner.onCutListener);
          owner.element.addEventListener('copy', owner.onCopyListener);


          owner.initPhoneFormatter();
          owner.initDateFormatter();
          owner.initTimeFormatter();
          owner.initNumeralFormatter();

          // avoid touch input field if value is null
          // otherwise Firefox will add red box-shadow for <input required />
          if (pps.initValue || (pps.prefix && !pps.noImmediatePrefix)) {
              owner.onInput(pps.initValue);
          }
      },

      initNumeralFormatter: function () {
          var owner = this, pps = owner.properties;

          if (!pps.numeral) {
              return;
          }

          pps.numeralFormatter = new Cleave.NumeralFormatter(
              pps.numeralDecimalMark,
              pps.numeralIntegerScale,
              pps.numeralDecimalScale,
              pps.numeralThousandsGroupStyle,
              pps.numeralPositiveOnly,
              pps.stripLeadingZeroes,
              pps.prefix,
              pps.signBeforePrefix,
              pps.delimiter
          );
      },

      initTimeFormatter: function() {
          var owner = this, pps = owner.properties;

          if (!pps.time) {
              return;
          }

          pps.timeFormatter = new Cleave.TimeFormatter(pps.timePattern, pps.timeFormat);
          pps.blocks = pps.timeFormatter.getBlocks();
          pps.blocksLength = pps.blocks.length;
          pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
      },

      initDateFormatter: function () {
          var owner = this, pps = owner.properties;

          if (!pps.date) {
              return;
          }

          pps.dateFormatter = new Cleave.DateFormatter(pps.datePattern, pps.dateMin, pps.dateMax);
          pps.blocks = pps.dateFormatter.getBlocks();
          pps.blocksLength = pps.blocks.length;
          pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
      },

      initPhoneFormatter: function () {
          var owner = this, pps = owner.properties;

          if (!pps.phone) {
              return;
          }

          // Cleave.AsYouTypeFormatter should be provided by
          // external google closure lib
          try {
              pps.phoneFormatter = new Cleave.PhoneFormatter(
                  new pps.root.Cleave.AsYouTypeFormatter(pps.phoneRegionCode),
                  pps.delimiter
              );
          } catch (ex) {
              throw new Error('[cleave.js] Please include phone-type-formatter.{country}.js lib');
          }
      },

      onKeyDown: function (event) {
          var owner = this, pps = owner.properties,
              charCode = event.which || event.keyCode,
              Util = Cleave.Util,
              currentValue = owner.element.value;

          // if we got any charCode === 8, this means, that this device correctly
          // sends backspace keys in event, so we do not need to apply any hacks
          owner.hasBackspaceSupport = owner.hasBackspaceSupport || charCode === 8;
          if (!owner.hasBackspaceSupport
            && Util.isAndroidBackspaceKeydown(owner.lastInputValue, currentValue)
          ) {
              charCode = 8;
          }

          owner.lastInputValue = currentValue;

          // hit backspace when last character is delimiter
          var postDelimiter = Util.getPostDelimiter(currentValue, pps.delimiter, pps.delimiters);
          if (charCode === 8 && postDelimiter) {
              pps.postDelimiterBackspace = postDelimiter;
          } else {
              pps.postDelimiterBackspace = false;
          }
      },

      onChange: function () {
          this.onInput(this.element.value);
      },

      onFocus: function () {
          var owner = this,
              pps = owner.properties;

          Cleave.Util.fixPrefixCursor(owner.element, pps.prefix, pps.delimiter, pps.delimiters);
      },

      onCut: function (e) {
          if (!Cleave.Util.checkFullSelection(this.element.value)) { return; }
          this.copyClipboardData(e);
          this.onInput('');
      },

      onCopy: function (e) {
          if (!Cleave.Util.checkFullSelection(this.element.value)) { return; }
          this.copyClipboardData(e);
      },

      copyClipboardData: function (e) {
          var owner = this,
              pps = owner.properties,
              Util = Cleave.Util,
              inputValue = owner.element.value,
              textToCopy = '';

          if (!pps.copyDelimiter) {
              textToCopy = Util.stripDelimiters(inputValue, pps.delimiter, pps.delimiters);
          } else {
              textToCopy = inputValue;
          }

          try {
              if (e.clipboardData) {
                  e.clipboardData.setData('Text', textToCopy);
              } else {
                  window.clipboardData.setData('Text', textToCopy);
              }

              e.preventDefault();
          } catch (ex) {
              //  empty
          }
      },

      onInput: function (value) {
          var owner = this, pps = owner.properties,
              Util = Cleave.Util;

          // case 1: delete one more character "4"
          // 1234*| -> hit backspace -> 123|
          // case 2: last character is not delimiter which is:
          // 12|34* -> hit backspace -> 1|34*
          // note: no need to apply this for numeral mode
          var postDelimiterAfter = Util.getPostDelimiter(value, pps.delimiter, pps.delimiters);
          if (!pps.numeral && pps.postDelimiterBackspace && !postDelimiterAfter) {
              value = Util.headStr(value, value.length - pps.postDelimiterBackspace.length);
          }

          // phone formatter
          if (pps.phone) {
              if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
                  pps.result = pps.prefix + pps.phoneFormatter.format(value).slice(pps.prefix.length);
              } else {
                  pps.result = pps.phoneFormatter.format(value);
              }
              owner.updateValueState();

              return;
          }

          // numeral formatter
          if (pps.numeral) {
              // Do not show prefix when noImmediatePrefix is specified
              // This mostly because we need to show user the native input placeholder
              if (pps.prefix && pps.noImmediatePrefix && value.length === 0) {
                  pps.result = '';
              } else {
                  pps.result = pps.numeralFormatter.format(value);
              }
              owner.updateValueState();

              return;
          }

          // date
          if (pps.date) {
              value = pps.dateFormatter.getValidatedDate(value);
          }

          // time
          if (pps.time) {
              value = pps.timeFormatter.getValidatedTime(value);
          }

          // strip delimiters
          value = Util.stripDelimiters(value, pps.delimiter, pps.delimiters);

          // strip prefix
          value = Util.getPrefixStrippedValue(
              value, pps.prefix, pps.prefixLength,
              pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix
          );

          // strip non-numeric characters
          value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value;

          // convert case
          value = pps.uppercase ? value.toUpperCase() : value;
          value = pps.lowercase ? value.toLowerCase() : value;

          // prevent from showing prefix when no immediate option enabled with empty input value
          if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
              value = pps.prefix + value;

              // no blocks specified, no need to do formatting
              if (pps.blocksLength === 0) {
                  pps.result = value;
                  owner.updateValueState();

                  return;
              }
          }

          // update credit card props
          if (pps.creditCard) {
              owner.updateCreditCardPropsByValue(value);
          }

          // strip over length characters
          value = Util.headStr(value, pps.maxLength);

          // apply blocks
          pps.result = Util.getFormattedValue(
              value,
              pps.blocks, pps.blocksLength,
              pps.delimiter, pps.delimiters, pps.delimiterLazyShow
          );

          owner.updateValueState();
      },

      updateCreditCardPropsByValue: function (value) {
          var owner = this, pps = owner.properties,
              Util = Cleave.Util,
              creditCardInfo;

          // At least one of the first 4 characters has changed
          if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
              return;
          }

          creditCardInfo = Cleave.CreditCardDetector.getInfo(value, pps.creditCardStrictMode);

          pps.blocks = creditCardInfo.blocks;
          pps.blocksLength = pps.blocks.length;
          pps.maxLength = Util.getMaxLength(pps.blocks);

          // credit card type changed
          if (pps.creditCardType !== creditCardInfo.type) {
              pps.creditCardType = creditCardInfo.type;

              pps.onCreditCardTypeChanged.call(owner, pps.creditCardType);
          }
      },

      updateValueState: function () {
          var owner = this,
              Util = Cleave.Util,
              pps = owner.properties;

          if (!owner.element) {
              return;
          }

          var endPos = owner.element.selectionEnd;
          var oldValue = owner.element.value;
          var newValue = pps.result;

          endPos = Util.getNextCursorPosition(endPos, oldValue, newValue, pps.delimiter, pps.delimiters);

          // fix Android browser type="text" input field
          // cursor not jumping issue
          if (owner.isAndroid) {
              window.setTimeout(function () {
                  owner.element.value = newValue;
                  Util.setSelection(owner.element, endPos, pps.document, false);
                  owner.callOnValueChanged();
              }, 1);

              return;
          }

          owner.element.value = newValue;
          Util.setSelection(owner.element, endPos, pps.document, false);
          owner.callOnValueChanged();
      },

      callOnValueChanged: function () {
          var owner = this,
              pps = owner.properties;

          pps.onValueChanged.call(owner, {
              target: {
                  value: pps.result,
                  rawValue: owner.getRawValue()
              }
          });
      },

      setPhoneRegionCode: function (phoneRegionCode) {
          var owner = this, pps = owner.properties;

          pps.phoneRegionCode = phoneRegionCode;
          owner.initPhoneFormatter();
          owner.onChange();
      },

      setRawValue: function (value) {
          var owner = this, pps = owner.properties;

          value = value !== undefined && value !== null ? value.toString() : '';

          if (pps.numeral) {
              value = value.replace('.', pps.numeralDecimalMark);
          }

          pps.postDelimiterBackspace = false;

          owner.element.value = value;
          owner.onInput(value);
      },

      getRawValue: function () {
          var owner = this,
              pps = owner.properties,
              Util = Cleave.Util,
              rawValue = owner.element.value;

          if (pps.rawValueTrimPrefix) {
              rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters);
          }

          if (pps.numeral) {
              rawValue = pps.numeralFormatter.getRawValue(rawValue);
          } else {
              rawValue = Util.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
          }

          return rawValue;
      },

      getISOFormatDate: function () {
          var owner = this,
              pps = owner.properties;

          return pps.date ? pps.dateFormatter.getISOFormatDate() : '';
      },

      getISOFormatTime: function () {
          var owner = this,
              pps = owner.properties;

          return pps.time ? pps.timeFormatter.getISOFormatTime() : '';
      },

      getFormattedValue: function () {
          return this.element.value;
      },

      destroy: function () {
          var owner = this;

          owner.element.removeEventListener('input', owner.onChangeListener);
          owner.element.removeEventListener('keydown', owner.onKeyDownListener);
          owner.element.removeEventListener('focus', owner.onFocusListener);
          owner.element.removeEventListener('cut', owner.onCutListener);
          owner.element.removeEventListener('copy', owner.onCopyListener);
      },

      toString: function () {
          return '[Cleave Object]';
      }
  };

  Cleave.NumeralFormatter = NumeralFormatter_1;
  Cleave.DateFormatter = DateFormatter_1;
  Cleave.TimeFormatter = TimeFormatter_1;
  Cleave.PhoneFormatter = PhoneFormatter_1;
  Cleave.CreditCardDetector = CreditCardDetector_1;
  Cleave.Util = Util_1;
  Cleave.DefaultProperties = DefaultProperties_1;

  // for angular directive
  ((typeof commonjsGlobal === 'object' && commonjsGlobal) ? commonjsGlobal : window)['Cleave'] = Cleave;

  // CommonJS
  var Cleave_1 = Cleave;

  var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  !function(){function l(l,n){var u=l.split("."),t=Y;u[0]in t||!t.execScript||t.execScript("var "+u[0]);for(var e;u.length&&(e=u.shift());){ u.length||void 0===n?t=t[e]?t[e]:t[e]={}:t[e]=n; }}function n(l,n){function u(){}u.prototype=n.prototype,l.M=n.prototype,l.prototype=new u,l.prototype.constructor=l,l.N=function(l,u,t){
  var arguments$1 = arguments;
  for(var e=Array(arguments.length-2),r=2;r<arguments.length;r++){ e[r-2]=arguments$1[r]; }return n.prototype[u].apply(l,e)};}function u(l,n){null!=l&&this.a.apply(this,arguments);}function t(l){l.b="";}function e(l,n){l.sort(n||r);}function r(l,n){return l>n?1:l<n?-1:0}function i(l){var n,u=[],t=0;for(n in l){ u[t++]=l[n]; }return u}function a(l,n){this.b=l,this.a={};for(var u=0;u<n.length;u++){var t=n[u];this.a[t.b]=t;}}function d(l){return l=i(l.a),e(l,function(l,n){return l.b-n.b}),l}function o(l,n){switch(this.b=l,this.g=!!n.v,this.a=n.c,this.i=n.type,this.h=!1,this.a){case O:case H:case q:case X:case k:case L:case J:this.h=!0;}this.f=n.defaultValue;}function s(){this.a={},this.f=this.j().a,this.b=this.g=null;}function f(l,n){for(var u=d(l.j()),t=0;t<u.length;t++){var e=u[t],r=e.b;if(null!=n.a[r]){l.b&&delete l.b[e.b];var i=11==e.a||10==e.a;if(e.g){ for(var e=p(n,r)||[],a=0;a<e.length;a++){var o=l,s=r,c=i?e[a].clone():e[a];o.a[s]||(o.a[s]=[]),o.a[s].push(c),o.b&&delete o.b[s];} }else { e=p(n,r),i?(i=p(l,r))?f(i,e):m(l,r,e.clone()):m(l,r,e); }}}}function p(l,n){var u=l.a[n];if(null==u){ return null; }if(l.g){if(!(n in l.b)){var t=l.g,e=l.f[n];if(null!=u){ if(e.g){for(var r=[],i=0;i<u.length;i++){ r[i]=t.b(e,u[i]); }u=r;}else { u=t.b(e,u); } }return l.b[n]=u}return l.b[n]}return u}function c(l,n,u){var t=p(l,n);return l.f[n].g?t[u||0]:t}function h(l,n){var u;if(null!=l.a[n]){ u=c(l,n,void 0); }else { l:{if(u=l.f[n],void 0===u.f){var t=u.i;if(t===Boolean){ u.f=!1; }else if(t===Number){ u.f=0; }else {if(t!==String){u=new t;break l}u.f=u.h?"0":"";}}u=u.f;} }return u}function g(l,n){return l.f[n].g?null!=l.a[n]?l.a[n].length:0:null!=l.a[n]?1:0}function m(l,n,u){l.a[n]=u,l.b&&(l.b[n]=u);}function b(l,n){var u,t=[];for(u in n){ 0!=u&&t.push(new o(u,n[u])); }return new a(l,t)}/*

   Protocol Buffer 2 Copyright 2008 Google Inc.
   All other code copyright its respective owners.
   Copyright (C) 2010 The Libphonenumber Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
  */
  function y(){s.call(this);}function v(){s.call(this);}function S(){s.call(this);}function _(){}function w(){}function A(){}/*

   Copyright (C) 2010 The Libphonenumber Authors.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
  */
  function x(){this.a={};}function B(l){return 0==l.length||rl.test(l)}function C(l,n){if(null==n){ return null; }n=n.toUpperCase();var u=l.a[n];if(null==u){if(u=nl[n],null==u){ return null; }u=(new A).a(S.j(),u),l.a[n]=u;}return u}function M(l){return l=ll[l],null==l?"ZZ":l[0]}function N(l){this.H=RegExp(" "),this.C="",this.m=new u,this.w="",this.i=new u,this.u=new u,this.l=!0,this.A=this.o=this.F=!1,this.G=x.b(),this.s=0,this.b=new u,this.B=!1,this.h="",this.a=new u,this.f=[],this.D=l,this.J=this.g=D(this,this.D);}function D(l,n){var u;if(null!=n&&isNaN(n)&&n.toUpperCase()in nl){if(u=C(l.G,n),null==u){ throw Error("Invalid region code: "+n); }u=h(u,10);}else { u=0; }return u=C(l.G,M(u)),null!=u?u:il}function G(l){for(var n=l.f.length,u=0;u<n;++u){var e=l.f[u],r=h(e,1);if(l.w==r){ return !1; }var i;i=l;var a=e,d=h(a,1);if(-1!=d.indexOf("|")){ i=!1; }else {d=d.replace(al,"\\d"),d=d.replace(dl,"\\d"),t(i.m);var o;o=i;var a=h(a,2),s="999999999999999".match(d)[0];s.length<o.a.b.length?o="":(o=s.replace(new RegExp(d,"g"),a),o=o.replace(RegExp("9","g")," ")),0<o.length?(i.m.a(o),i=!0):i=!1;}if(i){ return l.w=r,l.B=sl.test(c(e,4)),l.s=0,!0 }}return l.l=!1}function j(l,n){for(var u=[],t=n.length-3,e=l.f.length,r=0;r<e;++r){var i=l.f[r];0==g(i,3)?u.push(l.f[r]):(i=c(i,3,Math.min(t,g(i,3)-1)),0==n.search(i)&&u.push(l.f[r]));}l.f=u;}function I(l,n){l.i.a(n);var u=n;if(el.test(u)||1==l.i.b.length&&tl.test(u)){var e,u=n;"+"==u?(e=u,l.u.a(u)):(e=ul[u],l.u.a(e),l.a.a(e)),n=e;}else { l.l=!1,l.F=!0; }if(!l.l){if(!l.F){ if(F(l)){if(U(l)){ return V(l) }}else if(0<l.h.length&&(u=l.a.toString(),t(l.a),l.a.a(l.h),l.a.a(u),u=l.b.toString(),e=u.lastIndexOf(l.h),t(l.b),l.b.a(u.substring(0,e))),l.h!=P(l)){ return l.b.a(" "),V(l); } }return l.i.toString()}switch(l.u.b.length){case 0:case 1:case 2:return l.i.toString();case 3:if(!F(l)){ return l.h=P(l),E(l); }l.A=!0;default:return l.A?(U(l)&&(l.A=!1),l.b.toString()+l.a.toString()):0<l.f.length?(u=K(l,n),e=$(l),0<e.length?e:(j(l,l.a.toString()),G(l)?T(l):l.l?R(l,u):l.i.toString())):E(l)}}function V(l){return l.l=!0,l.A=!1,l.f=[],l.s=0,t(l.m),l.w="",E(l)}function $(l){for(var n=l.a.toString(),u=l.f.length,t=0;t<u;++t){var e=l.f[t],r=h(e,1);if(new RegExp("^(?:"+r+")$").test(n)){ return l.B=sl.test(c(e,4)),n=n.replace(new RegExp(r,"g"),c(e,2)),R(l,n) }}return ""}function R(l,n){var u=l.b.b.length;return l.B&&0<u&&" "!=l.b.toString().charAt(u-1)?l.b+" "+n:l.b+n}function E(l){var n=l.a.toString();if(3<=n.length){for(var u=l.o&&0==l.h.length&&0<g(l.g,20)?p(l.g,20)||[]:p(l.g,19)||[],t=u.length,e=0;e<t;++e){var r=u[e];0<l.h.length&&B(h(r,4))&&!c(r,6)&&null==r.a[5]||(0!=l.h.length||l.o||B(h(r,4))||c(r,6))&&ol.test(h(r,2))&&l.f.push(r);}return j(l,n),n=$(l),0<n.length?n:G(l)?T(l):l.i.toString()}return R(l,n)}function T(l){var n=l.a.toString(),u=n.length;if(0<u){for(var t="",e=0;e<u;e++){ t=K(l,n.charAt(e)); }return l.l?R(l,t):l.i.toString()}return l.b.toString()}function P(l){var n,u=l.a.toString(),e=0;return 1!=c(l.g,10)?n=!1:(n=l.a.toString(),n="1"==n.charAt(0)&&"0"!=n.charAt(1)&&"1"!=n.charAt(1)),n?(e=1,l.b.a("1").a(" "),l.o=!0):null!=l.g.a[15]&&(n=new RegExp("^(?:"+c(l.g,15)+")"),n=u.match(n),null!=n&&null!=n[0]&&0<n[0].length&&(l.o=!0,e=n[0].length,l.b.a(u.substring(0,e)))),t(l.a),l.a.a(u.substring(e)),u.substring(0,e)}function F(l){var n=l.u.toString(),u=new RegExp("^(?:\\+|"+c(l.g,11)+")"),u=n.match(u);return null!=u&&null!=u[0]&&0<u[0].length&&(l.o=!0,u=u[0].length,t(l.a),l.a.a(n.substring(u)),t(l.b),l.b.a(n.substring(0,u)),"+"!=n.charAt(0)&&l.b.a(" "),!0)}function U(l){if(0==l.a.b.length){ return !1; }var n,e=new u;l:{if(n=l.a.toString(),0!=n.length&&"0"!=n.charAt(0)){ for(var r,i=n.length,a=1;3>=a&&a<=i;++a){ if(r=parseInt(n.substring(0,a),10),r in ll){e.a(n.substring(a)),n=r;break l} } }n=0;}return 0!=n&&(t(l.a),l.a.a(e.toString()),e=M(n),"001"==e?l.g=C(l.G,""+n):e!=l.D&&(l.g=D(l,e)),l.b.a(""+n).a(" "),l.h="",!0)}function K(l,n){var u=l.m.toString();if(0<=u.substring(l.s).search(l.H)){var e=u.search(l.H),u=u.replace(l.H,n);return t(l.m),l.m.a(u),l.s=e,u.substring(0,l.s+1)}return 1==l.f.length&&(l.l=!1),l.w="",l.i.toString()}var Y=this;u.prototype.b="",u.prototype.set=function(l){this.b=""+l;},u.prototype.a=function(l,n,u){
  var arguments$1 = arguments;
  if(this.b+=String(l),null!=n){ for(var t=1;t<arguments.length;t++){ this.b+=arguments$1[t]; } }return this},u.prototype.toString=function(){return this.b};var J=1,L=2,O=3,H=4,q=6,X=16,k=18;s.prototype.set=function(l,n){m(this,l.b,n);},s.prototype.clone=function(){var l=new this.constructor;return l!=this&&(l.a={},l.b&&(l.b={}),f(l,this)),l},n(y,s);var Z=null;n(v,s);var z=null;n(S,s);var Q=null;y.prototype.j=function(){var l=Z;return l||(Z=l=b(y,{0:{name:"NumberFormat",I:"i18n.phonenumbers.NumberFormat"},1:{name:"pattern",required:!0,c:9,type:String},2:{name:"format",required:!0,c:9,type:String},3:{name:"leading_digits_pattern",v:!0,c:9,type:String},4:{name:"national_prefix_formatting_rule",c:9,type:String},6:{name:"national_prefix_optional_when_formatting",c:8,defaultValue:!1,type:Boolean},5:{name:"domestic_carrier_code_formatting_rule",c:9,type:String}})),l},y.j=y.prototype.j,v.prototype.j=function(){var l=z;return l||(z=l=b(v,{0:{name:"PhoneNumberDesc",I:"i18n.phonenumbers.PhoneNumberDesc"},2:{name:"national_number_pattern",c:9,type:String},9:{name:"possible_length",v:!0,c:5,type:Number},10:{name:"possible_length_local_only",v:!0,c:5,type:Number},6:{name:"example_number",c:9,type:String}})),l},v.j=v.prototype.j,S.prototype.j=function(){var l=Q;return l||(Q=l=b(S,{0:{name:"PhoneMetadata",I:"i18n.phonenumbers.PhoneMetadata"},1:{name:"general_desc",c:11,type:v},2:{name:"fixed_line",c:11,type:v},3:{name:"mobile",c:11,type:v},4:{name:"toll_free",c:11,type:v},5:{name:"premium_rate",c:11,type:v},6:{name:"shared_cost",c:11,type:v},7:{name:"personal_number",c:11,type:v},8:{name:"voip",c:11,type:v},21:{name:"pager",c:11,type:v},25:{name:"uan",c:11,type:v},27:{name:"emergency",c:11,type:v},28:{name:"voicemail",c:11,type:v},29:{name:"short_code",c:11,type:v},30:{name:"standard_rate",c:11,type:v},31:{name:"carrier_specific",c:11,type:v},33:{name:"sms_services",c:11,type:v},24:{name:"no_international_dialling",c:11,type:v},9:{name:"id",required:!0,c:9,type:String},10:{name:"country_code",c:5,type:Number},11:{name:"international_prefix",c:9,type:String},17:{name:"preferred_international_prefix",c:9,type:String},12:{name:"national_prefix",c:9,type:String},13:{name:"preferred_extn_prefix",c:9,type:String},15:{name:"national_prefix_for_parsing",c:9,type:String},16:{name:"national_prefix_transform_rule",c:9,type:String},18:{name:"same_mobile_and_fixed_line_pattern",c:8,defaultValue:!1,type:Boolean},19:{name:"number_format",v:!0,c:11,type:y},20:{name:"intl_number_format",v:!0,c:11,type:y},22:{name:"main_country_for_code",c:8,defaultValue:!1,type:Boolean},23:{name:"leading_digits",c:9,type:String},26:{name:"leading_zero_possible",c:8,defaultValue:!1,type:Boolean}})),l},S.j=S.prototype.j,_.prototype.a=function(l){throw new l.b,Error("Unimplemented")},_.prototype.b=function(l,n){if(11==l.a||10==l.a){ return n instanceof s?n:this.a(l.i.prototype.j(),n); }if(14==l.a){if("string"==typeof n&&W.test(n)){var u=Number(n);if(0<u){ return u }}return n}if(!l.h){ return n; }if(u=l.i,u===String){if("number"==typeof n){ return String(n) }}else if(u===Number&&"string"==typeof n&&("Infinity"===n||"-Infinity"===n||"NaN"===n||W.test(n))){ return Number(n); }return n};var W=/^-?[0-9]+$/;n(w,_),w.prototype.a=function(l,n){var u=new l.b;return u.g=this,u.a=n,u.b={},u},n(A,w),A.prototype.b=function(l,n){return 8==l.a?!!n:_.prototype.b.apply(this,arguments)},A.prototype.a=function(l,n){return A.M.a.call(this,l,n)};/*

   Copyright (C) 2010 The Libphonenumber Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
  */
  var ll={1:"US AG AI AS BB BM BS CA DM DO GD GU JM KN KY LC MP MS PR SX TC TT VC VG VI".split(" ")},nl={AG:[null,[null,null,"(?:268|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"268(?:4(?:6[0-38]|84)|56[0-2])\\d{4}",null,null,null,"2684601234",null,null,null,[7]],[null,null,"268(?:464|7(?:1[3-9]|2\\d|3[246]|64|[78][0-689]))\\d{4}",null,null,null,"2684641234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"26848[01]\\d{4}",null,null,null,"2684801234",null,null,null,[7]],"AG",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,"26840[69]\\d{4}",null,null,null,"2684061234",null,null,null,[7]],null,"268",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],AI:[null,[null,null,"(?:264|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"2644(?:6[12]|9[78])\\d{4}",null,null,null,"2644612345",null,null,null,[7]],[null,null,"264(?:235|476|5(?:3[6-9]|8[1-4])|7(?:29|72))\\d{4}",null,null,null,"2642351234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"AI",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"264",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],AS:[null,[null,null,"(?:[58]\\d\\d|684|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"6846(?:22|33|44|55|77|88|9[19])\\d{4}",null,null,null,"6846221234",null,null,null,[7]],[null,null,"684(?:2(?:5[2468]|72)|7(?:3[13]|70))\\d{4}",null,null,null,"6847331234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"AS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"684",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BB:[null,[null,null,"(?:246|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"246(?:2(?:2[78]|7[0-4])|4(?:1[024-6]|2\\d|3[2-9])|5(?:20|[34]\\d|54|7[1-3])|6(?:2\\d|38)|7[35]7|9(?:1[89]|63))\\d{4}",null,null,null,"2464123456",null,null,null,[7]],[null,null,"246(?:2(?:[356]\\d|4[0-57-9]|8[0-79])|45\\d|69[5-7]|8(?:[2-5]\\d|83))\\d{4}",null,null,null,"2462501234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"(?:246976|900[2-9]\\d\\d)\\d{4}",null,null,null,"9002123456",null,null,null,[7]],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"24631\\d{5}",null,null,null,"2463101234",null,null,null,[7]],"BB",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"246",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"246(?:292|367|4(?:1[7-9]|3[01]|44|67)|7(?:36|53))\\d{4}",null,null,null,"2464301234",null,null,null,[7]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BM:[null,[null,null,"(?:441|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"441(?:2(?:02|23|[3479]\\d|61)|[46]\\d\\d|5(?:4\\d|60|89)|824)\\d{4}",null,null,null,"4412345678",null,null,null,[7]],[null,null,"441(?:[37]\\d|5[0-39])\\d{5}",null,null,null,"4413701234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"BM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"441",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BS:[null,[null,null,"(?:242|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"242(?:3(?:02|[236][1-9]|4[0-24-9]|5[0-68]|7[347]|8[0-4]|9[2-467])|461|502|6(?:0[1-4]|12|2[013]|[45]0|7[67]|8[78]|9[89])|7(?:02|88))\\d{4}",null,null,null,"2423456789",null,null,null,[7]],[null,null,"242(?:3(?:5[79]|7[56]|95)|4(?:[23][1-9]|4[1-35-9]|5[1-8]|6[2-8]|7\\d|81)|5(?:2[45]|3[35]|44|5[1-46-9]|65|77)|6[34]6|7(?:27|38)|8(?:0[1-9]|1[02-9]|2\\d|[89]9))\\d{4}",null,null,null,"2423591234",null,null,null,[7]],[null,null,"(?:242300|8(?:00|33|44|55|66|77|88)[2-9]\\d\\d)\\d{4}",null,null,null,"8002123456",null,null,null,[7]],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"BS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"242",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"242225[0-46-9]\\d{3}",null,null,null,"2422250123"],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],CA:[null,[null,null,"(?:[2-8]\\d|90)\\d{8}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|65)|4(?:03|1[68]|3[178]|50)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",null,null,null,"5062345678",null,null,null,[7]],[null,null,"(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|65)|4(?:03|1[68]|3[178]|50)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",null,null,null,"5062345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"(?:5(?:00|2[12]|33|44|66|77|88)|622)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"600[2-9]\\d{6}",null,null,null,"6002012345"],"CA",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],DM:[null,[null,null,"(?:[58]\\d\\d|767|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"767(?:2(?:55|66)|4(?:2[01]|4[0-25-9])|50[0-4]|70[1-3])\\d{4}",null,null,null,"7674201234",null,null,null,[7]],[null,null,"767(?:2(?:[2-4689]5|7[5-7])|31[5-7]|61[1-7])\\d{4}",null,null,null,"7672251234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"DM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"767",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],DO:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"8(?:[04]9[2-9]\\d\\d|29(?:2(?:[0-59]\\d|6[04-9]|7[0-27]|8[0237-9])|3(?:[0-35-9]\\d|4[7-9])|[45]\\d\\d|6(?:[0-27-9]\\d|[3-5][1-9]|6[0135-8])|7(?:0[013-9]|[1-37]\\d|4[1-35689]|5[1-4689]|6[1-57-9]|8[1-79]|9[1-8])|8(?:0[146-9]|1[0-48]|[248]\\d|3[1-79]|5[01589]|6[013-68]|7[124-8]|9[0-8])|9(?:[0-24]\\d|3[02-46-9]|5[0-79]|60|7[0169]|8[57-9]|9[02-9])))\\d{4}",null,null,null,"8092345678",null,null,null,[7]],[null,null,"8[024]9[2-9]\\d{6}",null,null,null,"8092345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"DO",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"8[024]9",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],GD:[null,[null,null,"(?:473|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"473(?:2(?:3[0-2]|69)|3(?:2[89]|86)|4(?:[06]8|3[5-9]|4[0-49]|5[5-79]|73|90)|63[68]|7(?:58|84)|800|938)\\d{4}",null,null,null,"4732691234",null,null,null,[7]],[null,null,"473(?:4(?:0[2-79]|1[04-9]|2[0-5]|58)|5(?:2[01]|3[3-8])|901)\\d{4}",null,null,null,"4734031234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"GD",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"473",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],GU:[null,[null,null,"(?:[58]\\d\\d|671|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",null,null,null,"6713001234",null,null,null,[7]],[null,null,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",null,null,null,"6713001234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"GU",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"671",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],JM:[null,[null,null,"(?:[58]\\d\\d|658|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:658[2-9]\\d\\d|876(?:5(?:0[12]|1[0-468]|2[35]|63)|6(?:0[1-3579]|1[0237-9]|[23]\\d|40|5[06]|6[2-589]|7[05]|8[04]|9[4-9])|7(?:0[2-689]|[1-6]\\d|8[056]|9[45])|9(?:0[1-8]|1[02378]|[2-8]\\d|9[2-468])))\\d{4}",null,null,null,"8765230123",null,null,null,[7]],[null,null,"876(?:(?:2[14-9]|[348]\\d)\\d|5(?:0[3-9]|[2-57-9]\\d|6[0-24-9])|7(?:0[07]|7\\d|8[1-47-9]|9[0-36-9])|9(?:[01]9|9[0579]))\\d{4}",null,null,null,"8762101234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"JM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"658|876",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],KN:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"869(?:2(?:29|36)|302|4(?:6[015-9]|70))\\d{4}",null,null,null,"8692361234",null,null,null,[7]],[null,null,"869(?:5(?:5[6-8]|6[5-7])|66\\d|76[02-7])\\d{4}",null,null,null,"8697652917",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"KN",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"869",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],KY:[null,[null,null,"(?:345|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"345(?:2(?:22|44)|444|6(?:23|38|40)|7(?:4[35-79]|6[6-9]|77)|8(?:00|1[45]|25|[48]8)|9(?:14|4[035-9]))\\d{4}",null,null,null,"3452221234",null,null,null,[7]],[null,null,"345(?:32[1-9]|5(?:1[67]|2[5-79]|4[6-9]|50|76)|649|9(?:1[67]|2[2-9]|3[689]))\\d{4}",null,null,null,"3453231234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"(?:345976|900[2-9]\\d\\d)\\d{4}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"KY",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,"345849\\d{4}",null,null,null,"3458491234"],null,"345",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],LC:[null,[null,null,"(?:[58]\\d\\d|758|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"758(?:4(?:30|5\\d|6[2-9]|8[0-2])|57[0-2]|638)\\d{4}",null,null,null,"7584305678",null,null,null,[7]],[null,null,"758(?:28[4-7]|384|4(?:6[01]|8[4-9])|5(?:1[89]|20|84)|7(?:1[2-9]|2\\d|3[01]))\\d{4}",null,null,null,"7582845678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"LC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"758",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],MP:[null,[null,null,"(?:[58]\\d\\d|(?:67|90)0)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"670(?:2(?:3[3-7]|56|8[5-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",null,null,null,"6702345678",null,null,null,[7]],[null,null,"670(?:2(?:3[3-7]|56|8[5-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",null,null,null,"6702345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"MP",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"670",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],MS:[null,[null,null,"(?:(?:[58]\\d\\d|900)\\d\\d|66449)\\d{5}",null,null,null,null,null,null,[10],[7]],[null,null,"664491\\d{4}",null,null,null,"6644912345",null,null,null,[7]],[null,null,"66449[2-6]\\d{4}",null,null,null,"6644923456",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"MS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"664",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],PR:[null,[null,null,"(?:[589]\\d\\d|787)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:787|939)[2-9]\\d{6}",null,null,null,"7872345678",null,null,null,[7]],[null,null,"(?:787|939)[2-9]\\d{6}",null,null,null,"7872345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"PR",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"787|939",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],SX:[null,[null,null,"(?:(?:[58]\\d\\d|900)\\d|7215)\\d{6}",null,null,null,null,null,null,[10],[7]],[null,null,"7215(?:4[2-8]|8[239]|9[056])\\d{4}",null,null,null,"7215425678",null,null,null,[7]],[null,null,"7215(?:1[02]|2\\d|5[034679]|8[014-8])\\d{4}",null,null,null,"7215205678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"SX",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"721",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],TC:[null,[null,null,"(?:[58]\\d\\d|649|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"649(?:712|9(?:4\\d|50))\\d{4}",null,null,null,"6497121234",null,null,null,[7]],[null,null,"649(?:2(?:3[129]|4[1-7])|3(?:3[1-389]|4[1-8])|4[34][1-3])\\d{4}",null,null,null,"6492311234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"64971[01]\\d{4}",null,null,null,"6497101234",null,null,null,[7]],"TC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"649",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],TT:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"868(?:2(?:01|[23]\\d)|6(?:0[7-9]|1[02-8]|2[1-9]|[3-69]\\d|7[0-79])|82[124])\\d{4}",null,null,null,"8682211234",null,null,null,[7]],[null,null,"868(?:2(?:6[6-9]|[7-9]\\d)|[37](?:0[1-9]|1[02-9]|[2-9]\\d)|4[6-9]\\d|6(?:20|78|8\\d))\\d{4}",null,null,null,"8682911234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"TT",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"868",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,"868619\\d{4}",null,null,null,"8686191234",null,null,null,[7]]],US:[null,[null,null,"[2-9]\\d{9}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[0-24679]|4[67]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|6[39]|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[017]|6[0-279]|78|8[0-2])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-28]|4[3578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[0179]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",null,null,null,"2015550123",null,null,null,[7]],[null,null,"(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[0-24679]|4[67]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|6[39]|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[017]|6[0-279]|78|8[0-2])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-28]|4[3578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[0179]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",null,null,null,"2015550123",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"US",1,"011","1",null,null,"1",null,null,1,[[null,"(\\d{3})(\\d{4})","$1-$2",["[2-9]"]],[null,"(\\d{3})(\\d{3})(\\d{4})","($1) $2-$3",["[2-9]"],null,null,1]],[[null,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["[2-9]"]]],[null,null,null,null,null,null,null,null,null,[-1]],1,null,[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"710[2-9]\\d{6}",null,null,null,"7102123456"],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VC:[null,[null,null,"(?:[58]\\d\\d|784|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"784(?:266|3(?:6[6-9]|7\\d|8[0-24-6])|4(?:38|5[0-36-8]|8[0-8])|5(?:55|7[0-2]|93)|638|784)\\d{4}",null,null,null,"7842661234",null,null,null,[7]],[null,null,"784(?:4(?:3[0-5]|5[45]|89|9[0-8])|5(?:2[6-9]|3[0-4]))\\d{4}",null,null,null,"7844301234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"784",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VG:[null,[null,null,"(?:284|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"284(?:(?:229|774|8(?:52|6[459]))\\d|4(?:22\\d|9(?:[45]\\d|6[0-5])))\\d{3}",null,null,null,"2842291234",null,null,null,[7]],[null,null,"284(?:(?:3(?:0[0-3]|4[0-7]|68|9[34])|54[0-57])\\d|4(?:(?:4[0-6]|68)\\d|9(?:6[6-9]|9\\d)))\\d{3}",null,null,null,"2843001234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VG",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"284",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VI:[null,[null,null,"(?:(?:34|90)0|[58]\\d\\d)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"340(?:2(?:01|2[06-8]|44|77)|3(?:32|44)|4(?:22|7[34])|5(?:1[34]|55)|6(?:26|4[23]|77|9[023])|7(?:1[2-57-9]|27|7\\d)|884|998)\\d{4}",null,null,null,"3406421234",null,null,null,[7]],[null,null,"340(?:2(?:01|2[06-8]|44|77)|3(?:32|44)|4(?:22|7[34])|5(?:1[34]|55)|6(?:26|4[23]|77|9[023])|7(?:1[2-57-9]|27|7\\d)|884|998)\\d{4}",null,null,null,"3406421234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VI",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"340",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]]};x.b=function(){return x.a?x.a:x.a=new x};var ul={0:"0",1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9","０":"0","１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"},tl=RegExp("[+＋]+"),el=RegExp("([0-9０-９٠-٩۰-۹])"),rl=/^\(?\$1\)?$/,il=new S;m(il,11,"NA");var al=/\[([^\[\]])*\]/g,dl=/\d(?=[^,}][^,}])/g,ol=RegExp("^[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～]*(\\$\\d[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～]*)+$"),sl=/[- ]/;N.prototype.K=function(){this.C="",t(this.i),t(this.u),t(this.m),this.s=0,this.w="",t(this.b),this.h="",t(this.a),this.l=!0,this.A=this.o=this.F=!1,this.f=[],this.B=!1,this.g!=this.J&&(this.g=D(this,this.D));},N.prototype.L=function(l){return this.C=I(this,l)},l("Cleave.AsYouTypeFormatter",N),l("Cleave.AsYouTypeFormatter.prototype.inputDigit",N.prototype.L),l("Cleave.AsYouTypeFormatter.prototype.clear",N.prototype.K);}.call("object"==typeof commonjsGlobal$1&&commonjsGlobal$1?commonjsGlobal$1:window);

  var e=/^(?:submit|button|image|reset|file)$/i,t=/^(?:input|select|textarea|keygen)/i,n=/(\[[^\[\]]*\])/g;function a(e,t,a){if(t.match(n)){ !function e(t,n,a){if(0===n.length){ return a; }var r=n.shift(),i=r.match(/^\[(.+?)\]$/);if("[]"===r){ return t=t||[],Array.isArray(t)?t.push(e(null,n,a)):(t._values=t._values||[],t._values.push(e(null,n,a))),t; }if(i){var l=i[1],u=+l;isNaN(u)?(t=t||{})[l]=e(t[l],n,a):(t=t||[])[u]=e(t[u],n,a);}else { t[r]=e(t[r],n,a); }return t}(e,function(e){var t=[],a=new RegExp(n),r=/^([^\[\]]*)/.exec(e);for(r[1]&&t.push(r[1]);null!==(r=a.exec(e));){ t.push(r[1]); }return t}(t),a); }else {var r=e[t];r?(Array.isArray(r)||(e[t]=[r]),e[t].push(a)):e[t]=a;}return e}function r(e,t,n){return n=(n=String(n)).replace(/(\r)?\n/g,"\r\n"),n=(n=encodeURIComponent(n)).replace(/%20/g,"+"),e+(e?"&":"")+encodeURIComponent(t)+"="+n}function serialize(n,i){"object"!=typeof i?i={hash:!!i}:void 0===i.hash&&(i.hash=!0);for(var l=i.hash?{}:"",u=i.serializer||(i.hash?a:r),s=n&&n.elements?n.elements:[],c=Object.create(null),o=0;o<s.length;++o){var h=s[o];if((i.disabled||!h.disabled)&&h.name&&t.test(h.nodeName)&&!e.test(h.type)){var p=h.name,f=h.value;if("checkbox"!==h.type&&"radio"!==h.type||h.checked||(f=void 0),i.empty){if("checkbox"!==h.type||h.checked||(f=!1),"radio"===h.type&&(c[h.name]||h.checked?h.checked&&(c[h.name]=!0):c[h.name]=!1),null==f&&"radio"==h.type){ continue }}else if(!f){ continue; }if("select-multiple"!==h.type){ l=u(l,p,f); }else {f=[];for(var v=h.options,m=!1,d=0;d<v.length;++d){var y=v[d];y.selected&&(y.value||i.empty&&!y.value)&&(m=!0,l=i.hash&&"[]"!==p.slice(p.length-2)?u(l,p+"[]",y.value):u(l,p,y.value));}!m&&i.empty&&(l=u(l,p,""));}}}if(i.empty){ for(var p in c){ c[p]||(l=u(l,p,"")); } }return l}

  /* eslint-env browser */
  /**
   * This component handles validation and submission for share by email and
   * share by SMS forms.
   * @class
   */

  var ShareForm = function ShareForm(element) {
    var this$1 = this;

    this.element = element;
    /**
     * Setting class variables to our constants
     */

    this.selector = ShareForm.selector;
    this.selectors = ShareForm.selectors;
    this.classes = ShareForm.classes;
    this.strings = ShareForm.strings;
    this.patterns = ShareForm.patterns;
    this.sent = ShareForm.sent;
    /**
     * Set up masking for phone numbers (if this is a texting module)
     */

    this.phone = this.element.querySelector(this.selectors.PHONE);

    if (this.phone) {
      this.cleave = new Cleave_1(this.phone, {
        phone: true,
        phoneRegionCode: 'us',
        delimiter: '-'
      });
      this.phone.setAttribute('pattern', this.patterns.PHONE);
      this.type = 'text';
    } else {
      this.type = 'email';
    }
    /**
     * Configure the validation for the form using the form utility
     */


    this.form = new Forms(this.element.querySelector(this.selectors.FORM));
    this.form.strings = this.strings;
    this.form.selectors = {
      'REQUIRED': this.selectors.REQUIRED,
      'ERROR_MESSAGE_PARENT': this.selectors.FORM
    };
    this.form.FORM.addEventListener('submit', function (event) {
      event.preventDefault();
      if (this$1.form.valid(event) === false) { return false; }
      this$1.sanitize().processing().submit(event).then(function (response) { return response.json(); }).then(function (response) {
        this$1.response(response);
      }).catch(function (data) {
        { console.dir(data); }
      });
    });
    /**
     * Instatiate the ShareForm's toggle component
     */

    this.toggle = new Toggle({
      element: this.element.querySelector(this.selectors.TOGGLE),
      after: function () {
        this$1.element.querySelector(this$1.selectors.INPUT).focus();
      }
    });
    return this;
  };
  /**
   * Serialize and clean any data sent to the server
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.sanitize = function sanitize () {
    // Serialize the data
    this._data = serialize(this.form.FORM, {
      hash: true
    }); // Sanitize the phone number (if there is a phone number)

    if (this.phone && this._data.to) { this._data.to = this._data.to.replace(/[-]/g, ''); }
    return this;
  };
  /**
   * Switch the form to the processing state
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.processing = function processing () {
    // Disable the form
    var inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

    for (var i = 0; i < inputs.length; i++) { inputs[i].setAttribute('disabled', true); }

    var button = this.form.FORM.querySelector(this.selectors.SUBMIT);
    button.setAttribute('disabled', true); // Show processing state

    this.form.FORM.classList.add(this.classes.PROCESSING);
    return this;
  };
  /**
   * POSTs the serialized form data using the Fetch Method
   * @return {Promise} Fetch promise
   */


  ShareForm.prototype.submit = function submit () {
      var this$1 = this;

    // To send the data with the application/x-www-form-urlencoded header
    // we need to use URLSearchParams(); instead of FormData(); which uses
    // multipart/form-data
    var formData = new URLSearchParams();
    Object.keys(this._data).map(function (k) {
      formData.append(k, this$1._data[k]);
    });
    var html = document.querySelector('html');

    if (html.hasAttribute('lang')) {
      formData.append('lang', html.getAttribute('lang'));
    }

    return fetch(this.form.FORM.getAttribute('action'), {
      method: this.form.FORM.getAttribute('method'),
      body: formData
    });
  };
  /**
   * The response handler
   * @param {Object}dataData from the request
   * @return{Object}      The instantiated class
   */


  ShareForm.prototype.response = function response (data) {
    if (data.success) {
      this.success();
    } else {
      if (data.error === 21211) {
        this.feedback('SERVER_TEL_INVALID').enable();
      } else {
        this.feedback('SERVER').enable();
      }
    }

    { console.dir(data); }
    return this;
  };
  /**
   * Queues the success message and adds an event listener to reset the form
   * to it's default state.
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.success = function success () {
      var this$1 = this;

    this.form.FORM.classList.replace(this.classes.PROCESSING, this.classes.SUCCESS);
    this.enable();
    this.form.FORM.addEventListener('input', function () {
      this$1.form.FORM.classList.remove(this$1.classes.SUCCESS);
    }); // Successful messages hook (fn provided to the class upon instatiation)

    if (this.sent) { this.sent(this); }
    return this;
  };
  /**
   * Queues the server error message
   * @param {Object}responseThe error response from the request
   * @return{Object}          The instantiated class
   */


  ShareForm.prototype.error = function error (response) {
    this.feedback('SERVER').enable();
    { console.dir(response); }
    return this;
  };
  /**
   * Adds a div containing the feedback message to the user and toggles the
   * class of the form
   * @param {string}KEYThe key of message paired in messages and classes
   * @return{Object}     The instantiated class
   */


  ShareForm.prototype.feedback = function feedback (KEY) {
    // Create the new error message
    var message = document.createElement('div'); // Set the feedback class and insert text

    message.classList.add(("" + (this.classes[KEY]) + (this.classes.MESSAGE)));
    message.innerHTML = this.strings[KEY]; // Add message to the form and add feedback class

    this.form.FORM.insertBefore(message, this.form.FORM.childNodes[0]);
    this.form.FORM.classList.add(this.classes[KEY]);
    return this;
  };
  /**
   * Enables the ShareForm (after submitting a request)
   * @return{Object}The instantiated class
   */


  ShareForm.prototype.enable = function enable () {
    // Enable the form
    var inputs = this.form.FORM.querySelectorAll(this.selectors.INPUTS);

    for (var i = 0; i < inputs.length; i++) { inputs[i].removeAttribute('disabled'); }

    var button = this.form.FORM.querySelector(this.selectors.SUBMIT);
    button.removeAttribute('disabled'); // Remove the processing class

    this.form.FORM.classList.remove(this.classes.PROCESSING);
    return this;
  };
  /** The main component selector */


  ShareForm.selector = '[data-js="share-form"]';
  /** Selectors within the component */

  ShareForm.selectors = {
    FORM: 'form',
    INPUTS: 'input',
    PHONE: 'input[type="tel"]',
    SUBMIT: 'button[type="submit"]',
    REQUIRED: '[required="true"]',
    TOGGLE: '[data-js*="share-form__control"]',
    INPUT: '[data-js*="share-form__input"]'
  };
  /**
   * CSS classes used by this component.
   * @enum {string}
   */

  ShareForm.classes = {
    ERROR: 'error',
    SERVER: 'error',
    SERVER_TEL_INVALID: 'error',
    MESSAGE: '-message',
    PROCESSING: 'processing',
    SUCCESS: 'success'
  };
  /**
   * Strings used for validation feedback
   */

  ShareForm.strings = {
    SERVER: 'Something went wrong. Please try again later.',
    SERVER_TEL_INVALID: 'Unable to send to number provided. Please use another number.',
    VALID_REQUIRED: 'This is required',
    VALID_EMAIL_INVALID: 'Please enter a valid email.',
    VALID_TEL_INVALID: 'Please provide 10-digit number with area code.'
  };
  /**
   * Input patterns for form input elements
   */

  ShareForm.patterns = {
    PHONE: '[0-9]{3}-[0-9]{3}-[0-9]{4}'
  };
  ShareForm.sent = false;

  /**
   * Uses the Share API to t
   */

  var WebShare = function WebShare() {
    var this$1 = this;

    this.selector = WebShare.selector;
    this.callback = WebShare.callback;

    if (navigator.share) {
      // Remove fallback aria toggling attributes
      document.querySelectorAll(this.selector).forEach(function (item) {
        item.removeAttribute('aria-controls');
        item.removeAttribute('aria-expanded');
      }); // Add event listener for the share click

      document.querySelector('body').addEventListener('click', function (event) {
        if (!event.target.matches(this$1.selector)) { return; }
        this$1.element = event.target;
        this$1.data = JSON.parse(this$1.element.dataset.webShare);
        this$1.share(this$1.data);
      });
    } else {
      // Convert component into a toggle for the fallback
      this.toggle = new Toggle({
        selector: this.selector
      });
    }

    return this;
  };
  /**
   * Web Share API handler
   *
   * @param {Object}dataAn object containing title, url, and text.
   *
   * @return{Promise}     The response of the .share() method.
   */


  WebShare.prototype.share = function share (data) {
      if ( data === void 0 ) data = {};

    return navigator.share(data).then(function (res) {
      WebShare.callback(data);
    }).catch(function (err) {
      {
        console.dir(err);
      }
    });
  };
  /** The html selector for the component */


  WebShare.selector = '[data-js*="web-share"]';
  /** Placeholder callback for a successful send */

  WebShare.callback = function () {
    {
      console.dir('Success!');
    }
  };

  /*! js-cookie v3.0.0-beta.0 | MIT */
  function extend () {
    var arguments$1 = arguments;

    var result = {};
    for (var i = 0; i < arguments.length; i++) {
      var attributes = arguments$1[i];
      for (var key in attributes) {
        result[key] = attributes[key];
      }
    }
    return result
  }

  function decode (s) {
    return s.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  }

  function init (converter) {
    function set (key, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }

      attributes = extend(api.defaults, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      value = converter.write
        ? converter.write(value, key)
        : encodeURIComponent(String(value)).replace(
          /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
          decodeURIComponent
        );

      key = encodeURIComponent(String(key))
        .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);

      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }
        stringifiedAttributes += '; ' + attributeName;
        if (attributes[attributeName] === true) {
          continue
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }

      return (document.cookie = key + '=' + value + stringifiedAttributes)
    }

    function get (key) {
      if (typeof document === 'undefined' || (arguments.length && !key)) {
        return
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var cookie = parts.slice(1).join('=');

        if (cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }

        try {
          var name = decode(parts[0]);
          jar[name] =
            (converter.read || converter)(cookie, name) || decode(cookie);

          if (key === name) {
            break
          }
        } catch (e) {}
      }

      return key ? jar[key] : jar
    }

    var api = {
      defaults: {
        path: '/'
      },
      set: set,
      get: get,
      remove: function (key, attributes) {
        set(
          key,
          '',
          extend(attributes, {
            expires: -1
          })
        );
      },
      withConverter: init
    };

    return api
  }

  var js_cookie = init(function () {});

  /**
   * Alert Banner module
   */

  var AlertBanner = function AlertBanner(element) {
    var this$1 = this;

    this.selector = AlertBanner.selector;
    this.selectors = AlertBanner.selectors;
    this.data = AlertBanner.data;
    this.expires = AlertBanner.expires;
    this.element = element;
    this.name = element.dataset[this.data.NAME];
    this.button = element.querySelector(this.selectors.BUTTON);
    /**
     * Create new Toggle for this alert
     */

    this._toggle = new Toggle({
      selector: this.selectors.BUTTON,
      after: function () {
        if (element.classList.contains(Toggle.inactiveClass)) { js_cookie.set(this$1.name, 'dismissed', {
          expires: this$1.expires
        }); }else if (element.classList.contains(Toggle.activeClass)) { js_cookie.remove(this$1.name); }
      }
    }); // If the cookie is present and the Alert is active, hide it.

    if (js_cookie.get(this.name) && element.classList.contains(Toggle.activeClass)) { this._toggle.elementToggle(this.button, element); }
    return this;
  };
  /**
   * Method to toggle the alert banner
   * @return {Object} Instance of AlertBanner
   */


  AlertBanner.prototype.toggle = function toggle () {
    this._toggle.elementToggle(this.button, this.element);

    return this;
  };
  /** Main selector for the Alert Banner Element */


  AlertBanner.selector = '[data-js*="alert-banner"]';
  /** Other internal selectors */

  AlertBanner.selectors = {
    'BUTTON': '[data-js*="alert-controller"]'
  };
  /** Data attributes set to the pattern */

  AlertBanner.data = {
    'NAME': 'alertName'
  };
  /** Expiration for the cookie. */

  AlertBanner.expires = 360;

  /**
   * The Newsletter module
   * @class
   */

  var Newsletter = function Newsletter(element) {
    var this$1 = this;

    this._el = element;
    this.keys = Newsletter.keys;
    this.endpoints = Newsletter.endpoints;
    this.callback = Newsletter.callback;
    this.selectors = Newsletter.selectors;
    this.selector = Newsletter.selector;
    this.stringKeys = Newsletter.stringKeys;
    this.strings = Newsletter.strings;
    this.templates = Newsletter.templates;
    this.classes = Newsletter.classes; // This sets the script callback function to a global function that
    // can be accessed by the the requested script.

    window[Newsletter.callback] = function (data) {
      this$1._callback(data);
    };

    this.form = new Forms(this._el.querySelector('form'));
    this.form.strings = this.strings;

    this.form.submit = function (event) {
      event.preventDefault();

      this$1._submit(event).then(this$1._onload).catch(this$1._onerror);
    };

    this.form.watch();
    return this;
  };
  /**
   * The form submission method. Requests a script with a callback function
   * to be executed on our page. The callback function will be passed the
   * response as a JSON object (function parameter).
   * @param{Event} event The form submission event
   * @return {Promise}     A promise containing the new script call
   */


  Newsletter.prototype._submit = function _submit (event) {
    event.preventDefault(); // Serialize the data

    this._data = serialize(event.target, {
      hash: true
    }); // Switch the action to post-json. This creates an endpoint for mailchimp
    // that acts as a script that can be loaded onto our page.

    var action = event.target.action.replace(((Newsletter.endpoints.MAIN) + "?"), ((Newsletter.endpoints.MAIN_JSON) + "?")); // Add our params to the action

    action = action + serialize(event.target, {
      serializer: function () {
          var params = [], len = arguments.length;
          while ( len-- ) params[ len ] = arguments[ len ];

        var prev = typeof params[0] === 'string' ? params[0] : '';
        return (prev + "&" + (params[1]) + "=" + (params[2]));
      }
    }); // Append the callback reference. Mailchimp will wrap the JSON response in
    // our callback method. Once we load the script the callback will execute.

    action = action + "&c=window." + (Newsletter.callback); // Create a promise that appends the script response of the post-json method

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


  Newsletter.prototype._onload = function _onload (event) {
    event.path[0].remove();
    return this;
  };
  /**
   * The script on error resolution
   * @param{Object} error The script on error load event
   * @return {Class}      The Newsletter class
   */


  Newsletter.prototype._onerror = function _onerror (error) {
    // eslint-disable-next-line no-console
    { console.dir(error); }
    return this;
  };
  /**
   * The callback function for the MailChimp Script call
   * @param{Object} data The success/error message from MailChimp
   * @return {Class}     The Newsletter class
   */


  Newsletter.prototype._callback = function _callback (data) {
    if (this[("_" + (data[this._key('MC_RESULT')]))]) {
      this[("_" + (data[this._key('MC_RESULT')]))](data.msg);
    } else {
      // eslint-disable-next-line no-console
      { console.dir(data); }
    }

    return this;
  };
  /**
   * Submission error handler
   * @param{string} msg The error message
   * @return {Class}    The Newsletter class
   */


  Newsletter.prototype._error = function _error (msg) {
    this._elementsReset();

    this._messaging('WARNING', msg);

    return this;
  };
  /**
   * Submission success handler
   * @param{string} msg The success message
   * @return {Class}    The Newsletter class
   */


  Newsletter.prototype._success = function _success (msg) {
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


  Newsletter.prototype._messaging = function _messaging (type, msg) {
      if ( msg === void 0 ) msg = 'no message';

    var strings = Object.keys(Newsletter.stringKeys);
    var handled = false;

    var alertBox = this._el.querySelector(Newsletter.selectors[(type + "_BOX")]);

    var alertBoxMsg = alertBox.querySelector(Newsletter.selectors.ALERT_BOX_TEXT); // Get the localized string, these should be written to the DOM already.
    // The utility contains a global method for retrieving them.

    var stringKeys = strings.filter(function (s) { return msg.includes(Newsletter.stringKeys[s]); });
    msg = stringKeys.length ? this.strings[stringKeys[0]] : msg;
    handled = stringKeys.length ? true : false; // Replace string templates with values from either our form data or
    // the Newsletter strings object.

    for (var x = 0; x < Newsletter.templates.length; x++) {
      var template = Newsletter.templates[x];
      var key = template.replace('{{ ', '').replace(' }}', '');
      var value = this._data[key] || this.strings[key];
      var reg = new RegExp(template, 'gi');
      msg = msg.replace(reg, value ? value : '');
    }

    if (handled) {
      alertBoxMsg.innerHTML = msg;
    } else if (type === 'ERROR') {
      alertBoxMsg.innerHTML = this.strings.ERR_PLEASE_TRY_LATER;
    }

    if (alertBox) { this._elementShow(alertBox, alertBoxMsg); }
    return this;
  };
  /**
   * The main toggling method
   * @return {Class}       Newsletter
   */


  Newsletter.prototype._elementsReset = function _elementsReset () {
    var targets = this._el.querySelectorAll(Newsletter.selectors.ALERT_BOXES);

    var loop = function ( i ) {
        if (!targets[i].classList.contains(Newsletter.classes.HIDDEN)) {
      targets[i].classList.add(Newsletter.classes.HIDDEN);
      Newsletter.classes.ANIMATE.split(' ').forEach(function (item) { return targets[i].classList.remove(item); }); // Screen Readers

      targets[i].setAttribute('aria-hidden', 'true');
      targets[i].querySelector(Newsletter.selectors.ALERT_BOX_TEXT).setAttribute('aria-live', 'off');
    }
      };

      for (var i = 0; i < targets.length; i++) loop( i );

    return this;
  };
  /**
   * The main toggling method
   * @param{object} targetMessage container
   * @param{object} content Content that changes dynamically that should
   *                        be announced to screen readers.
   * @return {Class}        Newsletter
   */


  Newsletter.prototype._elementShow = function _elementShow (target, content) {
    target.classList.toggle(Newsletter.classes.HIDDEN);
    Newsletter.classes.ANIMATE.split(' ').forEach(function (item) { return target.classList.toggle(item); }); // Screen Readers

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


  Newsletter.prototype._key = function _key (key) {
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

  Newsletter.stringKeys = {
    SUCCESS_CONFIRM_EMAIL: 'Almost finished...',
    ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
    ERR_TOO_MANY_RECENT: 'too many',
    ERR_ALREADY_SUBSCRIBED: 'is already subscribed',
    ERR_INVALID_EMAIL: 'looks fake or invalid'
  };
  /** @type {Object} Available strings */

  Newsletter.strings = {
    VALID_REQUIRED: 'This field is required.',
    VALID_EMAIL_REQUIRED: 'Email is required.',
    VALID_EMAIL_INVALID: 'Please enter a valid email.',
    VALID_CHECKBOX_BOROUGH: 'Please select a borough.',
    ERR_PLEASE_TRY_LATER: 'There was an error with your submission. ' + 'Please try again later.',
    SUCCESS_CONFIRM_EMAIL: 'Almost finished... We need to confirm your email ' + 'address. To complete the subscription process, ' + 'please click the link in the email we just sent you.',
    ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
    ERR_TOO_MANY_RECENT: 'Recipient "{{ EMAIL }}" has too ' + 'many recent signup requests',
    ERR_ALREADY_SUBSCRIBED: '{{ EMAIL }} is already subscribed ' + 'to list {{ LIST_NAME }}.',
    ERR_INVALID_EMAIL: 'This email address looks fake or invalid. ' + 'Please enter a real email address.',
    LIST_NAME: 'ACCESS NYC - Newsletter'
  };
  /** @type {Array} Placeholders that will be replaced in message strings */

  Newsletter.templates = ['{{ EMAIL }}', '{{ LIST_NAME }}'];
  Newsletter.classes = {
    ANIMATE: 'animated fadeInUp',
    HIDDEN: 'hidden'
  };

  /* eslint-env browser */
  /**
   * This controls the text sizer module at the top of page. A text-size-X class
   * is added to the html root element. X is an integer to indicate the scale of
   * text adjustment with 0 being neutral.
   * @class
   */

  var TextController = function TextController(el) {
    /** @private {HTMLElement} The component element. */
    this.el = el;
    /** @private {Number} The relative scale of text adjustment. */

    this._textSize = 0;
    /** @private {boolean} Whether the textSizer is displayed. */

    this._active = false;
    /** @private {boolean} Whether the map has been initialized. */

    this._initialized = false;
    /** @private {object} The toggle instance for the Text Controller */

    this._toggle = new Toggle({
      selector: TextController.selectors.TOGGLE
    });
    this.init();
    return this;
  };
  /**
   * Attaches event listeners to controller. Checks for textSize cookie and
   * sets the text size class appropriately.
   * @return {this} TextSizer
   */


  TextController.prototype.init = function init () {
      var this$1 = this;

    if (this._initialized) { return this; }
    var btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
    var btnLarger = this.el.querySelector(TextController.selectors.LARGER);
    btnSmaller.addEventListener('click', function (event) {
      event.preventDefault();
      var newSize = this$1._textSize - 1;

      if (newSize >= TextController.min) {
        this$1._adjustSize(newSize);
      }
    });
    btnLarger.addEventListener('click', function (event) {
      event.preventDefault();
      var newSize = this$1._textSize + 1;

      if (newSize <= TextController.max) {
        this$1._adjustSize(newSize);
      }
    }); // If there is a text size cookie, set the textSize variable to the setting.
    // If not, textSize initial setting remains at zero and we toggle on the
    // text sizer/language controls and add a cookie.

    if (js_cookie.get('textSize')) {
      var size = parseInt(js_cookie.get('textSize'), 10);
      this._textSize = size;

      this._adjustSize(size);
    } else {
      var html = document.querySelector('html');
      html.classList.add(("text-size-" + (this._textSize)));
      this.show();

      this._setCookie();
    }

    this._initialized = true;
    return this;
  };
  /**
   * Shows the text sizer controls.
   * @return {this} TextSizer
   */


  TextController.prototype.show = function show () {
    this._active = true; // Retrieve selectors required for the main toggling method

    var el = this.el.querySelector(TextController.selectors.TOGGLE);
    var targetSelector = "#" + (el.getAttribute('aria-controls'));
    var target = this.el.querySelector(targetSelector); // Invoke main toggling method from toggle.js

    this._toggle.elementToggle(el, target);

    return this;
  };
  /**
   * Sets the `textSize` cookie to store the value of this._textSize. Expires
   * in 1 hour (1/24 of a day).
   * @return {this} TextSizer
   */


  TextController.prototype._setCookie = function _setCookie () {
    js_cookie.set('textSize', this._textSize, {
      expires: 1 / 24
    });
    return this;
  };
  /**
   * Sets the text-size-X class on the html root element. Updates the cookie
   * if necessary.
   * @param {Number} size - new size to set.
   * @return {this} TextSizer
   */


  TextController.prototype._adjustSize = function _adjustSize (size) {
    var originalSize = this._textSize;
    var html = document.querySelector('html');

    if (size !== originalSize) {
      this._textSize = size;

      this._setCookie();

      html.classList.remove(("text-size-" + originalSize));
    }

    html.classList.add(("text-size-" + size));

    this._checkForMinMax();

    return this;
  };
  /**
   * Checks the current text size against the min and max. If the limits are
   * reached, disable the controls for going smaller/larger as appropriate.
   * @return {this} TextSizer
   */


  TextController.prototype._checkForMinMax = function _checkForMinMax () {
    var btnSmaller = this.el.querySelector(TextController.selectors.SMALLER);
    var btnLarger = this.el.querySelector(TextController.selectors.LARGER);

    if (this._textSize <= TextController.min) {
      this._textSize = TextController.min;
      btnSmaller.setAttribute('disabled', '');
    } else { btnSmaller.removeAttribute('disabled'); }

    if (this._textSize >= TextController.max) {
      this._textSize = TextController.max;
      btnLarger.setAttribute('disabled', '');
    } else { btnLarger.removeAttribute('disabled'); }

    return this;
  };
  /** @type {Integer} The minimum text size */


  TextController.min = -3;
  /** @type {Integer} The maximum text size */

  TextController.max = 3;
  /** @type {String} The component selector */

  TextController.selector = '[data-js="text-controller"]';
  /** @type {Object} element selectors within the component */

  TextController.selectors = {
    LARGER: '[data-js*="text-larger"]',
    SMALLER: '[data-js*="text-smaller"]',
    TOGGLE: '[data-js*="text-controller__control"]'
  };

  /** import components here as they are written. */

  /**
   * The Main module
   * @class
   */

  var main = function main () {};

  main.prototype.icons = function icons (path) {
      if ( path === void 0 ) path = 'svg/icons.svg';

    return new Icons(path);
  };
  /**
   * An API for the Toggle Utility
   * @param{Object} settings Settings for the Toggle Class
   * @return {Object}        Instance of toggle
   */


  main.prototype.toggle = function toggle (settings) {
      if ( settings === void 0 ) settings = false;

    return settings ? new Toggle(settings) : new Toggle();
  };
  /**
   *
   * @param {string} selector
   * @param {function} submit
   */


  main.prototype.valid = function valid (selector, submit) {
    this.form = new Forms(document.querySelector(selector));
    this.form.submit = submit;
    this.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';
    this.form.watch();
  };
  /**
   * An API for the Tooltips element
   * @param{Object} settings Settings for the Tooltips Class
   * @return {nodelist}        Tooltip elements
   */


  main.prototype.tooltips = function tooltips (elements) {
      if ( elements === void 0 ) elements = document.querySelectorAll(Tooltips.selector);

    elements.forEach(function (element) {
      new Tooltips(element);
    });
    return elements.length ? elements : null;
  };
  /**
   * An API for the Filter Component
   * @return {Object} instance of Filter
   */


  main.prototype.filter = function filter () {
    return new Filter();
  };
  /**
   * An API for the Accordion Component
   * @return {Object} instance of Accordion
   */


  main.prototype.accordion = function accordion () {
    return new Accordion();
  };
  /**
   * An API for the Nearby Stops Component
   * @return {Object} instance of NearbyStops
   */


  main.prototype.nearbyStops = function nearbyStops () {
    return new NearbyStops();
  };
  /**
   * An API for the Newsletter Object
   * @return {Object} instance of Newsletter
   */


  main.prototype.newsletter = function newsletter (element) {
      if ( element === void 0 ) element = document.querySelector(Newsletter.selector);

    return element ? new Newsletter(element) : null;
  };
  /**
   * An API for the Autocomplete Object
   *
   * @param{Object}settingsSettings for the Autocomplete Class
   *
   * @return {Object}          Instance of Autocomplete
   */
  // inputsAutocomplete(settings = {}) {
  // return new InputsAutocomplete(settings);
  // }

  /**
   * An API for the AlertBanner Component
   *
   * @return{Object}Instance of AlertBanner
   */


  main.prototype.alertBanner = function alertBanner (element) {
      if ( element === void 0 ) element = document.querySelector(AlertBanner.selector);

    return element ? new AlertBanner(element) : null;
  };
  /**
   * An API for the ShareForm Component
   *
   * @return{Object}Instance of ShareForm
   */


  main.prototype.shareForm = function shareForm (elements) {
      if ( elements === void 0 ) elements = document.querySelectorAll(ShareForm.selector);

    elements.forEach(function (element) {
      new ShareForm(element);
    });
    return elements.length ? elements : null;
  };
  /**
   * An API for the WebShare Component
   *
   * @return{Object}Instance of WebShare
   */


  main.prototype.webShare = function webShare () {
    return new WebShare();
  };
  /**
   * An API for the Copy Utility
   *
   * @return{Object}Instance of Copy
   */


  main.prototype.copy = function copy () {
    return new Copy();
  };
  /**
   * An API for the Disclaimer Component
   * @return{Object}Instance of Disclaimer
   */


  main.prototype.disclaimer = function disclaimer () {
    return new Disclaimer();
  };
  /**
   * An API for the TextController Object
   *
   * @return{Object}Instance of TextController
   */


  main.prototype.textController = function textController (element) {
      if ( element === void 0 ) element = document.querySelector(TextController.selector);

    return element ? new TextController(element) : null;
  };
  /**
   * An API for the Track Object
   *
   * @return{Object}Instance of Track
   */


  main.prototype.track = function track () {
    return new Track();
  };

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzLW55Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvaWNvbnMvaWNvbnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RyYWNrL3RyYWNrLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9jb3B5L2NvcHkuanMiLCIuLi8uLi9zcmMvZWxlbWVudHMvdG9vbHRpcHMvdG9vbHRpcHMuanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZGlzY2xhaW1lci9kaXNjbGFpbWVyLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2ZyZWVHbG9iYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yb290LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fU3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0UmF3VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb2JqZWN0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlR2V0VGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNGdW5jdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcmVKc0RhdGEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc01hc2tlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3RvU291cmNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzTmF0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0VmFsdWUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXROYXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19kZWZpbmVQcm9wZXJ0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hc3NpZ25WYWx1ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcHlPYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lkZW50aXR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXBwbHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vdmVyUmVzdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvY29uc3RhbnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlU2V0VG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zaG9ydE91dC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3NldFRvU3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVJlc3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzTGVuZ3RoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5TGlrZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc0l0ZXJhdGVlQ2FsbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NyZWF0ZUFzc2lnbmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRpbWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc09iamVjdExpa2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNBcmd1bWVudHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJndW1lbnRzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0FycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9zdHViRmFsc2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQnVmZmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VVbmFyeS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25vZGVVdGlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1R5cGVkQXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUxpa2VLZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzSW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2Fzc2lnbkluV2l0aC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJBcmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzUGxhaW5PYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzRXJyb3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2F0dGVtcHQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheU1hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VWYWx1ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jdXN0b21EZWZhdWx0c0Fzc2lnbkluLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZXNjYXBlU3RyaW5nQ2hhci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMva2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlSW50ZXJwb2xhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUHJvcGVydHlPZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2VzY2FwZUh0bWxDaGFyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1N5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VUb1N0cmluZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdG9TdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2VzY2FwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3JlRXNjYXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fcmVFdmFsdWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGVTZXR0aW5ncy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdGVtcGxhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VGb3JPd24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVCYXNlRWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VFYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY2FzdEZ1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9mb3JFYWNoLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvbmVhcmJ5LXN0b3BzL25lYXJieS1zdG9wcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jbGVhdmUuanMvZGlzdC9jbGVhdmUtZXNtLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NsZWF2ZS5qcy9kaXN0L2FkZG9ucy9jbGVhdmUtcGhvbmUudXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZm9yLWNlcmlhbC9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL3NoYXJlLWZvcm0vc2hhcmUtZm9ybS5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL3dlYi1zaGFyZS93ZWItc2hhcmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvanMtY29va2llL2Rpc3QvanMuY29va2llLm1qcyIsIi4uLy4uL3NyYy9vYmplY3RzL2FsZXJ0LWJhbm5lci9hbGVydC1iYW5uZXIuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy90ZXh0LWNvbnRyb2xsZXIvdGV4dC1jb250cm9sbGVyLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgRm9ybSBjb21wb25lbnRzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRm9ybXMge1xuICAvKipcbiAgICogVGhlIEZvcm0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmb3JtIFRoZSBmb3JtIERPTSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSBmb3JtO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gRm9ybXMuc3RyaW5ncztcblxuICAgIHRoaXMuc3VibWl0ID0gRm9ybXMuc3VibWl0O1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRm9ybXMuY2xhc3NlcztcblxuICAgIHRoaXMubWFya3VwID0gRm9ybXMubWFya3VwO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBGb3Jtcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmF0dHJzID0gRm9ybXMuYXR0cnM7XG5cbiAgICB0aGlzLkZPUk0uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAgICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAqL1xuICBqb2luVmFsdWVzKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAuam9pbignLCAnKTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gICAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gICAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAgICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3MvQm9vbGVhbn0gICAgICAgVGhlIGZvcm0gY2xhc3Mgb3IgZmFsc2UgaWYgaW52YWxpZFxuICAgKi9cbiAgdmFsaWQoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIHRoaXMucmVzZXQoZWwpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiAodmFsaWRpdHkpID8gdGhpcyA6IHZhbGlkaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHRvIGlucHV0cyB3aXRoIHJlcXVpcmVkIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtICAge29iamVjdH0gIGZvcm0gIFBhc3NpbmcgYSBmb3JtIGlzIHBvc3NpYmxlLCBvdGhlcndpc2UgaXQgd2lsbCB1c2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb3JtIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgd2F0Y2goZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gKGZvcm0pID8gZm9ybSA6IHRoaXMuRk9STTtcblxuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIC8qKiBXYXRjaCBJbmRpdmlkdWFsIElucHV0cyAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0KGVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBTdWJtaXQgRXZlbnQgKi9cbiAgICB0aGlzLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy52YWxpZChldmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHRoaXMuc3VibWl0KGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgYW5kIGNsYXNzZXMgZnJvbSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICByZXNldChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBSZW1vdmUgZXJyb3IgY2xhc3MgZnJvbSB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIFJlbW92ZSBkeW5hbWljIGF0dHJpYnV0ZXMgZnJvbSB0aGUgaW5wdXRcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSk7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSB2YWxpZGl0eSBtZXNzYWdlIHRvIHRoZSB1c2VyLiBJdCB3aWxsIGZpcnN0IHVzZSBhbnkgbG9jYWxpemVkXG4gICAqIHN0cmluZyBwYXNzZWQgdG8gdGhlIGNsYXNzIGZvciByZXF1aXJlZCBmaWVsZHMgbWlzc2luZyBpbnB1dC4gSWYgdGhlXG4gICAqIGlucHV0IGlzIGZpbGxlZCBpbiBidXQgZG9lc24ndCBtYXRjaCB0aGUgcmVxdWlyZWQgcGF0dGVybiwgaXQgd2lsbCB1c2VcbiAgICogYSBsb2NhbGl6ZWQgc3RyaW5nIHNldCBmb3IgdGhlIHNwZWNpZmljIGlucHV0IHR5cGUuIElmIG9uZSBpc24ndCBwcm92aWRlZFxuICAgKiBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBicm93c2VyIHByb3ZpZGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGludmFsaWQgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICBoaWdobGlnaHQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm1hcmt1cC5FUlJPUl9NRVNTQUdFKTtcbiAgICBsZXQgaWQgPSBgJHtlbC5nZXRBdHRyaWJ1dGUoJ2lkJyl9LSR7dGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0V9YDtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzIChpZiBzZXQpLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcgJiYgdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQ7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkICYmXG4gICAgICB0aGlzLnN0cmluZ3NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF0pIHtcbiAgICAgIGxldCBzdHJpbmdLZXkgPSBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgO1xuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5XTtcbiAgICB9IGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICAvLyBTZXQgYXJpYSBhdHRyaWJ1dGVzIGFuZCBjc3MgY2xhc3NlcyB0byB0aGUgbWVzc2FnZVxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMF0sXG4gICAgICB0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMV0pO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlIHRvIHRoZSBkb20uXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIHRvIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gQWRkIGR5bmFtaWMgYXR0cmlidXRlcyB0byB0aGUgaW5wdXRcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSwgdGhpcy5hdHRycy5FUlJPUl9JTlBVVFsxXSk7XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwsIGlkKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQSBkaWN0aW9uYWlyeSBvZiBzdHJpbmdzIGluIHRoZSBmb3JtYXQuXG4gKiB7XG4gKiAgICdWQUxJRF9SRVFVSVJFRCc6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAqICAgJ1ZBTElEX3t7IFRZUEUgfX1fSU5WQUxJRCc6ICdJbnZhbGlkJ1xuICogfVxuICovXG5Gb3Jtcy5zdHJpbmdzID0ge307XG5cbi8qKiBQbGFjZWhvbGRlciBmb3IgdGhlIHN1Ym1pdCBmdW5jdGlvbiAqL1xuRm9ybXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqIENsYXNzZXMgZm9yIHZhcmlvdXMgY29udGFpbmVycyAqL1xuRm9ybXMuY2xhc3NlcyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZXJyb3ItbWVzc2FnZScsIC8vIGVycm9yIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZVxuICAnRVJST1JfQ09OVEFJTkVSJzogJ2Vycm9yJywgLy8gY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlIHBhcmVudFxuICAnRVJST1JfRk9STSc6ICdlcnJvcidcbn07XG5cbi8qKiBIVE1MIHRhZ3MgYW5kIG1hcmt1cCBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMubWFya3VwID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdkaXYnLFxufTtcblxuLyoqIERPTSBTZWxlY3RvcnMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLnNlbGVjdG9ycyA9IHtcbiAgJ1JFUVVJUkVEJzogJ1tyZXF1aXJlZD1cInRydWVcIl0nLCAvLyBTZWxlY3RvciBmb3IgcmVxdWlyZWQgaW5wdXQgZWxlbWVudHNcbiAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogZmFsc2Vcbn07XG5cbi8qKiBBdHRyaWJ1dGVzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5hdHRycyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiBbJ2FyaWEtbGl2ZScsICdwb2xpdGUnXSwgLy8gQXR0cmlidXRlIGZvciB2YWxpZCBlcnJvciBtZXNzYWdlXG4gICdFUlJPUl9JTlBVVCc6IFsnYXJpYS1pbnZhbGlkJywgJ3RydWUnXSxcbiAgJ0VSUk9SX0xBQkVMJzogJ2FyaWEtZGVzY3JpYmVkYnknXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgU2ltcGxlIFRvZ2dsZSBjbGFzcy4gVGhpcyB3aWxsIHRvZ2dsZSB0aGUgY2xhc3MgJ2FjdGl2ZScgYW5kICdoaWRkZW4nXG4gKiBvbiB0YXJnZXQgZWxlbWVudHMsIGRldGVybWluZWQgYnkgYSBjbGljayBldmVudCBvbiBhIHNlbGVjdGVkIGxpbmsgb3JcbiAqIGVsZW1lbnQuIFRoaXMgd2lsbCBhbHNvIHRvZ2dsZSB0aGUgYXJpYS1oaWRkZW4gYXR0cmlidXRlIGZvciB0YXJnZXRlZFxuICogZWxlbWVudHMgdG8gc3VwcG9ydCBzY3JlZW4gcmVhZGVycy4gVGFyZ2V0IHNldHRpbmdzIGFuZCBvdGhlciBmdW5jdGlvbmFsaXR5XG4gKiBjYW4gYmUgY29udHJvbGxlZCB0aHJvdWdoIGRhdGEgYXR0cmlidXRlcy5cbiAqXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRvZ2dsZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzIFNldHRpbmdzIGZvciB0aGlzIFRvZ2dsZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KCdBQ0NFU1NfVE9HR0xFUycpKVxuICAgICAgd2luZG93LkFDQ0VTU19UT0dHTEVTID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlXG4gICAgfTtcblxuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvdy5BQ0NFU1NfVE9HR0xFUy5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIHRoYXQgYSB0b2dnbGUgdXNpbmcgdGhpcyBzZWxlY3RvciBoYXMgYmVlbiBpbnN0YW50aWF0ZWQuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBkb3VibGUgdG9nZ2xpbmcuXG4gICAgd2luZG93LkFDQ0VTU19UT0dHTEVTW3RoaXMuc2V0dGluZ3Muc2VsZWN0b3JdID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLyoqIEFuY2hvciBMaW5rcyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgOiB0YXJnZXQ7XG5cbiAgICAvKiogVG9nZ2xlIENvbnRyb2xzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gKSA6IHRhcmdldDtcblxuICAgIC8qKiBNYWluIEZ1bmN0aW9uYWxpdHkgKi9cbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqIFVuZG8gKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcblxuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdHRyID0gJyc7XG4gICAgbGV0IHZhbHVlID0gJyc7XG5cbiAgICAvLyBHZXQgb3RoZXIgdG9nZ2xlcyB0aGF0IG1pZ2h0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgIGxldCBvdGhlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYFthcmlhLWNvbnRyb2xzPVwiJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1cIl1gKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGJlZm9yZSBob29rLlxuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmJlZm9yZSkgdGhpcy5zZXR0aW5ncy5iZWZvcmUodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCBhbmQgVGFyZ2V0IGNsYXNzZXNcbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwpIG90aGVyLmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBFbGVtZW50IEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEp1bXAgTGlua3NcbiAgICAgKi9cbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdocmVmJykpIHtcbiAgICAgIC8vIFJlc2V0IHRoZSBoaXN0b3J5IHN0YXRlLCB0aGlzIHdpbGwgY2xlYXIgb3V0XG4gICAgICAvLyB0aGUgaGFzaCB3aGVuIHRoZSBqdW1wIGl0ZW0gaXMgdG9nZ2xlZCBjbG9zZWQuXG4gICAgICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgICAvLyBUYXJnZXQgZWxlbWVudCB0b2dnbGUuXG4gICAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgIHRhcmdldC5mb2N1cyh7cHJldmVudFNjcm9sbDogdHJ1ZX0pO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGNvbXBsZXRlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWZ0ZXIpIHRoaXMuc2V0dGluZ3MuYWZ0ZXIodGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbi8qKiBAdHlwZSB7QXJyYXl9IEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRvZ2dsaW5nIGVsZW1lbnQgKi9cblRvZ2dsZS5lbEFyaWFSb2xlcyA9IFsnYXJpYS1wcmVzc2VkJywgJ2FyaWEtZXhwYW5kZWQnXTtcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS50YXJnZXRBcmlhUm9sZXMgPSBbJ2FyaWEtaGlkZGVuJ107XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnc3ZnL2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRyYWNraW5nIGJ1cyBmb3IgR29vZ2xlIGFuYWx5dGljcyBhbmQgV2VidHJlbmRzLlxuICovXG5jbGFzcyBUcmFjayB7XG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVHJhY2suc2VsZWN0b3IsXG4gICAgfTtcblxuICAgIHRoaXMuZGVzaW5hdGlvbnMgPSBUcmFjay5kZXN0aW5hdGlvbnM7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBsZXQga2V5ID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tLZXk7XG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tEYXRhKTtcblxuICAgICAgdGhpcy50cmFjayhrZXksIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZnVuY3Rpb24gd3JhcHBlclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBmaW5hbCBkYXRhIG9iamVjdFxuICAgKi9cbiAgdHJhY2soa2V5LCBkYXRhKSB7XG4gICAgLy8gU2V0IHRoZSBwYXRoIG5hbWUgYmFzZWQgb24gdGhlIGxvY2F0aW9uXG4gICAgY29uc3QgZCA9IGRhdGEubWFwKGVsID0+IHtcbiAgICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICAgICAgZWxbVHJhY2sua2V5XSA9IGAke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0vJHtlbFtUcmFjay5rZXldfWBcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgfSk7XG5cbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGQpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZyhrZXksIGQpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cbiAgICByZXR1cm4gZDtcbiAgfTtcblxuICAvKipcbiAgICogRGF0YSBidXMgZm9yIHRyYWNraW5nIHZpZXdzIGluIFdlYnRyZW5kcyBhbmQgR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgYXBwICAgVGhlIG5hbWUgb2YgdGhlIFNpbmdsZSBQYWdlIEFwcGxpY2F0aW9uIHRvIHRyYWNrXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgdmlldyhhcHAsIGtleSwgZGF0YSkge1xuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZGF0YSk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnVmlldyhhcHAsIGtleSk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBFdmVudHMgdG8gV2VidHJlbmRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgd2VidHJlbmRzKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBXZWJ0cmVuZHMgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCd3ZWJ0cmVuZHMnKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBldmVudCA9IFt7XG4gICAgICAnV1QudGknOiBrZXlcbiAgICB9XTtcblxuICAgIGlmIChkYXRhWzBdICYmIGRhdGFbMF0uaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSkge1xuICAgICAgZXZlbnQucHVzaCh7XG4gICAgICAgICdEQ1MuZGNzdXJpJzogZGF0YVswXVtUcmFjay5rZXldXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmFzc2lnbihldmVudCwgZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gRm9ybWF0IGRhdGEgZm9yIFdlYnRyZW5kc1xuICAgIGxldCB3dGQgPSB7YXJnc2E6IGV2ZW50LmZsYXRNYXAoZSA9PiB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoZSkuZmxhdE1hcChrID0+IFtrLCBlW2tdXSk7XG4gICAgfSl9O1xuXG4gICAgLy8gSWYgJ2FjdGlvbicgaXMgdXNlZCBhcyB0aGUga2V5IChmb3IgZ3RhZy5qcyksIHN3aXRjaCBpdCB0byBXZWJ0cmVuZHNcbiAgICBsZXQgYWN0aW9uID0gZGF0YS5hcmdzYS5pbmRleE9mKCdhY3Rpb24nKTtcblxuICAgIGlmIChhY3Rpb24pIGRhdGEuYXJnc2FbYWN0aW9uXSA9ICdEQ1MuZGNzdXJpJztcblxuICAgIC8vIFdlYnRyZW5kcyBkb2Vzbid0IHNlbmQgdGhlIHBhZ2UgdmlldyBmb3IgTXVsdGlUcmFjaywgYWRkIHBhdGggdG8gdXJsXG4gICAgbGV0IGRjc3VyaSA9IGRhdGEuYXJnc2EuaW5kZXhPZignRENTLmRjc3VyaScpO1xuXG4gICAgaWYgKGRjc3VyaSkge1xuICAgICAgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArXG4gICAgICAgIGRhdGEuYXJnc2FbZGNzdXJpICsgMV07XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBpZiAodHlwZW9mIFdlYnRyZW5kcyAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgICBXZWJ0cmVuZHMubXVsdGlUcmFjayh3dGQpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydXZWJ0cmVuZHMnLCB3dGRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIENsaWNrIEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgZ3RhZyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB1cmkgPSBkYXRhLmZpbmQoKGVsZW1lbnQpID0+IGVsZW1lbnQuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSk7XG5cbiAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAnZXZlbnRfY2F0ZWdvcnknOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIFNjcmVlbiBWaWV3IEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGFwcCAgVGhlIG5hbWUgb2YgdGhlIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGtleSAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKi9cbiAgZ3RhZ1ZpZXcoYXBwLCBrZXkpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB2aWV3ID0ge1xuICAgICAgYXBwX25hbWU6IGFwcCxcbiAgICAgIHNjcmVlbl9uYW1lOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKCdldmVudCcsICdzY3JlZW5fdmlldycsIHZpZXcpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksICdzY3JlZW5fdmlldycsIHZpZXddO1xuICB9O1xufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0cmFja2luZyBmdW5jdGlvbiB0byAqL1xuVHJhY2suc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidHJhY2tcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gZXZlbnQgdHJhY2tpbmcga2V5IHRvIG1hcCB0byBXZWJ0cmVuZHMgRENTLnVyaSAqL1xuVHJhY2sua2V5ID0gJ2V2ZW50JztcblxuLyoqIEB0eXBlIHtBcnJheX0gV2hhdCBkZXN0aW5hdGlvbnMgdG8gcHVzaCBkYXRhIHRvICovXG5UcmFjay5kZXN0aW5hdGlvbnMgPSBbXG4gICd3ZWJ0cmVuZHMnLFxuICAnZ3RhZydcbl07XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb3B5IHRvIENsaXBib2FyZCBIZWxwZXJcbiAqXG4gKiA8aW5wdXQgZGF0YS1jb3B5LXRhcmdldD1cIndlYi1zaGFyZS11cmxcIiBpZD1cIndlYi1zaGFyZS11cmxcIiBuYW1lPVwid2ViLXNoYXJlLXVybFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCJodHRwczovL215dXJsXCIgLz5cbiAqXG4gKiA8YnV0dG9uIGFyaWEtcHJlc3NlZD1cImZhbHNlXCIgZGF0YS1jb3B5PVwid2ViLXNoYXJlLXVybFwiIGRhdGEtanM9XCJjb3B5XCI+XG4gKiAgIENvcHkgdG8gQ2xpcGJvYXJkXG4gKiA8L2J1dHRvbj5cbiAqL1xuY2xhc3MgQ29weSB7XG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICB0aGlzLnNlbGVjdG9yID0gQ29weS5zZWxlY3RvcjtcblxuICAgIHRoaXMuYXJpYSA9IENvcHkuYXJpYTtcblxuICAgIHRoaXMubm90aWZ5VGltZW91dCA9IENvcHkubm90aWZ5VGltZW91dDtcblxuICAgIC8vIFNlbGVjdCB0aGUgZW50aXJlIHRleHQgd2hlbiBpdCdzIGZvY3VzZWQgb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKENvcHkuc2VsZWN0b3JzLlRBUkdFVFMpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gdGhpcy5zZWxlY3QoaXRlbSkpO1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2VsZWN0KGl0ZW0pKTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBtYWluIGNsaWNrIGV2ZW50IGZvciB0aGUgY2xhc3NcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmFyaWEsIGZhbHNlKTtcblxuICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmVsZW1lbnQuZGF0YXNldC5jb3B5O1xuXG4gICAgICBpZiAodGhpcy5jb3B5KHRoaXMudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMuYXJpYSwgdHJ1ZSk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZWxlbWVudFsndGltZW91dCddKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRbJ3RpbWVvdXQnXSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5hcmlhLCBmYWxzZSk7XG4gICAgICAgIH0sIHRoaXMubm90aWZ5VGltZW91dCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgdGFyZ2V0ICBDb250ZW50IG9mIHRhcmdldCBkYXRhIGF0dHJpYnV0ZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Qm9vbGVhbn0gICAgICAgICBXZXRoZXIgY29weSB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICovXG4gIGNvcHkodGFyZ2V0KSB7XG4gICAgbGV0IHNlbGVjdG9yID0gQ29weS5zZWxlY3RvcnMuVEFSR0VUUy5yZXBsYWNlKCddJywgYD1cIiR7dGFyZ2V0fVwiXWApO1xuXG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICB0aGlzLnNlbGVjdChpbnB1dCk7XG5cbiAgICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCkge1xuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoaW5wdXQudmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQpIHtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVyIGZvciB0aGUgdGV4dCBzZWxlY3Rpb24gbWV0aG9kXG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBpbnB1dCAgVGhlIGlucHV0IHdpdGggY29udGVudCB0byBzZWxlY3RcbiAgICovXG4gIHNlbGVjdChpbnB1dCkge1xuICAgIGlucHV0LnNlbGVjdCgpO1xuXG4gICAgaW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgOTk5OTkpO1xuICB9XG59XG5cbi8qKiBUaGUgbWFpbiBlbGVtZW50IHNlbGVjdG9yICovXG5Db3B5LnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImNvcHlcIl0nO1xuXG4vKiogQ2xhc3Mgc2VsZWN0b3JzICovXG5Db3B5LnNlbGVjdG9ycyA9IHtcbiAgVEFSR0VUUzogJ1tkYXRhLWNvcHktdGFyZ2V0XSdcbn07XG5cbi8qKiBCdXR0b24gYXJpYSByb2xlIHRvIHRvZ2dsZSAqL1xuQ29weS5hcmlhID0gJ2FyaWEtcHJlc3NlZCc7XG5cbi8qKiBUaW1lb3V0IGZvciB0aGUgXCJDb3BpZWQhXCIgbm90aWZpY2F0aW9uICovXG5Db3B5Lm5vdGlmeVRpbWVvdXQgPSAxNTAwO1xuXG5leHBvcnQgZGVmYXVsdCBDb3B5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB0b29sdGlwcy4gVGhlIGNvbnN0cnVjdG9yIGlzIHBhc3NlZCBhbiBIVE1MIGVsZW1lbnQgdGhhdCBzZXJ2ZXMgYXNcbiAqIHRoZSB0cmlnZ2VyIHRvIHNob3cgb3IgaGlkZSB0aGUgdG9vbHRpcHMuIFRoZSB0b29sdGlwIHNob3VsZCBoYXZlIGFuXG4gKiBgYXJpYS1kZXNjcmliZWRieWAgYXR0cmlidXRlLCB0aGUgdmFsdWUgb2Ygd2hpY2ggaXMgdGhlIElEIG9mIHRoZSB0b29sdGlwXG4gKiBjb250ZW50IHRvIHNob3cgb3IgaGlkZS5cbiAqL1xuY2xhc3MgVG9vbHRpcHMge1xuICAvKipcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgLSBUaGUgdHJpZ2dlciBlbGVtZW50IGZvciB0aGUgY29tcG9uZW50LlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsKSB7XG4gICAgdGhpcy50cmlnZ2VyID0gZWw7XG5cbiAgICB0aGlzLnRvb2x0aXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKSk7XG5cbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy50b29sdGlwLmNsYXNzTGlzdC5hZGQoVG9vbHRpcHMuQ3NzQ2xhc3MuVE9PTFRJUCk7XG4gICAgdGhpcy50b29sdGlwLmNsYXNzTGlzdC5hZGQoVG9vbHRpcHMuQ3NzQ2xhc3MuSElEREVOKTtcblxuICAgIHRoaXMudG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Rvb2x0aXAnKTtcblxuICAgIC8vIFN0b3AgY2xpY2sgcHJvcGFnYXRpb24gc28gY2xpY2tpbmcgb24gdGhlIHRpcCBkb2Vzbid0IHRyaWdnZXIgYVxuICAgIC8vIGNsaWNrIG9uIGJvZHksIHdoaWNoIHdvdWxkIGNsb3NlIHRoZSB0b29sdGlwcy5cbiAgICB0aGlzLnRvb2x0aXAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hcHBlbmRDaGlsZCh0aGlzLnRvb2x0aXApO1xuXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgIH0pXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgVG9vbHRpcHMuQWxsVGlwcy5wdXNoKHRoaXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgdGhlIHRvb2x0aXBzLiBTZXRzIGEgb25lLXRpbWUgbGlzdGVuZXIgb24gdGhlIGJvZHkgdG8gY2xvc2UgdGhlXG4gICAqIHRvb2x0aXAgd2hlbiBhIGNsaWNrIGV2ZW50IGJ1YmJsZXMgdXAgdG8gaXQuXG4gICAqIEBtZXRob2RcbiAgICogQHJldHVybiB7dGhpc30gVG9vbHRpcFxuICAgKi9cbiAgc2hvdygpIHtcbiAgICBUb29sdGlwcy5oaWRlQWxsKCk7XG5cbiAgICB0aGlzLnRvb2x0aXAuY2xhc3NMaXN0LnJlbW92ZShUb29sdGlwcy5Dc3NDbGFzcy5ISURERU4pO1xuXG4gICAgdGhpcy50b29sdGlwLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgbGV0IGhpZGVUb29sdGlwT25jZSA9ICgpID0+IHtcbiAgICAgIHRoaXMuaGlkZSgpO1xuXG4gICAgICBib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZVRvb2x0aXBPbmNlKTtcbiAgICB9O1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVUb29sdGlwT25jZSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZXBvc2l0aW9uKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlcG9zaXRpb24oKTtcblxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIHRoZSB0b29sdGlwIGFuZCByZW1vdmVzIHRoZSBjbGljayBldmVudCBsaXN0ZW5lciBvbiB0aGUgYm9keS5cbiAgICogQG1ldGhvZFxuICAgKiBAcmV0dXJuIHt0aGlzfSBUb29sdGlwXG4gICAqL1xuICBoaWRlKCkge1xuICAgIHRoaXMudG9vbHRpcC5jbGFzc0xpc3QuYWRkKFRvb2x0aXBzLkNzc0NsYXNzLkhJRERFTik7XG5cbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc3RhdGUgb2YgdGhlIHRvb2x0aXBzLlxuICAgKiBAbWV0aG9kXG4gICAqIEByZXR1cm4ge3RoaXN9IFRvb2x0aXBcbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3coKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3NpdGlvbnMgdGhlIHRvb2x0aXAgYmVuZWF0aCB0aGUgdHJpZ2dlcmluZyBlbGVtZW50LlxuICAgKiBAbWV0aG9kXG4gICAqIEByZXR1cm4ge3RoaXN9IFRvb2x0aXBcbiAgICovXG4gIHJlcG9zaXRpb24oKSB7XG4gICAgbGV0IHBvcyA9IHtcbiAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXG4gICAgICAnbGVmdCc6ICdhdXRvJyxcbiAgICAgICdyaWdodCc6ICdhdXRvJyxcbiAgICAgICd0b3AnOiAnYXV0bycsXG4gICAgICAnYm90dG9tJzogJ2F1dG8nLFxuICAgICAgJ3dpZHRoJzogJydcbiAgICB9O1xuXG4gICAgbGV0IHN0eWxlID0gKGF0dHJzKSA9PiBPYmplY3Qua2V5cyhhdHRycylcbiAgICAgIC5tYXAoa2V5ID0+IGAke2tleX06ICR7YXR0cnNba2V5XX1gKS5qb2luKCc7ICcpO1xuXG4gICAgbGV0IGcgPSA4OyAvLyBHdXR0ZXIuIE1pbmltdW0gZGlzdGFuY2UgZnJvbSBzY3JlZW4gZWRnZS5cbiAgICBsZXQgdHQgPSB0aGlzLnRvb2x0aXA7XG4gICAgbGV0IHRyID0gdGhpcy50cmlnZ2VyO1xuICAgIGxldCB3ID0gd2luZG93O1xuXG4gICAgLy8gUmVzZXRcbiAgICB0aGlzLnRvb2x0aXAuc2V0QXR0cmlidXRlKCdzdHlsZScsIHN0eWxlKHBvcykpO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGxlZnQgb3IgcmlnaHQgYWxpZ25tZW50LlxuICAgIGlmICh0dC5vZmZzZXRXaWR0aCA+PSB3LmlubmVyV2lkdGggLSAoMiAqIGcpKSB7XG4gICAgICAvLyBJZiB0aGUgdG9vbHRpcCBpcyB3aWRlciB0aGFuIHRoZSBzY3JlZW4gbWludXMgZ3V0dGVycywgdGhlbiBwb3NpdGlvblxuICAgICAgLy8gdGhlIHRvb2x0aXAgdG8gZXh0ZW5kIHRvIHRoZSBndXR0ZXJzLlxuICAgICAgcG9zLmxlZnQgPSBnICsgJ3B4JztcbiAgICAgIHBvcy5yaWdodCA9IGcgKyAncHgnO1xuICAgICAgcG9zLndpZHRoID0gJ2F1dG8nO1xuICAgIH0gZWxzZSBpZiAodHIub2Zmc2V0TGVmdCArIHR0Lm9mZnNldFdpZHRoICsgZyA+IHcuaW5uZXJXaWR0aCkge1xuICAgICAgLy8gSWYgdGhlIHRvb2x0aXAsIHdoZW4gbGVmdCBhbGlnbmVkIHdpdGggdGhlIHRyaWdnZXIsIHdvdWxkIGNhdXNlIHRoZVxuICAgICAgLy8gdGlwIHRvIGdvIG9mZnNjcmVlbiAoZGV0ZXJtaW5lZCBieSB0YWtpbmcgdGhlIHRyaWdnZXIgbGVmdCBvZmZzZXQgYW5kXG4gICAgICAvLyBhZGRpbmcgdGhlIHRvb2x0aXAgd2lkdGggYW5kIHRoZSBsZWZ0IGd1dHRlcikgdGhlbiBhbGlnbiB0aGUgdG9vbHRpcFxuICAgICAgLy8gdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAgICAgIHBvcy5sZWZ0ID0gJ2F1dG8nO1xuICAgICAgcG9zLnJpZ2h0ID0gdy5pbm5lcldpZHRoIC0gKHRyLm9mZnNldExlZnQgKyB0ci5vZmZzZXRXaWR0aCkgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbGlnbiB0aGUgdG9vbHRpcCB0byB0aGUgbGVmdCBvZiB0aGUgdHJpZ2dlciBlbGVtZW50LlxuICAgICAgcG9zLmxlZnQgPSB0ci5vZmZzZXRMZWZ0ICsgJ3B4JztcbiAgICAgIHBvcy5yaWdodCA9ICdhdXRvJztcbiAgICB9XG5cbiAgICAvLyBQb3NpdGlvbiBUVCBvbiB0b3AgaWYgdGhlIHRyaWdnZXIgaXMgYmVsb3cgdGhlIG1pZGRsZSBvZiB0aGUgd2luZG93XG4gICAgaWYgKHRyLm9mZnNldFRvcCAtIHcuc2Nyb2xsWSA+IHcuaW5uZXJIZWlnaHQgLyAyKSB7XG4gICAgICBwb3MudG9wID0gdHIub2Zmc2V0VG9wIC0gdHQub2Zmc2V0SGVpZ2h0IC0gKGcpICsgJ3B4JztcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zLnRvcCA9IHRyLm9mZnNldFRvcCArIHRyLm9mZnNldEhlaWdodCArIGcgKyAncHgnO1xuICAgIH1cblxuICAgIHRoaXMudG9vbHRpcC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgc3R5bGUocG9zKSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5Ub29sdGlwcy5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ0b29sdGlwXCJdJztcblxuLyoqXG4gKiBBcnJheSBvZiBhbGwgdGhlIGluc3RhbnRpYXRlZCB0b29sdGlwcy5cbiAqIEB0eXBlIHtBcnJheTxUb29sdGlwPn1cbiAqL1xuVG9vbHRpcHMuQWxsVGlwcyA9IFtdO1xuXG4vKipcbiAqIEhpZGUgYWxsIFRvb2x0aXBzLlxuICogQHB1YmxpY1xuICovXG5Ub29sdGlwcy5oaWRlQWxsID0gZnVuY3Rpb24oKSB7XG4gIFRvb2x0aXBzLkFsbFRpcHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICBlbGVtZW50LmhpZGUoKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIENTUyBjbGFzc2VzIHVzZWQgYnkgdGhpcyBjb21wb25lbnQuXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5Ub29sdGlwcy5Dc3NDbGFzcyA9IHtcbiAgSElEREVOOiAnaGlkZGVuJyxcbiAgVE9PTFRJUDogJ3Rvb2x0aXAtYnViYmxlJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVG9vbHRpcHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJhY2NvcmRpb25cIl0nO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRGlzY2xhaW1lciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBEaXNjbGFpbWVyLnNlbGVjdG9yO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBEaXNjbGFpbWVyLnNlbGVjdG9ycztcblxuICAgIHRoaXMuY2xhc3NlcyA9IERpc2NsYWltZXIuY2xhc3NlcztcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNlbGVjdG9ycy5UT0dHTEUpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBkaXNjbGFpbWVyIHRvIGJlIHZpc2libGUgb3IgaW52aXNpYmxlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZXZlbnQgIFRoZSBib2R5IGNsaWNrIGV2ZW50XG4gICAqIEByZXR1cm4gIHtvYmplY3R9ICAgICAgICAgVGhlIGRpc2NsYWltZXIgY2xhc3NcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBsZXQgaWQgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG5cbiAgICBsZXQgc2VsZWN0b3IgPSBgW2FyaWEtZGVzY3JpYmVkYnk9XCIke2lkfVwiXS4ke3RoaXMuY2xhc3Nlcy5BQ1RJVkV9YDtcbiAgICBsZXQgdHJpZ2dlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgIGxldCBkaXNjbGFpbWVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG5cbiAgICBpZiAodHJpZ2dlcnMubGVuZ3RoID4gMCAmJiBkaXNjbGFpbWVyKSB7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkhJRERFTik7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkFOSU1BVEVEKTtcbiAgICAgIGRpc2NsYWltZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuQU5JTUFUSU9OKTtcbiAgICAgIGRpc2NsYWltZXIuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcblxuICAgICAgLy8gU2Nyb2xsLXRvIGZ1bmN0aW9uYWxpdHkgZm9yIG1vYmlsZVxuICAgICAgaWYgKHdpbmRvdy5zY3JvbGxUbyAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8IFNDUkVFTl9ERVNLVE9QKSB7XG4gICAgICAgIGxldCBvZmZzZXQgPSBldmVudC50YXJnZXQub2Zmc2V0VG9wIC0gZXZlbnQudGFyZ2V0LmRhdGFzZXQuc2Nyb2xsT2Zmc2V0O1xuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgb2Zmc2V0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5ISURERU4pO1xuICAgICAgZGlzY2xhaW1lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5BTklNQVRFRCk7XG4gICAgICBkaXNjbGFpbWVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkFOSU1BVElPTik7XG4gICAgICBkaXNjbGFpbWVyLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5EaXNjbGFpbWVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwiZGlzY2xhaW1lclwiXSc7XG5cbkRpc2NsYWltZXIuc2VsZWN0b3JzID0ge1xuICBUT0dHTEU6ICdbZGF0YS1qcyo9XCJkaXNjbGFpbWVyLWNvbnRyb2xcIl0nXG59O1xuXG5EaXNjbGFpbWVyLmNsYXNzZXMgPSB7XG4gIEFDVElWRTogJ2FjdGl2ZScsXG4gIEhJRERFTjogJ2hpZGRlbicsXG4gIEFOSU1BVEVEOiAnYW5pbWF0ZWQnLFxuICBBTklNQVRJT046ICdmYWRlSW5VcCdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IERpc2NsYWltZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgRmlsdGVyIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZpbHRlciB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogRmlsdGVyLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiBGaWx0ZXIubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogRmlsdGVyLmluYWN0aXZlQ2xhc3NcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImZpbHRlclwiXSc7XG5cbi8qKlxuICogVGhlIG5hbWVzcGFjZSBmb3IgdGhlIGNvbXBvbmVudHMgSlMgb3B0aW9uc1xuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLm5hbWVzcGFjZSA9ICdmaWx0ZXInO1xuXG4vKipcbiAqIFRoZSBpbmNhY3RpdmUgY2xhc3MgbmFtZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuRmlsdGVyLmluYWN0aXZlQ2xhc3MgPSAnaW5hY3RpdmUnO1xuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXI7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5leHBvcnQgZGVmYXVsdCBmcmVlR2xvYmFsO1xuIiwiaW1wb3J0IGZyZWVHbG9iYWwgZnJvbSAnLi9fZnJlZUdsb2JhbC5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuZXhwb3J0IGRlZmF1bHQgcm9vdDtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxuZXhwb3J0IGRlZmF1bHQgU3ltYm9sO1xuIiwiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBvYmplY3RUb1N0cmluZztcbiIsImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcbmltcG9ydCBnZXRSYXdUYWcgZnJvbSAnLi9fZ2V0UmF3VGFnLmpzJztcbmltcG9ydCBvYmplY3RUb1N0cmluZyBmcm9tICcuL19vYmplY3RUb1N0cmluZy5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlR2V0VGFnO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0O1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzRnVuY3Rpb247XG4iLCJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxuZXhwb3J0IGRlZmF1bHQgY29yZUpzRGF0YTtcbiIsImltcG9ydCBjb3JlSnNEYXRhIGZyb20gJy4vX2NvcmVKc0RhdGEuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc01hc2tlZDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9Tb3VyY2U7XG4iLCJpbXBvcnQgaXNGdW5jdGlvbiBmcm9tICcuL2lzRnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzTWFza2VkIGZyb20gJy4vX2lzTWFza2VkLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcbmltcG9ydCB0b1NvdXJjZSBmcm9tICcuL190b1NvdXJjZS5qcyc7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc05hdGl2ZTtcbiIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRWYWx1ZTtcbiIsImltcG9ydCBiYXNlSXNOYXRpdmUgZnJvbSAnLi9fYmFzZUlzTmF0aXZlLmpzJztcbmltcG9ydCBnZXRWYWx1ZSBmcm9tICcuL19nZXRWYWx1ZS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldE5hdGl2ZTtcbiIsImltcG9ydCBnZXROYXRpdmUgZnJvbSAnLi9fZ2V0TmF0aXZlLmpzJztcblxudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHZhciBmdW5jID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZVByb3BlcnR5O1xuIiwiaW1wb3J0IGRlZmluZVByb3BlcnR5IGZyb20gJy4vX2RlZmluZVByb3BlcnR5LmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUFzc2lnblZhbHVlO1xuIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVxO1xuIiwiaW1wb3J0IGJhc2VBc3NpZ25WYWx1ZSBmcm9tICcuL19iYXNlQXNzaWduVmFsdWUuanMnO1xuaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3NpZ25WYWx1ZTtcbiIsImltcG9ydCBhc3NpZ25WYWx1ZSBmcm9tICcuL19hc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5cbi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBpZGVudGlmaWVycyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29waWVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlPYmplY3Qoc291cmNlLCBwcm9wcywgb2JqZWN0LCBjdXN0b21pemVyKSB7XG4gIHZhciBpc05ldyA9ICFvYmplY3Q7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgID8gY3VzdG9taXplcihvYmplY3Rba2V5XSwgc291cmNlW2tleV0sIGtleSwgb2JqZWN0LCBzb3VyY2UpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdWYWx1ZSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb3B5T2JqZWN0O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaWRlbnRpdHk7XG4iLCIvKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFwcGx5O1xuIiwiaW1wb3J0IGFwcGx5IGZyb20gJy4vX2FwcGx5LmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZVJlc3RgIHdoaWNoIHRyYW5zZm9ybXMgdGhlIHJlc3QgYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIHJlc3QgYXJyYXkgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCB0cmFuc2Zvcm0pIHtcbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogc3RhcnQsIDApO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heChhcmdzLmxlbmd0aCAtIHN0YXJ0LCAwKSxcbiAgICAgICAgYXJyYXkgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGFycmF5W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIGluZGV4ID0gLTE7XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBzdGFydCkge1xuICAgICAgb3RoZXJBcmdzW2luZGV4XSA9IGFyZ3NbaW5kZXhdO1xuICAgIH1cbiAgICBvdGhlckFyZ3Nbc3RhcnRdID0gdHJhbnNmb3JtKGFycmF5KTtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdGhpcywgb3RoZXJBcmdzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb3ZlclJlc3Q7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNvbnN0YW50IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IF8udGltZXMoMiwgXy5jb25zdGFudCh7ICdhJzogMSB9KSk7XG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gKiAvLyA9PiBbeyAnYSc6IDEgfSwgeyAnYSc6IDEgfV1cbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29uc3RhbnQ7XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSAnLi9jb25zdGFudC5qcyc7XG5pbXBvcnQgZGVmaW5lUHJvcGVydHkgZnJvbSAnLi9fZGVmaW5lUHJvcGVydHkuanMnO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBzZXRUb1N0cmluZ2Agd2l0aG91dCBzdXBwb3J0IGZvciBob3QgbG9vcCBzaG9ydGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBiYXNlU2V0VG9TdHJpbmcgPSAhZGVmaW5lUHJvcGVydHkgPyBpZGVudGl0eSA6IGZ1bmN0aW9uKGZ1bmMsIHN0cmluZykge1xuICByZXR1cm4gZGVmaW5lUHJvcGVydHkoZnVuYywgJ3RvU3RyaW5nJywge1xuICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgJ3ZhbHVlJzogY29uc3RhbnQoc3RyaW5nKSxcbiAgICAnd3JpdGFibGUnOiB0cnVlXG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZVNldFRvU3RyaW5nO1xuIiwiLyoqIFVzZWQgdG8gZGV0ZWN0IGhvdCBmdW5jdGlvbnMgYnkgbnVtYmVyIG9mIGNhbGxzIHdpdGhpbiBhIHNwYW4gb2YgbWlsbGlzZWNvbmRzLiAqL1xudmFyIEhPVF9DT1VOVCA9IDgwMCxcbiAgICBIT1RfU1BBTiA9IDE2O1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQnbGwgc2hvcnQgb3V0IGFuZCBpbnZva2UgYGlkZW50aXR5YCBpbnN0ZWFkXG4gKiBvZiBgZnVuY2Agd2hlbiBpdCdzIGNhbGxlZCBgSE9UX0NPVU5UYCBvciBtb3JlIHRpbWVzIGluIGBIT1RfU1BBTmBcbiAqIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzaG9ydGFibGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHNob3J0T3V0KGZ1bmMpIHtcbiAgdmFyIGNvdW50ID0gMCxcbiAgICAgIGxhc3RDYWxsZWQgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhbXAgPSBuYXRpdmVOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gSE9UX1NQQU4gLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKTtcblxuICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgaWYgKCsrY291bnQgPj0gSE9UX0NPVU5UKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBzaG9ydE91dDtcbiIsImltcG9ydCBiYXNlU2V0VG9TdHJpbmcgZnJvbSAnLi9fYmFzZVNldFRvU3RyaW5nLmpzJztcbmltcG9ydCBzaG9ydE91dCBmcm9tICcuL19zaG9ydE91dC5qcyc7XG5cbi8qKlxuICogU2V0cyB0aGUgYHRvU3RyaW5nYCBtZXRob2Qgb2YgYGZ1bmNgIHRvIHJldHVybiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBzZXRUb1N0cmluZyA9IHNob3J0T3V0KGJhc2VTZXRUb1N0cmluZyk7XG5cbmV4cG9ydCBkZWZhdWx0IHNldFRvU3RyaW5nO1xuIiwiaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IG92ZXJSZXN0IGZyb20gJy4vX292ZXJSZXN0LmpzJztcbmltcG9ydCBzZXRUb1N0cmluZyBmcm9tICcuL19zZXRUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVzdGAgd2hpY2ggZG9lc24ndCB2YWxpZGF0ZSBvciBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VSZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCBzdGFydCwgaWRlbnRpdHkpLCBmdW5jICsgJycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUmVzdDtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNMZW5ndGg7XG4iLCJpbXBvcnQgaXNGdW5jdGlvbiBmcm9tICcuL2lzRnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzTGVuZ3RoIGZyb20gJy4vaXNMZW5ndGguanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheUxpa2U7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcblxuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGUgIT0gJ3N5bWJvbCcgJiYgcmVJc1VpbnQudGVzdCh2YWx1ZSkpKSAmJlxuICAgICAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSW5kZXg7XG4iLCJpbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5pbXBvcnQgaXNJbmRleCBmcm9tICcuL19pc0luZGV4LmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0l0ZXJhdGVlQ2FsbDtcbiIsImltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBsaWtlIGBfLmFzc2lnbmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGFzc2lnbmVyIFRoZSBmdW5jdGlvbiB0byBhc3NpZ24gdmFsdWVzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYXNzaWduZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFzc2lnbmVyKGFzc2lnbmVyKSB7XG4gIHJldHVybiBiYXNlUmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVBc3NpZ25lcjtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VUaW1lcztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc09iamVjdExpa2U7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNBcmd1bWVudHM7XG4iLCJpbXBvcnQgYmFzZUlzQXJndW1lbnRzIGZyb20gJy4vX2Jhc2VJc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJndW1lbnRzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJyYXk7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0dWJGYWxzZTtcbiIsImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuaW1wb3J0IHN0dWJGYWxzZSBmcm9tICcuL3N0dWJGYWxzZS5qcyc7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgaXNCdWZmZXI7XG4iLCJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc0xlbmd0aCBmcm9tICcuL2lzTGVuZ3RoLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1R5cGVkQXJyYXlgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tiYXNlR2V0VGFnKHZhbHVlKV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc1R5cGVkQXJyYXk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VVbmFyeTtcbiIsImltcG9ydCBmcmVlR2xvYmFsIGZyb20gJy4vX2ZyZWVHbG9iYWwuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIC8vIFVzZSBgdXRpbC50eXBlc2AgZm9yIE5vZGUuanMgMTArLlxuICAgIHZhciB0eXBlcyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5yZXF1aXJlICYmIGZyZWVNb2R1bGUucmVxdWlyZSgndXRpbCcpLnR5cGVzO1xuXG4gICAgaWYgKHR5cGVzKSB7XG4gICAgICByZXR1cm4gdHlwZXM7XG4gICAgfVxuXG4gICAgLy8gTGVnYWN5IGBwcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKWAgZm9yIE5vZGUuanMgPCAxMC5cbiAgICByZXR1cm4gZnJlZVByb2Nlc3MgJiYgZnJlZVByb2Nlc3MuYmluZGluZyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nKCd1dGlsJyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5leHBvcnQgZGVmYXVsdCBub2RlVXRpbDtcbiIsImltcG9ydCBiYXNlSXNUeXBlZEFycmF5IGZyb20gJy4vX2Jhc2VJc1R5cGVkQXJyYXkuanMnO1xuaW1wb3J0IGJhc2VVbmFyeSBmcm9tICcuL19iYXNlVW5hcnkuanMnO1xuaW1wb3J0IG5vZGVVdGlsIGZyb20gJy4vX25vZGVVdGlsLmpzJztcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzVHlwZWRBcnJheTtcbiIsImltcG9ydCBiYXNlVGltZXMgZnJvbSAnLi9fYmFzZVRpbWVzLmpzJztcbmltcG9ydCBpc0FyZ3VtZW50cyBmcm9tICcuL2lzQXJndW1lbnRzLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5pbXBvcnQgaXNCdWZmZXIgZnJvbSAnLi9pc0J1ZmZlci5qcyc7XG5pbXBvcnQgaXNJbmRleCBmcm9tICcuL19pc0luZGV4LmpzJztcbmltcG9ydCBpc1R5cGVkQXJyYXkgZnJvbSAnLi9pc1R5cGVkQXJyYXkuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5TGlrZUtleXM7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzUHJvdG90eXBlO1xuIiwiLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGxpa2VcbiAqIFtgT2JqZWN0LmtleXNgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGV4Y2VwdCB0aGF0IGl0IGluY2x1ZGVzIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIG5hdGl2ZUtleXNJbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBpZiAob2JqZWN0ICE9IG51bGwpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXNJbjtcbiIsImltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcbmltcG9ydCBpc1Byb3RvdHlwZSBmcm9tICcuL19pc1Byb3RvdHlwZS5qcyc7XG5pbXBvcnQgbmF0aXZlS2V5c0luIGZyb20gJy4vX25hdGl2ZUtleXNJbi5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VLZXlzSW47XG4iLCJpbXBvcnQgYXJyYXlMaWtlS2V5cyBmcm9tICcuL19hcnJheUxpa2VLZXlzLmpzJztcbmltcG9ydCBiYXNlS2V5c0luIGZyb20gJy4vX2Jhc2VLZXlzSW4uanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzSW4obmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYicsICdjJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xuZnVuY3Rpb24ga2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0LCB0cnVlKSA6IGJhc2VLZXlzSW4ob2JqZWN0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5c0luO1xuIiwiaW1wb3J0IGNvcHlPYmplY3QgZnJvbSAnLi9fY29weU9iamVjdC5qcyc7XG5pbXBvcnQgY3JlYXRlQXNzaWduZXIgZnJvbSAnLi9fY3JlYXRlQXNzaWduZXIuanMnO1xuaW1wb3J0IGtleXNJbiBmcm9tICcuL2tleXNJbi5qcyc7XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5hc3NpZ25JbmAgZXhjZXB0IHRoYXQgaXQgYWNjZXB0cyBgY3VzdG9taXplcmBcbiAqIHdoaWNoIGlzIGludm9rZWQgdG8gcHJvZHVjZSB0aGUgYXNzaWduZWQgdmFsdWVzLiBJZiBgY3VzdG9taXplcmAgcmV0dXJuc1xuICogYHVuZGVmaW5lZGAsIGFzc2lnbm1lbnQgaXMgaGFuZGxlZCBieSB0aGUgbWV0aG9kIGluc3RlYWQuIFRoZSBgY3VzdG9taXplcmBcbiAqIGlzIGludm9rZWQgd2l0aCBmaXZlIGFyZ3VtZW50czogKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QsIHNvdXJjZSkuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIG11dGF0ZXMgYG9iamVjdGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGFsaWFzIGV4dGVuZFdpdGhcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBzb3VyY2VzIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKiBAc2VlIF8uYXNzaWduV2l0aFxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBjdXN0b21pemVyKG9ialZhbHVlLCBzcmNWYWx1ZSkge1xuICogICByZXR1cm4gXy5pc1VuZGVmaW5lZChvYmpWYWx1ZSkgPyBzcmNWYWx1ZSA6IG9ialZhbHVlO1xuICogfVxuICpcbiAqIHZhciBkZWZhdWx0cyA9IF8ucGFydGlhbFJpZ2h0KF8uYXNzaWduSW5XaXRoLCBjdXN0b21pemVyKTtcbiAqXG4gKiBkZWZhdWx0cyh7ICdhJzogMSB9LCB7ICdiJzogMiB9LCB7ICdhJzogMyB9KTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIgfVxuICovXG52YXIgYXNzaWduSW5XaXRoID0gY3JlYXRlQXNzaWduZXIoZnVuY3Rpb24ob2JqZWN0LCBzb3VyY2UsIHNyY0luZGV4LCBjdXN0b21pemVyKSB7XG4gIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzSW4oc291cmNlKSwgb2JqZWN0LCBjdXN0b21pemVyKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBhc3NpZ25JbldpdGg7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb3ZlckFyZztcbiIsImltcG9ydCBvdmVyQXJnIGZyb20gJy4vX292ZXJBcmcuanMnO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBnZXRQcm90b3R5cGUgPSBvdmVyQXJnKE9iamVjdC5nZXRQcm90b3R5cGVPZiwgT2JqZWN0KTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0UHJvdG90eXBlO1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgZ2V0UHJvdG90eXBlIGZyb20gJy4vX2dldFByb3RvdHlwZS5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fCBiYXNlR2V0VGFnKHZhbHVlKSAhPSBvYmplY3RUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiZcbiAgICBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1BsYWluT2JqZWN0O1xuIiwiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJy4vaXNQbGFpbk9iamVjdC5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBkb21FeGNUYWcgPSAnW29iamVjdCBET01FeGNlcHRpb25dJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gYEVycm9yYCwgYEV2YWxFcnJvcmAsIGBSYW5nZUVycm9yYCwgYFJlZmVyZW5jZUVycm9yYCxcbiAqIGBTeW50YXhFcnJvcmAsIGBUeXBlRXJyb3JgLCBvciBgVVJJRXJyb3JgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBlcnJvciBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Vycm9yKG5ldyBFcnJvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Vycm9yKEVycm9yKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBlcnJvclRhZyB8fCB0YWcgPT0gZG9tRXhjVGFnIHx8XG4gICAgKHR5cGVvZiB2YWx1ZS5tZXNzYWdlID09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZS5uYW1lID09ICdzdHJpbmcnICYmICFpc1BsYWluT2JqZWN0KHZhbHVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzRXJyb3I7XG4iLCJpbXBvcnQgYXBwbHkgZnJvbSAnLi9fYXBwbHkuanMnO1xuaW1wb3J0IGJhc2VSZXN0IGZyb20gJy4vX2Jhc2VSZXN0LmpzJztcbmltcG9ydCBpc0Vycm9yIGZyb20gJy4vaXNFcnJvci5qcyc7XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gaW52b2tlIGBmdW5jYCwgcmV0dXJuaW5nIGVpdGhlciB0aGUgcmVzdWx0IG9yIHRoZSBjYXVnaHQgZXJyb3JcbiAqIG9iamVjdC4gQW55IGFkZGl0aW9uYWwgYXJndW1lbnRzIGFyZSBwcm92aWRlZCB0byBgZnVuY2Agd2hlbiBpdCdzIGludm9rZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGF0dGVtcHQuXG4gKiBAcGFyYW0gey4uLip9IFthcmdzXSBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBgZnVuY2AgcmVzdWx0IG9yIGVycm9yIG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgdGhyb3dpbmcgZXJyb3JzIGZvciBpbnZhbGlkIHNlbGVjdG9ycy5cbiAqIHZhciBlbGVtZW50cyA9IF8uYXR0ZW1wdChmdW5jdGlvbihzZWxlY3Rvcikge1xuICogICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gKiB9LCAnPl8+Jyk7XG4gKlxuICogaWYgKF8uaXNFcnJvcihlbGVtZW50cykpIHtcbiAqICAgZWxlbWVudHMgPSBbXTtcbiAqIH1cbiAqL1xudmFyIGF0dGVtcHQgPSBiYXNlUmVzdChmdW5jdGlvbihmdW5jLCBhcmdzKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHVuZGVmaW5lZCwgYXJncyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gaXNFcnJvcihlKSA/IGUgOiBuZXcgRXJyb3IoZSk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBhdHRlbXB0O1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWFwYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAqIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TWFwKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlNYXA7XG4iLCJpbXBvcnQgYXJyYXlNYXAgZnJvbSAnLi9fYXJyYXlNYXAuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnZhbHVlc2AgYW5kIGBfLnZhbHVlc0luYCB3aGljaCBjcmVhdGVzIGFuXG4gKiBhcnJheSBvZiBgb2JqZWN0YCBwcm9wZXJ0eSB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgcHJvcGVydHkgbmFtZXNcbiAqIG9mIGBwcm9wc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBuYW1lcyB0byBnZXQgdmFsdWVzIGZvci5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gYmFzZVZhbHVlcyhvYmplY3QsIHByb3BzKSB7XG4gIHJldHVybiBhcnJheU1hcChwcm9wcywgZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdFtrZXldO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVZhbHVlcztcbiIsImltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmRlZmF1bHRzYCB0byBjdXN0b21pemUgaXRzIGBfLmFzc2lnbkluYCB1c2UgdG8gYXNzaWduIHByb3BlcnRpZXNcbiAqIG9mIHNvdXJjZSBvYmplY3RzIHRvIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QgZm9yIGFsbCBkZXN0aW5hdGlvbiBwcm9wZXJ0aWVzXG4gKiB0aGF0IHJlc29sdmUgdG8gYHVuZGVmaW5lZGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gb2JqVmFsdWUgVGhlIGRlc3RpbmF0aW9uIHZhbHVlLlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgc291cmNlIHZhbHVlLlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBwYXJlbnQgb2JqZWN0IG9mIGBvYmpWYWx1ZWAuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QpIHtcbiAgaWYgKG9ialZhbHVlID09PSB1bmRlZmluZWQgfHxcbiAgICAgIChlcShvYmpWYWx1ZSwgb2JqZWN0UHJvdG9ba2V5XSkgJiYgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkge1xuICAgIHJldHVybiBzcmNWYWx1ZTtcbiAgfVxuICByZXR1cm4gb2JqVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGN1c3RvbURlZmF1bHRzQXNzaWduSW47XG4iLCIvKiogVXNlZCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscy4gKi9cbnZhciBzdHJpbmdFc2NhcGVzID0ge1xuICAnXFxcXCc6ICdcXFxcJyxcbiAgXCInXCI6IFwiJ1wiLFxuICAnXFxuJzogJ24nLFxuICAnXFxyJzogJ3InLFxuICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICdcXHUyMDI5JzogJ3UyMDI5J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLnRlbXBsYXRlYCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGNociBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZ0NoYXIoY2hyKSB7XG4gIHJldHVybiAnXFxcXCcgKyBzdHJpbmdFc2NhcGVzW2Nocl07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVzY2FwZVN0cmluZ0NoYXI7XG4iLCJpbXBvcnQgb3ZlckFyZyBmcm9tICcuL19vdmVyQXJnLmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5leHBvcnQgZGVmYXVsdCBuYXRpdmVLZXlzO1xuIiwiaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBuYXRpdmVLZXlzIGZyb20gJy4vX25hdGl2ZUtleXMuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIGlmICghaXNQcm90b3R5cGUob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYga2V5ICE9ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VLZXlzO1xuIiwiaW1wb3J0IGFycmF5TGlrZUtleXMgZnJvbSAnLi9fYXJyYXlMaWtlS2V5cy5qcyc7XG5pbXBvcnQgYmFzZUtleXMgZnJvbSAnLi9fYmFzZUtleXMuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbmZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QpIDogYmFzZUtleXMob2JqZWN0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5cztcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVJbnRlcnBvbGF0ZSA9IC88JT0oW1xcc1xcU10rPyklPi9nO1xuXG5leHBvcnQgZGVmYXVsdCByZUludGVycG9sYXRlO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5wcm9wZXJ0eU9mYCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFjY2Vzc29yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUHJvcGVydHlPZihvYmplY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUHJvcGVydHlPZjtcbiIsImltcG9ydCBiYXNlUHJvcGVydHlPZiBmcm9tICcuL19iYXNlUHJvcGVydHlPZi5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hcCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuICovXG52YXIgaHRtbEVzY2FwZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmIzM5Oydcbn07XG5cbi8qKlxuICogVXNlZCBieSBgXy5lc2NhcGVgIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hyIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xudmFyIGVzY2FwZUh0bWxDaGFyID0gYmFzZVByb3BlcnR5T2YoaHRtbEVzY2FwZXMpO1xuXG5leHBvcnQgZGVmYXVsdCBlc2NhcGVIdG1sQ2hhcjtcbiIsImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNTeW1ib2w7XG4iLCJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5pbXBvcnQgYXJyYXlNYXAgZnJvbSAnLi9fYXJyYXlNYXAuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc1N5bWJvbCBmcm9tICcuL2lzU3ltYm9sLmpzJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBjb252ZXJ0IHZhbHVlcyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHJldHVybiBhcnJheU1hcCh2YWx1ZSwgYmFzZVRvU3RyaW5nKSArICcnO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRvU3RyaW5nO1xuIiwiaW1wb3J0IGJhc2VUb1N0cmluZyBmcm9tICcuL19iYXNlVG9TdHJpbmcuanMnO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gKiBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLiBUaGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9TdHJpbmcobnVsbCk7XG4gKiAvLyA9PiAnJ1xuICpcbiAqIF8udG9TdHJpbmcoLTApO1xuICogLy8gPT4gJy0wJ1xuICpcbiAqIF8udG9TdHJpbmcoWzEsIDIsIDNdKTtcbiAqIC8vID0+ICcxLDIsMydcbiAqL1xuZnVuY3Rpb24gdG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IGJhc2VUb1N0cmluZyh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRvU3RyaW5nO1xuIiwiaW1wb3J0IGVzY2FwZUh0bWxDaGFyIGZyb20gJy4vX2VzY2FwZUh0bWxDaGFyLmpzJztcbmltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvU3RyaW5nLmpzJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggSFRNTCBlbnRpdGllcyBhbmQgSFRNTCBjaGFyYWN0ZXJzLiAqL1xudmFyIHJlVW5lc2NhcGVkSHRtbCA9IC9bJjw+XCInXS9nLFxuICAgIHJlSGFzVW5lc2NhcGVkSHRtbCA9IFJlZ0V4cChyZVVuZXNjYXBlZEh0bWwuc291cmNlKTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgY2hhcmFjdGVycyBcIiZcIiwgXCI8XCIsIFwiPlwiLCAnXCInLCBhbmQgXCInXCIgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAqIGNvcnJlc3BvbmRpbmcgSFRNTCBlbnRpdGllcy5cbiAqXG4gKiAqKk5vdGU6KiogTm8gb3RoZXIgY2hhcmFjdGVycyBhcmUgZXNjYXBlZC4gVG8gZXNjYXBlIGFkZGl0aW9uYWxcbiAqIGNoYXJhY3RlcnMgdXNlIGEgdGhpcmQtcGFydHkgbGlicmFyeSBsaWtlIFtfaGVfXShodHRwczovL210aHMuYmUvaGUpLlxuICpcbiAqIFRob3VnaCB0aGUgXCI+XCIgY2hhcmFjdGVyIGlzIGVzY2FwZWQgZm9yIHN5bW1ldHJ5LCBjaGFyYWN0ZXJzIGxpa2VcbiAqIFwiPlwiIGFuZCBcIi9cIiBkb24ndCBuZWVkIGVzY2FwaW5nIGluIEhUTUwgYW5kIGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nXG4gKiB1bmxlc3MgdGhleSdyZSBwYXJ0IG9mIGEgdGFnIG9yIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS4gU2VlXG4gKiBbTWF0aGlhcyBCeW5lbnMncyBhcnRpY2xlXShodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHMpXG4gKiAodW5kZXIgXCJzZW1pLXJlbGF0ZWQgZnVuIGZhY3RcIikgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBXaGVuIHdvcmtpbmcgd2l0aCBIVE1MIHlvdSBzaG91bGQgYWx3YXlzXG4gKiBbcXVvdGUgYXR0cmlidXRlIHZhbHVlc10oaHR0cDovL3dvbmtvLmNvbS9wb3N0L2h0bWwtZXNjYXBpbmcpIHRvIHJlZHVjZVxuICogWFNTIHZlY3RvcnMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtzdHJpbmc9JyddIFRoZSBzdHJpbmcgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZXNjYXBlKCdmcmVkLCBiYXJuZXksICYgcGViYmxlcycpO1xuICogLy8gPT4gJ2ZyZWQsIGJhcm5leSwgJmFtcDsgcGViYmxlcydcbiAqL1xuZnVuY3Rpb24gZXNjYXBlKHN0cmluZykge1xuICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xuICByZXR1cm4gKHN0cmluZyAmJiByZUhhc1VuZXNjYXBlZEh0bWwudGVzdChzdHJpbmcpKVxuICAgID8gc3RyaW5nLnJlcGxhY2UocmVVbmVzY2FwZWRIdG1sLCBlc2NhcGVIdG1sQ2hhcilcbiAgICA6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXNjYXBlO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUVzY2FwZSA9IC88JS0oW1xcc1xcU10rPyklPi9nO1xuXG5leHBvcnQgZGVmYXVsdCByZUVzY2FwZTtcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVFdmFsdWF0ZSA9IC88JShbXFxzXFxTXSs/KSU+L2c7XG5cbmV4cG9ydCBkZWZhdWx0IHJlRXZhbHVhdGU7XG4iLCJpbXBvcnQgZXNjYXBlIGZyb20gJy4vZXNjYXBlLmpzJztcbmltcG9ydCByZUVzY2FwZSBmcm9tICcuL19yZUVzY2FwZS5qcyc7XG5pbXBvcnQgcmVFdmFsdWF0ZSBmcm9tICcuL19yZUV2YWx1YXRlLmpzJztcbmltcG9ydCByZUludGVycG9sYXRlIGZyb20gJy4vX3JlSW50ZXJwb2xhdGUuanMnO1xuXG4vKipcbiAqIEJ5IGRlZmF1bHQsIHRoZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzIHVzZWQgYnkgbG9kYXNoIGFyZSBsaWtlIHRob3NlIGluXG4gKiBlbWJlZGRlZCBSdWJ5IChFUkIpIGFzIHdlbGwgYXMgRVMyMDE1IHRlbXBsYXRlIHN0cmluZ3MuIENoYW5nZSB0aGVcbiAqIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIHRlbXBsYXRlU2V0dGluZ3MgPSB7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gYmUgSFRNTC1lc2NhcGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnZXNjYXBlJzogcmVFc2NhcGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGNvZGUgdG8gYmUgZXZhbHVhdGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICAnZXZhbHVhdGUnOiByZUV2YWx1YXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGluamVjdC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2ludGVycG9sYXRlJzogcmVJbnRlcnBvbGF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byByZWZlcmVuY2UgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICAndmFyaWFibGUnOiAnJyxcblxuICAvKipcbiAgICogVXNlZCB0byBpbXBvcnQgdmFyaWFibGVzIGludG8gdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICAnaW1wb3J0cyc6IHtcblxuICAgIC8qKlxuICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0c1xuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKi9cbiAgICAnXyc6IHsgJ2VzY2FwZSc6IGVzY2FwZSB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlU2V0dGluZ3M7XG4iLCJpbXBvcnQgYXNzaWduSW5XaXRoIGZyb20gJy4vYXNzaWduSW5XaXRoLmpzJztcbmltcG9ydCBhdHRlbXB0IGZyb20gJy4vYXR0ZW1wdC5qcyc7XG5pbXBvcnQgYmFzZVZhbHVlcyBmcm9tICcuL19iYXNlVmFsdWVzLmpzJztcbmltcG9ydCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluIGZyb20gJy4vX2N1c3RvbURlZmF1bHRzQXNzaWduSW4uanMnO1xuaW1wb3J0IGVzY2FwZVN0cmluZ0NoYXIgZnJvbSAnLi9fZXNjYXBlU3RyaW5nQ2hhci5qcyc7XG5pbXBvcnQgaXNFcnJvciBmcm9tICcuL2lzRXJyb3IuanMnO1xuaW1wb3J0IGlzSXRlcmF0ZWVDYWxsIGZyb20gJy4vX2lzSXRlcmF0ZWVDYWxsLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5pbXBvcnQgcmVJbnRlcnBvbGF0ZSBmcm9tICcuL19yZUludGVycG9sYXRlLmpzJztcbmltcG9ydCB0ZW1wbGF0ZVNldHRpbmdzIGZyb20gJy4vdGVtcGxhdGVTZXR0aW5ncy5qcyc7XG5pbXBvcnQgdG9TdHJpbmcgZnJvbSAnLi90b1N0cmluZy5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGVtcHR5IHN0cmluZyBsaXRlcmFscyBpbiBjb21waWxlZCB0ZW1wbGF0ZSBzb3VyY2UuICovXG52YXIgcmVFbXB0eVN0cmluZ0xlYWRpbmcgPSAvXFxiX19wIFxcKz0gJyc7L2csXG4gICAgcmVFbXB0eVN0cmluZ01pZGRsZSA9IC9cXGIoX19wIFxcKz0pICcnIFxcKy9nLFxuICAgIHJlRW1wdHlTdHJpbmdUcmFpbGluZyA9IC8oX19lXFwoLio/XFwpfFxcYl9fdFxcKSkgXFwrXFxuJyc7L2c7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaFxuICogW0VTIHRlbXBsYXRlIGRlbGltaXRlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRlbXBsYXRlLWxpdGVyYWwtbGV4aWNhbC1jb21wb25lbnRzKS5cbiAqL1xudmFyIHJlRXNUZW1wbGF0ZSA9IC9cXCRcXHsoW15cXFxcfV0qKD86XFxcXC5bXlxcXFx9XSopKilcXH0vZztcblxuLyoqIFVzZWQgdG8gZW5zdXJlIGNhcHR1cmluZyBvcmRlciBvZiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlTm9NYXRjaCA9IC8oJF4pLztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggdW5lc2NhcGVkIGNoYXJhY3RlcnMgaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLiAqL1xudmFyIHJlVW5lc2NhcGVkU3RyaW5nID0gL1snXFxuXFxyXFx1MjAyOFxcdTIwMjlcXFxcXS9nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjb21waWxlZCB0ZW1wbGF0ZSBmdW5jdGlvbiB0aGF0IGNhbiBpbnRlcnBvbGF0ZSBkYXRhIHByb3BlcnRpZXNcbiAqIGluIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXJzLCBIVE1MLWVzY2FwZSBpbnRlcnBvbGF0ZWQgZGF0YSBwcm9wZXJ0aWVzIGluXG4gKiBcImVzY2FwZVwiIGRlbGltaXRlcnMsIGFuZCBleGVjdXRlIEphdmFTY3JpcHQgaW4gXCJldmFsdWF0ZVwiIGRlbGltaXRlcnMuIERhdGFcbiAqIHByb3BlcnRpZXMgbWF5IGJlIGFjY2Vzc2VkIGFzIGZyZWUgdmFyaWFibGVzIGluIHRoZSB0ZW1wbGF0ZS4gSWYgYSBzZXR0aW5nXG4gKiBvYmplY3QgaXMgZ2l2ZW4sIGl0IHRha2VzIHByZWNlZGVuY2Ugb3ZlciBgXy50ZW1wbGF0ZVNldHRpbmdzYCB2YWx1ZXMuXG4gKlxuICogKipOb3RlOioqIEluIHRoZSBkZXZlbG9wbWVudCBidWlsZCBgXy50ZW1wbGF0ZWAgdXRpbGl6ZXNcbiAqIFtzb3VyY2VVUkxzXShodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9kZXZlbG9wZXJ0b29scy9zb3VyY2VtYXBzLyN0b2Mtc291cmNldXJsKVxuICogZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gcHJlY29tcGlsaW5nIHRlbXBsYXRlcyBzZWVcbiAqIFtsb2Rhc2gncyBjdXN0b20gYnVpbGRzIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vbG9kYXNoLmNvbS9jdXN0b20tYnVpbGRzKS5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBDaHJvbWUgZXh0ZW5zaW9uIHNhbmRib3hlcyBzZWVcbiAqIFtDaHJvbWUncyBleHRlbnNpb25zIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZGV2ZWxvcGVyLmNocm9tZS5jb20vZXh0ZW5zaW9ucy9zYW5kYm94aW5nRXZhbCkuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtzdHJpbmc9JyddIFRoZSB0ZW1wbGF0ZSBzdHJpbmcuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5lc2NhcGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmVzY2FwZV1cbiAqICBUaGUgSFRNTCBcImVzY2FwZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5ldmFsdWF0ZT1fLnRlbXBsYXRlU2V0dGluZ3MuZXZhbHVhdGVdXG4gKiAgVGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMuaW1wb3J0cz1fLnRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0c11cbiAqICBBbiBvYmplY3QgdG8gaW1wb3J0IGludG8gdGhlIHRlbXBsYXRlIGFzIGZyZWUgdmFyaWFibGVzLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmludGVycG9sYXRlPV8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZV1cbiAqICBUaGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zb3VyY2VVUkw9J3RlbXBsYXRlU291cmNlc1tuXSddXG4gKiAgVGhlIHNvdXJjZVVSTCBvZiB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudmFyaWFibGU9J29iaiddXG4gKiAgVGhlIGRhdGEgb2JqZWN0IHZhcmlhYmxlIG5hbWUuXG4gKiBAcGFyYW0tIHtPYmplY3R9IFtndWFyZF0gRW5hYmxlcyB1c2UgYXMgYW4gaXRlcmF0ZWUgZm9yIG1ldGhvZHMgbGlrZSBgXy5tYXBgLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBjb21waWxlZCB0ZW1wbGF0ZSBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gVXNlIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyIHRvIGNyZWF0ZSBhIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IHVzZXIgJT4hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ2ZyZWQnIH0pO1xuICogLy8gPT4gJ2hlbGxvIGZyZWQhJ1xuICpcbiAqIC8vIFVzZSB0aGUgSFRNTCBcImVzY2FwZVwiIGRlbGltaXRlciB0byBlc2NhcGUgZGF0YSBwcm9wZXJ0eSB2YWx1ZXMuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8Yj48JS0gdmFsdWUgJT48L2I+Jyk7XG4gKiBjb21waWxlZCh7ICd2YWx1ZSc6ICc8c2NyaXB0PicgfSk7XG4gKiAvLyA9PiAnPGI+Jmx0O3NjcmlwdCZndDs8L2I+J1xuICpcbiAqIC8vIFVzZSB0aGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlciB0byBleGVjdXRlIEphdmFTY3JpcHQgYW5kIGdlbmVyYXRlIEhUTUwuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JSBfLmZvckVhY2godXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHsgJT48bGk+PCUtIHVzZXIgJT48L2xpPjwlIH0pOyAlPicpO1xuICogY29tcGlsZWQoeyAndXNlcnMnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyBVc2UgdGhlIGludGVybmFsIGBwcmludGAgZnVuY3Rpb24gaW4gXCJldmFsdWF0ZVwiIGRlbGltaXRlcnMuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JSBwcmludChcImhlbGxvIFwiICsgdXNlcik7ICU+IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdiYXJuZXknIH0pO1xuICogLy8gPT4gJ2hlbGxvIGJhcm5leSEnXG4gKlxuICogLy8gVXNlIHRoZSBFUyB0ZW1wbGF0ZSBsaXRlcmFsIGRlbGltaXRlciBhcyBhbiBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogLy8gRGlzYWJsZSBzdXBwb3J0IGJ5IHJlcGxhY2luZyB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvICR7IHVzZXIgfSEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAncGViYmxlcycgfSk7XG4gKiAvLyA9PiAnaGVsbG8gcGViYmxlcyEnXG4gKlxuICogLy8gVXNlIGJhY2tzbGFzaGVzIHRvIHRyZWF0IGRlbGltaXRlcnMgYXMgcGxhaW4gdGV4dC5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJzwlPSBcIlxcXFw8JS0gdmFsdWUgJVxcXFw+XCIgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ3ZhbHVlJzogJ2lnbm9yZWQnIH0pO1xuICogLy8gPT4gJzwlLSB2YWx1ZSAlPidcbiAqXG4gKiAvLyBVc2UgdGhlIGBpbXBvcnRzYCBvcHRpb24gdG8gaW1wb3J0IGBqUXVlcnlgIGFzIGBqcWAuXG4gKiB2YXIgdGV4dCA9ICc8JSBqcS5lYWNoKHVzZXJzLCBmdW5jdGlvbih1c2VyKSB7ICU+PGxpPjwlLSB1c2VyICU+PC9saT48JSB9KTsgJT4nO1xuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSh0ZXh0LCB7ICdpbXBvcnRzJzogeyAnanEnOiBqUXVlcnkgfSB9KTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXJzJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gVXNlIHRoZSBgc291cmNlVVJMYCBvcHRpb24gdG8gc3BlY2lmeSBhIGN1c3RvbSBzb3VyY2VVUkwgZm9yIHRoZSB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSB1c2VyICU+IScsIHsgJ3NvdXJjZVVSTCc6ICcvYmFzaWMvZ3JlZXRpbmcuanN0JyB9KTtcbiAqIGNvbXBpbGVkKGRhdGEpO1xuICogLy8gPT4gRmluZCB0aGUgc291cmNlIG9mIFwiZ3JlZXRpbmcuanN0XCIgdW5kZXIgdGhlIFNvdXJjZXMgdGFiIG9yIFJlc291cmNlcyBwYW5lbCBvZiB0aGUgd2ViIGluc3BlY3Rvci5cbiAqXG4gKiAvLyBVc2UgdGhlIGB2YXJpYWJsZWAgb3B0aW9uIHRvIGVuc3VyZSBhIHdpdGgtc3RhdGVtZW50IGlzbid0IHVzZWQgaW4gdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGkgPCU9IGRhdGEudXNlciAlPiEnLCB7ICd2YXJpYWJsZSc6ICdkYXRhJyB9KTtcbiAqIGNvbXBpbGVkLnNvdXJjZTtcbiAqIC8vID0+IGZ1bmN0aW9uKGRhdGEpIHtcbiAqIC8vICAgdmFyIF9fdCwgX19wID0gJyc7XG4gKiAvLyAgIF9fcCArPSAnaGkgJyArICgoX190ID0gKCBkYXRhLnVzZXIgKSkgPT0gbnVsbCA/ICcnIDogX190KSArICchJztcbiAqIC8vICAgcmV0dXJuIF9fcDtcbiAqIC8vIH1cbiAqXG4gKiAvLyBVc2UgY3VzdG9tIHRlbXBsYXRlIGRlbGltaXRlcnMuXG4gKiBfLnRlbXBsYXRlU2V0dGluZ3MuaW50ZXJwb2xhdGUgPSAve3soW1xcc1xcU10rPyl9fS9nO1xuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8ge3sgdXNlciB9fSEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnbXVzdGFjaGUnIH0pO1xuICogLy8gPT4gJ2hlbGxvIG11c3RhY2hlISdcbiAqXG4gKiAvLyBVc2UgdGhlIGBzb3VyY2VgIHByb3BlcnR5IHRvIGlubGluZSBjb21waWxlZCB0ZW1wbGF0ZXMgZm9yIG1lYW5pbmdmdWxcbiAqIC8vIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzLlxuICogZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2pzdC5qcycpLCAnXFxcbiAqICAgdmFyIEpTVCA9IHtcXFxuICogICAgIFwibWFpblwiOiAnICsgXy50ZW1wbGF0ZShtYWluVGV4dCkuc291cmNlICsgJ1xcXG4gKiAgIH07XFxcbiAqICcpO1xuICovXG5mdW5jdGlvbiB0ZW1wbGF0ZShzdHJpbmcsIG9wdGlvbnMsIGd1YXJkKSB7XG4gIC8vIEJhc2VkIG9uIEpvaG4gUmVzaWcncyBgdG1wbGAgaW1wbGVtZW50YXRpb25cbiAgLy8gKGh0dHA6Ly9lam9obi5vcmcvYmxvZy9qYXZhc2NyaXB0LW1pY3JvLXRlbXBsYXRpbmcvKVxuICAvLyBhbmQgTGF1cmEgRG9rdG9yb3ZhJ3MgZG9ULmpzIChodHRwczovL2dpdGh1Yi5jb20vb2xhZG8vZG9UKS5cbiAgdmFyIHNldHRpbmdzID0gdGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzLl8udGVtcGxhdGVTZXR0aW5ncyB8fCB0ZW1wbGF0ZVNldHRpbmdzO1xuXG4gIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzdHJpbmcsIG9wdGlvbnMsIGd1YXJkKSkge1xuICAgIG9wdGlvbnMgPSB1bmRlZmluZWQ7XG4gIH1cbiAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcbiAgb3B0aW9ucyA9IGFzc2lnbkluV2l0aCh7fSwgb3B0aW9ucywgc2V0dGluZ3MsIGN1c3RvbURlZmF1bHRzQXNzaWduSW4pO1xuXG4gIHZhciBpbXBvcnRzID0gYXNzaWduSW5XaXRoKHt9LCBvcHRpb25zLmltcG9ydHMsIHNldHRpbmdzLmltcG9ydHMsIGN1c3RvbURlZmF1bHRzQXNzaWduSW4pLFxuICAgICAgaW1wb3J0c0tleXMgPSBrZXlzKGltcG9ydHMpLFxuICAgICAgaW1wb3J0c1ZhbHVlcyA9IGJhc2VWYWx1ZXMoaW1wb3J0cywgaW1wb3J0c0tleXMpO1xuXG4gIHZhciBpc0VzY2FwaW5nLFxuICAgICAgaXNFdmFsdWF0aW5nLFxuICAgICAgaW5kZXggPSAwLFxuICAgICAgaW50ZXJwb2xhdGUgPSBvcHRpb25zLmludGVycG9sYXRlIHx8IHJlTm9NYXRjaCxcbiAgICAgIHNvdXJjZSA9IFwiX19wICs9ICdcIjtcblxuICAvLyBDb21waWxlIHRoZSByZWdleHAgdG8gbWF0Y2ggZWFjaCBkZWxpbWl0ZXIuXG4gIHZhciByZURlbGltaXRlcnMgPSBSZWdFeHAoXG4gICAgKG9wdGlvbnMuZXNjYXBlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICBpbnRlcnBvbGF0ZS5zb3VyY2UgKyAnfCcgK1xuICAgIChpbnRlcnBvbGF0ZSA9PT0gcmVJbnRlcnBvbGF0ZSA/IHJlRXNUZW1wbGF0ZSA6IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICAob3B0aW9ucy5ldmFsdWF0ZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JCdcbiAgLCAnZycpO1xuXG4gIC8vIFVzZSBhIHNvdXJjZVVSTCBmb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAgLy8gVGhlIHNvdXJjZVVSTCBnZXRzIGluamVjdGVkIGludG8gdGhlIHNvdXJjZSB0aGF0J3MgZXZhbC1lZCwgc28gYmUgY2FyZWZ1bFxuICAvLyB3aXRoIGxvb2t1cCAoaW4gY2FzZSBvZiBlLmcuIHByb3RvdHlwZSBwb2xsdXRpb24pLCBhbmQgc3RyaXAgbmV3bGluZXMgaWYgYW55LlxuICAvLyBBIG5ld2xpbmUgd291bGRuJ3QgYmUgYSB2YWxpZCBzb3VyY2VVUkwgYW55d2F5LCBhbmQgaXQnZCBlbmFibGUgY29kZSBpbmplY3Rpb24uXG4gIHZhciBzb3VyY2VVUkwgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsICdzb3VyY2VVUkwnKVxuICAgID8gKCcvLyMgc291cmNlVVJMPScgK1xuICAgICAgIChvcHRpb25zLnNvdXJjZVVSTCArICcnKS5yZXBsYWNlKC9bXFxyXFxuXS9nLCAnICcpICtcbiAgICAgICAnXFxuJylcbiAgICA6ICcnO1xuXG4gIHN0cmluZy5yZXBsYWNlKHJlRGVsaW1pdGVycywgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZVZhbHVlLCBpbnRlcnBvbGF0ZVZhbHVlLCBlc1RlbXBsYXRlVmFsdWUsIGV2YWx1YXRlVmFsdWUsIG9mZnNldCkge1xuICAgIGludGVycG9sYXRlVmFsdWUgfHwgKGludGVycG9sYXRlVmFsdWUgPSBlc1RlbXBsYXRlVmFsdWUpO1xuXG4gICAgLy8gRXNjYXBlIGNoYXJhY3RlcnMgdGhhdCBjYW4ndCBiZSBpbmNsdWRlZCBpbiBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgc291cmNlICs9IHN0cmluZy5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKHJlVW5lc2NhcGVkU3RyaW5nLCBlc2NhcGVTdHJpbmdDaGFyKTtcblxuICAgIC8vIFJlcGxhY2UgZGVsaW1pdGVycyB3aXRoIHNuaXBwZXRzLlxuICAgIGlmIChlc2NhcGVWYWx1ZSkge1xuICAgICAgaXNFc2NhcGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG5fX2UoXCIgKyBlc2NhcGVWYWx1ZSArIFwiKSArXFxuJ1wiO1xuICAgIH1cbiAgICBpZiAoZXZhbHVhdGVWYWx1ZSkge1xuICAgICAgaXNFdmFsdWF0aW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZVZhbHVlICsgXCI7XFxuX19wICs9ICdcIjtcbiAgICB9XG4gICAgaWYgKGludGVycG9sYXRlVmFsdWUpIHtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbigoX190ID0gKFwiICsgaW50ZXJwb2xhdGVWYWx1ZSArIFwiKSkgPT0gbnVsbCA/ICcnIDogX190KSArXFxuJ1wiO1xuICAgIH1cbiAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgIC8vIFRoZSBKUyBlbmdpbmUgZW1iZWRkZWQgaW4gQWRvYmUgcHJvZHVjdHMgbmVlZHMgYG1hdGNoYCByZXR1cm5lZCBpblxuICAgIC8vIG9yZGVyIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3QgYG9mZnNldGAgdmFsdWUuXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9KTtcblxuICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gIC8vIElmIGB2YXJpYWJsZWAgaXMgbm90IHNwZWNpZmllZCB3cmFwIGEgd2l0aC1zdGF0ZW1lbnQgYXJvdW5kIHRoZSBnZW5lcmF0ZWRcbiAgLy8gY29kZSB0byBhZGQgdGhlIGRhdGEgb2JqZWN0IHRvIHRoZSB0b3Agb2YgdGhlIHNjb3BlIGNoYWluLlxuICAvLyBMaWtlIHdpdGggc291cmNlVVJMLCB3ZSB0YWtlIGNhcmUgdG8gbm90IGNoZWNrIHRoZSBvcHRpb24ncyBwcm90b3R5cGUsXG4gIC8vIGFzIHRoaXMgY29uZmlndXJhdGlvbiBpcyBhIGNvZGUgaW5qZWN0aW9uIHZlY3Rvci5cbiAgdmFyIHZhcmlhYmxlID0gaGFzT3duUHJvcGVydHkuY2FsbChvcHRpb25zLCAndmFyaWFibGUnKSAmJiBvcHRpb25zLnZhcmlhYmxlO1xuICBpZiAoIXZhcmlhYmxlKSB7XG4gICAgc291cmNlID0gJ3dpdGggKG9iaikge1xcbicgKyBzb3VyY2UgKyAnXFxufVxcbic7XG4gIH1cbiAgLy8gQ2xlYW51cCBjb2RlIGJ5IHN0cmlwcGluZyBlbXB0eSBzdHJpbmdzLlxuICBzb3VyY2UgPSAoaXNFdmFsdWF0aW5nID8gc291cmNlLnJlcGxhY2UocmVFbXB0eVN0cmluZ0xlYWRpbmcsICcnKSA6IHNvdXJjZSlcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nTWlkZGxlLCAnJDEnKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdUcmFpbGluZywgJyQxOycpO1xuXG4gIC8vIEZyYW1lIGNvZGUgYXMgdGhlIGZ1bmN0aW9uIGJvZHkuXG4gIHNvdXJjZSA9ICdmdW5jdGlvbignICsgKHZhcmlhYmxlIHx8ICdvYmonKSArICcpIHtcXG4nICtcbiAgICAodmFyaWFibGVcbiAgICAgID8gJydcbiAgICAgIDogJ29iaiB8fCAob2JqID0ge30pO1xcbidcbiAgICApICtcbiAgICBcInZhciBfX3QsIF9fcCA9ICcnXCIgK1xuICAgIChpc0VzY2FwaW5nXG4gICAgICAgPyAnLCBfX2UgPSBfLmVzY2FwZSdcbiAgICAgICA6ICcnXG4gICAgKSArXG4gICAgKGlzRXZhbHVhdGluZ1xuICAgICAgPyAnLCBfX2ogPSBBcnJheS5wcm90b3R5cGUuam9pbjtcXG4nICtcbiAgICAgICAgXCJmdW5jdGlvbiBwcmludCgpIHsgX19wICs9IF9fai5jYWxsKGFyZ3VtZW50cywgJycpIH1cXG5cIlxuICAgICAgOiAnO1xcbidcbiAgICApICtcbiAgICBzb3VyY2UgK1xuICAgICdyZXR1cm4gX19wXFxufSc7XG5cbiAgdmFyIHJlc3VsdCA9IGF0dGVtcHQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uKGltcG9ydHNLZXlzLCBzb3VyY2VVUkwgKyAncmV0dXJuICcgKyBzb3VyY2UpXG4gICAgICAuYXBwbHkodW5kZWZpbmVkLCBpbXBvcnRzVmFsdWVzKTtcbiAgfSk7XG5cbiAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24ncyBzb3VyY2UgYnkgaXRzIGB0b1N0cmluZ2AgbWV0aG9kIG9yXG4gIC8vIHRoZSBgc291cmNlYCBwcm9wZXJ0eSBhcyBhIGNvbnZlbmllbmNlIGZvciBpbmxpbmluZyBjb21waWxlZCB0ZW1wbGF0ZXMuXG4gIHJlc3VsdC5zb3VyY2UgPSBzb3VyY2U7XG4gIGlmIChpc0Vycm9yKHJlc3VsdCkpIHtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5mb3JFYWNoYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlFYWNoKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSA9PT0gZmFsc2UpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5RWFjaDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIG1ldGhvZHMgbGlrZSBgXy5mb3JJbmAgYW5kIGBfLmZvck93bmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUZvcihmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgaXRlcmF0ZWUsIGtleXNGdW5jKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KG9iamVjdCksXG4gICAgICAgIHByb3BzID0ga2V5c0Z1bmMob2JqZWN0KSxcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbZnJvbVJpZ2h0ID8gbGVuZ3RoIDogKytpbmRleF07XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCYXNlRm9yO1xuIiwiaW1wb3J0IGNyZWF0ZUJhc2VGb3IgZnJvbSAnLi9fY3JlYXRlQmFzZUZvci5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGJhc2VGb3JPd25gIHdoaWNoIGl0ZXJhdGVzIG92ZXIgYG9iamVjdGBcbiAqIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgYGtleXNGdW5jYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG52YXIgYmFzZUZvciA9IGNyZWF0ZUJhc2VGb3IoKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZvcjtcbiIsImltcG9ydCBiYXNlRm9yIGZyb20gJy4vX2Jhc2VGb3IuanMnO1xuaW1wb3J0IGtleXMgZnJvbSAnLi9rZXlzLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JPd25gIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlRm9yT3duKG9iamVjdCwgaXRlcmF0ZWUpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBiYXNlRm9yKG9iamVjdCwgaXRlcmF0ZWUsIGtleXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlRm9yT3duO1xuIiwiaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBgYmFzZUVhY2hgIG9yIGBiYXNlRWFjaFJpZ2h0YCBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZWFjaEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGl0ZXJhdGUgb3ZlciBhIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VFYWNoKGVhY2hGdW5jLCBmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gICAgaWYgKGNvbGxlY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuICAgIGlmICghaXNBcnJheUxpa2UoY29sbGVjdGlvbikpIHtcbiAgICAgIHJldHVybiBlYWNoRnVuYyhjb2xsZWN0aW9uLCBpdGVyYXRlZSk7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aCxcbiAgICAgICAgaW5kZXggPSBmcm9tUmlnaHQgPyBsZW5ndGggOiAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3QoY29sbGVjdGlvbik7XG5cbiAgICB3aGlsZSAoKGZyb21SaWdodCA/IGluZGV4LS0gOiArK2luZGV4IDwgbGVuZ3RoKSkge1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2luZGV4XSwgaW5kZXgsIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCYXNlRWFjaDtcbiIsImltcG9ydCBiYXNlRm9yT3duIGZyb20gJy4vX2Jhc2VGb3JPd24uanMnO1xuaW1wb3J0IGNyZWF0ZUJhc2VFYWNoIGZyb20gJy4vX2NyZWF0ZUJhc2VFYWNoLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JFYWNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xudmFyIGJhc2VFYWNoID0gY3JlYXRlQmFzZUVhY2goYmFzZUZvck93bik7XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VFYWNoO1xuIiwiaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIENhc3RzIGB2YWx1ZWAgdG8gYGlkZW50aXR5YCBpZiBpdCdzIG5vdCBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGNhc3QgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNhc3RGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicgPyB2YWx1ZSA6IGlkZW50aXR5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjYXN0RnVuY3Rpb247XG4iLCJpbXBvcnQgYXJyYXlFYWNoIGZyb20gJy4vX2FycmF5RWFjaC5qcyc7XG5pbXBvcnQgYmFzZUVhY2ggZnJvbSAnLi9fYmFzZUVhY2guanMnO1xuaW1wb3J0IGNhc3RGdW5jdGlvbiBmcm9tICcuL19jYXN0RnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIGVsZW1lbnQuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqICoqTm90ZToqKiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBcImxlbmd0aFwiXG4gKiBwcm9wZXJ0eSBhcmUgaXRlcmF0ZWQgbGlrZSBhcnJheXMuIFRvIGF2b2lkIHRoaXMgYmVoYXZpb3IgdXNlIGBfLmZvckluYFxuICogb3IgYF8uZm9yT3duYCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAYWxpYXMgZWFjaFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKiBAc2VlIF8uZm9yRWFjaFJpZ2h0XG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZm9yRWFjaChbMSwgMl0sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gKiAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyBgMWAgdGhlbiBgMmAuXG4gKlxuICogXy5mb3JFYWNoKHsgJ2EnOiAxLCAnYic6IDIgfSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaDtcbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgY2FzdEZ1bmN0aW9uKGl0ZXJhdGVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZvckVhY2g7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdsb2Rhc2gtZXMvdGVtcGxhdGUnO1xuaW1wb3J0IGZvckVhY2ggZnJvbSAnbG9kYXNoLWVzL2ZvckVhY2gnO1xuXG4vKipcbiAqIFRoZSBOZWFyYnlTdG9wcyBNb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBOZWFyYnlTdG9wcyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgTmVhcmJ5U3RvcHMgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKiBAdHlwZSB7QXJyYXl9IENvbGxlY3Rpb24gb2YgbmVhcmJ5IHN0b3BzIERPTSBlbGVtZW50cyAqL1xuICAgIHRoaXMuX2VsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChOZWFyYnlTdG9wcy5zZWxlY3Rvcik7XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY29sbGVjdGlvbiBhbGwgc3RvcHMgZnJvbSB0aGUgZGF0YSAqL1xuICAgIHRoaXMuX3N0b3BzID0gW107XG5cbiAgICAvKiogQHR5cGUge0FycmF5fSBUaGUgY3VycmF0ZWQgY29sbGVjdGlvbiBvZiBzdG9wcyB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgKi9cbiAgICB0aGlzLl9sb2NhdGlvbnMgPSBbXTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBET00gQ29tcG9uZW50cy5cbiAgICBmb3JFYWNoKHRoaXMuX2VsZW1lbnRzLCAoZWwpID0+IHtcbiAgICAgIC8vIEZldGNoIHRoZSBkYXRhIGZvciB0aGUgZWxlbWVudC5cbiAgICAgIHRoaXMuX2ZldGNoKGVsLCAoc3RhdHVzLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChzdGF0dXMgIT09ICdzdWNjZXNzJykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3N0b3BzID0gZGF0YTtcbiAgICAgICAgLy8gR2V0IHN0b3BzIGNsb3Nlc3QgdG8gdGhlIGxvY2F0aW9uLlxuICAgICAgICB0aGlzLl9sb2NhdGlvbnMgPSB0aGlzLl9sb2NhdGUoZWwsIHRoaXMuX3N0b3BzKTtcbiAgICAgICAgLy8gQXNzaWduIHRoZSBjb2xvciBuYW1lcyBmcm9tIHBhdHRlcm5zIHN0eWxlc2hlZXQuXG4gICAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IHRoaXMuX2Fzc2lnbkNvbG9ycyh0aGlzLl9sb2NhdGlvbnMpO1xuICAgICAgICAvLyBSZW5kZXIgdGhlIG1hcmt1cCBmb3IgdGhlIHN0b3BzLlxuICAgICAgICB0aGlzLl9yZW5kZXIoZWwsIHRoaXMuX2xvY2F0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcGFyZXMgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgd2l0aCB0aGUgU3Vid2F5IFN0b3BzIGRhdGEsIHNvcnRzXG4gICAqIHRoZSBkYXRhIGJ5IGRpc3RhbmNlIGZyb20gY2xvc2VzdCB0byBmYXJ0aGVzdCwgYW5kIHJldHVybnMgdGhlIHN0b3AgYW5kXG4gICAqIGRpc3RhbmNlcyBvZiB0aGUgc3RhdGlvbnMuXG4gICAqIEBwYXJhbSAge29iamVjdH0gZWwgICAgVGhlIERPTSBDb21wb25lbnQgd2l0aCB0aGUgZGF0YSBhdHRyIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9wcyBBbGwgb2YgdGhlIHN0b3BzIGRhdGEgdG8gY29tcGFyZSB0b1xuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgIEEgY29sbGVjdGlvbiBvZiB0aGUgY2xvc2VzdCBzdG9wcyB3aXRoIGRpc3RhbmNlc1xuICAgKi9cbiAgX2xvY2F0ZShlbCwgc3RvcHMpIHtcbiAgICBjb25zdCBhbW91bnQgPSBwYXJzZUludCh0aGlzLl9vcHQoZWwsICdBTU9VTlQnKSlcbiAgICAgIHx8IE5lYXJieVN0b3BzLmRlZmF1bHRzLkFNT1VOVDtcbiAgICBsZXQgbG9jID0gSlNPTi5wYXJzZSh0aGlzLl9vcHQoZWwsICdMT0NBVElPTicpKTtcbiAgICBsZXQgZ2VvID0gW107XG4gICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xuXG4gICAgLy8gMS4gQ29tcGFyZSBsYXQgYW5kIGxvbiBvZiBjdXJyZW50IGxvY2F0aW9uIHdpdGggbGlzdCBvZiBzdG9wc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdlbyA9IHN0b3BzW2ldW3RoaXMuX2tleSgnT0RBVEFfR0VPJyldW3RoaXMuX2tleSgnT0RBVEFfQ09PUicpXTtcbiAgICAgIGdlbyA9IGdlby5yZXZlcnNlKCk7XG4gICAgICBkaXN0YW5jZXMucHVzaCh7XG4gICAgICAgICdkaXN0YW5jZSc6IHRoaXMuX2VxdWlyZWN0YW5ndWxhcihsb2NbMF0sIGxvY1sxXSwgZ2VvWzBdLCBnZW9bMV0pLFxuICAgICAgICAnc3RvcCc6IGksIC8vIGluZGV4IG9mIHN0b3AgaW4gdGhlIGRhdGFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDIuIFNvcnQgdGhlIGRpc3RhbmNlcyBzaG9ydGVzdCB0byBsb25nZXN0XG4gICAgZGlzdGFuY2VzLnNvcnQoKGEsIGIpID0+IChhLmRpc3RhbmNlIDwgYi5kaXN0YW5jZSkgPyAtMSA6IDEpO1xuICAgIGRpc3RhbmNlcyA9IGRpc3RhbmNlcy5zbGljZSgwLCBhbW91bnQpO1xuXG4gICAgLy8gMy4gUmV0dXJuIHRoZSBsaXN0IG9mIGNsb3Nlc3Qgc3RvcHMgKG51bWJlciBiYXNlZCBvbiBBbW91bnQgb3B0aW9uKVxuICAgIC8vIGFuZCByZXBsYWNlIHRoZSBzdG9wIGluZGV4IHdpdGggdGhlIGFjdHVhbCBzdG9wIGRhdGFcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRpc3RhbmNlcy5sZW5ndGg7IHgrKylcbiAgICAgIGRpc3RhbmNlc1t4XS5zdG9wID0gc3RvcHNbZGlzdGFuY2VzW3hdLnN0b3BdO1xuXG4gICAgcmV0dXJuIGRpc3RhbmNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBzdG9wIGRhdGEgZnJvbSBhIGxvY2FsIHNvdXJjZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9ICAgZWwgICAgICAgVGhlIE5lYXJieVN0b3BzIERPTSBlbGVtZW50XG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBzdWNjZXNzXG4gICAqIEByZXR1cm4ge2Z1bmNpdG9ufSAgICAgICAgICB0aGUgZmV0Y2ggcHJvbWlzZVxuICAgKi9cbiAgX2ZldGNoKGVsLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAnbWV0aG9kJzogJ0dFVCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuX29wdChlbCwgJ0VORFBPSU5UJyksIGhlYWRlcnMpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgICAgICBjYWxsYmFjaygnZXJyb3InLCByZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICAgIGNhbGxiYWNrKCdlcnJvcicsIGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4gY2FsbGJhY2soJ3N1Y2Nlc3MnLCBkYXRhKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBkaXN0YW5jZSBpbiBtaWxlcyBjb21wYXJpbmcgdGhlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgb2YgdHdvXG4gICAqIHBvaW50cyB1c2luZyBkZWNpbWFsIGRlZ3JlZXMuXG4gICAqIEBwYXJhbSAge2Zsb2F0fSBsYXQxIExhdGl0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxvbjEgTG9uZ2l0dWRlIG9mIHBvaW50IDEgKGluIGRlY2ltYWwgZGVncmVlcylcbiAgICogQHBhcmFtICB7ZmxvYXR9IGxhdDIgTGF0aXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcGFyYW0gIHtmbG9hdH0gbG9uMiBMb25naXR1ZGUgb2YgcG9pbnQgMiAoaW4gZGVjaW1hbCBkZWdyZWVzKVxuICAgKiBAcmV0dXJuIHtmbG9hdH0gICAgICBbZGVzY3JpcHRpb25dXG4gICAqL1xuICBfZXF1aXJlY3Rhbmd1bGFyKGxhdDEsIGxvbjEsIGxhdDIsIGxvbjIpIHtcbiAgICBNYXRoLmRlZzJyYWQgPSAoZGVnKSA9PiBkZWcgKiAoTWF0aC5QSSAvIDE4MCk7XG4gICAgbGV0IGFscGhhID0gTWF0aC5hYnMobG9uMikgLSBNYXRoLmFicyhsb24xKTtcbiAgICBsZXQgeCA9IE1hdGguZGVnMnJhZChhbHBoYSkgKiBNYXRoLmNvcyhNYXRoLmRlZzJyYWQobGF0MSArIGxhdDIpIC8gMik7XG4gICAgbGV0IHkgPSBNYXRoLmRlZzJyYWQobGF0MSAtIGxhdDIpO1xuICAgIGxldCBSID0gMzk1OTsgLy8gZWFydGggcmFkaXVzIGluIG1pbGVzO1xuICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSAqIFI7XG5cbiAgICByZXR1cm4gZGlzdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogQXNzaWducyBjb2xvcnMgdG8gdGhlIGRhdGEgdXNpbmcgdGhlIE5lYXJieVN0b3BzLnRydW5ja3MgZGljdGlvbmFyeS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBsb2NhdGlvbnMgT2JqZWN0IG9mIGNsb3Nlc3QgbG9jYXRpb25zXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgIFNhbWUgb2JqZWN0IHdpdGggY29sb3JzIGFzc2lnbmVkIHRvIGVhY2ggbG9jXG4gICAqL1xuICBfYXNzaWduQ29sb3JzKGxvY2F0aW9ucykge1xuICAgIGxldCBsb2NhdGlvbkxpbmVzID0gW107XG4gICAgbGV0IGxpbmUgPSAnUyc7XG4gICAgbGV0IGxpbmVzID0gWydTJ107XG5cbiAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBsb2NhdGlvbiB0aGF0IHdlIGFyZSBnb2luZyB0byBkaXNwbGF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGFzc2lnbiB0aGUgbGluZSB0byBhIHZhcmlhYmxlIHRvIGxvb2t1cCBpbiBvdXIgY29sb3IgZGljdGlvbmFyeVxuICAgICAgbG9jYXRpb25MaW5lcyA9IGxvY2F0aW9uc1tpXS5zdG9wW3RoaXMuX2tleSgnT0RBVEFfTElORScpXS5zcGxpdCgnLScpO1xuXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGxvY2F0aW9uTGluZXMubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgbGluZSA9IGxvY2F0aW9uTGluZXNbeF07XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBOZWFyYnlTdG9wcy50cnVua3MubGVuZ3RoOyB5KyspIHtcbiAgICAgICAgICBsaW5lcyA9IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnTElORVMnXTtcblxuICAgICAgICAgIGlmIChsaW5lcy5pbmRleE9mKGxpbmUpID4gLTEpXG4gICAgICAgICAgICBsb2NhdGlvbkxpbmVzW3hdID0ge1xuICAgICAgICAgICAgICAnbGluZSc6IGxpbmUsXG4gICAgICAgICAgICAgICd0cnVuayc6IE5lYXJieVN0b3BzLnRydW5rc1t5XVsnVFJVTksnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgdGhlIHRydW5rIHRvIHRoZSBsb2NhdGlvblxuICAgICAgbG9jYXRpb25zW2ldLnRydW5rcyA9IGxvY2F0aW9uTGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2F0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZnVuY3Rpb24gdG8gY29tcGlsZSBhbmQgcmVuZGVyIHRoZSBsb2NhdGlvbiB0ZW1wbGF0ZVxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgVGhlIHBhcmVudCBET00gZWxlbWVudCBvZiB0aGUgY29tcG9uZW50XG4gICAqIEBwYXJhbSAge29iamVjdH0gZGF0YSAgICBUaGUgZGF0YSB0byBwYXNzIHRvIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICAgVGhlIE5lYXJieVN0b3BzIGNsYXNzXG4gICAqL1xuICBfcmVuZGVyKGVsZW1lbnQsIGRhdGEpIHtcbiAgICBsZXQgY29tcGlsZWQgPSB0ZW1wbGF0ZShOZWFyYnlTdG9wcy50ZW1wbGF0ZXMuU1VCV0FZLCB7XG4gICAgICAnaW1wb3J0cyc6IHtcbiAgICAgICAgJ19lYWNoJzogZm9yRWFjaFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb21waWxlZCh7J3N0b3BzJzogZGF0YX0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGRhdGEgYXR0cmlidXRlIG9wdGlvbnNcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHB1bGwgdGhlIHNldHRpbmcgZnJvbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBvcHQgICAgIFRoZSBrZXkgcmVmZXJlbmNlIHRvIHRoZSBhdHRyaWJ1dGUuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICBUaGUgc2V0dGluZyBvZiB0aGUgZGF0YSBhdHRyaWJ1dGUuXG4gICAqL1xuICBfb3B0KGVsZW1lbnQsIG9wdCkge1xuICAgIHJldHVybiBlbGVtZW50LmRhdGFzZXRbXG4gICAgICBgJHtOZWFyYnlTdG9wcy5uYW1lc3BhY2V9JHtOZWFyYnlTdG9wcy5vcHRpb25zW29wdF19YFxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIE5lYXJieVN0b3BzLmtleXNba2V5XTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbk5lYXJieVN0b3BzLnNlbGVjdG9yID0gJ1tkYXRhLWpzPVwibmVhcmJ5LXN0b3BzXCJdJztcblxuLyoqXG4gKiBUaGUgbmFtZXNwYWNlIGZvciB0aGUgY29tcG9uZW50J3MgSlMgb3B0aW9ucy4gSXQncyBwcmltYXJpbHkgdXNlZCB0byBsb29rdXBcbiAqIGF0dHJpYnV0ZXMgaW4gYW4gZWxlbWVudCdzIGRhdGFzZXQuXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5OZWFyYnlTdG9wcy5uYW1lc3BhY2UgPSAnbmVhcmJ5U3RvcHMnO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBvcHRpb25zIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIHRoZSBjb21wb25lbnQuIEl0J3MgcHJpbWFyaWx5IHVzZWRcbiAqIHRvIGxvb2t1cCBhdHRyaWJ1dGVzIGluIGFuIGVsZW1lbnQncyBkYXRhc2V0LlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMub3B0aW9ucyA9IHtcbiAgTE9DQVRJT046ICdMb2NhdGlvbicsXG4gIEFNT1VOVDogJ0Ftb3VudCcsXG4gIEVORFBPSU5UOiAnRW5kcG9pbnQnXG59O1xuXG4vKipcbiAqIFRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgZGF0YSBhdHRyIG9wdGlvbnMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5OZWFyYnlTdG9wcy5kZWZpbml0aW9uID0ge1xuICBMT0NBVElPTjogJ1RoZSBjdXJyZW50IGxvY2F0aW9uIHRvIGNvbXBhcmUgZGlzdGFuY2UgdG8gc3RvcHMuJyxcbiAgQU1PVU5UOiAnVGhlIGFtb3VudCBvZiBzdG9wcyB0byBsaXN0LicsXG4gIEVORFBPSU5UOiAnVGhlIGVuZG9wb2ludCBmb3IgdGhlIGRhdGEgZmVlZC4nXG59O1xuXG4vKipcbiAqIFtkZWZhdWx0cyBkZXNjcmlwdGlvbl1cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbk5lYXJieVN0b3BzLmRlZmF1bHRzID0ge1xuICBBTU9VTlQ6IDNcbn07XG5cbi8qKlxuICogU3RvcmFnZSBmb3Igc29tZSBvZiB0aGUgZGF0YSBrZXlzLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMua2V5cyA9IHtcbiAgT0RBVEFfR0VPOiAndGhlX2dlb20nLFxuICBPREFUQV9DT09SOiAnY29vcmRpbmF0ZXMnLFxuICBPREFUQV9MSU5FOiAnbGluZSdcbn07XG5cbi8qKlxuICogVGVtcGxhdGVzIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICogQHR5cGUge09iamVjdH1cbiAqL1xuTmVhcmJ5U3RvcHMudGVtcGxhdGVzID0ge1xuICBTVUJXQVk6IFtcbiAgJzwlIF9lYWNoKHN0b3BzLCBmdW5jdGlvbihzdG9wKSB7ICU+JyxcbiAgJzxkaXYgY2xhc3M9XCJjLW5lYXJieS1zdG9wc19fc3RvcFwiPicsXG4gICAgJzwlIHZhciBsaW5lcyA9IHN0b3Auc3RvcC5saW5lLnNwbGl0KFwiLVwiKSAlPicsXG4gICAgJzwlIF9lYWNoKHN0b3AudHJ1bmtzLCBmdW5jdGlvbih0cnVuaykgeyAlPicsXG4gICAgJzwlIHZhciBleHAgPSAodHJ1bmsubGluZS5pbmRleE9mKFwiRXhwcmVzc1wiKSA+IC0xKSA/IHRydWUgOiBmYWxzZSAlPicsXG4gICAgJzwlIGlmIChleHApIHRydW5rLmxpbmUgPSB0cnVuay5saW5lLnNwbGl0KFwiIFwiKVswXSAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiJyxcbiAgICAgICdjLW5lYXJieS1zdG9wc19fc3Vid2F5ICcsXG4gICAgICAnaWNvbi1zdWJ3YXk8JSBpZiAoZXhwKSB7ICU+LWV4cHJlc3M8JSB9ICU+ICcsXG4gICAgICAnPCUgaWYgKGV4cCkgeyAlPmJvcmRlci08JSB9IGVsc2UgeyAlPmJnLTwlIH0gJT48JS0gdHJ1bmsudHJ1bmsgJT4nLFxuICAgICAgJ1wiPicsXG4gICAgICAnPCUtIHRydW5rLmxpbmUgJT4nLFxuICAgICAgJzwlIGlmIChleHApIHsgJT4gPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+RXhwcmVzczwvc3Bhbj48JSB9ICU+JyxcbiAgICAnPC9zcGFuPicsXG4gICAgJzwlIH0pOyAlPicsXG4gICAgJzxzcGFuIGNsYXNzPVwiYy1uZWFyYnktc3RvcHNfX2Rlc2NyaXB0aW9uXCI+JyxcbiAgICAgICc8JS0gc3RvcC5kaXN0YW5jZS50b1N0cmluZygpLnNsaWNlKDAsIDMpICU+IE1pbGVzLCAnLFxuICAgICAgJzwlLSBzdG9wLnN0b3AubmFtZSAlPicsXG4gICAgJzwvc3Bhbj4nLFxuICAnPC9kaXY+JyxcbiAgJzwlIH0pOyAlPidcbiAgXS5qb2luKCcnKVxufTtcblxuLyoqXG4gKiBDb2xvciBhc3NpZ25tZW50IGZvciBTdWJ3YXkgVHJhaW4gbGluZXMsIHVzZWQgaW4gY3VuanVuY3Rpb24gd2l0aCB0aGVcbiAqIGJhY2tncm91bmQgY29sb3JzIGRlZmluZWQgaW4gY29uZmlnL3Rva2Vucy5qcy5cbiAqIEJhc2VkIG9uIHRoZSBub21lbmNsYXR1cmUgZGVzY3JpYmVkIGhlcmU7XG4gKiBAdXJsIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05ld19Zb3JrX0NpdHlfU3Vid2F5I05vbWVuY2xhdHVyZVxuICogQHR5cGUge0FycmF5fVxuICovXG5OZWFyYnlTdG9wcy50cnVua3MgPSBbXG4gIHtcbiAgICBUUlVOSzogJ2VpZ2h0aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJ0EnLCAnQycsICdFJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ3NpeHRoLWF2ZW51ZScsXG4gICAgTElORVM6IFsnQicsICdEJywgJ0YnLCAnTSddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdjcm9zc3Rvd24nLFxuICAgIExJTkVTOiBbJ0cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnY2FuYXJzaWUnLFxuICAgIExJTkVTOiBbJ0wnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnbmFzc2F1JyxcbiAgICBMSU5FUzogWydKJywgJ1onXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXknLFxuICAgIExJTkVTOiBbJ04nLCAnUScsICdSJywgJ1cnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnYnJvYWR3YXktc2V2ZW50aC1hdmVudWUnLFxuICAgIExJTkVTOiBbJzEnLCAnMicsICczJ10sXG4gIH0sXG4gIHtcbiAgICBUUlVOSzogJ2xleGluZ3Rvbi1hdmVudWUnLFxuICAgIExJTkVTOiBbJzQnLCAnNScsICc2JywgJzYgRXhwcmVzcyddLFxuICB9LFxuICB7XG4gICAgVFJVTks6ICdmbHVzaGluZycsXG4gICAgTElORVM6IFsnNycsICc3IEV4cHJlc3MnXSxcbiAgfSxcbiAge1xuICAgIFRSVU5LOiAnc2h1dHRsZXMnLFxuICAgIExJTkVTOiBbJ1MnXVxuICB9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBOZWFyYnlTdG9wcztcbiIsInZhciBjb21tb25qc0dsb2JhbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDoge307XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gZnVuY3Rpb24gKG51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxJbnRlZ2VyU2NhbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsRGVjaW1hbFNjYWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsUG9zaXRpdmVPbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaXBMZWFkaW5nWmVyb2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbkJlZm9yZVByZWZpeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgPSBudW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgIG93bmVyLm51bWVyYWxJbnRlZ2VyU2NhbGUgPSBudW1lcmFsSW50ZWdlclNjYWxlID4gMCA/IG51bWVyYWxJbnRlZ2VyU2NhbGUgOiAwO1xuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUgPSBudW1lcmFsRGVjaW1hbFNjYWxlID49IDAgPyBudW1lcmFsRGVjaW1hbFNjYWxlIDogMjtcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8IE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDtcbiAgICBvd25lci5udW1lcmFsUG9zaXRpdmVPbmx5ID0gISFudW1lcmFsUG9zaXRpdmVPbmx5O1xuICAgIG93bmVyLnN0cmlwTGVhZGluZ1plcm9lcyA9IHN0cmlwTGVhZGluZ1plcm9lcyAhPT0gZmFsc2U7XG4gICAgb3duZXIucHJlZml4ID0gKHByZWZpeCB8fCBwcmVmaXggPT09ICcnKSA/IHByZWZpeCA6ICcnO1xuICAgIG93bmVyLnNpZ25CZWZvcmVQcmVmaXggPSAhIXNpZ25CZWZvcmVQcmVmaXg7XG4gICAgb3duZXIuZGVsaW1pdGVyID0gKGRlbGltaXRlciB8fCBkZWxpbWl0ZXIgPT09ICcnKSA/IGRlbGltaXRlciA6ICcsJztcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG5ldyBSZWdFeHAoJ1xcXFwnICsgZGVsaW1pdGVyLCAnZycpIDogJyc7XG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUgPSB7XG4gICAgdGhvdXNhbmQ6ICd0aG91c2FuZCcsXG4gICAgbGFraDogICAgICdsYWtoJyxcbiAgICB3YW46ICAgICAgJ3dhbicsXG4gICAgbm9uZTogICAgICdub25lJyAgICBcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGdldFJhd1ZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5kZWxpbWl0ZXJSRSwgJycpLnJlcGxhY2UodGhpcy5udW1lcmFsRGVjaW1hbE1hcmssICcuJyk7XG4gICAgfSxcblxuICAgIGZvcm1hdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBhcnRzLCBwYXJ0U2lnbiwgcGFydFNpZ25BbmRQcmVmaXgsIHBhcnRJbnRlZ2VyLCBwYXJ0RGVjaW1hbCA9ICcnO1xuXG4gICAgICAgIC8vIHN0cmlwIGFscGhhYmV0IGxldHRlcnNcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bQS1aYS16XS9nLCAnJylcbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGZpcnN0IGRlY2ltYWwgbWFyayB3aXRoIHJlc2VydmVkIHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAucmVwbGFjZShvd25lci5udW1lcmFsRGVjaW1hbE1hcmssICdNJylcblxuICAgICAgICAgICAgLy8gc3RyaXAgbm9uIG51bWVyaWMgbGV0dGVycyBleGNlcHQgbWludXMgYW5kIFwiTVwiXG4gICAgICAgICAgICAvLyB0aGlzIGlzIHRvIGVuc3VyZSBwcmVmaXggaGFzIGJlZW4gc3RyaXBwZWRcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcZE0tXS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgbGVhZGluZyBtaW51cyB3aXRoIHJlc2VydmVkIHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAucmVwbGFjZSgvXlxcLS8sICdOJylcblxuICAgICAgICAgICAgLy8gc3RyaXAgdGhlIG90aGVyIG1pbnVzIHNpZ24gKGlmIHByZXNlbnQpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwtL2csICcnKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBtaW51cyBzaWduIChpZiBwcmVzZW50KVxuICAgICAgICAgICAgLnJlcGxhY2UoJ04nLCBvd25lci5udW1lcmFsUG9zaXRpdmVPbmx5ID8gJycgOiAnLScpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgZGVjaW1hbCBtYXJrXG4gICAgICAgICAgICAucmVwbGFjZSgnTScsIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayk7XG5cbiAgICAgICAgLy8gc3RyaXAgYW55IGxlYWRpbmcgemVyb3NcbiAgICAgICAgaWYgKG93bmVyLnN0cmlwTGVhZGluZ1plcm9lcykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9eKC0pPzArKD89XFxkKS8sICckMScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFydFNpZ24gPSB2YWx1ZS5zbGljZSgwLCAxKSA9PT0gJy0nID8gJy0nIDogJyc7XG4gICAgICAgIGlmICh0eXBlb2Ygb3duZXIucHJlZml4ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpZiAob3duZXIuc2lnbkJlZm9yZVByZWZpeCkge1xuICAgICAgICAgICAgICAgIHBhcnRTaWduQW5kUHJlZml4ID0gcGFydFNpZ24gKyBvd25lci5wcmVmaXg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRTaWduQW5kUHJlZml4ID0gb3duZXIucHJlZml4ICsgcGFydFNpZ247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJ0U2lnbkFuZFByZWZpeCA9IHBhcnRTaWduO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaykgPj0gMCkge1xuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgIHBhcnREZWNpbWFsID0gb3duZXIubnVtZXJhbERlY2ltYWxNYXJrICsgcGFydHNbMV0uc2xpY2UoMCwgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihwYXJ0U2lnbiA9PT0gJy0nKSB7XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnNsaWNlKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG93bmVyLm51bWVyYWxJbnRlZ2VyU2NhbGUgPiAwKSB7XG4gICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5zbGljZSgwLCBvd25lci5udW1lcmFsSW50ZWdlclNjYWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAob3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUpIHtcbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUubGFraDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkXFxkKStcXGQkKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUud2FuOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7NH0pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFydFNpZ25BbmRQcmVmaXggKyBwYXJ0SW50ZWdlci50b1N0cmluZygpICsgKG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUgPiAwID8gcGFydERlY2ltYWwudG9TdHJpbmcoKSA6ICcnKTtcbiAgICB9XG59O1xuXG52YXIgTnVtZXJhbEZvcm1hdHRlcl8xID0gTnVtZXJhbEZvcm1hdHRlcjtcblxudmFyIERhdGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZVBhdHRlcm4sIGRhdGVNaW4sIGRhdGVNYXgpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuZGF0ZSA9IFtdO1xuICAgIG93bmVyLmJsb2NrcyA9IFtdO1xuICAgIG93bmVyLmRhdGVQYXR0ZXJuID0gZGF0ZVBhdHRlcm47XG4gICAgb3duZXIuZGF0ZU1pbiA9IGRhdGVNaW5cbiAgICAgIC5zcGxpdCgnLScpXG4gICAgICAucmV2ZXJzZSgpXG4gICAgICAubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHgsIDEwKTtcbiAgICAgIH0pO1xuICAgIGlmIChvd25lci5kYXRlTWluLmxlbmd0aCA9PT0gMikgb3duZXIuZGF0ZU1pbi51bnNoaWZ0KDApO1xuXG4gICAgb3duZXIuZGF0ZU1heCA9IGRhdGVNYXhcbiAgICAgIC5zcGxpdCgnLScpXG4gICAgICAucmV2ZXJzZSgpXG4gICAgICAubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHgsIDEwKTtcbiAgICAgIH0pO1xuICAgIGlmIChvd25lci5kYXRlTWF4Lmxlbmd0aCA9PT0gMikgb3duZXIuZGF0ZU1heC51bnNoaWZ0KDApO1xuICAgIFxuICAgIG93bmVyLmluaXRCbG9ja3MoKTtcbn07XG5cbkRhdGVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGluaXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcbiAgICAgICAgb3duZXIuZGF0ZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1knKSB7XG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goNCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgZGF0ZSA9IG93bmVyLmRhdGU7XG5cbiAgICAgICAgcmV0dXJuIGRhdGVbMl0gPyAoXG4gICAgICAgICAgICBkYXRlWzJdICsgJy0nICsgb3duZXIuYWRkTGVhZGluZ1plcm8oZGF0ZVsxXSkgKyAnLScgKyBvd25lci5hZGRMZWFkaW5nWmVybyhkYXRlWzBdKVxuICAgICAgICApIDogJyc7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFZhbGlkYXRlZERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHN1YjAgPSBzdWIuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci5kYXRlUGF0dGVybltpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YiA9PT0gJzAwJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICczMSc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViID09PSAnMDAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMDEnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YjAsIDEwKSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzEyJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWREYXRlU3RyaW5nKHJlc3VsdCk7XG4gICAgfSxcblxuICAgIGdldEZpeGVkRGF0ZVN0cmluZzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIGRhdGVQYXR0ZXJuID0gb3duZXIuZGF0ZVBhdHRlcm4sIGRhdGUgPSBbXSxcbiAgICAgICAgICAgIGRheUluZGV4ID0gMCwgbW9udGhJbmRleCA9IDAsIHllYXJJbmRleCA9IDAsXG4gICAgICAgICAgICBkYXlTdGFydEluZGV4ID0gMCwgbW9udGhTdGFydEluZGV4ID0gMCwgeWVhclN0YXJ0SW5kZXggPSAwLFxuICAgICAgICAgICAgZGF5LCBtb250aCwgeWVhciwgZnVsbFllYXJEb25lID0gZmFsc2U7XG5cbiAgICAgICAgLy8gbW0tZGQgfHwgZGQtbW1cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNCAmJiBkYXRlUGF0dGVyblswXS50b0xvd2VyQ2FzZSgpICE9PSAneScgJiYgZGF0ZVBhdHRlcm5bMV0udG9Mb3dlckNhc2UoKSAhPT0gJ3knKSB7XG4gICAgICAgICAgICBkYXlTdGFydEluZGV4ID0gZGF0ZVBhdHRlcm5bMF0gPT09ICdkJyA/IDAgOiAyO1xuICAgICAgICAgICAgbW9udGhTdGFydEluZGV4ID0gMiAtIGRheVN0YXJ0SW5kZXg7XG4gICAgICAgICAgICBkYXkgPSBwYXJzZUludCh2YWx1ZS5zbGljZShkYXlTdGFydEluZGV4LCBkYXlTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobW9udGhTdGFydEluZGV4LCBtb250aFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5nZXRGaXhlZERhdGUoZGF5LCBtb250aCwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB5eXl5LW1tLWRkIHx8IHl5eXktZGQtbW0gfHwgbW0tZGQteXl5eSB8fCBkZC1tbS15eXl5IHx8IGRkLXl5eXktbW0gfHwgbW0teXl5eS1kZFxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA4KSB7XG4gICAgICAgICAgICBkYXRlUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICBkYXlJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGhJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB5ZWFySW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHllYXJTdGFydEluZGV4ID0geWVhckluZGV4ICogMjtcbiAgICAgICAgICAgIGRheVN0YXJ0SW5kZXggPSAoZGF5SW5kZXggPD0geWVhckluZGV4KSA/IGRheUluZGV4ICogMiA6IChkYXlJbmRleCAqIDIgKyAyKTtcbiAgICAgICAgICAgIG1vbnRoU3RhcnRJbmRleCA9IChtb250aEluZGV4IDw9IHllYXJJbmRleCkgPyBtb250aEluZGV4ICogMiA6IChtb250aEluZGV4ICogMiArIDIpO1xuXG4gICAgICAgICAgICBkYXkgPSBwYXJzZUludCh2YWx1ZS5zbGljZShkYXlTdGFydEluZGV4LCBkYXlTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQodmFsdWUuc2xpY2UobW9udGhTdGFydEluZGV4LCBtb250aFN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDQpLCAxMCk7XG5cbiAgICAgICAgICAgIGZ1bGxZZWFyRG9uZSA9IHZhbHVlLnNsaWNlKHllYXJTdGFydEluZGV4LCB5ZWFyU3RhcnRJbmRleCArIDQpLmxlbmd0aCA9PT0gNDtcblxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuZ2V0Rml4ZWREYXRlKGRheSwgbW9udGgsIHllYXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbW0teXkgfHwgeXktbW1cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNCAmJiAoZGF0ZVBhdHRlcm5bMF0gPT09ICd5JyB8fCBkYXRlUGF0dGVyblsxXSA9PT0gJ3knKSkge1xuICAgICAgICAgICAgbW9udGhTdGFydEluZGV4ID0gZGF0ZVBhdHRlcm5bMF0gPT09ICdtJyA/IDAgOiAyO1xuICAgICAgICAgICAgeWVhclN0YXJ0SW5kZXggPSAyIC0gbW9udGhTdGFydEluZGV4O1xuICAgICAgICAgICAgbW9udGggPSBwYXJzZUludCh2YWx1ZS5zbGljZShtb250aFN0YXJ0SW5kZXgsIG1vbnRoU3RhcnRJbmRleCArIDIpLCAxMCk7XG4gICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQodmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgMiksIDEwKTtcblxuICAgICAgICAgICAgZnVsbFllYXJEb25lID0gdmFsdWUuc2xpY2UoeWVhclN0YXJ0SW5kZXgsIHllYXJTdGFydEluZGV4ICsgMikubGVuZ3RoID09PSAyO1xuXG4gICAgICAgICAgICBkYXRlID0gWzAsIG1vbnRoLCB5ZWFyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1tLXl5eXkgfHwgeXl5eS1tbVxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA2ICYmIChkYXRlUGF0dGVyblswXSA9PT0gJ1knIHx8IGRhdGVQYXR0ZXJuWzFdID09PSAnWScpKSB7XG4gICAgICAgICAgICBtb250aFN0YXJ0SW5kZXggPSBkYXRlUGF0dGVyblswXSA9PT0gJ20nID8gMCA6IDQ7XG4gICAgICAgICAgICB5ZWFyU3RhcnRJbmRleCA9IDIgLSAwLjUgKiBtb250aFN0YXJ0SW5kZXg7XG4gICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1vbnRoU3RhcnRJbmRleCwgbW9udGhTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIHllYXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KSwgMTApO1xuXG4gICAgICAgICAgICBmdWxsWWVhckRvbmUgPSB2YWx1ZS5zbGljZSh5ZWFyU3RhcnRJbmRleCwgeWVhclN0YXJ0SW5kZXggKyA0KS5sZW5ndGggPT09IDQ7XG5cbiAgICAgICAgICAgIGRhdGUgPSBbMCwgbW9udGgsIHllYXJdO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0ZSA9IG93bmVyLmdldFJhbmdlRml4ZWREYXRlKGRhdGUpO1xuICAgICAgICBvd25lci5kYXRlID0gZGF0ZTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gZGF0ZS5sZW5ndGggPT09IDAgPyB2YWx1ZSA6IGRhdGVQYXR0ZXJuLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudCkge1xuICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgKGRhdGVbMF0gPT09IDAgPyAnJyA6IG93bmVyLmFkZExlYWRpbmdaZXJvKGRhdGVbMF0pKTtcbiAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIChkYXRlWzFdID09PSAwID8gJycgOiBvd25lci5hZGRMZWFkaW5nWmVybyhkYXRlWzFdKSk7XG4gICAgICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyAoZnVsbFllYXJEb25lID8gb3duZXIuYWRkTGVhZGluZ1plcm9Gb3JZZWFyKGRhdGVbMl0sIGZhbHNlKSA6ICcnKTtcbiAgICAgICAgICAgIGNhc2UgJ1knOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIChmdWxsWWVhckRvbmUgPyBvd25lci5hZGRMZWFkaW5nWmVyb0ZvclllYXIoZGF0ZVsyXSwgdHJ1ZSkgOiAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICcnKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBnZXRSYW5nZUZpeGVkRGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIGRhdGVQYXR0ZXJuID0gb3duZXIuZGF0ZVBhdHRlcm4sXG4gICAgICAgICAgICBkYXRlTWluID0gb3duZXIuZGF0ZU1pbiB8fCBbXSxcbiAgICAgICAgICAgIGRhdGVNYXggPSBvd25lci5kYXRlTWF4IHx8IFtdO1xuXG4gICAgICAgIGlmICghZGF0ZS5sZW5ndGggfHwgKGRhdGVNaW4ubGVuZ3RoIDwgMyAmJiBkYXRlTWF4Lmxlbmd0aCA8IDMpKSByZXR1cm4gZGF0ZTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGF0ZVBhdHRlcm4uZmluZChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4geC50b0xvd2VyQ2FzZSgpID09PSAneSc7XG4gICAgICAgICAgfSkgJiZcbiAgICAgICAgICBkYXRlWzJdID09PSAwXG4gICAgICAgICkgcmV0dXJuIGRhdGU7XG5cbiAgICAgICAgaWYgKGRhdGVNYXgubGVuZ3RoICYmIChkYXRlTWF4WzJdIDwgZGF0ZVsyXSB8fCAoXG4gICAgICAgICAgZGF0ZU1heFsyXSA9PT0gZGF0ZVsyXSAmJiAoZGF0ZU1heFsxXSA8IGRhdGVbMV0gfHwgKFxuICAgICAgICAgICAgZGF0ZU1heFsxXSA9PT0gZGF0ZVsxXSAmJiBkYXRlTWF4WzBdIDwgZGF0ZVswXVxuICAgICAgICAgICkpXG4gICAgICAgICkpKSByZXR1cm4gZGF0ZU1heDtcblxuICAgICAgICBpZiAoZGF0ZU1pbi5sZW5ndGggJiYgKGRhdGVNaW5bMl0gPiBkYXRlWzJdIHx8IChcbiAgICAgICAgICBkYXRlTWluWzJdID09PSBkYXRlWzJdICYmIChkYXRlTWluWzFdID4gZGF0ZVsxXSB8fCAoXG4gICAgICAgICAgICBkYXRlTWluWzFdID09PSBkYXRlWzFdICYmIGRhdGVNaW5bMF0gPiBkYXRlWzBdXG4gICAgICAgICAgKSlcbiAgICAgICAgKSkpIHJldHVybiBkYXRlTWluO1xuXG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZERhdGU6IGZ1bmN0aW9uIChkYXksIG1vbnRoLCB5ZWFyKSB7XG4gICAgICAgIGRheSA9IE1hdGgubWluKGRheSwgMzEpO1xuICAgICAgICBtb250aCA9IE1hdGgubWluKG1vbnRoLCAxMik7XG4gICAgICAgIHllYXIgPSBwYXJzZUludCgoeWVhciB8fCAwKSwgMTApO1xuXG4gICAgICAgIGlmICgobW9udGggPCA3ICYmIG1vbnRoICUgMiA9PT0gMCkgfHwgKG1vbnRoID4gOCAmJiBtb250aCAlIDIgPT09IDEpKSB7XG4gICAgICAgICAgICBkYXkgPSBNYXRoLm1pbihkYXksIG1vbnRoID09PSAyID8gKHRoaXMuaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpIDogMzApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtkYXksIG1vbnRoLCB5ZWFyXTtcbiAgICB9LFxuXG4gICAgaXNMZWFwWWVhcjogZnVuY3Rpb24gKHllYXIpIHtcbiAgICAgICAgcmV0dXJuICgoeWVhciAlIDQgPT09IDApICYmICh5ZWFyICUgMTAwICE9PSAwKSkgfHwgKHllYXIgJSA0MDAgPT09IDApO1xuICAgIH0sXG5cbiAgICBhZGRMZWFkaW5nWmVybzogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAnIDogJycpICsgbnVtYmVyO1xuICAgIH0sXG5cbiAgICBhZGRMZWFkaW5nWmVyb0ZvclllYXI6IGZ1bmN0aW9uIChudW1iZXIsIGZ1bGxZZWFyTW9kZSkge1xuICAgICAgICBpZiAoZnVsbFllYXJNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAwMCcgOiAobnVtYmVyIDwgMTAwID8gJzAwJyA6IChudW1iZXIgPCAxMDAwID8gJzAnIDogJycpKSkgKyBudW1iZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAnIDogJycpICsgbnVtYmVyO1xuICAgIH1cbn07XG5cbnZhciBEYXRlRm9ybWF0dGVyXzEgPSBEYXRlRm9ybWF0dGVyO1xuXG52YXIgVGltZUZvcm1hdHRlciA9IGZ1bmN0aW9uICh0aW1lUGF0dGVybiwgdGltZUZvcm1hdCkge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci50aW1lID0gW107XG4gICAgb3duZXIuYmxvY2tzID0gW107XG4gICAgb3duZXIudGltZVBhdHRlcm4gPSB0aW1lUGF0dGVybjtcbiAgICBvd25lci50aW1lRm9ybWF0ID0gdGltZUZvcm1hdDtcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5UaW1lRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLnRpbWVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goMik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJU09Gb3JtYXRUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICB0aW1lID0gb3duZXIudGltZTtcblxuICAgICAgICByZXR1cm4gdGltZVsyXSA/IChcbiAgICAgICAgICAgIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMF0pICsgJzonICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVsxXSkgKyAnOicgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzJdKVxuICAgICAgICApIDogJyc7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFRpbWVGb3JtYXRPcHRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIGlmIChTdHJpbmcob3duZXIudGltZUZvcm1hdCkgPT09ICcxMicpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWF4SG91ckZpcnN0RGlnaXQ6IDEsXG4gICAgICAgICAgICAgICAgbWF4SG91cnM6IDEyLFxuICAgICAgICAgICAgICAgIG1heE1pbnV0ZXNGaXJzdERpZ2l0OiA1LFxuICAgICAgICAgICAgICAgIG1heE1pbnV0ZXM6IDYwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1heEhvdXJGaXJzdERpZ2l0OiAyLFxuICAgICAgICAgICAgbWF4SG91cnM6IDIzLFxuICAgICAgICAgICAgbWF4TWludXRlc0ZpcnN0RGlnaXQ6IDUsXG4gICAgICAgICAgICBtYXhNaW51dGVzOiA2MFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRWYWxpZGF0ZWRUaW1lOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcZF0vZywgJycpO1xuXG4gICAgICAgIHZhciB0aW1lRm9ybWF0T3B0aW9ucyA9IG93bmVyLmdldFRpbWVGb3JtYXRPcHRpb25zKCk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHN1YjAgPSBzdWIuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci50aW1lUGF0dGVybltpbmRleF0pIHtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViMCwgMTApID4gdGltZUZvcm1hdE9wdGlvbnMubWF4SG91ckZpcnN0RGlnaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiB0aW1lRm9ybWF0T3B0aW9ucy5tYXhIb3Vycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gdGltZUZvcm1hdE9wdGlvbnMubWF4SG91cnMgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiB0aW1lRm9ybWF0T3B0aW9ucy5tYXhNaW51dGVzRmlyc3REaWdpdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAnICsgc3ViMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA+IHRpbWVGb3JtYXRPcHRpb25zLm1heE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9IHRpbWVGb3JtYXRPcHRpb25zLm1heE1pbnV0ZXMgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpeGVkVGltZVN0cmluZyhyZXN1bHQpO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZFRpbWVTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCB0aW1lUGF0dGVybiA9IG93bmVyLnRpbWVQYXR0ZXJuLCB0aW1lID0gW10sXG4gICAgICAgICAgICBzZWNvbmRJbmRleCA9IDAsIG1pbnV0ZUluZGV4ID0gMCwgaG91ckluZGV4ID0gMCxcbiAgICAgICAgICAgIHNlY29uZFN0YXJ0SW5kZXggPSAwLCBtaW51dGVTdGFydEluZGV4ID0gMCwgaG91clN0YXJ0SW5kZXggPSAwLFxuICAgICAgICAgICAgc2Vjb25kLCBtaW51dGUsIGhvdXI7XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gNikge1xuICAgICAgICAgICAgdGltZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kSW5kZXggPSBpbmRleCAqIDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBtaW51dGVJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgIGhvdXJJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGhvdXJTdGFydEluZGV4ID0gaG91ckluZGV4O1xuICAgICAgICAgICAgbWludXRlU3RhcnRJbmRleCA9IG1pbnV0ZUluZGV4O1xuICAgICAgICAgICAgc2Vjb25kU3RhcnRJbmRleCA9IHNlY29uZEluZGV4O1xuXG4gICAgICAgICAgICBzZWNvbmQgPSBwYXJzZUludCh2YWx1ZS5zbGljZShzZWNvbmRTdGFydEluZGV4LCBzZWNvbmRTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIG1pbnV0ZSA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKG1pbnV0ZVN0YXJ0SW5kZXgsIG1pbnV0ZVN0YXJ0SW5kZXggKyAyKSwgMTApO1xuICAgICAgICAgICAgaG91ciA9IHBhcnNlSW50KHZhbHVlLnNsaWNlKGhvdXJTdGFydEluZGV4LCBob3VyU3RhcnRJbmRleCArIDIpLCAxMCk7XG5cbiAgICAgICAgICAgIHRpbWUgPSB0aGlzLmdldEZpeGVkVGltZShob3VyLCBtaW51dGUsIHNlY29uZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSA0ICYmIG93bmVyLnRpbWVQYXR0ZXJuLmluZGV4T2YoJ3MnKSA8IDApIHtcbiAgICAgICAgICAgIHRpbWVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZUluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICAgICAgaG91ckluZGV4ID0gaW5kZXggKiAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaG91clN0YXJ0SW5kZXggPSBob3VySW5kZXg7XG4gICAgICAgICAgICBtaW51dGVTdGFydEluZGV4ID0gbWludXRlSW5kZXg7XG5cbiAgICAgICAgICAgIHNlY29uZCA9IDA7XG4gICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludCh2YWx1ZS5zbGljZShtaW51dGVTdGFydEluZGV4LCBtaW51dGVTdGFydEluZGV4ICsgMiksIDEwKTtcbiAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludCh2YWx1ZS5zbGljZShob3VyU3RhcnRJbmRleCwgaG91clN0YXJ0SW5kZXggKyAyKSwgMTApO1xuXG4gICAgICAgICAgICB0aW1lID0gdGhpcy5nZXRGaXhlZFRpbWUoaG91ciwgbWludXRlLCBzZWNvbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIudGltZSA9IHRpbWU7XG5cbiAgICAgICAgcmV0dXJuIHRpbWUubGVuZ3RoID09PSAwID8gdmFsdWUgOiB0aW1lUGF0dGVybi5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIG93bmVyLmFkZExlYWRpbmdaZXJvKHRpbWVbMl0pO1xuICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgb3duZXIuYWRkTGVhZGluZ1plcm8odGltZVsxXSk7XG4gICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBvd25lci5hZGRMZWFkaW5nWmVybyh0aW1lWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgJycpO1xuICAgIH0sXG5cbiAgICBnZXRGaXhlZFRpbWU6IGZ1bmN0aW9uIChob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgICBzZWNvbmQgPSBNYXRoLm1pbihwYXJzZUludChzZWNvbmQgfHwgMCwgMTApLCA2MCk7XG4gICAgICAgIG1pbnV0ZSA9IE1hdGgubWluKG1pbnV0ZSwgNjApO1xuICAgICAgICBob3VyID0gTWF0aC5taW4oaG91ciwgNjApO1xuXG4gICAgICAgIHJldHVybiBbaG91ciwgbWludXRlLCBzZWNvbmRdO1xuICAgIH0sXG5cbiAgICBhZGRMZWFkaW5nWmVybzogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICByZXR1cm4gKG51bWJlciA8IDEwID8gJzAnIDogJycpICsgbnVtYmVyO1xuICAgIH1cbn07XG5cbnZhciBUaW1lRm9ybWF0dGVyXzEgPSBUaW1lRm9ybWF0dGVyO1xuXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZm9ybWF0dGVyLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuZGVsaW1pdGVyID0gKGRlbGltaXRlciB8fCBkZWxpbWl0ZXIgPT09ICcnKSA/IGRlbGltaXRlciA6ICcgJztcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG5ldyBSZWdFeHAoJ1xcXFwnICsgZGVsaW1pdGVyLCAnZycpIDogJyc7XG5cbiAgICBvd25lci5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XG59O1xuXG5QaG9uZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgc2V0Rm9ybWF0dGVyOiBmdW5jdGlvbiAoZm9ybWF0dGVyKSB7XG4gICAgICAgIHRoaXMuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xuICAgIH0sXG5cbiAgICBmb3JtYXQ6IGZ1bmN0aW9uIChwaG9uZU51bWJlcikge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIG93bmVyLmZvcm1hdHRlci5jbGVhcigpO1xuXG4gICAgICAgIC8vIG9ubHkga2VlcCBudW1iZXIgYW5kICtcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9bXlxcZCtdL2csICcnKTtcblxuICAgICAgICAvLyBzdHJpcCBub24tbGVhZGluZyArXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvXlxcKy8sICdCJykucmVwbGFjZSgvXFwrL2csICcnKS5yZXBsYWNlKCdCJywgJysnKTtcblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKG93bmVyLmRlbGltaXRlclJFLCAnJyk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnLCBjdXJyZW50LCB2YWxpZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaU1heCA9IHBob25lTnVtYmVyLmxlbmd0aDsgaSA8IGlNYXg7IGkrKykge1xuICAgICAgICAgICAgY3VycmVudCA9IG93bmVyLmZvcm1hdHRlci5pbnB1dERpZ2l0KHBob25lTnVtYmVyLmNoYXJBdChpKSk7XG5cbiAgICAgICAgICAgIC8vIGhhcyAoKS0gb3Igc3BhY2UgaW5zaWRlXG4gICAgICAgICAgICBpZiAoL1tcXHMoKS1dL2cudGVzdChjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG5cbiAgICAgICAgICAgICAgICB2YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbHNlOiBvdmVyIGxlbmd0aCBpbnB1dFxuICAgICAgICAgICAgICAgIC8vIGl0IHR1cm5zIHRvIGludmFsaWQgbnVtYmVyIGFnYWluXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCAoKVxuICAgICAgICAvLyBlLmcuIFVTOiA3MTYxMjM0NTY3IHJldHVybnMgKDcxNikgMTIzLTQ1NjdcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1soKV0vZywgJycpO1xuICAgICAgICAvLyByZXBsYWNlIGxpYnJhcnkgZGVsaW1pdGVyIHdpdGggdXNlciBjdXN0b21pemVkIGRlbGltaXRlclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvW1xccy1dL2csIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG52YXIgUGhvbmVGb3JtYXR0ZXJfMSA9IFBob25lRm9ybWF0dGVyO1xuXG52YXIgQ3JlZGl0Q2FyZERldGVjdG9yID0ge1xuICAgIGJsb2Nrczoge1xuICAgICAgICB1YXRwOiAgICAgICAgICBbNCwgNSwgNl0sXG4gICAgICAgIGFtZXg6ICAgICAgICAgIFs0LCA2LCA1XSxcbiAgICAgICAgZGluZXJzOiAgICAgICAgWzQsIDYsIDRdLFxuICAgICAgICBkaXNjb3ZlcjogICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIG1hc3RlcmNhcmQ6ICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZGFua29ydDogICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBpbnN0YXBheW1lbnQ6ICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGpjYjE1OiAgICAgICAgIFs0LCA2LCA1XSxcbiAgICAgICAgamNiOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBtYWVzdHJvOiAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIHZpc2E6ICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWlyOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICB1bmlvblBheTogICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGdlbmVyYWw6ICAgICAgIFs0LCA0LCA0LCA0XVxuICAgIH0sXG5cbiAgICByZToge1xuICAgICAgICAvLyBzdGFydHMgd2l0aCAxOyAxNSBkaWdpdHMsIG5vdCBzdGFydHMgd2l0aCAxODAwIChqY2IgY2FyZClcbiAgICAgICAgdWF0cDogL14oPyExODAwKTFcXGR7MCwxNH0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDM0LzM3OyAxNSBkaWdpdHNcbiAgICAgICAgYW1leDogL14zWzQ3XVxcZHswLDEzfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjAxMS82NS82NDQtNjQ5OyAxNiBkaWdpdHNcbiAgICAgICAgZGlzY292ZXI6IC9eKD86NjAxMXw2NVxcZHswLDJ9fDY0WzQtOV1cXGQ/KVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzAwLTMwNS8zMDkgb3IgMzYvMzgvMzk7IDE0IGRpZ2l0c1xuICAgICAgICBkaW5lcnM6IC9eMyg/OjAoWzAtNV18OSl8WzY4OV1cXGQ/KVxcZHswLDExfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTEtNTUvMjIyMeKAkzI3MjA7IDE2IGRpZ2l0c1xuICAgICAgICBtYXN0ZXJjYXJkOiAvXig1WzEtNV1cXGR7MCwyfXwyMlsyLTldXFxkezAsMX18MlszLTddXFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MDE5LzQxNzUvNDU3MTsgMTYgZGlnaXRzXG4gICAgICAgIGRhbmtvcnQ6IC9eKDUwMTl8NDE3NXw0NTcxKVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjM3LTYzOTsgMTYgZGlnaXRzXG4gICAgICAgIGluc3RhcGF5bWVudDogL142M1s3LTldXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDA7IDE1IGRpZ2l0c1xuICAgICAgICBqY2IxNTogL14oPzoyMTMxfDE4MDApXFxkezAsMTF9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDAvMzU7IDE2IGRpZ2l0c1xuICAgICAgICBqY2I6IC9eKD86MzVcXGR7MCwyfSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUwLzU2LTU4LzYzMDQvNjc7IDE2IGRpZ2l0c1xuICAgICAgICBtYWVzdHJvOiAvXig/OjVbMDY3OF1cXGR7MCwyfXw2MzA0fDY3XFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMjsgMTYgZGlnaXRzXG4gICAgICAgIG1pcjogL14yMjBbMC00XVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNDsgMTYgZGlnaXRzXG4gICAgICAgIHZpc2E6IC9eNFxcZHswLDE1fS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjI7IDE2IGRpZ2l0c1xuICAgICAgICB1bmlvblBheTogL142MlxcZHswLDE0fS9cbiAgICB9LFxuXG4gICAgZ2V0U3RyaWN0QmxvY2tzOiBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgIHZhciB0b3RhbCA9IGJsb2NrLnJlZHVjZShmdW5jdGlvbiAocHJldiwgY3VycmVudCkge1xuICAgICAgICByZXR1cm4gcHJldiArIGN1cnJlbnQ7XG4gICAgICB9LCAwKTtcblxuICAgICAgcmV0dXJuIGJsb2NrLmNvbmNhdCgxOSAtIHRvdGFsKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5mbzogZnVuY3Rpb24gKHZhbHVlLCBzdHJpY3RNb2RlKSB7XG4gICAgICAgIHZhciBibG9ja3MgPSBDcmVkaXRDYXJkRGV0ZWN0b3IuYmxvY2tzLFxuICAgICAgICAgICAgcmUgPSBDcmVkaXRDYXJkRGV0ZWN0b3IucmU7XG5cbiAgICAgICAgLy8gU29tZSBjcmVkaXQgY2FyZCBjYW4gaGF2ZSB1cCB0byAxOSBkaWdpdHMgbnVtYmVyLlxuICAgICAgICAvLyBTZXQgc3RyaWN0TW9kZSB0byB0cnVlIHdpbGwgcmVtb3ZlIHRoZSAxNiBtYXgtbGVuZ3RoIHJlc3RyYWluLFxuICAgICAgICAvLyBob3dldmVyLCBJIG5ldmVyIGZvdW5kIGFueSB3ZWJzaXRlIHZhbGlkYXRlIGNhcmQgbnVtYmVyIGxpa2VcbiAgICAgICAgLy8gdGhpcywgaGVuY2UgcHJvYmFibHkgeW91IGRvbid0IHdhbnQgdG8gZW5hYmxlIHRoaXMgb3B0aW9uLlxuICAgICAgICBzdHJpY3RNb2RlID0gISFzdHJpY3RNb2RlO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiByZSkge1xuICAgICAgICAgICAgaWYgKHJlW2tleV0udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlZEJsb2NrcyA9IGJsb2Nrc1trZXldO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiBzdHJpY3RNb2RlID8gdGhpcy5nZXRTdHJpY3RCbG9ja3MobWF0Y2hlZEJsb2NrcykgOiBtYXRjaGVkQmxvY2tzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAndW5rbm93bicsXG4gICAgICAgICAgICBibG9ja3M6IHN0cmljdE1vZGUgPyB0aGlzLmdldFN0cmljdEJsb2NrcyhibG9ja3MuZ2VuZXJhbCkgOiBibG9ja3MuZ2VuZXJhbFxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3JfMSA9IENyZWRpdENhcmREZXRlY3RvcjtcblxudmFyIFV0aWwgPSB7XG4gICAgbm9vcDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG5cbiAgICBzdHJpcDogZnVuY3Rpb24gKHZhbHVlLCByZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgJycpO1xuICAgIH0sXG5cbiAgICBnZXRQb3N0RGVsaW1pdGVyOiBmdW5jdGlvbiAodmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICAvLyBzaW5nbGUgZGVsaW1pdGVyXG4gICAgICAgIGlmIChkZWxpbWl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKC1kZWxpbWl0ZXIubGVuZ3RoKSA9PT0gZGVsaW1pdGVyID8gZGVsaW1pdGVyIDogJyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtdWx0aXBsZSBkZWxpbWl0ZXJzXG4gICAgICAgIHZhciBtYXRjaGVkRGVsaW1pdGVyID0gJyc7XG4gICAgICAgIGRlbGltaXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLnNsaWNlKC1jdXJyZW50Lmxlbmd0aCkgPT09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBtYXRjaGVkRGVsaW1pdGVyID0gY3VycmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZWREZWxpbWl0ZXI7XG4gICAgfSxcblxuICAgIGdldERlbGltaXRlclJFQnlEZWxpbWl0ZXI6IGZ1bmN0aW9uIChkZWxpbWl0ZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoZGVsaW1pdGVyLnJlcGxhY2UoLyhbLj8qK14kW1xcXVxcXFwoKXt9fC1dKS9nLCAnXFxcXCQxJyksICdnJyk7XG4gICAgfSxcblxuICAgIGdldE5leHRDdXJzb3JQb3NpdGlvbjogZnVuY3Rpb24gKHByZXZQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAvLyBJZiBjdXJzb3Igd2FzIGF0IHRoZSBlbmQgb2YgdmFsdWUsIGp1c3QgcGxhY2UgaXQgYmFjay5cbiAgICAgIC8vIEJlY2F1c2UgbmV3IHZhbHVlIGNvdWxkIGNvbnRhaW4gYWRkaXRpb25hbCBjaGFycy5cbiAgICAgIGlmIChvbGRWYWx1ZS5sZW5ndGggPT09IHByZXZQb3MpIHtcbiAgICAgICAgICByZXR1cm4gbmV3VmFsdWUubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldlBvcyArIHRoaXMuZ2V0UG9zaXRpb25PZmZzZXQocHJldlBvcywgb2xkVmFsdWUsIG5ld1ZhbHVlLCBkZWxpbWl0ZXIgLGRlbGltaXRlcnMpO1xuICAgIH0sXG5cbiAgICBnZXRQb3NpdGlvbk9mZnNldDogZnVuY3Rpb24gKHByZXZQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgZGVsaW1pdGVyLCBkZWxpbWl0ZXJzKSB7XG4gICAgICAgIHZhciBvbGRSYXdWYWx1ZSwgbmV3UmF3VmFsdWUsIGxlbmd0aE9mZnNldDtcblxuICAgICAgICBvbGRSYXdWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKG9sZFZhbHVlLnNsaWNlKDAsIHByZXZQb3MpLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuICAgICAgICBuZXdSYXdWYWx1ZSA9IHRoaXMuc3RyaXBEZWxpbWl0ZXJzKG5ld1ZhbHVlLnNsaWNlKDAsIHByZXZQb3MpLCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuICAgICAgICBsZW5ndGhPZmZzZXQgPSBvbGRSYXdWYWx1ZS5sZW5ndGggLSBuZXdSYXdWYWx1ZS5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIChsZW5ndGhPZmZzZXQgIT09IDApID8gKGxlbmd0aE9mZnNldCAvIE1hdGguYWJzKGxlbmd0aE9mZnNldCkpIDogMDtcbiAgICB9LFxuXG4gICAgc3RyaXBEZWxpbWl0ZXJzOiBmdW5jdGlvbiAodmFsdWUsIGRlbGltaXRlciwgZGVsaW1pdGVycykge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIC8vIHNpbmdsZSBkZWxpbWl0ZXJcbiAgICAgICAgaWYgKGRlbGltaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBvd25lci5nZXREZWxpbWl0ZXJSRUJ5RGVsaW1pdGVyKGRlbGltaXRlcikgOiAnJztcblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoZGVsaW1pdGVyUkUsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11bHRpcGxlIGRlbGltaXRlcnNcbiAgICAgICAgZGVsaW1pdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjdXJyZW50KSB7XG4gICAgICAgICAgICBjdXJyZW50LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2Uob3duZXIuZ2V0RGVsaW1pdGVyUkVCeURlbGltaXRlcihsZXR0ZXIpLCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBoZWFkU3RyOiBmdW5jdGlvbiAoc3RyLCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcbiAgICAgICAgcmV0dXJuIGJsb2Nrcy5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBjdXJyZW50O1xuICAgICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgLy8gc3RyaXAgcHJlZml4XG4gICAgLy8gQmVmb3JlIHR5cGUgIHwgICBBZnRlciB0eXBlICAgIHwgICAgIFJldHVybiB2YWx1ZVxuICAgIC8vIFBFRklYLS4uLiAgICB8ICAgUEVGSVgtLi4uICAgICB8ICAgICAnJ1xuICAgIC8vIFBSRUZJWC0xMjMgICB8ICAgUEVGSVgtMTIzICAgICB8ICAgICAxMjNcbiAgICAvLyBQUkVGSVgtMTIzICAgfCAgIFBSRUZJWC0yMyAgICAgfCAgICAgMjNcbiAgICAvLyBQUkVGSVgtMTIzICAgfCAgIFBSRUZJWC0xMjM0ICAgfCAgICAgMTIzNFxuICAgIGdldFByZWZpeFN0cmlwcGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgcHJlZml4LCBwcmVmaXhMZW5ndGgsIHByZXZSZXN1bHQsIGRlbGltaXRlciwgZGVsaW1pdGVycywgbm9JbW1lZGlhdGVQcmVmaXgpIHtcbiAgICAgICAgLy8gTm8gcHJlZml4XG4gICAgICAgIGlmIChwcmVmaXhMZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmUgcmVzdWx0IHByZWZpeCBzdHJpbmcgZG9lcyBub3QgbWF0Y2ggcHJlLWRlZmluZWQgcHJlZml4XG4gICAgICAgIGlmIChwcmV2UmVzdWx0LnNsaWNlKDAsIHByZWZpeExlbmd0aCkgIT09IHByZWZpeCkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBmaXJzdCB0aW1lIHVzZXIgZW50ZXJlZCBzb21ldGhpbmdcbiAgICAgICAgICBpZiAobm9JbW1lZGlhdGVQcmVmaXggJiYgIXByZXZSZXN1bHQgJiYgdmFsdWUpIHJldHVybiB2YWx1ZTtcblxuICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLnN0cmlwRGVsaW1pdGVycyhwcmV2UmVzdWx0LCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpO1xuXG4gICAgICAgIC8vIE5ldyB2YWx1ZSBoYXMgaXNzdWUsIHNvbWVvbmUgdHlwZWQgaW4gYmV0d2VlbiBwcmVmaXggbGV0dGVyc1xuICAgICAgICAvLyBSZXZlcnQgdG8gcHJlIHZhbHVlXG4gICAgICAgIGlmICh2YWx1ZS5zbGljZSgwLCBwcmVmaXhMZW5ndGgpICE9PSBwcmVmaXgpIHtcbiAgICAgICAgICByZXR1cm4gcHJldlZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyBpc3N1ZSwgc3RyaXAgcHJlZml4IGZvciBuZXcgdmFsdWVcbiAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldEZpcnN0RGlmZkluZGV4OiBmdW5jdGlvbiAocHJldiwgY3VycmVudCkge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgICAgIHdoaWxlIChwcmV2LmNoYXJBdChpbmRleCkgPT09IGN1cnJlbnQuY2hhckF0KGluZGV4KSkge1xuICAgICAgICAgICAgaWYgKHByZXYuY2hhckF0KGluZGV4KyspID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgYmxvY2tzLCBibG9ja3NMZW5ndGgsIGRlbGltaXRlciwgZGVsaW1pdGVycywgZGVsaW1pdGVyTGF6eVNob3cpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnLFxuICAgICAgICAgICAgbXVsdGlwbGVEZWxpbWl0ZXJzID0gZGVsaW1pdGVycy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgY3VycmVudERlbGltaXRlcjtcblxuICAgICAgICAvLyBubyBvcHRpb25zLCBub3JtYWwgaW5wdXRcbiAgICAgICAgaWYgKGJsb2Nrc0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG11bHRpcGxlRGVsaW1pdGVycykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGVsaW1pdGVyID0gZGVsaW1pdGVyc1tkZWxpbWl0ZXJMYXp5U2hvdyA/IChpbmRleCAtIDEpIDogaW5kZXhdIHx8IGN1cnJlbnREZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudERlbGltaXRlciA9IGRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsaW1pdGVyTGF6eVNob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGN1cnJlbnREZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Yi5sZW5ndGggPT09IGxlbmd0aCAmJiBpbmRleCA8IGJsb2Nrc0xlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBjdXJyZW50RGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8vIG1vdmUgY3Vyc29yIHRvIHRoZSBlbmRcbiAgICAvLyB0aGUgZmlyc3QgdGltZSB1c2VyIGZvY3VzZXMgb24gYW4gaW5wdXQgd2l0aCBwcmVmaXhcbiAgICBmaXhQcmVmaXhDdXJzb3I6IGZ1bmN0aW9uIChlbCwgcHJlZml4LCBkZWxpbWl0ZXIsIGRlbGltaXRlcnMpIHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZhbCA9IGVsLnZhbHVlLFxuICAgICAgICAgICAgYXBwZW5kaXggPSBkZWxpbWl0ZXIgfHwgKGRlbGltaXRlcnNbMF0gfHwgJyAnKTtcblxuICAgICAgICBpZiAoIWVsLnNldFNlbGVjdGlvblJhbmdlIHx8ICFwcmVmaXggfHwgKHByZWZpeC5sZW5ndGggKyBhcHBlbmRpeC5sZW5ndGgpIDwgdmFsLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbiA9IHZhbC5sZW5ndGggKiAyO1xuXG4gICAgICAgIC8vIHNldCB0aW1lb3V0IHRvIGF2b2lkIGJsaW5rXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UobGVuLCBsZW4pO1xuICAgICAgICB9LCAxKTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgaW5wdXQgZmllbGQgaXMgZnVsbHkgc2VsZWN0ZWRcbiAgICBjaGVja0Z1bGxTZWxlY3Rpb246IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpIHx8IGRvY3VtZW50LmdldFNlbGVjdGlvbigpIHx8IHt9O1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID09PSB2YWx1ZS5sZW5ndGg7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAvLyBJZ25vcmVcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBzZXRTZWxlY3Rpb246IGZ1bmN0aW9uIChlbGVtZW50LCBwb3NpdGlvbiwgZG9jKSB7XG4gICAgICAgIGlmIChlbGVtZW50ICE9PSB0aGlzLmdldEFjdGl2ZUVsZW1lbnQoZG9jKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3Vyc29yIGlzIGFscmVhZHkgaW4gdGhlIGVuZFxuICAgICAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50LnZhbHVlLmxlbmd0aCA8PSBwb3NpdGlvbikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSkge1xuICAgICAgICAgICAgdmFyIHJhbmdlID0gZWxlbWVudC5jcmVhdGVUZXh0UmFuZ2UoKTtcblxuICAgICAgICAgICAgcmFuZ2UubW92ZSgnY2hhcmFjdGVyJywgcG9zaXRpb24pO1xuICAgICAgICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UocG9zaXRpb24sIHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBpbnB1dCBlbGVtZW50IHR5cGUgZG9lcyBub3Qgc3VwcG9ydCBzZWxlY3Rpb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRBY3RpdmVFbGVtZW50OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdmFyIGFjdGl2ZUVsZW1lbnQgPSBwYXJlbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKGFjdGl2ZUVsZW1lbnQgJiYgYWN0aXZlRWxlbWVudC5zaGFkb3dSb290KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVFbGVtZW50KGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGl2ZUVsZW1lbnQ7XG4gICAgfSxcblxuICAgIGlzQW5kcm9pZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmF2aWdhdG9yICYmIC9hbmRyb2lkL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICB9LFxuXG4gICAgLy8gT24gQW5kcm9pZCBjaHJvbWUsIHRoZSBrZXl1cCBhbmQga2V5ZG93biBldmVudHNcbiAgICAvLyBhbHdheXMgcmV0dXJuIGtleSBjb2RlIDIyOSBhcyBhIGNvbXBvc2l0aW9uIHRoYXRcbiAgICAvLyBidWZmZXJzIHRoZSB1c2Vy4oCZcyBrZXlzdHJva2VzXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3Npci9jbGVhdmUuanMvaXNzdWVzLzE0N1xuICAgIGlzQW5kcm9pZEJhY2tzcGFjZUtleWRvd246IGZ1bmN0aW9uIChsYXN0SW5wdXRWYWx1ZSwgY3VycmVudElucHV0VmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzQW5kcm9pZCgpIHx8ICFsYXN0SW5wdXRWYWx1ZSB8fCAhY3VycmVudElucHV0VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50SW5wdXRWYWx1ZSA9PT0gbGFzdElucHV0VmFsdWUuc2xpY2UoMCwgLTEpO1xuICAgIH1cbn07XG5cbnZhciBVdGlsXzEgPSBVdGlsO1xuXG4vKipcbiAqIFByb3BzIEFzc2lnbm1lbnRcbiAqXG4gKiBTZXBhcmF0ZSB0aGlzLCBzbyByZWFjdCBtb2R1bGUgY2FuIHNoYXJlIHRoZSB1c2FnZVxuICovXG52YXIgRGVmYXVsdFByb3BlcnRpZXMgPSB7XG4gICAgLy8gTWF5YmUgY2hhbmdlIHRvIG9iamVjdC1hc3NpZ25cbiAgICAvLyBmb3Igbm93IGp1c3Qga2VlcCBpdCBhcyBzaW1wbGVcbiAgICBhc3NpZ246IGZ1bmN0aW9uICh0YXJnZXQsIG9wdHMpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt9O1xuICAgICAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgICAgICAvLyBjcmVkaXQgY2FyZFxuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZCA9ICEhb3B0cy5jcmVkaXRDYXJkO1xuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZFN0cmljdE1vZGUgPSAhIW9wdHMuY3JlZGl0Q2FyZFN0cmljdE1vZGU7XG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkVHlwZSA9ICcnO1xuICAgICAgICB0YXJnZXQub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgPSBvcHRzLm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkIHx8IChmdW5jdGlvbiAoKSB7fSk7XG5cbiAgICAgICAgLy8gcGhvbmVcbiAgICAgICAgdGFyZ2V0LnBob25lID0gISFvcHRzLnBob25lO1xuICAgICAgICB0YXJnZXQucGhvbmVSZWdpb25Db2RlID0gb3B0cy5waG9uZVJlZ2lvbkNvZGUgfHwgJ0FVJztcbiAgICAgICAgdGFyZ2V0LnBob25lRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gdGltZVxuICAgICAgICB0YXJnZXQudGltZSA9ICEhb3B0cy50aW1lO1xuICAgICAgICB0YXJnZXQudGltZVBhdHRlcm4gPSBvcHRzLnRpbWVQYXR0ZXJuIHx8IFsnaCcsICdtJywgJ3MnXTtcbiAgICAgICAgdGFyZ2V0LnRpbWVGb3JtYXQgPSBvcHRzLnRpbWVGb3JtYXQgfHwgJzI0JztcbiAgICAgICAgdGFyZ2V0LnRpbWVGb3JtYXR0ZXIgPSB7fTtcblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIHRhcmdldC5kYXRlID0gISFvcHRzLmRhdGU7XG4gICAgICAgIHRhcmdldC5kYXRlUGF0dGVybiA9IG9wdHMuZGF0ZVBhdHRlcm4gfHwgWydkJywgJ20nLCAnWSddO1xuICAgICAgICB0YXJnZXQuZGF0ZU1pbiA9IG9wdHMuZGF0ZU1pbiB8fCAnJztcbiAgICAgICAgdGFyZ2V0LmRhdGVNYXggPSBvcHRzLmRhdGVNYXggfHwgJyc7XG4gICAgICAgIHRhcmdldC5kYXRlRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gbnVtZXJhbFxuICAgICAgICB0YXJnZXQubnVtZXJhbCA9ICEhb3B0cy5udW1lcmFsO1xuICAgICAgICB0YXJnZXQubnVtZXJhbEludGVnZXJTY2FsZSA9IG9wdHMubnVtZXJhbEludGVnZXJTY2FsZSA+IDAgPyBvcHRzLm51bWVyYWxJbnRlZ2VyU2NhbGUgOiAwO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxTY2FsZSA9IG9wdHMubnVtZXJhbERlY2ltYWxTY2FsZSA+PSAwID8gb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlIDogMjtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gb3B0cy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCAndGhvdXNhbmQnO1xuICAgICAgICB0YXJnZXQubnVtZXJhbFBvc2l0aXZlT25seSA9ICEhb3B0cy5udW1lcmFsUG9zaXRpdmVPbmx5O1xuICAgICAgICB0YXJnZXQuc3RyaXBMZWFkaW5nWmVyb2VzID0gb3B0cy5zdHJpcExlYWRpbmdaZXJvZXMgIT09IGZhbHNlO1xuICAgICAgICB0YXJnZXQuc2lnbkJlZm9yZVByZWZpeCA9ICEhb3B0cy5zaWduQmVmb3JlUHJlZml4O1xuXG4gICAgICAgIC8vIG90aGVyc1xuICAgICAgICB0YXJnZXQubnVtZXJpY09ubHkgPSB0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSB8fCAhIW9wdHMubnVtZXJpY09ubHk7XG5cbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XG4gICAgICAgIHRhcmdldC5sb3dlcmNhc2UgPSAhIW9wdHMubG93ZXJjYXNlO1xuXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LmRhdGUpID8gJycgOiAob3B0cy5wcmVmaXggfHwgJycpO1xuICAgICAgICB0YXJnZXQubm9JbW1lZGlhdGVQcmVmaXggPSAhIW9wdHMubm9JbW1lZGlhdGVQcmVmaXg7XG4gICAgICAgIHRhcmdldC5wcmVmaXhMZW5ndGggPSB0YXJnZXQucHJlZml4Lmxlbmd0aDtcbiAgICAgICAgdGFyZ2V0LnJhd1ZhbHVlVHJpbVByZWZpeCA9ICEhb3B0cy5yYXdWYWx1ZVRyaW1QcmVmaXg7XG4gICAgICAgIHRhcmdldC5jb3B5RGVsaW1pdGVyID0gISFvcHRzLmNvcHlEZWxpbWl0ZXI7XG5cbiAgICAgICAgdGFyZ2V0LmluaXRWYWx1ZSA9IChvcHRzLmluaXRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIG9wdHMuaW5pdFZhbHVlICE9PSBudWxsKSA/IG9wdHMuaW5pdFZhbHVlLnRvU3RyaW5nKCkgOiAnJztcblxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID1cbiAgICAgICAgICAgIChvcHRzLmRlbGltaXRlciB8fCBvcHRzLmRlbGltaXRlciA9PT0gJycpID8gb3B0cy5kZWxpbWl0ZXIgOlxuICAgICAgICAgICAgICAgIChvcHRzLmRhdGUgPyAnLycgOlxuICAgICAgICAgICAgICAgICAgICAob3B0cy50aW1lID8gJzonIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIChvcHRzLm51bWVyYWwgPyAnLCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChvcHRzLnBob25lID8gJyAnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnKSkpKTtcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlckxlbmd0aCA9IHRhcmdldC5kZWxpbWl0ZXIubGVuZ3RoO1xuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyTGF6eVNob3cgPSAhIW9wdHMuZGVsaW1pdGVyTGF6eVNob3c7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJzID0gb3B0cy5kZWxpbWl0ZXJzIHx8IFtdO1xuXG4gICAgICAgIHRhcmdldC5ibG9ja3MgPSBvcHRzLmJsb2NrcyB8fCBbXTtcbiAgICAgICAgdGFyZ2V0LmJsb2Nrc0xlbmd0aCA9IHRhcmdldC5ibG9ja3MubGVuZ3RoO1xuXG4gICAgICAgIHRhcmdldC5yb290ID0gKHR5cGVvZiBjb21tb25qc0dsb2JhbCA9PT0gJ29iamVjdCcgJiYgY29tbW9uanNHbG9iYWwpID8gY29tbW9uanNHbG9iYWwgOiB3aW5kb3c7XG4gICAgICAgIHRhcmdldC5kb2N1bWVudCA9IG9wdHMuZG9jdW1lbnQgfHwgdGFyZ2V0LnJvb3QuZG9jdW1lbnQ7XG5cbiAgICAgICAgdGFyZ2V0Lm1heExlbmd0aCA9IDA7XG5cbiAgICAgICAgdGFyZ2V0LmJhY2tzcGFjZSA9IGZhbHNlO1xuICAgICAgICB0YXJnZXQucmVzdWx0ID0gJyc7XG5cbiAgICAgICAgdGFyZ2V0Lm9uVmFsdWVDaGFuZ2VkID0gb3B0cy5vblZhbHVlQ2hhbmdlZCB8fCAoZnVuY3Rpb24gKCkge30pO1xuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxufTtcblxudmFyIERlZmF1bHRQcm9wZXJ0aWVzXzEgPSBEZWZhdWx0UHJvcGVydGllcztcblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSBuZXcgQ2xlYXZlIGluc3RhbmNlIGJ5IHBhc3NpbmcgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gKlxuICogQHBhcmFtIHtTdHJpbmcgfCBIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqL1xudmFyIENsZWF2ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRzKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcbiAgICB2YXIgaGFzTXVsdGlwbGVFbGVtZW50cyA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICBvd25lci5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50KTtcbiAgICAgICAgaGFzTXVsdGlwbGVFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudCkubGVuZ3RoID4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBlbGVtZW50Lmxlbmd0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgZWxlbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgIG93bmVyLmVsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICBoYXNNdWx0aXBsZUVsZW1lbnRzID0gZWxlbWVudC5sZW5ndGggPiAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3duZXIuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFvd25lci5lbGVtZW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignW2NsZWF2ZS5qc10gUGxlYXNlIGNoZWNrIHRoZSBlbGVtZW50Jyk7XG4gICAgfVxuXG4gICAgaWYgKGhhc011bHRpcGxlRWxlbWVudHMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICBjb25zb2xlLndhcm4oJ1tjbGVhdmUuanNdIE11bHRpcGxlIGlucHV0IGZpZWxkcyBtYXRjaGVkLCBjbGVhdmUuanMgd2lsbCBvbmx5IHRha2UgdGhlIGZpcnN0IG9uZS4nKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gT2xkIElFXG4gICAgICB9XG4gICAgfVxuXG4gICAgb3B0cy5pbml0VmFsdWUgPSBvd25lci5lbGVtZW50LnZhbHVlO1xuXG4gICAgb3duZXIucHJvcGVydGllcyA9IENsZWF2ZS5EZWZhdWx0UHJvcGVydGllcy5hc3NpZ24oe30sIG9wdHMpO1xuXG4gICAgb3duZXIuaW5pdCgpO1xufTtcblxuQ2xlYXZlLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgLy8gbm8gbmVlZCB0byB1c2UgdGhpcyBsaWJcbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCAmJiAhcHBzLnBob25lICYmICFwcHMuY3JlZGl0Q2FyZCAmJiAhcHBzLnRpbWUgJiYgIXBwcy5kYXRlICYmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwICYmICFwcHMucHJlZml4KSkge1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChwcHMuaW5pdFZhbHVlKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm1heExlbmd0aCA9IENsZWF2ZS5VdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcblxuICAgICAgICBvd25lci5pc0FuZHJvaWQgPSBDbGVhdmUuVXRpbC5pc0FuZHJvaWQoKTtcbiAgICAgICAgb3duZXIubGFzdElucHV0VmFsdWUgPSAnJztcblxuICAgICAgICBvd25lci5vbkNoYW5nZUxpc3RlbmVyID0gb3duZXIub25DaGFuZ2UuYmluZChvd25lcik7XG4gICAgICAgIG93bmVyLm9uS2V5RG93bkxpc3RlbmVyID0gb3duZXIub25LZXlEb3duLmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbkZvY3VzTGlzdGVuZXIgPSBvd25lci5vbkZvY3VzLmJpbmQob3duZXIpO1xuICAgICAgICBvd25lci5vbkN1dExpc3RlbmVyID0gb3duZXIub25DdXQuYmluZChvd25lcik7XG4gICAgICAgIG93bmVyLm9uQ29weUxpc3RlbmVyID0gb3duZXIub25Db3B5LmJpbmQob3duZXIpO1xuXG4gICAgICAgIG93bmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBvd25lci5vbkNoYW5nZUxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb3duZXIub25LZXlEb3duTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb3duZXIub25Gb2N1c0xpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjdXQnLCBvd25lci5vbkN1dExpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb3B5Jywgb3duZXIub25Db3B5TGlzdGVuZXIpO1xuXG5cbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXREYXRlRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXRUaW1lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXROdW1lcmFsRm9ybWF0dGVyKCk7XG5cbiAgICAgICAgLy8gYXZvaWQgdG91Y2ggaW5wdXQgZmllbGQgaWYgdmFsdWUgaXMgbnVsbFxuICAgICAgICAvLyBvdGhlcndpc2UgRmlyZWZveCB3aWxsIGFkZCByZWQgYm94LXNoYWRvdyBmb3IgPGlucHV0IHJlcXVpcmVkIC8+XG4gICAgICAgIGlmIChwcHMuaW5pdFZhbHVlIHx8IChwcHMucHJlZml4ICYmICFwcHMubm9JbW1lZGlhdGVQcmVmaXgpKSB7XG4gICAgICAgICAgICBvd25lci5vbklucHV0KHBwcy5pbml0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGluaXROdW1lcmFsRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm51bWVyYWxGb3JtYXR0ZXIgPSBuZXcgQ2xlYXZlLk51bWVyYWxGb3JtYXR0ZXIoXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxJbnRlZ2VyU2NhbGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsUG9zaXRpdmVPbmx5LFxuICAgICAgICAgICAgcHBzLnN0cmlwTGVhZGluZ1plcm9lcyxcbiAgICAgICAgICAgIHBwcy5wcmVmaXgsXG4gICAgICAgICAgICBwcHMuc2lnbkJlZm9yZVByZWZpeCxcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW5pdFRpbWVGb3JtYXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLnRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy50aW1lRm9ybWF0dGVyID0gbmV3IENsZWF2ZS5UaW1lRm9ybWF0dGVyKHBwcy50aW1lUGF0dGVybiwgcHBzLnRpbWVGb3JtYXQpO1xuICAgICAgICBwcHMuYmxvY2tzID0gcHBzLnRpbWVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IENsZWF2ZS5VdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICB9LFxuXG4gICAgaW5pdERhdGVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5kYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMuZGF0ZUZvcm1hdHRlciA9IG5ldyBDbGVhdmUuRGF0ZUZvcm1hdHRlcihwcHMuZGF0ZVBhdHRlcm4sIHBwcy5kYXRlTWluLCBwcHMuZGF0ZU1heCk7XG4gICAgICAgIHBwcy5ibG9ja3MgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRCbG9ja3MoKTtcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gQ2xlYXZlLlV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuICAgIH0sXG5cbiAgICBpbml0UGhvbmVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5waG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlciBzaG91bGQgYmUgcHJvdmlkZWQgYnlcbiAgICAgICAgLy8gZXh0ZXJuYWwgZ29vZ2xlIGNsb3N1cmUgbGliXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcHMucGhvbmVGb3JtYXR0ZXIgPSBuZXcgQ2xlYXZlLlBob25lRm9ybWF0dGVyKFxuICAgICAgICAgICAgICAgIG5ldyBwcHMucm9vdC5DbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyKHBwcy5waG9uZVJlZ2lvbkNvZGUpLFxuICAgICAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tjbGVhdmUuanNdIFBsZWFzZSBpbmNsdWRlIHBob25lLXR5cGUtZm9ybWF0dGVyLntjb3VudHJ5fS5qcyBsaWInKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbktleURvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcblxuICAgICAgICAvLyBpZiB3ZSBnb3QgYW55IGNoYXJDb2RlID09PSA4LCB0aGlzIG1lYW5zLCB0aGF0IHRoaXMgZGV2aWNlIGNvcnJlY3RseVxuICAgICAgICAvLyBzZW5kcyBiYWNrc3BhY2Uga2V5cyBpbiBldmVudCwgc28gd2UgZG8gbm90IG5lZWQgdG8gYXBwbHkgYW55IGhhY2tzXG4gICAgICAgIG93bmVyLmhhc0JhY2tzcGFjZVN1cHBvcnQgPSBvd25lci5oYXNCYWNrc3BhY2VTdXBwb3J0IHx8IGNoYXJDb2RlID09PSA4O1xuICAgICAgICBpZiAoIW93bmVyLmhhc0JhY2tzcGFjZVN1cHBvcnRcbiAgICAgICAgICAmJiBVdGlsLmlzQW5kcm9pZEJhY2tzcGFjZUtleWRvd24ob3duZXIubGFzdElucHV0VmFsdWUsIGN1cnJlbnRWYWx1ZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjaGFyQ29kZSA9IDg7XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci5sYXN0SW5wdXRWYWx1ZSA9IGN1cnJlbnRWYWx1ZTtcblxuICAgICAgICAvLyBoaXQgYmFja3NwYWNlIHdoZW4gbGFzdCBjaGFyYWN0ZXIgaXMgZGVsaW1pdGVyXG4gICAgICAgIHZhciBwb3N0RGVsaW1pdGVyID0gVXRpbC5nZXRQb3N0RGVsaW1pdGVyKGN1cnJlbnRWYWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICBpZiAoY2hhckNvZGUgPT09IDggJiYgcG9zdERlbGltaXRlcikge1xuICAgICAgICAgICAgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgPSBwb3N0RGVsaW1pdGVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHBzLnBvc3REZWxpbWl0ZXJCYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm9uSW5wdXQodGhpcy5lbGVtZW50LnZhbHVlKTtcbiAgICB9LFxuXG4gICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBDbGVhdmUuVXRpbC5maXhQcmVmaXhDdXJzb3Iob3duZXIuZWxlbWVudCwgcHBzLnByZWZpeCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgIH0sXG5cbiAgICBvbkN1dDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCFDbGVhdmUuVXRpbC5jaGVja0Z1bGxTZWxlY3Rpb24odGhpcy5lbGVtZW50LnZhbHVlKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNvcHlDbGlwYm9hcmREYXRhKGUpO1xuICAgICAgICB0aGlzLm9uSW5wdXQoJycpO1xuICAgIH0sXG5cbiAgICBvbkNvcHk6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICghQ2xlYXZlLlV0aWwuY2hlY2tGdWxsU2VsZWN0aW9uKHRoaXMuZWxlbWVudC52YWx1ZSkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jb3B5Q2xpcGJvYXJkRGF0YShlKTtcbiAgICB9LFxuXG4gICAgY29weUNsaXBib2FyZERhdGE6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgaW5wdXRWYWx1ZSA9IG93bmVyLmVsZW1lbnQudmFsdWUsXG4gICAgICAgICAgICB0ZXh0VG9Db3B5ID0gJyc7XG5cbiAgICAgICAgaWYgKCFwcHMuY29weURlbGltaXRlcikge1xuICAgICAgICAgICAgdGV4dFRvQ29weSA9IFV0aWwuc3RyaXBEZWxpbWl0ZXJzKGlucHV0VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHRUb0NvcHkgPSBpbnB1dFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChlLmNsaXBib2FyZERhdGEpIHtcbiAgICAgICAgICAgICAgICBlLmNsaXBib2FyZERhdGEuc2V0RGF0YSgnVGV4dCcsIHRleHRUb0NvcHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCdUZXh0JywgdGV4dFRvQ29weSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIC8vICBlbXB0eVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uSW5wdXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsO1xuXG4gICAgICAgIC8vIGNhc2UgMTogZGVsZXRlIG9uZSBtb3JlIGNoYXJhY3RlciBcIjRcIlxuICAgICAgICAvLyAxMjM0KnwgLT4gaGl0IGJhY2tzcGFjZSAtPiAxMjN8XG4gICAgICAgIC8vIGNhc2UgMjogbGFzdCBjaGFyYWN0ZXIgaXMgbm90IGRlbGltaXRlciB3aGljaCBpczpcbiAgICAgICAgLy8gMTJ8MzQqIC0+IGhpdCBiYWNrc3BhY2UgLT4gMXwzNCpcbiAgICAgICAgLy8gbm90ZTogbm8gbmVlZCB0byBhcHBseSB0aGlzIGZvciBudW1lcmFsIG1vZGVcbiAgICAgICAgdmFyIHBvc3REZWxpbWl0ZXJBZnRlciA9IFV0aWwuZ2V0UG9zdERlbGltaXRlcih2YWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmIHBwcy5wb3N0RGVsaW1pdGVyQmFja3NwYWNlICYmICFwb3N0RGVsaW1pdGVyQWZ0ZXIpIHtcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCB2YWx1ZS5sZW5ndGggLSBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZS5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGhvbmUgZm9ybWF0dGVyXG4gICAgICAgIGlmIChwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIGlmIChwcHMucHJlZml4ICYmICghcHBzLm5vSW1tZWRpYXRlUHJlZml4IHx8IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnByZWZpeCArIHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpLnNsaWNlKHBwcy5wcmVmaXgubGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBudW1lcmFsIGZvcm1hdHRlclxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIC8vIERvIG5vdCBzaG93IHByZWZpeCB3aGVuIG5vSW1tZWRpYXRlUHJlZml4IGlzIHNwZWNpZmllZFxuICAgICAgICAgICAgLy8gVGhpcyBtb3N0bHkgYmVjYXVzZSB3ZSBuZWVkIHRvIHNob3cgdXNlciB0aGUgbmF0aXZlIGlucHV0IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICBpZiAocHBzLnByZWZpeCAmJiBwcHMubm9JbW1lZGlhdGVQcmVmaXggJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9ICcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLm51bWVyYWxGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICBpZiAocHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aW1lXG4gICAgICAgIGlmIChwcHMudGltZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMudGltZUZvcm1hdHRlci5nZXRWYWxpZGF0ZWRUaW1lKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlsLnN0cmlwRGVsaW1pdGVycyh2YWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuXG4gICAgICAgIC8vIHN0cmlwIHByZWZpeFxuICAgICAgICB2YWx1ZSA9IFV0aWwuZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZShcbiAgICAgICAgICAgIHZhbHVlLCBwcHMucHJlZml4LCBwcHMucHJlZml4TGVuZ3RoLFxuICAgICAgICAgICAgcHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMsIHBwcy5ub0ltbWVkaWF0ZVByZWZpeFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHN0cmlwIG5vbi1udW1lcmljIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBwcHMubnVtZXJpY09ubHkgPyBVdGlsLnN0cmlwKHZhbHVlLCAvW15cXGRdL2cpIDogdmFsdWU7XG5cbiAgICAgICAgLy8gY29udmVydCBjYXNlXG4gICAgICAgIHZhbHVlID0gcHBzLnVwcGVyY2FzZSA/IHZhbHVlLnRvVXBwZXJDYXNlKCkgOiB2YWx1ZTtcbiAgICAgICAgdmFsdWUgPSBwcHMubG93ZXJjYXNlID8gdmFsdWUudG9Mb3dlckNhc2UoKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIHByZXZlbnQgZnJvbSBzaG93aW5nIHByZWZpeCB3aGVuIG5vIGltbWVkaWF0ZSBvcHRpb24gZW5hYmxlZCB3aXRoIGVtcHR5IGlucHV0IHZhbHVlXG4gICAgICAgIGlmIChwcHMucHJlZml4ICYmICghcHBzLm5vSW1tZWRpYXRlUHJlZml4IHx8IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLnByZWZpeCArIHZhbHVlO1xuXG4gICAgICAgICAgICAvLyBubyBibG9ja3Mgc3BlY2lmaWVkLCBubyBuZWVkIHRvIGRvIGZvcm1hdHRpbmdcbiAgICAgICAgICAgIGlmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjcmVkaXQgY2FyZCBwcm9wc1xuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmQpIHtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgb3ZlciBsZW5ndGggY2hhcmFjdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgcHBzLm1heExlbmd0aCk7XG5cbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXG4gICAgICAgIHBwcy5yZXN1bHQgPSBVdGlsLmdldEZvcm1hdHRlZFZhbHVlKFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBwcHMuYmxvY2tzLCBwcHMuYmxvY2tzTGVuZ3RoLFxuICAgICAgICAgICAgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMsIHBwcy5kZWxpbWl0ZXJMYXp5U2hvd1xuICAgICAgICApO1xuXG4gICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBVdGlsID0gQ2xlYXZlLlV0aWwsXG4gICAgICAgICAgICBjcmVkaXRDYXJkSW5mbztcblxuICAgICAgICAvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBoYXMgY2hhbmdlZFxuICAgICAgICBpZiAoVXRpbC5oZWFkU3RyKHBwcy5yZXN1bHQsIDQpID09PSBVdGlsLmhlYWRTdHIodmFsdWUsIDQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjcmVkaXRDYXJkSW5mbyA9IENsZWF2ZS5DcmVkaXRDYXJkRGV0ZWN0b3IuZ2V0SW5mbyh2YWx1ZSwgcHBzLmNyZWRpdENhcmRTdHJpY3RNb2RlKTtcblxuICAgICAgICBwcHMuYmxvY2tzID0gY3JlZGl0Q2FyZEluZm8uYmxvY2tzO1xuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcblxuICAgICAgICAvLyBjcmVkaXQgY2FyZCB0eXBlIGNoYW5nZWRcbiAgICAgICAgaWYgKHBwcy5jcmVkaXRDYXJkVHlwZSAhPT0gY3JlZGl0Q2FyZEluZm8udHlwZSkge1xuICAgICAgICAgICAgcHBzLmNyZWRpdENhcmRUeXBlID0gY3JlZGl0Q2FyZEluZm8udHlwZTtcblxuICAgICAgICAgICAgcHBzLm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkLmNhbGwob3duZXIsIHBwcy5jcmVkaXRDYXJkVHlwZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlVmFsdWVTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIW93bmVyLmVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlbmRQb3MgPSBvd25lci5lbGVtZW50LnNlbGVjdGlvbkVuZDtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gb3duZXIuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gcHBzLnJlc3VsdDtcblxuICAgICAgICBlbmRQb3MgPSBVdGlsLmdldE5leHRDdXJzb3JQb3NpdGlvbihlbmRQb3MsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuXG4gICAgICAgIC8vIGZpeCBBbmRyb2lkIGJyb3dzZXIgdHlwZT1cInRleHRcIiBpbnB1dCBmaWVsZFxuICAgICAgICAvLyBjdXJzb3Igbm90IGp1bXBpbmcgaXNzdWVcbiAgICAgICAgaWYgKG93bmVyLmlzQW5kcm9pZCkge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG93bmVyLmVsZW1lbnQudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICBVdGlsLnNldFNlbGVjdGlvbihvd25lci5lbGVtZW50LCBlbmRQb3MsIHBwcy5kb2N1bWVudCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIG93bmVyLmNhbGxPblZhbHVlQ2hhbmdlZCgpO1xuICAgICAgICAgICAgfSwgMSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLmVsZW1lbnQudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgVXRpbC5zZXRTZWxlY3Rpb24ob3duZXIuZWxlbWVudCwgZW5kUG9zLCBwcHMuZG9jdW1lbnQsIGZhbHNlKTtcbiAgICAgICAgb3duZXIuY2FsbE9uVmFsdWVDaGFuZ2VkKCk7XG4gICAgfSxcblxuICAgIGNhbGxPblZhbHVlQ2hhbmdlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBwcHMub25WYWx1ZUNoYW5nZWQuY2FsbChvd25lciwge1xuICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHBwcy5yZXN1bHQsXG4gICAgICAgICAgICAgICAgcmF3VmFsdWU6IG93bmVyLmdldFJhd1ZhbHVlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNldFBob25lUmVnaW9uQ29kZTogZnVuY3Rpb24gKHBob25lUmVnaW9uQ29kZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIHBwcy5waG9uZVJlZ2lvbkNvZGUgPSBwaG9uZVJlZ2lvbkNvZGU7XG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5vbkNoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBzZXRSYXdWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsID8gdmFsdWUudG9TdHJpbmcoKSA6ICcnO1xuXG4gICAgICAgIGlmIChwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKCcuJywgcHBzLm51bWVyYWxEZWNpbWFsTWFyayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcHMucG9zdERlbGltaXRlckJhY2tzcGFjZSA9IGZhbHNlO1xuXG4gICAgICAgIG93bmVyLmVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgb3duZXIub25JbnB1dCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGdldFJhd1ZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgVXRpbCA9IENsZWF2ZS5VdGlsLFxuICAgICAgICAgICAgcmF3VmFsdWUgPSBvd25lci5lbGVtZW50LnZhbHVlO1xuXG4gICAgICAgIGlmIChwcHMucmF3VmFsdWVUcmltUHJlZml4KSB7XG4gICAgICAgICAgICByYXdWYWx1ZSA9IFV0aWwuZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZShyYXdWYWx1ZSwgcHBzLnByZWZpeCwgcHBzLnByZWZpeExlbmd0aCwgcHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlciwgcHBzLmRlbGltaXRlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICByYXdWYWx1ZSA9IHBwcy5udW1lcmFsRm9ybWF0dGVyLmdldFJhd1ZhbHVlKHJhd1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhd1ZhbHVlID0gVXRpbC5zdHJpcERlbGltaXRlcnMocmF3VmFsdWUsIHBwcy5kZWxpbWl0ZXIsIHBwcy5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByYXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICByZXR1cm4gcHBzLmRhdGUgPyBwcHMuZGF0ZUZvcm1hdHRlci5nZXRJU09Gb3JtYXREYXRlKCkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0SVNPRm9ybWF0VGltZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICByZXR1cm4gcHBzLnRpbWUgPyBwcHMudGltZUZvcm1hdHRlci5nZXRJU09Gb3JtYXRUaW1lKCkgOiAnJztcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC52YWx1ZTtcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIG93bmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBvd25lci5vbkNoYW5nZUxpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb3duZXIub25LZXlEb3duTGlzdGVuZXIpO1xuICAgICAgICBvd25lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb3duZXIub25Gb2N1c0xpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjdXQnLCBvd25lci5vbkN1dExpc3RlbmVyKTtcbiAgICAgICAgb3duZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb3B5Jywgb3duZXIub25Db3B5TGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ1tDbGVhdmUgT2JqZWN0XSc7XG4gICAgfVxufTtcblxuQ2xlYXZlLk51bWVyYWxGb3JtYXR0ZXIgPSBOdW1lcmFsRm9ybWF0dGVyXzE7XG5DbGVhdmUuRGF0ZUZvcm1hdHRlciA9IERhdGVGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5UaW1lRm9ybWF0dGVyID0gVGltZUZvcm1hdHRlcl8xO1xuQ2xlYXZlLlBob25lRm9ybWF0dGVyID0gUGhvbmVGb3JtYXR0ZXJfMTtcbkNsZWF2ZS5DcmVkaXRDYXJkRGV0ZWN0b3IgPSBDcmVkaXRDYXJkRGV0ZWN0b3JfMTtcbkNsZWF2ZS5VdGlsID0gVXRpbF8xO1xuQ2xlYXZlLkRlZmF1bHRQcm9wZXJ0aWVzID0gRGVmYXVsdFByb3BlcnRpZXNfMTtcblxuLy8gZm9yIGFuZ3VsYXIgZGlyZWN0aXZlXG4oKHR5cGVvZiBjb21tb25qc0dsb2JhbCA9PT0gJ29iamVjdCcgJiYgY29tbW9uanNHbG9iYWwpID8gY29tbW9uanNHbG9iYWwgOiB3aW5kb3cpWydDbGVhdmUnXSA9IENsZWF2ZTtcblxuLy8gQ29tbW9uSlNcbnZhciBDbGVhdmVfMSA9IENsZWF2ZTtcblxuZXhwb3J0IGRlZmF1bHQgQ2xlYXZlXzE7XG4iLCIhZnVuY3Rpb24oKXtmdW5jdGlvbiBsKGwsbil7dmFyIHU9bC5zcGxpdChcIi5cIiksdD1ZO3VbMF1pbiB0fHwhdC5leGVjU2NyaXB0fHx0LmV4ZWNTY3JpcHQoXCJ2YXIgXCIrdVswXSk7Zm9yKHZhciBlO3UubGVuZ3RoJiYoZT11LnNoaWZ0KCkpOyl1Lmxlbmd0aHx8dm9pZCAwPT09bj90PXRbZV0/dFtlXTp0W2VdPXt9OnRbZV09bn1mdW5jdGlvbiBuKGwsbil7ZnVuY3Rpb24gdSgpe311LnByb3RvdHlwZT1uLnByb3RvdHlwZSxsLk09bi5wcm90b3R5cGUsbC5wcm90b3R5cGU9bmV3IHUsbC5wcm90b3R5cGUuY29uc3RydWN0b3I9bCxsLk49ZnVuY3Rpb24obCx1LHQpe2Zvcih2YXIgZT1BcnJheShhcmd1bWVudHMubGVuZ3RoLTIpLHI9MjtyPGFyZ3VtZW50cy5sZW5ndGg7cisrKWVbci0yXT1hcmd1bWVudHNbcl07cmV0dXJuIG4ucHJvdG90eXBlW3VdLmFwcGx5KGwsZSl9fWZ1bmN0aW9uIHUobCxuKXtudWxsIT1sJiZ0aGlzLmEuYXBwbHkodGhpcyxhcmd1bWVudHMpfWZ1bmN0aW9uIHQobCl7bC5iPVwiXCJ9ZnVuY3Rpb24gZShsLG4pe2wuc29ydChufHxyKX1mdW5jdGlvbiByKGwsbil7cmV0dXJuIGw+bj8xOmw8bj8tMTowfWZ1bmN0aW9uIGkobCl7dmFyIG4sdT1bXSx0PTA7Zm9yKG4gaW4gbCl1W3QrK109bFtuXTtyZXR1cm4gdX1mdW5jdGlvbiBhKGwsbil7dGhpcy5iPWwsdGhpcy5hPXt9O2Zvcih2YXIgdT0wO3U8bi5sZW5ndGg7dSsrKXt2YXIgdD1uW3VdO3RoaXMuYVt0LmJdPXR9fWZ1bmN0aW9uIGQobCl7cmV0dXJuIGw9aShsLmEpLGUobCxmdW5jdGlvbihsLG4pe3JldHVybiBsLmItbi5ifSksbH1mdW5jdGlvbiBvKGwsbil7c3dpdGNoKHRoaXMuYj1sLHRoaXMuZz0hIW4udix0aGlzLmE9bi5jLHRoaXMuaT1uLnR5cGUsdGhpcy5oPSExLHRoaXMuYSl7Y2FzZSBPOmNhc2UgSDpjYXNlIHE6Y2FzZSBYOmNhc2UgazpjYXNlIEw6Y2FzZSBKOnRoaXMuaD0hMH10aGlzLmY9bi5kZWZhdWx0VmFsdWV9ZnVuY3Rpb24gcygpe3RoaXMuYT17fSx0aGlzLmY9dGhpcy5qKCkuYSx0aGlzLmI9dGhpcy5nPW51bGx9ZnVuY3Rpb24gZihsLG4pe2Zvcih2YXIgdT1kKGwuaigpKSx0PTA7dDx1Lmxlbmd0aDt0Kyspe3ZhciBlPXVbdF0scj1lLmI7aWYobnVsbCE9bi5hW3JdKXtsLmImJmRlbGV0ZSBsLmJbZS5iXTt2YXIgaT0xMT09ZS5hfHwxMD09ZS5hO2lmKGUuZylmb3IodmFyIGU9cChuLHIpfHxbXSxhPTA7YTxlLmxlbmd0aDthKyspe3ZhciBvPWwscz1yLGM9aT9lW2FdLmNsb25lKCk6ZVthXTtvLmFbc118fChvLmFbc109W10pLG8uYVtzXS5wdXNoKGMpLG8uYiYmZGVsZXRlIG8uYltzXX1lbHNlIGU9cChuLHIpLGk/KGk9cChsLHIpKT9mKGksZSk6bShsLHIsZS5jbG9uZSgpKTptKGwscixlKX19fWZ1bmN0aW9uIHAobCxuKXt2YXIgdT1sLmFbbl07aWYobnVsbD09dSlyZXR1cm4gbnVsbDtpZihsLmcpe2lmKCEobiBpbiBsLmIpKXt2YXIgdD1sLmcsZT1sLmZbbl07aWYobnVsbCE9dSlpZihlLmcpe2Zvcih2YXIgcj1bXSxpPTA7aTx1Lmxlbmd0aDtpKyspcltpXT10LmIoZSx1W2ldKTt1PXJ9ZWxzZSB1PXQuYihlLHUpO3JldHVybiBsLmJbbl09dX1yZXR1cm4gbC5iW25dfXJldHVybiB1fWZ1bmN0aW9uIGMobCxuLHUpe3ZhciB0PXAobCxuKTtyZXR1cm4gbC5mW25dLmc/dFt1fHwwXTp0fWZ1bmN0aW9uIGgobCxuKXt2YXIgdTtpZihudWxsIT1sLmFbbl0pdT1jKGwsbix2b2lkIDApO2Vsc2UgbDp7aWYodT1sLmZbbl0sdm9pZCAwPT09dS5mKXt2YXIgdD11Lmk7aWYodD09PUJvb2xlYW4pdS5mPSExO2Vsc2UgaWYodD09PU51bWJlcil1LmY9MDtlbHNle2lmKHQhPT1TdHJpbmcpe3U9bmV3IHQ7YnJlYWsgbH11LmY9dS5oP1wiMFwiOlwiXCJ9fXU9dS5mfXJldHVybiB1fWZ1bmN0aW9uIGcobCxuKXtyZXR1cm4gbC5mW25dLmc/bnVsbCE9bC5hW25dP2wuYVtuXS5sZW5ndGg6MDpudWxsIT1sLmFbbl0/MTowfWZ1bmN0aW9uIG0obCxuLHUpe2wuYVtuXT11LGwuYiYmKGwuYltuXT11KX1mdW5jdGlvbiBiKGwsbil7dmFyIHUsdD1bXTtmb3IodSBpbiBuKTAhPXUmJnQucHVzaChuZXcgbyh1LG5bdV0pKTtyZXR1cm4gbmV3IGEobCx0KX0vKlxuXG4gUHJvdG9jb2wgQnVmZmVyIDIgQ29weXJpZ2h0IDIwMDggR29vZ2xlIEluYy5cbiBBbGwgb3RoZXIgY29kZSBjb3B5cmlnaHQgaXRzIHJlc3BlY3RpdmUgb3duZXJzLlxuIENvcHlyaWdodCAoQykgMjAxMCBUaGUgTGlicGhvbmVudW1iZXIgQXV0aG9yc1xuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmZ1bmN0aW9uIHkoKXtzLmNhbGwodGhpcyl9ZnVuY3Rpb24gdigpe3MuY2FsbCh0aGlzKX1mdW5jdGlvbiBTKCl7cy5jYWxsKHRoaXMpfWZ1bmN0aW9uIF8oKXt9ZnVuY3Rpb24gdygpe31mdW5jdGlvbiBBKCl7fS8qXG5cbiBDb3B5cmlnaHQgKEMpIDIwMTAgVGhlIExpYnBob25lbnVtYmVyIEF1dGhvcnMuXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuZnVuY3Rpb24geCgpe3RoaXMuYT17fX1mdW5jdGlvbiBCKGwpe3JldHVybiAwPT1sLmxlbmd0aHx8cmwudGVzdChsKX1mdW5jdGlvbiBDKGwsbil7aWYobnVsbD09bilyZXR1cm4gbnVsbDtuPW4udG9VcHBlckNhc2UoKTt2YXIgdT1sLmFbbl07aWYobnVsbD09dSl7aWYodT1ubFtuXSxudWxsPT11KXJldHVybiBudWxsO3U9KG5ldyBBKS5hKFMuaigpLHUpLGwuYVtuXT11fXJldHVybiB1fWZ1bmN0aW9uIE0obCl7cmV0dXJuIGw9bGxbbF0sbnVsbD09bD9cIlpaXCI6bFswXX1mdW5jdGlvbiBOKGwpe3RoaXMuSD1SZWdFeHAoXCLigIhcIiksdGhpcy5DPVwiXCIsdGhpcy5tPW5ldyB1LHRoaXMudz1cIlwiLHRoaXMuaT1uZXcgdSx0aGlzLnU9bmV3IHUsdGhpcy5sPSEwLHRoaXMuQT10aGlzLm89dGhpcy5GPSExLHRoaXMuRz14LmIoKSx0aGlzLnM9MCx0aGlzLmI9bmV3IHUsdGhpcy5CPSExLHRoaXMuaD1cIlwiLHRoaXMuYT1uZXcgdSx0aGlzLmY9W10sdGhpcy5EPWwsdGhpcy5KPXRoaXMuZz1EKHRoaXMsdGhpcy5EKX1mdW5jdGlvbiBEKGwsbil7dmFyIHU7aWYobnVsbCE9biYmaXNOYU4obikmJm4udG9VcHBlckNhc2UoKWluIG5sKXtpZih1PUMobC5HLG4pLG51bGw9PXUpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIHJlZ2lvbiBjb2RlOiBcIituKTt1PWgodSwxMCl9ZWxzZSB1PTA7cmV0dXJuIHU9QyhsLkcsTSh1KSksbnVsbCE9dT91OmlsfWZ1bmN0aW9uIEcobCl7Zm9yKHZhciBuPWwuZi5sZW5ndGgsdT0wO3U8bjsrK3Upe3ZhciBlPWwuZlt1XSxyPWgoZSwxKTtpZihsLnc9PXIpcmV0dXJuITE7dmFyIGk7aT1sO3ZhciBhPWUsZD1oKGEsMSk7aWYoLTEhPWQuaW5kZXhPZihcInxcIikpaT0hMTtlbHNle2Q9ZC5yZXBsYWNlKGFsLFwiXFxcXGRcIiksZD1kLnJlcGxhY2UoZGwsXCJcXFxcZFwiKSx0KGkubSk7dmFyIG87bz1pO3ZhciBhPWgoYSwyKSxzPVwiOTk5OTk5OTk5OTk5OTk5XCIubWF0Y2goZClbMF07cy5sZW5ndGg8by5hLmIubGVuZ3RoP289XCJcIjoobz1zLnJlcGxhY2UobmV3IFJlZ0V4cChkLFwiZ1wiKSxhKSxvPW8ucmVwbGFjZShSZWdFeHAoXCI5XCIsXCJnXCIpLFwi4oCIXCIpKSwwPG8ubGVuZ3RoPyhpLm0uYShvKSxpPSEwKTppPSExfWlmKGkpcmV0dXJuIGwudz1yLGwuQj1zbC50ZXN0KGMoZSw0KSksbC5zPTAsITB9cmV0dXJuIGwubD0hMX1mdW5jdGlvbiBqKGwsbil7Zm9yKHZhciB1PVtdLHQ9bi5sZW5ndGgtMyxlPWwuZi5sZW5ndGgscj0wO3I8ZTsrK3Ipe3ZhciBpPWwuZltyXTswPT1nKGksMyk/dS5wdXNoKGwuZltyXSk6KGk9YyhpLDMsTWF0aC5taW4odCxnKGksMyktMSkpLDA9PW4uc2VhcmNoKGkpJiZ1LnB1c2gobC5mW3JdKSl9bC5mPXV9ZnVuY3Rpb24gSShsLG4pe2wuaS5hKG4pO3ZhciB1PW47aWYoZWwudGVzdCh1KXx8MT09bC5pLmIubGVuZ3RoJiZ0bC50ZXN0KHUpKXt2YXIgZSx1PW47XCIrXCI9PXU/KGU9dSxsLnUuYSh1KSk6KGU9dWxbdV0sbC51LmEoZSksbC5hLmEoZSkpLG49ZX1lbHNlIGwubD0hMSxsLkY9ITA7aWYoIWwubCl7aWYoIWwuRilpZihGKGwpKXtpZihVKGwpKXJldHVybiBWKGwpfWVsc2UgaWYoMDxsLmgubGVuZ3RoJiYodT1sLmEudG9TdHJpbmcoKSx0KGwuYSksbC5hLmEobC5oKSxsLmEuYSh1KSx1PWwuYi50b1N0cmluZygpLGU9dS5sYXN0SW5kZXhPZihsLmgpLHQobC5iKSxsLmIuYSh1LnN1YnN0cmluZygwLGUpKSksbC5oIT1QKGwpKXJldHVybiBsLmIuYShcIiBcIiksVihsKTtyZXR1cm4gbC5pLnRvU3RyaW5nKCl9c3dpdGNoKGwudS5iLmxlbmd0aCl7Y2FzZSAwOmNhc2UgMTpjYXNlIDI6cmV0dXJuIGwuaS50b1N0cmluZygpO2Nhc2UgMzppZighRihsKSlyZXR1cm4gbC5oPVAobCksRShsKTtsLkE9ITA7ZGVmYXVsdDpyZXR1cm4gbC5BPyhVKGwpJiYobC5BPSExKSxsLmIudG9TdHJpbmcoKStsLmEudG9TdHJpbmcoKSk6MDxsLmYubGVuZ3RoPyh1PUsobCxuKSxlPSQobCksMDxlLmxlbmd0aD9lOihqKGwsbC5hLnRvU3RyaW5nKCkpLEcobCk/VChsKTpsLmw/UihsLHUpOmwuaS50b1N0cmluZygpKSk6RShsKX19ZnVuY3Rpb24gVihsKXtyZXR1cm4gbC5sPSEwLGwuQT0hMSxsLmY9W10sbC5zPTAsdChsLm0pLGwudz1cIlwiLEUobCl9ZnVuY3Rpb24gJChsKXtmb3IodmFyIG49bC5hLnRvU3RyaW5nKCksdT1sLmYubGVuZ3RoLHQ9MDt0PHU7Kyt0KXt2YXIgZT1sLmZbdF0scj1oKGUsMSk7aWYobmV3IFJlZ0V4cChcIl4oPzpcIityK1wiKSRcIikudGVzdChuKSlyZXR1cm4gbC5CPXNsLnRlc3QoYyhlLDQpKSxuPW4ucmVwbGFjZShuZXcgUmVnRXhwKHIsXCJnXCIpLGMoZSwyKSksUihsLG4pfXJldHVyblwiXCJ9ZnVuY3Rpb24gUihsLG4pe3ZhciB1PWwuYi5iLmxlbmd0aDtyZXR1cm4gbC5CJiYwPHUmJlwiIFwiIT1sLmIudG9TdHJpbmcoKS5jaGFyQXQodS0xKT9sLmIrXCIgXCIrbjpsLmIrbn1mdW5jdGlvbiBFKGwpe3ZhciBuPWwuYS50b1N0cmluZygpO2lmKDM8PW4ubGVuZ3RoKXtmb3IodmFyIHU9bC5vJiYwPT1sLmgubGVuZ3RoJiYwPGcobC5nLDIwKT9wKGwuZywyMCl8fFtdOnAobC5nLDE5KXx8W10sdD11Lmxlbmd0aCxlPTA7ZTx0OysrZSl7dmFyIHI9dVtlXTswPGwuaC5sZW5ndGgmJkIoaChyLDQpKSYmIWMociw2KSYmbnVsbD09ci5hWzVdfHwoMCE9bC5oLmxlbmd0aHx8bC5vfHxCKGgociw0KSl8fGMociw2KSkmJm9sLnRlc3QoaChyLDIpKSYmbC5mLnB1c2gocil9cmV0dXJuIGoobCxuKSxuPSQobCksMDxuLmxlbmd0aD9uOkcobCk/VChsKTpsLmkudG9TdHJpbmcoKX1yZXR1cm4gUihsLG4pfWZ1bmN0aW9uIFQobCl7dmFyIG49bC5hLnRvU3RyaW5nKCksdT1uLmxlbmd0aDtpZigwPHUpe2Zvcih2YXIgdD1cIlwiLGU9MDtlPHU7ZSsrKXQ9SyhsLG4uY2hhckF0KGUpKTtyZXR1cm4gbC5sP1IobCx0KTpsLmkudG9TdHJpbmcoKX1yZXR1cm4gbC5iLnRvU3RyaW5nKCl9ZnVuY3Rpb24gUChsKXt2YXIgbix1PWwuYS50b1N0cmluZygpLGU9MDtyZXR1cm4gMSE9YyhsLmcsMTApP249ITE6KG49bC5hLnRvU3RyaW5nKCksbj1cIjFcIj09bi5jaGFyQXQoMCkmJlwiMFwiIT1uLmNoYXJBdCgxKSYmXCIxXCIhPW4uY2hhckF0KDEpKSxuPyhlPTEsbC5iLmEoXCIxXCIpLmEoXCIgXCIpLGwubz0hMCk6bnVsbCE9bC5nLmFbMTVdJiYobj1uZXcgUmVnRXhwKFwiXig/OlwiK2MobC5nLDE1KStcIilcIiksbj11Lm1hdGNoKG4pLG51bGwhPW4mJm51bGwhPW5bMF0mJjA8blswXS5sZW5ndGgmJihsLm89ITAsZT1uWzBdLmxlbmd0aCxsLmIuYSh1LnN1YnN0cmluZygwLGUpKSkpLHQobC5hKSxsLmEuYSh1LnN1YnN0cmluZyhlKSksdS5zdWJzdHJpbmcoMCxlKX1mdW5jdGlvbiBGKGwpe3ZhciBuPWwudS50b1N0cmluZygpLHU9bmV3IFJlZ0V4cChcIl4oPzpcXFxcK3xcIitjKGwuZywxMSkrXCIpXCIpLHU9bi5tYXRjaCh1KTtyZXR1cm4gbnVsbCE9dSYmbnVsbCE9dVswXSYmMDx1WzBdLmxlbmd0aCYmKGwubz0hMCx1PXVbMF0ubGVuZ3RoLHQobC5hKSxsLmEuYShuLnN1YnN0cmluZyh1KSksdChsLmIpLGwuYi5hKG4uc3Vic3RyaW5nKDAsdSkpLFwiK1wiIT1uLmNoYXJBdCgwKSYmbC5iLmEoXCIgXCIpLCEwKX1mdW5jdGlvbiBVKGwpe2lmKDA9PWwuYS5iLmxlbmd0aClyZXR1cm4hMTt2YXIgbixlPW5ldyB1O2w6e2lmKG49bC5hLnRvU3RyaW5nKCksMCE9bi5sZW5ndGgmJlwiMFwiIT1uLmNoYXJBdCgwKSlmb3IodmFyIHIsaT1uLmxlbmd0aCxhPTE7Mz49YSYmYTw9aTsrK2EpaWYocj1wYXJzZUludChuLnN1YnN0cmluZygwLGEpLDEwKSxyIGluIGxsKXtlLmEobi5zdWJzdHJpbmcoYSkpLG49cjticmVhayBsfW49MH1yZXR1cm4gMCE9biYmKHQobC5hKSxsLmEuYShlLnRvU3RyaW5nKCkpLGU9TShuKSxcIjAwMVwiPT1lP2wuZz1DKGwuRyxcIlwiK24pOmUhPWwuRCYmKGwuZz1EKGwsZSkpLGwuYi5hKFwiXCIrbikuYShcIiBcIiksbC5oPVwiXCIsITApfWZ1bmN0aW9uIEsobCxuKXt2YXIgdT1sLm0udG9TdHJpbmcoKTtpZigwPD11LnN1YnN0cmluZyhsLnMpLnNlYXJjaChsLkgpKXt2YXIgZT11LnNlYXJjaChsLkgpLHU9dS5yZXBsYWNlKGwuSCxuKTtyZXR1cm4gdChsLm0pLGwubS5hKHUpLGwucz1lLHUuc3Vic3RyaW5nKDAsbC5zKzEpfXJldHVybiAxPT1sLmYubGVuZ3RoJiYobC5sPSExKSxsLnc9XCJcIixsLmkudG9TdHJpbmcoKX12YXIgWT10aGlzO3UucHJvdG90eXBlLmI9XCJcIix1LnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24obCl7dGhpcy5iPVwiXCIrbH0sdS5wcm90b3R5cGUuYT1mdW5jdGlvbihsLG4sdSl7aWYodGhpcy5iKz1TdHJpbmcobCksbnVsbCE9bilmb3IodmFyIHQ9MTt0PGFyZ3VtZW50cy5sZW5ndGg7dCsrKXRoaXMuYis9YXJndW1lbnRzW3RdO3JldHVybiB0aGlzfSx1LnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJ9O3ZhciBKPTEsTD0yLE89MyxIPTQscT02LFg9MTYsaz0xODtzLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24obCxuKXttKHRoaXMsbC5iLG4pfSxzLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3ZhciBsPW5ldyB0aGlzLmNvbnN0cnVjdG9yO3JldHVybiBsIT10aGlzJiYobC5hPXt9LGwuYiYmKGwuYj17fSksZihsLHRoaXMpKSxsfSxuKHkscyk7dmFyIFo9bnVsbDtuKHYscyk7dmFyIHo9bnVsbDtuKFMscyk7dmFyIFE9bnVsbDt5LnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7dmFyIGw9WjtyZXR1cm4gbHx8KFo9bD1iKHksezA6e25hbWU6XCJOdW1iZXJGb3JtYXRcIixJOlwiaTE4bi5waG9uZW51bWJlcnMuTnVtYmVyRm9ybWF0XCJ9LDE6e25hbWU6XCJwYXR0ZXJuXCIscmVxdWlyZWQ6ITAsYzo5LHR5cGU6U3RyaW5nfSwyOntuYW1lOlwiZm9ybWF0XCIscmVxdWlyZWQ6ITAsYzo5LHR5cGU6U3RyaW5nfSwzOntuYW1lOlwibGVhZGluZ19kaWdpdHNfcGF0dGVyblwiLHY6ITAsYzo5LHR5cGU6U3RyaW5nfSw0OntuYW1lOlwibmF0aW9uYWxfcHJlZml4X2Zvcm1hdHRpbmdfcnVsZVwiLGM6OSx0eXBlOlN0cmluZ30sNjp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF9vcHRpb25hbF93aGVuX2Zvcm1hdHRpbmdcIixjOjgsZGVmYXVsdFZhbHVlOiExLHR5cGU6Qm9vbGVhbn0sNTp7bmFtZTpcImRvbWVzdGljX2NhcnJpZXJfY29kZV9mb3JtYXR0aW5nX3J1bGVcIixjOjksdHlwZTpTdHJpbmd9fSkpLGx9LHkuaj15LnByb3RvdHlwZS5qLHYucHJvdG90eXBlLmo9ZnVuY3Rpb24oKXt2YXIgbD16O3JldHVybiBsfHwoej1sPWIodix7MDp7bmFtZTpcIlBob25lTnVtYmVyRGVzY1wiLEk6XCJpMThuLnBob25lbnVtYmVycy5QaG9uZU51bWJlckRlc2NcIn0sMjp7bmFtZTpcIm5hdGlvbmFsX251bWJlcl9wYXR0ZXJuXCIsYzo5LHR5cGU6U3RyaW5nfSw5OntuYW1lOlwicG9zc2libGVfbGVuZ3RoXCIsdjohMCxjOjUsdHlwZTpOdW1iZXJ9LDEwOntuYW1lOlwicG9zc2libGVfbGVuZ3RoX2xvY2FsX29ubHlcIix2OiEwLGM6NSx0eXBlOk51bWJlcn0sNjp7bmFtZTpcImV4YW1wbGVfbnVtYmVyXCIsYzo5LHR5cGU6U3RyaW5nfX0pKSxsfSx2Lmo9di5wcm90b3R5cGUuaixTLnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7dmFyIGw9UTtyZXR1cm4gbHx8KFE9bD1iKFMsezA6e25hbWU6XCJQaG9uZU1ldGFkYXRhXCIsSTpcImkxOG4ucGhvbmVudW1iZXJzLlBob25lTWV0YWRhdGFcIn0sMTp7bmFtZTpcImdlbmVyYWxfZGVzY1wiLGM6MTEsdHlwZTp2fSwyOntuYW1lOlwiZml4ZWRfbGluZVwiLGM6MTEsdHlwZTp2fSwzOntuYW1lOlwibW9iaWxlXCIsYzoxMSx0eXBlOnZ9LDQ6e25hbWU6XCJ0b2xsX2ZyZWVcIixjOjExLHR5cGU6dn0sNTp7bmFtZTpcInByZW1pdW1fcmF0ZVwiLGM6MTEsdHlwZTp2fSw2OntuYW1lOlwic2hhcmVkX2Nvc3RcIixjOjExLHR5cGU6dn0sNzp7bmFtZTpcInBlcnNvbmFsX251bWJlclwiLGM6MTEsdHlwZTp2fSw4OntuYW1lOlwidm9pcFwiLGM6MTEsdHlwZTp2fSwyMTp7bmFtZTpcInBhZ2VyXCIsYzoxMSx0eXBlOnZ9LDI1OntuYW1lOlwidWFuXCIsYzoxMSx0eXBlOnZ9LDI3OntuYW1lOlwiZW1lcmdlbmN5XCIsYzoxMSx0eXBlOnZ9LDI4OntuYW1lOlwidm9pY2VtYWlsXCIsYzoxMSx0eXBlOnZ9LDI5OntuYW1lOlwic2hvcnRfY29kZVwiLGM6MTEsdHlwZTp2fSwzMDp7bmFtZTpcInN0YW5kYXJkX3JhdGVcIixjOjExLHR5cGU6dn0sMzE6e25hbWU6XCJjYXJyaWVyX3NwZWNpZmljXCIsYzoxMSx0eXBlOnZ9LDMzOntuYW1lOlwic21zX3NlcnZpY2VzXCIsYzoxMSx0eXBlOnZ9LDI0OntuYW1lOlwibm9faW50ZXJuYXRpb25hbF9kaWFsbGluZ1wiLGM6MTEsdHlwZTp2fSw5OntuYW1lOlwiaWRcIixyZXF1aXJlZDohMCxjOjksdHlwZTpTdHJpbmd9LDEwOntuYW1lOlwiY291bnRyeV9jb2RlXCIsYzo1LHR5cGU6TnVtYmVyfSwxMTp7bmFtZTpcImludGVybmF0aW9uYWxfcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxNzp7bmFtZTpcInByZWZlcnJlZF9pbnRlcm5hdGlvbmFsX3ByZWZpeFwiLGM6OSx0eXBlOlN0cmluZ30sMTI6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhcIixjOjksdHlwZTpTdHJpbmd9LDEzOntuYW1lOlwicHJlZmVycmVkX2V4dG5fcHJlZml4XCIsYzo5LHR5cGU6U3RyaW5nfSwxNTp7bmFtZTpcIm5hdGlvbmFsX3ByZWZpeF9mb3JfcGFyc2luZ1wiLGM6OSx0eXBlOlN0cmluZ30sMTY6e25hbWU6XCJuYXRpb25hbF9wcmVmaXhfdHJhbnNmb3JtX3J1bGVcIixjOjksdHlwZTpTdHJpbmd9LDE4OntuYW1lOlwic2FtZV9tb2JpbGVfYW5kX2ZpeGVkX2xpbmVfcGF0dGVyblwiLGM6OCxkZWZhdWx0VmFsdWU6ITEsdHlwZTpCb29sZWFufSwxOTp7bmFtZTpcIm51bWJlcl9mb3JtYXRcIix2OiEwLGM6MTEsdHlwZTp5fSwyMDp7bmFtZTpcImludGxfbnVtYmVyX2Zvcm1hdFwiLHY6ITAsYzoxMSx0eXBlOnl9LDIyOntuYW1lOlwibWFpbl9jb3VudHJ5X2Zvcl9jb2RlXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59LDIzOntuYW1lOlwibGVhZGluZ19kaWdpdHNcIixjOjksdHlwZTpTdHJpbmd9LDI2OntuYW1lOlwibGVhZGluZ196ZXJvX3Bvc3NpYmxlXCIsYzo4LGRlZmF1bHRWYWx1ZTohMSx0eXBlOkJvb2xlYW59fSkpLGx9LFMuaj1TLnByb3RvdHlwZS5qLF8ucHJvdG90eXBlLmE9ZnVuY3Rpb24obCl7dGhyb3cgbmV3IGwuYixFcnJvcihcIlVuaW1wbGVtZW50ZWRcIil9LF8ucHJvdG90eXBlLmI9ZnVuY3Rpb24obCxuKXtpZigxMT09bC5hfHwxMD09bC5hKXJldHVybiBuIGluc3RhbmNlb2Ygcz9uOnRoaXMuYShsLmkucHJvdG90eXBlLmooKSxuKTtpZigxND09bC5hKXtpZihcInN0cmluZ1wiPT10eXBlb2YgbiYmVy50ZXN0KG4pKXt2YXIgdT1OdW1iZXIobik7aWYoMDx1KXJldHVybiB1fXJldHVybiBufWlmKCFsLmgpcmV0dXJuIG47aWYodT1sLmksdT09PVN0cmluZyl7aWYoXCJudW1iZXJcIj09dHlwZW9mIG4pcmV0dXJuIFN0cmluZyhuKX1lbHNlIGlmKHU9PT1OdW1iZXImJlwic3RyaW5nXCI9PXR5cGVvZiBuJiYoXCJJbmZpbml0eVwiPT09bnx8XCItSW5maW5pdHlcIj09PW58fFwiTmFOXCI9PT1ufHxXLnRlc3QobikpKXJldHVybiBOdW1iZXIobik7cmV0dXJuIG59O3ZhciBXPS9eLT9bMC05XSskLztuKHcsXyksdy5wcm90b3R5cGUuYT1mdW5jdGlvbihsLG4pe3ZhciB1PW5ldyBsLmI7cmV0dXJuIHUuZz10aGlzLHUuYT1uLHUuYj17fSx1fSxuKEEsdyksQS5wcm90b3R5cGUuYj1mdW5jdGlvbihsLG4pe3JldHVybiA4PT1sLmE/ISFuOl8ucHJvdG90eXBlLmIuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxBLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGwsbil7cmV0dXJuIEEuTS5hLmNhbGwodGhpcyxsLG4pfTsvKlxuXG4gQ29weXJpZ2h0IChDKSAyMDEwIFRoZSBMaWJwaG9uZW51bWJlciBBdXRob3JzXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xudmFyIGxsPXsxOlwiVVMgQUcgQUkgQVMgQkIgQk0gQlMgQ0EgRE0gRE8gR0QgR1UgSk0gS04gS1kgTEMgTVAgTVMgUFIgU1ggVEMgVFQgVkMgVkcgVklcIi5zcGxpdChcIiBcIil9LG5sPXtBRzpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjY4fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjY4KD86NCg/OjZbMC0zOF18ODQpfDU2WzAtMl0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI2ODQ2MDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNjgoPzo0NjR8Nyg/OjFbMy05XXwyXFxcXGR8M1syNDZdfDY0fFs3OF1bMC02ODldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY4NDY0MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjI2ODQ4WzAxXVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0ODAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxcIkFHXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxcIjI2ODQwWzY5XVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjg0MDYxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxudWxsLFwiMjY4XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxBSTpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjY0fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjY0NCg/OjZbMTJdfDlbNzhdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNjQ0NjEyMzQ1XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiMjY0KD86MjM1fDQ3Nnw1KD86M1s2LTldfDhbMS00XSl8Nyg/OjI5fDcyKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjY0MjM1MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQUlcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI2NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQVM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY4NHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY4NDYoPzoyMnwzM3w0NHw1NXw3N3w4OHw5WzE5XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjg0NjIyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY4NCg/OjIoPzo1WzI0NjhdfDcyKXw3KD86M1sxM118NzApKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2ODQ3MzMxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJBU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjg0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxCQjpbbnVsbCxbbnVsbCxudWxsLFwiKD86MjQ2fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMjQ2KD86Mig/OjJbNzhdfDdbMC00XSl8NCg/OjFbMDI0LTZdfDJcXFxcZHwzWzItOV0pfDUoPzoyMHxbMzRdXFxcXGR8NTR8N1sxLTNdKXw2KD86MlxcXFxkfDM4KXw3WzM1XTd8OSg/OjFbODldfDYzKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQ2NDEyMzQ1NlwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI0Nig/OjIoPzpbMzU2XVxcXFxkfDRbMC01Ny05XXw4WzAtNzldKXw0NVxcXFxkfDY5WzUtN118OCg/OlsyLTVdXFxcXGR8ODMpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDYyNTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIig/OjI0Njk3Nnw5MDBbMi05XVxcXFxkXFxcXGQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjI0NjMxXFxcXGR7NX1cIixudWxsLG51bGwsbnVsbCxcIjI0NjMxMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFwiQkJcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjI0NlwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiMjQ2KD86MjkyfDM2N3w0KD86MVs3LTldfDNbMDFdfDQ0fDY3KXw3KD86MzZ8NTMpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCIyNDY0MzAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxCTTpbbnVsbCxbbnVsbCxudWxsLFwiKD86NDQxfFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNDQxKD86Mig/OjAyfDIzfFszNDc5XVxcXFxkfDYxKXxbNDZdXFxcXGRcXFxcZHw1KD86NFxcXFxkfDYwfDg5KXw4MjQpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjQ0MTIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI0NDEoPzpbMzddXFxcXGR8NVswLTM5XSlcXFxcZHs1fVwiLG51bGwsbnVsbCxudWxsLFwiNDQxMzcwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiQk1cIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjQ0MVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQlM6W251bGwsW251bGwsbnVsbCxcIig/OjI0MnxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI0Mig/OjMoPzowMnxbMjM2XVsxLTldfDRbMC0yNC05XXw1WzAtNjhdfDdbMzQ3XXw4WzAtNF18OVsyLTQ2N10pfDQ2MXw1MDJ8Nig/OjBbMS00XXwxMnwyWzAxM118WzQ1XTB8N1s2N118OFs3OF18OVs4OV0pfDcoPzowMnw4OCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjI0MjM0NTY3ODlcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIyNDIoPzozKD86NVs3OV18N1s1Nl18OTUpfDQoPzpbMjNdWzEtOV18NFsxLTM1LTldfDVbMS04XXw2WzItOF18N1xcXFxkfDgxKXw1KD86Mls0NV18M1szNV18NDR8NVsxLTQ2LTldfDY1fDc3KXw2WzM0XTZ8Nyg/OjI3fDM4KXw4KD86MFsxLTldfDFbMDItOV18MlxcXFxkfFs4OV05KSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMjQyMzU5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIig/OjI0MjMwMHw4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZFxcXFxkKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkJTXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyNDJcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjI0MjIyNVswLTQ2LTldXFxcXGR7M31cIixudWxsLG51bGwsbnVsbCxcIjI0MjIyNTAxMjNcIl0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sQ0E6W251bGwsW251bGwsbnVsbCxcIig/OlsyLThdXFxcXGR8OTApXFxcXGR7OH1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIig/OjIoPzowNHxbMjNdNnxbNDhdOXw1MCl8Myg/OjA2fDQzfDY1KXw0KD86MDN8MVs2OF18M1sxNzhdfDUwKXw1KD86MDZ8MVs0OV18NDh8Nzl8OFsxN10pfDYoPzowNHwxM3wzOXw0Nyl8Nyg/OjBbNTldfDc4fDhbMDJdKXw4KD86WzA2XTd8MTl8MjV8NzMpfDkwWzI1XSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDYyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjA0fFsyM102fFs0OF05fDUwKXwzKD86MDZ8NDN8NjUpfDQoPzowM3wxWzY4XXwzWzE3OF18NTApfDUoPzowNnwxWzQ5XXw0OHw3OXw4WzE3XSl8Nig/OjA0fDEzfDM5fDQ3KXw3KD86MFs1OV18Nzh8OFswMl0pfDgoPzpbMDZdN3wxOXwyNXw3Myl8OTBbMjVdKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwNjIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIig/OjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OCl8NjIyKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjYwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjYwMDIwMTIzNDVcIl0sXCJDQVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxETTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NzY3fDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNzY3KD86Mig/OjU1fDY2KXw0KD86MlswMV18NFswLTI1LTldKXw1MFswLTRdfDcwWzEtM10pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc2NzQyMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3NjcoPzoyKD86WzItNDY4OV01fDdbNS03XSl8MzFbNS03XXw2MVsxLTddKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3NjcyMjUxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJETVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzY3XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxETzpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI4KD86WzA0XTlbMi05XVxcXFxkXFxcXGR8MjkoPzoyKD86WzAtNTldXFxcXGR8NlswNC05XXw3WzAtMjddfDhbMDIzNy05XSl8Myg/OlswLTM1LTldXFxcXGR8NFs3LTldKXxbNDVdXFxcXGRcXFxcZHw2KD86WzAtMjctOV1cXFxcZHxbMy01XVsxLTldfDZbMDEzNS04XSl8Nyg/OjBbMDEzLTldfFsxLTM3XVxcXFxkfDRbMS0zNTY4OV18NVsxLTQ2ODldfDZbMS01Ny05XXw4WzEtNzldfDlbMS04XSl8OCg/OjBbMTQ2LTldfDFbMC00OF18WzI0OF1cXFxcZHwzWzEtNzldfDVbMDE1ODldfDZbMDEzLTY4XXw3WzEyNC04XXw5WzAtOF0pfDkoPzpbMC0yNF1cXFxcZHwzWzAyLTQ2LTldfDVbMC03OV18NjB8N1swMTY5XXw4WzU3LTldfDlbMDItOV0pKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODA5MjM0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjhbMDI0XTlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDkyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJET1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiOFswMjRdOVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sR0Q6W251bGwsW251bGwsbnVsbCxcIig/OjQ3M3xbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjQ3Myg/OjIoPzozWzAtMl18NjkpfDMoPzoyWzg5XXw4Nil8NCg/OlswNl04fDNbNS05XXw0WzAtNDldfDVbNS03OV18NzN8OTApfDYzWzY4XXw3KD86NTh8ODQpfDgwMHw5MzgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjQ3MzI2OTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI0NzMoPzo0KD86MFsyLTc5XXwxWzA0LTldfDJbMC01XXw1OCl8NSg/OjJbMDFdfDNbMy04XSl8OTAxKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI0NzM0MDMxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJHRFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNDczXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxHVTpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4XVxcXFxkXFxcXGR8NjcxfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiNjcxKD86Myg/OjAwfDNbMzldfDRbMzQ5XXw1NXw2WzI2XSl8NCg/OjAwfDU2fDdbMS05XXw4WzAyMzYtOV0pfDUoPzo1NXw2WzItNV18ODgpfDYoPzozWzItNTc4XXw0WzI0LTldfDVbMzRdfDc4fDhbMjM1LTldKXw3KD86WzA0NzldN3wyWzAxNjddfDNbNDVdfDhbNy05XSl8OCg/OlsyLTU3LTldOHw2WzQ4XSl8OSg/OjJbMjldfDZbNzldfDdbMTI3OV18OFs3LTldfDlbNzhdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjcxMzAwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY3MSg/OjMoPzowMHwzWzM5XXw0WzM0OV18NTV8NlsyNl0pfDQoPzowMHw1Nnw3WzEtOV18OFswMjM2LTldKXw1KD86NTV8NlsyLTVdfDg4KXw2KD86M1syLTU3OF18NFsyNC05XXw1WzM0XXw3OHw4WzIzNS05XSl8Nyg/OlswNDc5XTd8MlswMTY3XXwzWzQ1XXw4WzctOV0pfDgoPzpbMi01Ny05XTh8Nls0OF0pfDkoPzoyWzI5XXw2Wzc5XXw3WzEyNzldfDhbNy05XXw5Wzc4XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MTMwMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjEyMzQ1NlwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIkdVXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI2NzFcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLEpNOltudWxsLFtudWxsLG51bGwsXCIoPzpbNThdXFxcXGRcXFxcZHw2NTh8OTAwKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIoPzo2NThbMi05XVxcXFxkXFxcXGR8ODc2KD86NSg/OjBbMTJdfDFbMC00NjhdfDJbMzVdfDYzKXw2KD86MFsxLTM1NzldfDFbMDIzNy05XXxbMjNdXFxcXGR8NDB8NVswNl18NlsyLTU4OV18N1swNV18OFswNF18OVs0LTldKXw3KD86MFsyLTY4OV18WzEtNl1cXFxcZHw4WzA1Nl18OVs0NV0pfDkoPzowWzEtOF18MVswMjM3OF18WzItOF1cXFxcZHw5WzItNDY4XSkpKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NzY1MjMwMTIzXCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiODc2KD86KD86MlsxNC05XXxbMzQ4XVxcXFxkKVxcXFxkfDUoPzowWzMtOV18WzItNTctOV1cXFxcZHw2WzAtMjQtOV0pfDcoPzowWzA3XXw3XFxcXGR8OFsxLTQ3LTldfDlbMC0zNi05XSl8OSg/OlswMV05fDlbMDU3OV0pKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NzYyMTAxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJKTVwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjU4fDg3NlwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sS046W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiODY5KD86Mig/OjI5fDM2KXwzMDJ8NCg/OjZbMDE1LTldfDcwKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiODY5MjM2MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjg2OSg/OjUoPzo1WzYtOF18Nls1LTddKXw2NlxcXFxkfDc2WzAyLTddKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4Njk3NjUyOTE3XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJLTlwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiODY5XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxLWTpbbnVsbCxbbnVsbCxudWxsLFwiKD86MzQ1fFs1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiMzQ1KD86Mig/OjIyfDQ0KXw0NDR8Nig/OjIzfDM4fDQwKXw3KD86NFszNS03OV18Nls2LTldfDc3KXw4KD86MDB8MVs0NV18MjV8WzQ4XTgpfDkoPzoxNHw0WzAzNS05XSkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0NTIyMjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIzNDUoPzozMlsxLTldfDUoPzoxWzY3XXwyWzUtNzldfDRbNi05XXw1MHw3Nil8NjQ5fDkoPzoxWzY3XXwyWzItOV18M1s2ODldKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiMzQ1MzIzMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCIoPzozNDU5NzZ8OTAwWzItOV1cXFxcZFxcXFxkKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiS1lcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLFwiMzQ1ODQ5XFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0NTg0OTEyMzRcIl0sbnVsbCxcIjM0NVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sTEM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDc1OHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjc1OCg/OjQoPzozMHw1XFxcXGR8NlsyLTldfDhbMC0yXSl8NTdbMC0yXXw2MzgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjc1ODQzMDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3NTgoPzoyOFs0LTddfDM4NHw0KD86NlswMV18OFs0LTldKXw1KD86MVs4OV18MjB8ODQpfDcoPzoxWzItOV18MlxcXFxkfDNbMDFdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzU4Mjg0NTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiTENcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc1OFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sTVA6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfCg/OjY3fDkwKTApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY3MCg/OjIoPzozWzMtN118NTZ8OFs1LThdKXwzMlsxLTM4XXw0KD86MzN8OFszNDhdKXw1KD86MzJ8NTV8ODgpfDYoPzo2NHw3MHw4Mil8NzhbMzU4OV18OFszLTldOHw5ODkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY3MDIzNDU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI2NzAoPzoyKD86M1szLTddfDU2fDhbNS04XSl8MzJbMS0zOF18NCg/OjMzfDhbMzQ4XSl8NSg/OjMyfDU1fDg4KXw2KD86NjR8NzB8ODIpfDc4WzM1ODldfDhbMy05XTh8OTg5KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NzAyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJNUFwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjcwXCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxNUzpbbnVsbCxbbnVsbCxudWxsLFwiKD86KD86WzU4XVxcXFxkXFxcXGR8OTAwKVxcXFxkXFxcXGR8NjY0NDkpXFxcXGR7NX1cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY2NDQ5MVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NjQ0OTEyMzQ1XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNjY0NDlbMi02XVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NjQ0OTIzNDU2XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIxMjM0NTZcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJNU1wiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNjY0XCIsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dXSxQUjpbbnVsbCxbbnVsbCxudWxsLFwiKD86WzU4OV1cXFxcZFxcXFxkfDc4NylcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86Nzg3fDkzOSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI3ODcyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiKD86Nzg3fDkzOSlbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI3ODcyMzQ1Njc4XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sXCJQUlwiLDEsXCIwMTFcIixcIjFcIixudWxsLG51bGwsXCIxXCIsbnVsbCxudWxsLDEsbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxudWxsLFwiNzg3fDkzOVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sU1g6W251bGwsW251bGwsbnVsbCxcIig/Oig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHw3MjE1KVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCI3MjE1KD86NFsyLThdfDhbMjM5XXw5WzA1Nl0pXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjcyMTU0MjU2NzhcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI3MjE1KD86MVswMl18MlxcXFxkfDVbMDM0Njc5XXw4WzAxNC04XSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzIxNTIwNTY3OFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMTIzNDU2XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiU1hcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjcyMVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVEM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDY0OXw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjY0OSg/OjcxMnw5KD86NFxcXFxkfDUwKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNjQ5NzEyMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjY0OSg/OjIoPzozWzEyOV18NFsxLTddKXwzKD86M1sxLTM4OV18NFsxLThdKXw0WzM0XVsxLTNdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI2NDkyMzExMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiOCg/OjAwfDMzfDQ0fDU1fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjgwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxcIjkwMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjkwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFtudWxsLG51bGwsXCI1KD86MDB8MlsxMl18MzN8NDR8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiNTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiNjQ5NzFbMDFdXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjY0OTcxMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFwiVENcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjY0OVwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVFQ6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDkwMClcXFxcZHs3fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiODY4KD86Mig/OjAxfFsyM11cXFxcZCl8Nig/OjBbNy05XXwxWzAyLThdfDJbMS05XXxbMy02OV1cXFxcZHw3WzAtNzldKXw4MlsxMjRdKVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI4NjgyMjExMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiODY4KD86Mig/OjZbNi05XXxbNy05XVxcXFxkKXxbMzddKD86MFsxLTldfDFbMDItOV18WzItOV1cXFxcZCl8NFs2LTldXFxcXGR8Nig/OjIwfDc4fDhcXFxcZCkpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2ODI5MTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlRUXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCI4NjhcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLFwiODY4NjE5XFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjg2ODYxOTEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dXSxVUzpbbnVsbCxbbnVsbCxudWxsLFwiWzItOV1cXFxcZHs5fVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFsxMF0sWzddXSxbbnVsbCxudWxsLFwiKD86Mig/OjBbMS0zNS05XXwxWzAyLTldfDJbMDMtNTg5XXwzWzE0OV18NFswOF18NVsxLTQ2XXw2WzAyNzldfDdbMDI2OV18OFsxM10pfDMoPzowWzEtNTctOV18MVswMi05XXwyWzAxMzVdfDNbMC0yNDY3OV18NFs2N118NVsxMl18NlswMTRdfDhbMDU2XSl8NCg/OjBbMTI0LTldfDFbMDItNTc5XXwyWzMtNV18M1swMjQ1XXw0WzAyMzVdfDU4fDZbMzldfDdbMDU4OV18OFswNF0pfDUoPzowWzEtNTctOV18MVswMjM1LThdfDIwfDNbMDE0OV18NFswMV18NVsxOV18NlsxLTQ3XXw3WzAxMy01XXw4WzA1Nl0pfDYoPzowWzEtMzUtOV18MVswMjQtOV18MlswMzY4OV18WzM0XVswMTZdfDVbMDE3XXw2WzAtMjc5XXw3OHw4WzAtMl0pfDcoPzowWzEtNDYtOF18MVsyLTldfDJbMDQtN118M1sxMjQ3XXw0WzAzN118NVs0N118NlswMjM1OV18N1swMi01OV18OFsxNTZdKXw4KD86MFsxLTY4XXwxWzAyLThdfDJbMDhdfDNbMC0yOF18NFszNTc4XXw1WzA0Ni05XXw2WzAyLTVdfDdbMDI4XSl8OSg/OjBbMTM0Ni05XXwxWzAyLTldfDJbMDU4OV18M1swMTQ2LThdfDRbMDE3OV18NVsxMjQ2OV18N1swLTM4OV18OFswNC02OV0pKVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjIwMTU1NTAxMjNcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIoPzoyKD86MFsxLTM1LTldfDFbMDItOV18MlswMy01ODldfDNbMTQ5XXw0WzA4XXw1WzEtNDZdfDZbMDI3OV18N1swMjY5XXw4WzEzXSl8Myg/OjBbMS01Ny05XXwxWzAyLTldfDJbMDEzNV18M1swLTI0Njc5XXw0WzY3XXw1WzEyXXw2WzAxNF18OFswNTZdKXw0KD86MFsxMjQtOV18MVswMi01NzldfDJbMy01XXwzWzAyNDVdfDRbMDIzNV18NTh8NlszOV18N1swNTg5XXw4WzA0XSl8NSg/OjBbMS01Ny05XXwxWzAyMzUtOF18MjB8M1swMTQ5XXw0WzAxXXw1WzE5XXw2WzEtNDddfDdbMDEzLTVdfDhbMDU2XSl8Nig/OjBbMS0zNS05XXwxWzAyNC05XXwyWzAzNjg5XXxbMzRdWzAxNl18NVswMTddfDZbMC0yNzldfDc4fDhbMC0yXSl8Nyg/OjBbMS00Ni04XXwxWzItOV18MlswNC03XXwzWzEyNDddfDRbMDM3XXw1WzQ3XXw2WzAyMzU5XXw3WzAyLTU5XXw4WzE1Nl0pfDgoPzowWzEtNjhdfDFbMDItOF18MlswOF18M1swLTI4XXw0WzM1NzhdfDVbMDQ2LTldfDZbMDItNV18N1swMjhdKXw5KD86MFsxMzQ2LTldfDFbMDItOV18MlswNTg5XXwzWzAxNDYtOF18NFswMTc5XXw1WzEyNDY5XXw3WzAtMzg5XXw4WzA0LTY5XSkpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiMjAxNTU1MDEyM1wiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVVNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCwxLFtbbnVsbCxcIihcXFxcZHszfSkoXFxcXGR7NH0pXCIsXCIkMS0kMlwiLFtcIlsyLTldXCJdXSxbbnVsbCxcIihcXFxcZHszfSkoXFxcXGR7M30pKFxcXFxkezR9KVwiLFwiKCQxKSAkMi0kM1wiLFtcIlsyLTldXCJdLG51bGwsbnVsbCwxXV0sW1tudWxsLFwiKFxcXFxkezN9KShcXFxcZHszfSkoXFxcXGR7NH0pXCIsXCIkMS0kMi0kM1wiLFtcIlsyLTldXCJdXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLDEsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjcxMFsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjcxMDIxMjM0NTZcIl0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVkM6W251bGwsW251bGwsbnVsbCxcIig/Ols1OF1cXFxcZFxcXFxkfDc4NHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjc4NCg/OjI2NnwzKD86Nls2LTldfDdcXFxcZHw4WzAtMjQtNl0pfDQoPzozOHw1WzAtMzYtOF18OFswLThdKXw1KD86NTV8N1swLTJdfDkzKXw2Mzh8Nzg0KVxcXFxkezR9XCIsbnVsbCxudWxsLG51bGwsXCI3ODQyNjYxMjM0XCIsbnVsbCxudWxsLG51bGwsWzddXSxbbnVsbCxudWxsLFwiNzg0KD86NCg/OjNbMC01XXw1WzQ1XXw4OXw5WzAtOF0pfDUoPzoyWzYtOV18M1swLTRdKSlcXFxcZHs0fVwiLG51bGwsbnVsbCxudWxsLFwiNzg0NDMwMTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjgoPzowMHwzM3w0NHw1NXw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI4MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsXCI5MDBbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI5MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLFwiNSg/OjAwfDJbMTJdfDMzfDQ0fDY2fDc3fDg4KVsyLTldXFxcXGR7Nn1cIixudWxsLG51bGwsbnVsbCxcIjUwMDIzNDU2NzhcIl0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLFwiVkNcIiwxLFwiMDExXCIsXCIxXCIsbnVsbCxudWxsLFwiMVwiLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxcIjc4NFwiLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sbnVsbCxudWxsLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXV0sVkc6W251bGwsW251bGwsbnVsbCxcIig/OjI4NHxbNThdXFxcXGRcXFxcZHw5MDApXFxcXGR7N31cIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbMTBdLFs3XV0sW251bGwsbnVsbCxcIjI4NCg/Oig/OjIyOXw3NzR8OCg/OjUyfDZbNDU5XSkpXFxcXGR8NCg/OjIyXFxcXGR8OSg/Ols0NV1cXFxcZHw2WzAtNV0pKSlcXFxcZHszfVwiLG51bGwsbnVsbCxudWxsLFwiMjg0MjI5MTIzNFwiLG51bGwsbnVsbCxudWxsLFs3XV0sW251bGwsbnVsbCxcIjI4NCg/Oig/OjMoPzowWzAtM118NFswLTddfDY4fDlbMzRdKXw1NFswLTU3XSlcXFxcZHw0KD86KD86NFswLTZdfDY4KVxcXFxkfDkoPzo2WzYtOV18OVxcXFxkKSkpXFxcXGR7M31cIixudWxsLG51bGwsbnVsbCxcIjI4NDMwMDEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlZHXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIyODRcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dLFZJOltudWxsLFtudWxsLG51bGwsXCIoPzooPzozNHw5MCkwfFs1OF1cXFxcZFxcXFxkKVxcXFxkezd9XCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWzEwXSxbN11dLFtudWxsLG51bGwsXCIzNDAoPzoyKD86MDF8MlswNi04XXw0NHw3Nyl8Myg/OjMyfDQ0KXw0KD86MjJ8N1szNF0pfDUoPzoxWzM0XXw1NSl8Nig/OjI2fDRbMjNdfDc3fDlbMDIzXSl8Nyg/OjFbMi01Ny05XXwyN3w3XFxcXGQpfDg4NHw5OTgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0MDY0MjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCIzNDAoPzoyKD86MDF8MlswNi04XXw0NHw3Nyl8Myg/OjMyfDQ0KXw0KD86MjJ8N1szNF0pfDUoPzoxWzM0XXw1NSl8Nig/OjI2fDRbMjNdfDc3fDlbMDIzXSl8Nyg/OjFbMi01Ny05XXwyN3w3XFxcXGQpfDg4NHw5OTgpXFxcXGR7NH1cIixudWxsLG51bGwsbnVsbCxcIjM0MDY0MjEyMzRcIixudWxsLG51bGwsbnVsbCxbN11dLFtudWxsLG51bGwsXCI4KD86MDB8MzN8NDR8NTV8NjZ8Nzd8ODgpWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiODAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLFwiOTAwWzItOV1cXFxcZHs2fVwiLG51bGwsbnVsbCxudWxsLFwiOTAwMjM0NTY3OFwiXSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxcIjUoPzowMHwyWzEyXXwzM3w0NHw2Nnw3N3w4OClbMi05XVxcXFxkezZ9XCIsbnVsbCxudWxsLG51bGwsXCI1MDAyMzQ1Njc4XCJdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbLTFdXSxcIlZJXCIsMSxcIjAxMVwiLFwiMVwiLG51bGwsbnVsbCxcIjFcIixudWxsLG51bGwsMSxudWxsLG51bGwsW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsXCIzNDBcIixbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLFstMV1dLG51bGwsbnVsbCxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsWy0xXV1dfTt4LmI9ZnVuY3Rpb24oKXtyZXR1cm4geC5hP3guYTp4LmE9bmV3IHh9O3ZhciB1bD17MDpcIjBcIiwxOlwiMVwiLDI6XCIyXCIsMzpcIjNcIiw0OlwiNFwiLDU6XCI1XCIsNjpcIjZcIiw3OlwiN1wiLDg6XCI4XCIsOTpcIjlcIixcIu+8kFwiOlwiMFwiLFwi77yRXCI6XCIxXCIsXCLvvJJcIjpcIjJcIixcIu+8k1wiOlwiM1wiLFwi77yUXCI6XCI0XCIsXCLvvJVcIjpcIjVcIixcIu+8llwiOlwiNlwiLFwi77yXXCI6XCI3XCIsXCLvvJhcIjpcIjhcIixcIu+8mVwiOlwiOVwiLFwi2aBcIjpcIjBcIixcItmhXCI6XCIxXCIsXCLZolwiOlwiMlwiLFwi2aNcIjpcIjNcIixcItmkXCI6XCI0XCIsXCLZpVwiOlwiNVwiLFwi2aZcIjpcIjZcIixcItmnXCI6XCI3XCIsXCLZqFwiOlwiOFwiLFwi2alcIjpcIjlcIixcItuwXCI6XCIwXCIsXCLbsVwiOlwiMVwiLFwi27JcIjpcIjJcIixcItuzXCI6XCIzXCIsXCLbtFwiOlwiNFwiLFwi27VcIjpcIjVcIixcItu2XCI6XCI2XCIsXCLbt1wiOlwiN1wiLFwi27hcIjpcIjhcIixcItu5XCI6XCI5XCJ9LHRsPVJlZ0V4cChcIlsr77yLXStcIiksZWw9UmVnRXhwKFwiKFswLTnvvJAt77yZ2aAt2anbsC3buV0pXCIpLHJsPS9eXFwoP1xcJDFcXCk/JC8saWw9bmV3IFM7bShpbCwxMSxcIk5BXCIpO3ZhciBhbD0vXFxbKFteXFxbXFxdXSkqXFxdL2csZGw9L1xcZCg/PVteLH1dW14sfV0pL2csb2w9UmVnRXhwKFwiXlsteOKAkC3igJXiiJLjg7zvvI0t77yPIMKgwq3igIvigaDjgIAoKe+8iO+8ie+8u++8vS5cXFxcW1xcXFxdL37igZPiiLzvvZ5dKihcXFxcJFxcXFxkWy144oCQLeKAleKIkuODvO+8jS3vvI8gwqDCreKAi+KBoOOAgCgp77yI77yJ77y777y9LlxcXFxbXFxcXF0vfuKBk+KIvO+9nl0qKSskXCIpLHNsPS9bLSBdLztOLnByb3RvdHlwZS5LPWZ1bmN0aW9uKCl7dGhpcy5DPVwiXCIsdCh0aGlzLmkpLHQodGhpcy51KSx0KHRoaXMubSksdGhpcy5zPTAsdGhpcy53PVwiXCIsdCh0aGlzLmIpLHRoaXMuaD1cIlwiLHQodGhpcy5hKSx0aGlzLmw9ITAsdGhpcy5BPXRoaXMubz10aGlzLkY9ITEsdGhpcy5mPVtdLHRoaXMuQj0hMSx0aGlzLmchPXRoaXMuSiYmKHRoaXMuZz1EKHRoaXMsdGhpcy5EKSl9LE4ucHJvdG90eXBlLkw9ZnVuY3Rpb24obCl7cmV0dXJuIHRoaXMuQz1JKHRoaXMsbCl9LGwoXCJDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyXCIsTiksbChcIkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIucHJvdG90eXBlLmlucHV0RGlnaXRcIixOLnByb3RvdHlwZS5MKSxsKFwiQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlci5wcm90b3R5cGUuY2xlYXJcIixOLnByb3RvdHlwZS5LKX0uY2FsbChcIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsJiZnbG9iYWw/Z2xvYmFsOndpbmRvdyk7IiwidmFyIGU9L14oPzpzdWJtaXR8YnV0dG9ufGltYWdlfHJlc2V0fGZpbGUpJC9pLHQ9L14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8a2V5Z2VuKS9pLG49LyhcXFtbXlxcW1xcXV0qXFxdKS9nO2Z1bmN0aW9uIGEoZSx0LGEpe2lmKHQubWF0Y2gobikpIWZ1bmN0aW9uIGUodCxuLGEpe2lmKDA9PT1uLmxlbmd0aClyZXR1cm4gYTt2YXIgcj1uLnNoaWZ0KCksaT1yLm1hdGNoKC9eXFxbKC4rPylcXF0kLyk7aWYoXCJbXVwiPT09cilyZXR1cm4gdD10fHxbXSxBcnJheS5pc0FycmF5KHQpP3QucHVzaChlKG51bGwsbixhKSk6KHQuX3ZhbHVlcz10Ll92YWx1ZXN8fFtdLHQuX3ZhbHVlcy5wdXNoKGUobnVsbCxuLGEpKSksdDtpZihpKXt2YXIgbD1pWzFdLHU9K2w7aXNOYU4odSk/KHQ9dHx8e30pW2xdPWUodFtsXSxuLGEpOih0PXR8fFtdKVt1XT1lKHRbdV0sbixhKX1lbHNlIHRbcl09ZSh0W3JdLG4sYSk7cmV0dXJuIHR9KGUsZnVuY3Rpb24oZSl7dmFyIHQ9W10sYT1uZXcgUmVnRXhwKG4pLHI9L14oW15cXFtcXF1dKikvLmV4ZWMoZSk7Zm9yKHJbMV0mJnQucHVzaChyWzFdKTtudWxsIT09KHI9YS5leGVjKGUpKTspdC5wdXNoKHJbMV0pO3JldHVybiB0fSh0KSxhKTtlbHNle3ZhciByPWVbdF07cj8oQXJyYXkuaXNBcnJheShyKXx8KGVbdF09W3JdKSxlW3RdLnB1c2goYSkpOmVbdF09YX1yZXR1cm4gZX1mdW5jdGlvbiByKGUsdCxuKXtyZXR1cm4gbj0obj1TdHJpbmcobikpLnJlcGxhY2UoLyhcXHIpP1xcbi9nLFwiXFxyXFxuXCIpLG49KG49ZW5jb2RlVVJJQ29tcG9uZW50KG4pKS5yZXBsYWNlKC8lMjAvZyxcIitcIiksZSsoZT9cIiZcIjpcIlwiKStlbmNvZGVVUklDb21wb25lbnQodCkrXCI9XCIrbn1leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuLGkpe1wib2JqZWN0XCIhPXR5cGVvZiBpP2k9e2hhc2g6ISFpfTp2b2lkIDA9PT1pLmhhc2gmJihpLmhhc2g9ITApO2Zvcih2YXIgbD1pLmhhc2g/e306XCJcIix1PWkuc2VyaWFsaXplcnx8KGkuaGFzaD9hOnIpLHM9biYmbi5lbGVtZW50cz9uLmVsZW1lbnRzOltdLGM9T2JqZWN0LmNyZWF0ZShudWxsKSxvPTA7bzxzLmxlbmd0aDsrK28pe3ZhciBoPXNbb107aWYoKGkuZGlzYWJsZWR8fCFoLmRpc2FibGVkKSYmaC5uYW1lJiZ0LnRlc3QoaC5ub2RlTmFtZSkmJiFlLnRlc3QoaC50eXBlKSl7dmFyIHA9aC5uYW1lLGY9aC52YWx1ZTtpZihcImNoZWNrYm94XCIhPT1oLnR5cGUmJlwicmFkaW9cIiE9PWgudHlwZXx8aC5jaGVja2VkfHwoZj12b2lkIDApLGkuZW1wdHkpe2lmKFwiY2hlY2tib3hcIiE9PWgudHlwZXx8aC5jaGVja2VkfHwoZj0hMSksXCJyYWRpb1wiPT09aC50eXBlJiYoY1toLm5hbWVdfHxoLmNoZWNrZWQ/aC5jaGVja2VkJiYoY1toLm5hbWVdPSEwKTpjW2gubmFtZV09ITEpLG51bGw9PWYmJlwicmFkaW9cIj09aC50eXBlKWNvbnRpbnVlfWVsc2UgaWYoIWYpY29udGludWU7aWYoXCJzZWxlY3QtbXVsdGlwbGVcIiE9PWgudHlwZSlsPXUobCxwLGYpO2Vsc2V7Zj1bXTtmb3IodmFyIHY9aC5vcHRpb25zLG09ITEsZD0wO2Q8di5sZW5ndGg7KytkKXt2YXIgeT12W2RdO3kuc2VsZWN0ZWQmJih5LnZhbHVlfHxpLmVtcHR5JiYheS52YWx1ZSkmJihtPSEwLGw9aS5oYXNoJiZcIltdXCIhPT1wLnNsaWNlKHAubGVuZ3RoLTIpP3UobCxwK1wiW11cIix5LnZhbHVlKTp1KGwscCx5LnZhbHVlKSl9IW0mJmkuZW1wdHkmJihsPXUobCxwLFwiXCIpKX19fWlmKGkuZW1wdHkpZm9yKHZhciBwIGluIGMpY1twXXx8KGw9dShsLHAsXCJcIikpO3JldHVybiBsfVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8vIElucHV0IG1hc2tpbmdcbmltcG9ydCBDbGVhdmUgZnJvbSAnY2xlYXZlLmpzJztcbmltcG9ydCAnY2xlYXZlLmpzL2Rpc3QvYWRkb25zL2NsZWF2ZS1waG9uZS51cyc7XG5cbmltcG9ydCBzZXJpYWxpemUgZnJvbSAnZm9yLWNlcmlhbCc7XG5cbi8qKlxuICogVGhpcyBjb21wb25lbnQgaGFuZGxlcyB2YWxpZGF0aW9uIGFuZCBzdWJtaXNzaW9uIGZvciBzaGFyZSBieSBlbWFpbCBhbmRcbiAqIHNoYXJlIGJ5IFNNUyBmb3Jtcy5cbiAqIEBjbGFzc1xuICovXG5jbGFzcyBTaGFyZUZvcm0ge1xuICAvKipcbiAgICogQ2xhc3MgQ29uc3RydWN0b3JcbiAgICogQHBhcmFtICAge09iamVjdH0gIGVsICBUaGUgRE9NIFNoYXJlIEZvcm0gRWxlbWVudFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogU2V0dGluZyBjbGFzcyB2YXJpYWJsZXMgdG8gb3VyIGNvbnN0YW50c1xuICAgICAqL1xuICAgIHRoaXMuc2VsZWN0b3IgPSBTaGFyZUZvcm0uc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IFNoYXJlRm9ybS5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBTaGFyZUZvcm0uY2xhc3NlcztcblxuICAgIHRoaXMuc3RyaW5ncyA9IFNoYXJlRm9ybS5zdHJpbmdzO1xuXG4gICAgdGhpcy5wYXR0ZXJucyA9IFNoYXJlRm9ybS5wYXR0ZXJucztcblxuICAgIHRoaXMuc2VudCA9IFNoYXJlRm9ybS5zZW50O1xuXG4gICAgLyoqXG4gICAgICogU2V0IHVwIG1hc2tpbmcgZm9yIHBob25lIG51bWJlcnMgKGlmIHRoaXMgaXMgYSB0ZXh0aW5nIG1vZHVsZSlcbiAgICAgKi9cbiAgICB0aGlzLnBob25lID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuUEhPTkUpO1xuXG4gICAgaWYgKHRoaXMucGhvbmUpIHtcbiAgICAgIHRoaXMuY2xlYXZlID0gbmV3IENsZWF2ZSh0aGlzLnBob25lLCB7XG4gICAgICAgIHBob25lOiB0cnVlLFxuICAgICAgICBwaG9uZVJlZ2lvbkNvZGU6ICd1cycsXG4gICAgICAgIGRlbGltaXRlcjogJy0nXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5waG9uZS5zZXRBdHRyaWJ1dGUoJ3BhdHRlcm4nLCB0aGlzLnBhdHRlcm5zLlBIT05FKTtcblxuICAgICAgdGhpcy50eXBlID0gJ3RleHQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnR5cGUgPSAnZW1haWwnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSB0aGUgdmFsaWRhdGlvbiBmb3IgdGhlIGZvcm0gdXNpbmcgdGhlIGZvcm0gdXRpbGl0eVxuICAgICAqL1xuICAgIHRoaXMuZm9ybSA9IG5ldyBGb3Jtcyh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5GT1JNKSk7XG5cbiAgICB0aGlzLmZvcm0uc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIHRoaXMuZm9ybS5zZWxlY3RvcnMgPSB7XG4gICAgICAnUkVRVUlSRUQnOiB0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCxcbiAgICAgICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IHRoaXMuc2VsZWN0b3JzLkZPUk1cbiAgICB9O1xuXG4gICAgdGhpcy5mb3JtLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy5mb3JtLnZhbGlkKGV2ZW50KSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgdGhpcy5zYW5pdGl6ZSgpXG4gICAgICAgIC5wcm9jZXNzaW5nKClcbiAgICAgICAgLnN1Ym1pdChldmVudClcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgdGhpcy5yZXNwb25zZShyZXNwb25zZSk7XG4gICAgICAgIH0pLmNhdGNoKGRhdGEgPT4ge1xuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgICAgY29uc29sZS5kaXIoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSW5zdGF0aWF0ZSB0aGUgU2hhcmVGb3JtJ3MgdG9nZ2xlIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHRoaXMudG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5UT0dHTEUpLFxuICAgICAgYWZ0ZXI6ICgpID0+IHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuSU5QVVQpLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgYW5kIGNsZWFuIGFueSBkYXRhIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgc2FuaXRpemUoKSB7XG4gICAgLy8gU2VyaWFsaXplIHRoZSBkYXRhXG4gICAgdGhpcy5fZGF0YSA9IHNlcmlhbGl6ZSh0aGlzLmZvcm0uRk9STSwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFNhbml0aXplIHRoZSBwaG9uZSBudW1iZXIgKGlmIHRoZXJlIGlzIGEgcGhvbmUgbnVtYmVyKVxuICAgIGlmICh0aGlzLnBob25lICYmIHRoaXMuX2RhdGEudG8pXG4gICAgICB0aGlzLl9kYXRhLnRvID0gdGhpcy5fZGF0YS50by5yZXBsYWNlKC9bLV0vZywgJycpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3dpdGNoIHRoZSBmb3JtIHRvIHRoZSBwcm9jZXNzaW5nIHN0YXRlXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBwcm9jZXNzaW5nKCkge1xuICAgIC8vIERpc2FibGUgdGhlIGZvcm1cbiAgICBsZXQgaW5wdXRzID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5JTlBVVFMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspXG4gICAgICBpbnB1dHNbaV0uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xuXG4gICAgbGV0IGJ1dHRvbiA9IHRoaXMuZm9ybS5GT1JNLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuU1VCTUlUKTtcblxuICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cbiAgICAvLyBTaG93IHByb2Nlc3Npbmcgc3RhdGVcbiAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5QUk9DRVNTSU5HKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBPU1RzIHRoZSBzZXJpYWxpemVkIGZvcm0gZGF0YSB1c2luZyB0aGUgRmV0Y2ggTWV0aG9kXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IEZldGNoIHByb21pc2VcbiAgICovXG4gIHN1Ym1pdCgpIHtcbiAgICAvLyBUbyBzZW5kIHRoZSBkYXRhIHdpdGggdGhlIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCBoZWFkZXJcbiAgICAvLyB3ZSBuZWVkIHRvIHVzZSBVUkxTZWFyY2hQYXJhbXMoKTsgaW5zdGVhZCBvZiBGb3JtRGF0YSgpOyB3aGljaCB1c2VzXG4gICAgLy8gbXVsdGlwYXJ0L2Zvcm0tZGF0YVxuICAgIGxldCBmb3JtRGF0YSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpLm1hcChrID0+IHtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChrLCB0aGlzLl9kYXRhW2tdKTtcbiAgICB9KTtcblxuICAgIGxldCBodG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xuXG4gICAgaWYgKGh0bWwuaGFzQXR0cmlidXRlKCdsYW5nJykpIHtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgnbGFuZycsIGh0bWwuZ2V0QXR0cmlidXRlKCdsYW5nJykpO1xuICAgIH1cblxuICAgIHJldHVybiBmZXRjaCh0aGlzLmZvcm0uRk9STS5nZXRBdHRyaWJ1dGUoJ2FjdGlvbicpLCB7XG4gICAgICBtZXRob2Q6IHRoaXMuZm9ybS5GT1JNLmdldEF0dHJpYnV0ZSgnbWV0aG9kJyksXG4gICAgICBib2R5OiBmb3JtRGF0YVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSByZXNwb25zZSBoYW5kbGVyXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBkYXRhICBEYXRhIGZyb20gdGhlIHJlcXVlc3RcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIHJlc3BvbnNlKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICB0aGlzLnN1Y2Nlc3MoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRhdGEuZXJyb3IgPT09IDIxMjExKSB7XG4gICAgICAgIHRoaXMuZmVlZGJhY2soJ1NFUlZFUl9URUxfSU5WQUxJRCcpLmVuYWJsZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5mZWVkYmFjaygnU0VSVkVSJykuZW5hYmxlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcihkYXRhKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXVlcyB0aGUgc3VjY2VzcyBtZXNzYWdlIGFuZCBhZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHJlc2V0IHRoZSBmb3JtXG4gICAqIHRvIGl0J3MgZGVmYXVsdCBzdGF0ZS5cbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIHN1Y2Nlc3MoKSB7XG4gICAgdGhpcy5mb3JtLkZPUk0uY2xhc3NMaXN0XG4gICAgICAucmVwbGFjZSh0aGlzLmNsYXNzZXMuUFJPQ0VTU0lORywgdGhpcy5jbGFzc2VzLlNVQ0NFU1MpO1xuXG4gICAgdGhpcy5lbmFibGUoKTtcblxuICAgIHRoaXMuZm9ybS5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgdGhpcy5mb3JtLkZPUk0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuU1VDQ0VTUyk7XG4gICAgfSk7XG5cbiAgICAvLyBTdWNjZXNzZnVsIG1lc3NhZ2VzIGhvb2sgKGZuIHByb3ZpZGVkIHRvIHRoZSBjbGFzcyB1cG9uIGluc3RhdGlhdGlvbilcbiAgICBpZiAodGhpcy5zZW50KSB0aGlzLnNlbnQodGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWV1ZXMgdGhlIHNlcnZlciBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICByZXNwb25zZSAgVGhlIGVycm9yIHJlc3BvbnNlIGZyb20gdGhlIHJlcXVlc3RcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIGNsYXNzXG4gICAqL1xuICBlcnJvcihyZXNwb25zZSkge1xuICAgIHRoaXMuZmVlZGJhY2soJ1NFUlZFUicpLmVuYWJsZSgpO1xuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcihyZXNwb25zZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZGl2IGNvbnRhaW5pbmcgdGhlIGZlZWRiYWNrIG1lc3NhZ2UgdG8gdGhlIHVzZXIgYW5kIHRvZ2dsZXMgdGhlXG4gICAqIGNsYXNzIG9mIHRoZSBmb3JtXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBLRVkgIFRoZSBrZXkgb2YgbWVzc2FnZSBwYWlyZWQgaW4gbWVzc2FnZXMgYW5kIGNsYXNzZXNcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgVGhlIGluc3RhbnRpYXRlZCBjbGFzc1xuICAgKi9cbiAgZmVlZGJhY2soS0VZKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZVxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBTZXQgdGhlIGZlZWRiYWNrIGNsYXNzIGFuZCBpbnNlcnQgdGV4dFxuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZChgJHt0aGlzLmNsYXNzZXNbS0VZXX0ke3RoaXMuY2xhc3Nlcy5NRVNTQUdFfWApO1xuICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW0tFWV07XG5cbiAgICAvLyBBZGQgbWVzc2FnZSB0byB0aGUgZm9ybSBhbmQgYWRkIGZlZWRiYWNrIGNsYXNzXG4gICAgdGhpcy5mb3JtLkZPUk0uaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIHRoaXMuZm9ybS5GT1JNLmNoaWxkTm9kZXNbMF0pO1xuICAgIHRoaXMuZm9ybS5GT1JNLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzW0tFWV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlcyB0aGUgU2hhcmVGb3JtIChhZnRlciBzdWJtaXR0aW5nIGEgcmVxdWVzdClcbiAgICogQHJldHVybiAge09iamVjdH0gIFRoZSBpbnN0YW50aWF0ZWQgY2xhc3NcbiAgICovXG4gIGVuYWJsZSgpIHtcbiAgICAvLyBFbmFibGUgdGhlIGZvcm1cbiAgICBsZXQgaW5wdXRzID0gdGhpcy5mb3JtLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5JTlBVVFMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspXG4gICAgICBpbnB1dHNbaV0ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gICAgbGV0IGJ1dHRvbiA9IHRoaXMuZm9ybS5GT1JNLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuU1VCTUlUKTtcblxuICAgIGJ1dHRvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHByb2Nlc3NpbmcgY2xhc3NcbiAgICB0aGlzLmZvcm0uRk9STS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5QUk9DRVNTSU5HKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBUaGUgbWFpbiBjb21wb25lbnQgc2VsZWN0b3IgKi9cblNoYXJlRm9ybS5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInNoYXJlLWZvcm1cIl0nO1xuXG4vKiogU2VsZWN0b3JzIHdpdGhpbiB0aGUgY29tcG9uZW50ICovXG5TaGFyZUZvcm0uc2VsZWN0b3JzID0ge1xuICBGT1JNOiAnZm9ybScsXG4gIElOUFVUUzogJ2lucHV0JyxcbiAgUEhPTkU6ICdpbnB1dFt0eXBlPVwidGVsXCJdJyxcbiAgU1VCTUlUOiAnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nLFxuICBSRVFVSVJFRDogJ1tyZXF1aXJlZD1cInRydWVcIl0nLFxuICBUT0dHTEU6ICdbZGF0YS1qcyo9XCJzaGFyZS1mb3JtX19jb250cm9sXCJdJyxcbiAgSU5QVVQ6ICdbZGF0YS1qcyo9XCJzaGFyZS1mb3JtX19pbnB1dFwiXSdcbn07XG5cbi8qKlxuICogQ1NTIGNsYXNzZXMgdXNlZCBieSB0aGlzIGNvbXBvbmVudC5cbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cblNoYXJlRm9ybS5jbGFzc2VzID0ge1xuICBFUlJPUjogJ2Vycm9yJyxcbiAgU0VSVkVSOiAnZXJyb3InLFxuICBTRVJWRVJfVEVMX0lOVkFMSUQ6ICdlcnJvcicsXG4gIE1FU1NBR0U6ICctbWVzc2FnZScsXG4gIFBST0NFU1NJTkc6ICdwcm9jZXNzaW5nJyxcbiAgU1VDQ0VTUzogJ3N1Y2Nlc3MnXG59O1xuXG4vKipcbiAqIFN0cmluZ3MgdXNlZCBmb3IgdmFsaWRhdGlvbiBmZWVkYmFja1xuICovXG5TaGFyZUZvcm0uc3RyaW5ncyA9IHtcbiAgU0VSVkVSOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuJyxcbiAgU0VSVkVSX1RFTF9JTlZBTElEOiAnVW5hYmxlIHRvIHNlbmQgdG8gbnVtYmVyIHByb3ZpZGVkLiBQbGVhc2UgdXNlIGFub3RoZXIgbnVtYmVyLicsXG4gIFZBTElEX1JFUVVJUkVEOiAnVGhpcyBpcyByZXF1aXJlZCcsXG4gIFZBTElEX0VNQUlMX0lOVkFMSUQ6ICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbC4nLFxuICBWQUxJRF9URUxfSU5WQUxJRDogJ1BsZWFzZSBwcm92aWRlIDEwLWRpZ2l0IG51bWJlciB3aXRoIGFyZWEgY29kZS4nXG59O1xuXG4vKipcbiAqIElucHV0IHBhdHRlcm5zIGZvciBmb3JtIGlucHV0IGVsZW1lbnRzXG4gKi9cblNoYXJlRm9ybS5wYXR0ZXJucyA9IHtcbiAgUEhPTkU6ICdbMC05XXszfS1bMC05XXszfS1bMC05XXs0fSdcbn07XG5cblNoYXJlRm9ybS5zZW50ID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IFNoYXJlRm9ybTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVXNlcyB0aGUgU2hhcmUgQVBJIHRvIHRcbiAqL1xuY2xhc3MgV2ViU2hhcmUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gV2ViU2hhcmUuc2VsZWN0b3I7XG5cbiAgICB0aGlzLmNhbGxiYWNrID0gV2ViU2hhcmUuY2FsbGJhY2s7XG5cbiAgICBpZiAobmF2aWdhdG9yLnNoYXJlKSB7XG4gICAgICAvLyBSZW1vdmUgZmFsbGJhY2sgYXJpYSB0b2dnbGluZyBhdHRyaWJ1dGVzXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3IpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGl0ZW0ucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyk7XG4gICAgICAgIGl0ZW0ucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc2hhcmUgY2xpY2tcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNlbGVjdG9yKSlcbiAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAgIHRoaXMuZGF0YSA9IEpTT04ucGFyc2UodGhpcy5lbGVtZW50LmRhdGFzZXQud2ViU2hhcmUpO1xuXG4gICAgICAgIHRoaXMuc2hhcmUodGhpcy5kYXRhKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDb252ZXJ0IGNvbXBvbmVudCBpbnRvIGEgdG9nZ2xlIGZvciB0aGUgZmFsbGJhY2tcbiAgICAgIHRoaXMudG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICAgIHNlbGVjdG9yOiB0aGlzLnNlbGVjdG9yXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXZWIgU2hhcmUgQVBJIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGRhdGEgIEFuIG9iamVjdCBjb250YWluaW5nIHRpdGxlLCB1cmwsIGFuZCB0ZXh0LlxuICAgKlxuICAgKiBAcmV0dXJuICB7UHJvbWlzZX0gICAgICAgVGhlIHJlc3BvbnNlIG9mIHRoZSAuc2hhcmUoKSBtZXRob2QuXG4gICAqL1xuICBzaGFyZShkYXRhID0ge30pIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLnNoYXJlKGRhdGEpXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICBXZWJTaGFyZS5jYWxsYmFjayhkYXRhKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgY29uc29sZS5kaXIoZXJyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqIFRoZSBodG1sIHNlbGVjdG9yIGZvciB0aGUgY29tcG9uZW50ICovXG5XZWJTaGFyZS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ3ZWItc2hhcmVcIl0nO1xuXG4vKiogUGxhY2Vob2xkZXIgY2FsbGJhY2sgZm9yIGEgc3VjY2Vzc2Z1bCBzZW5kICovXG5XZWJTaGFyZS5jYWxsYmFjayA9ICgpID0+IHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBjb25zb2xlLmRpcignU3VjY2VzcyEnKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgV2ViU2hhcmU7XG4iLCIvKiEganMtY29va2llIHYzLjAuMC1iZXRhLjAgfCBNSVQgKi9cbmZ1bmN0aW9uIGV4dGVuZCAoKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgcmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gZGVjb2RlIChzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UoLyglW1xcZEEtRl17Mn0pKy9naSwgZGVjb2RlVVJJQ29tcG9uZW50KVxufVxuXG5mdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcbiAgZnVuY3Rpb24gc2V0IChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGF0dHJpYnV0ZXMgPSBleHRlbmQoYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuICAgIGlmICh0eXBlb2YgYXR0cmlidXRlcy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuICAgICAgYXR0cmlidXRlcy5leHBpcmVzID0gbmV3IERhdGUobmV3IERhdGUoKSAqIDEgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlNSk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGVzLmV4cGlyZXMpIHtcbiAgICAgIGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpO1xuICAgIH1cblxuICAgIHZhbHVlID0gY29udmVydGVyLndyaXRlXG4gICAgICA/IGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KVxuICAgICAgOiBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSkucmVwbGFjZShcbiAgICAgICAgLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csXG4gICAgICAgIGRlY29kZVVSSUNvbXBvbmVudFxuICAgICAgKTtcblxuICAgIGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSlcbiAgICAgIC5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpXG4gICAgICAucmVwbGFjZSgvWygpXS9nLCBlc2NhcGUpO1xuXG4gICAgdmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuICAgIGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgaWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJzsgJyArIGF0dHJpYnV0ZU5hbWU7XG4gICAgICBpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyBDb25zaWRlcnMgUkZDIDYyNjUgc2VjdGlvbiA1LjI6XG4gICAgICAvLyAuLi5cbiAgICAgIC8vIDMuICBJZiB0aGUgcmVtYWluaW5nIHVucGFyc2VkLWF0dHJpYnV0ZXMgY29udGFpbnMgYSAleDNCIChcIjtcIilcbiAgICAgIC8vICAgICBjaGFyYWN0ZXI6XG4gICAgICAvLyBDb25zdW1lIHRoZSBjaGFyYWN0ZXJzIG9mIHRoZSB1bnBhcnNlZC1hdHRyaWJ1dGVzIHVwIHRvLFxuICAgICAgLy8gbm90IGluY2x1ZGluZywgdGhlIGZpcnN0ICV4M0IgKFwiO1wiKSBjaGFyYWN0ZXIuXG4gICAgICAvLyAuLi5cbiAgICAgIHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnPScgKyBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdLnNwbGl0KCc7JylbMF07XG4gICAgfVxuXG4gICAgcmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBrZXkgKyAnPScgKyB2YWx1ZSArIHN0cmluZ2lmaWVkQXR0cmlidXRlcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldCAoa2V5KSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgfHwgKGFyZ3VtZW50cy5sZW5ndGggJiYgIWtleSkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcbiAgICAvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC5cbiAgICB2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuICAgIHZhciBqYXIgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgIHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cbiAgICAgIGlmIChjb29raWUuY2hhckF0KDApID09PSAnXCInKSB7XG4gICAgICAgIGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBuYW1lID0gZGVjb2RlKHBhcnRzWzBdKTtcbiAgICAgICAgamFyW25hbWVdID1cbiAgICAgICAgICAoY29udmVydGVyLnJlYWQgfHwgY29udmVydGVyKShjb29raWUsIG5hbWUpIHx8IGRlY29kZShjb29raWUpO1xuXG4gICAgICAgIGlmIChrZXkgPT09IG5hbWUpIHtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cblxuICAgIHJldHVybiBrZXkgPyBqYXJba2V5XSA6IGphclxuICB9XG5cbiAgdmFyIGFwaSA9IHtcbiAgICBkZWZhdWx0czoge1xuICAgICAgcGF0aDogJy8nXG4gICAgfSxcbiAgICBzZXQ6IHNldCxcbiAgICBnZXQ6IGdldCxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcbiAgICAgIHNldChcbiAgICAgICAga2V5LFxuICAgICAgICAnJyxcbiAgICAgICAgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICBleHBpcmVzOiAtMVxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9LFxuICAgIHdpdGhDb252ZXJ0ZXI6IGluaXRcbiAgfTtcblxuICByZXR1cm4gYXBpXG59XG5cbnZhciBqc19jb29raWUgPSBpbml0KGZ1bmN0aW9uICgpIHt9KTtcblxuZXhwb3J0IGRlZmF1bHQganNfY29va2llO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQ29va2llcyBmcm9tICdqcy1jb29raWUvZGlzdC9qcy5jb29raWUubWpzJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIEFsZXJ0IEJhbm5lciBtb2R1bGVcbiAqL1xuY2xhc3MgQWxlcnRCYW5uZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7T2JqZWN0fSBBbGVydEJhbm5lclxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBBbGVydEJhbm5lci5zZWxlY3RvcjtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gQWxlcnRCYW5uZXIuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5kYXRhID0gQWxlcnRCYW5uZXIuZGF0YTtcblxuICAgIHRoaXMuZXhwaXJlcyA9IEFsZXJ0QmFubmVyLmV4cGlyZXM7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5uYW1lID0gZWxlbWVudC5kYXRhc2V0W3RoaXMuZGF0YS5OQU1FXTtcblxuICAgIHRoaXMuYnV0dG9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLkJVVFRPTik7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IFRvZ2dsZSBmb3IgdGhpcyBhbGVydFxuICAgICAqL1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IHRoaXMuc2VsZWN0b3JzLkJVVFRPTixcbiAgICAgIGFmdGVyOiAoKSA9PiB7XG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhUb2dnbGUuaW5hY3RpdmVDbGFzcykpXG4gICAgICAgICAgQ29va2llcy5zZXQodGhpcy5uYW1lLCAnZGlzbWlzc2VkJywge2V4cGlyZXM6IHRoaXMuZXhwaXJlc30pO1xuICAgICAgICBlbHNlIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhUb2dnbGUuYWN0aXZlQ2xhc3MpKVxuICAgICAgICAgIENvb2tpZXMucmVtb3ZlKHRoaXMubmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgY29va2llIGlzIHByZXNlbnQgYW5kIHRoZSBBbGVydCBpcyBhY3RpdmUsIGhpZGUgaXQuXG4gICAgaWYgKENvb2tpZXMuZ2V0KHRoaXMubmFtZSkgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoVG9nZ2xlLmFjdGl2ZUNsYXNzKSlcbiAgICAgIHRoaXMuX3RvZ2dsZS5lbGVtZW50VG9nZ2xlKHRoaXMuYnV0dG9uLCBlbGVtZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0byB0b2dnbGUgdGhlIGFsZXJ0IGJhbm5lclxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEluc3RhbmNlIG9mIEFsZXJ0QmFubmVyXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgdGhpcy5fdG9nZ2xlLmVsZW1lbnRUb2dnbGUodGhpcy5idXR0b24sIHRoaXMuZWxlbWVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogTWFpbiBzZWxlY3RvciBmb3IgdGhlIEFsZXJ0IEJhbm5lciBFbGVtZW50ICovXG5BbGVydEJhbm5lci5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJhbGVydC1iYW5uZXJcIl0nO1xuXG4vKiogT3RoZXIgaW50ZXJuYWwgc2VsZWN0b3JzICovXG5BbGVydEJhbm5lci5zZWxlY3RvcnMgPSB7XG4gICdCVVRUT04nOiAnW2RhdGEtanMqPVwiYWxlcnQtY29udHJvbGxlclwiXSdcbn07XG5cbi8qKiBEYXRhIGF0dHJpYnV0ZXMgc2V0IHRvIHRoZSBwYXR0ZXJuICovXG5BbGVydEJhbm5lci5kYXRhID0ge1xuICAnTkFNRSc6ICdhbGVydE5hbWUnXG59O1xuXG4vKiogRXhwaXJhdGlvbiBmb3IgdGhlIGNvb2tpZS4gKi9cbkFsZXJ0QmFubmVyLmV4cGlyZXMgPSAzNjA7XG5cbmV4cG9ydCBkZWZhdWx0IEFsZXJ0QmFubmVyOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcyc7XG5cbmltcG9ydCBzZXJpYWxpemUgZnJvbSAnZm9yLWNlcmlhbCc7XG5cbi8qKlxuICogVGhlIE5ld3NsZXR0ZXIgbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTmV3c2xldHRlciB7XG4gIC8qKlxuICAgKiBUaGUgY2xhc3MgY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBlbGVtZW50IFRoZSBOZXdzbGV0dGVyIERPTSBPYmplY3RcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgTmV3c2xldHRlciBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLl9lbCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLmtleXMgPSBOZXdzbGV0dGVyLmtleXM7XG5cbiAgICB0aGlzLmVuZHBvaW50cyA9IE5ld3NsZXR0ZXIuZW5kcG9pbnRzO1xuXG4gICAgdGhpcy5jYWxsYmFjayA9IE5ld3NsZXR0ZXIuY2FsbGJhY2s7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3I7XG5cbiAgICB0aGlzLnN0cmluZ0tleXMgPSBOZXdzbGV0dGVyLnN0cmluZ0tleXM7XG5cbiAgICB0aGlzLnN0cmluZ3MgPSBOZXdzbGV0dGVyLnN0cmluZ3M7XG5cbiAgICB0aGlzLnRlbXBsYXRlcyA9IE5ld3NsZXR0ZXIudGVtcGxhdGVzO1xuXG4gICAgdGhpcy5jbGFzc2VzID0gTmV3c2xldHRlci5jbGFzc2VzO1xuXG4gICAgLy8gVGhpcyBzZXRzIHRoZSBzY3JpcHQgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYSBnbG9iYWwgZnVuY3Rpb24gdGhhdFxuICAgIC8vIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgdGhlIHJlcXVlc3RlZCBzY3JpcHQuXG4gICAgd2luZG93W05ld3NsZXR0ZXIuY2FsbGJhY2tdID0gKGRhdGEpID0+IHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrKGRhdGEpO1xuICAgIH07XG5cbiAgICB0aGlzLmZvcm0gPSBuZXcgRm9ybXModGhpcy5fZWwucXVlcnlTZWxlY3RvcignZm9ybScpKTtcblxuICAgIHRoaXMuZm9ybS5zdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuXG4gICAgdGhpcy5mb3JtLnN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5fc3VibWl0KGV2ZW50KVxuICAgICAgICAudGhlbih0aGlzLl9vbmxvYWQpXG4gICAgICAgIC5jYXRjaCh0aGlzLl9vbmVycm9yKTtcbiAgICB9O1xuXG4gICAgdGhpcy5mb3JtLndhdGNoKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZm9ybSBzdWJtaXNzaW9uIG1ldGhvZC4gUmVxdWVzdHMgYSBzY3JpcHQgd2l0aCBhIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIHRvIGJlIGV4ZWN1dGVkIG9uIG91ciBwYWdlLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gd2lsbCBiZSBwYXNzZWQgdGhlXG4gICAqIHJlc3BvbnNlIGFzIGEgSlNPTiBvYmplY3QgKGZ1bmN0aW9uIHBhcmFtZXRlcikuXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5ldyBzY3JpcHQgY2FsbFxuICAgKi9cbiAgX3N1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBTZXJpYWxpemUgdGhlIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gc2VyaWFsaXplKGV2ZW50LnRhcmdldCwge2hhc2g6IHRydWV9KTtcblxuICAgIC8vIFN3aXRjaCB0aGUgYWN0aW9uIHRvIHBvc3QtanNvbi4gVGhpcyBjcmVhdGVzIGFuIGVuZHBvaW50IGZvciBtYWlsY2hpbXBcbiAgICAvLyB0aGF0IGFjdHMgYXMgYSBzY3JpcHQgdGhhdCBjYW4gYmUgbG9hZGVkIG9udG8gb3VyIHBhZ2UuXG4gICAgbGV0IGFjdGlvbiA9IGV2ZW50LnRhcmdldC5hY3Rpb24ucmVwbGFjZShcbiAgICAgIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU59P2AsIGAke05ld3NsZXR0ZXIuZW5kcG9pbnRzLk1BSU5fSlNPTn0/YFxuICAgICk7XG5cbiAgICAvLyBBZGQgb3VyIHBhcmFtcyB0byB0aGUgYWN0aW9uXG4gICAgYWN0aW9uID0gYWN0aW9uICsgc2VyaWFsaXplKGV2ZW50LnRhcmdldCwge3NlcmlhbGl6ZXI6ICguLi5wYXJhbXMpID0+IHtcbiAgICAgIGxldCBwcmV2ID0gKHR5cGVvZiBwYXJhbXNbMF0gPT09ICdzdHJpbmcnKSA/IHBhcmFtc1swXSA6ICcnO1xuXG4gICAgICByZXR1cm4gYCR7cHJldn0mJHtwYXJhbXNbMV19PSR7cGFyYW1zWzJdfWA7XG4gICAgfX0pO1xuXG4gICAgLy8gQXBwZW5kIHRoZSBjYWxsYmFjayByZWZlcmVuY2UuIE1haWxjaGltcCB3aWxsIHdyYXAgdGhlIEpTT04gcmVzcG9uc2UgaW5cbiAgICAvLyBvdXIgY2FsbGJhY2sgbWV0aG9kLiBPbmNlIHdlIGxvYWQgdGhlIHNjcmlwdCB0aGUgY2FsbGJhY2sgd2lsbCBleGVjdXRlLlxuICAgIGFjdGlvbiA9IGAke2FjdGlvbn0mYz13aW5kb3cuJHtOZXdzbGV0dGVyLmNhbGxiYWNrfWA7XG5cbiAgICAvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgYXBwZW5kcyB0aGUgc2NyaXB0IHJlc3BvbnNlIG9mIHRoZSBwb3N0LWpzb24gbWV0aG9kXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICBzY3JpcHQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdC5zcmMgPSBlbmNvZGVVUkkoYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9ubG9hZCByZXNvbHV0aW9uXG4gICAqIEBwYXJhbSAge0V2ZW50fSBldmVudCBUaGUgc2NyaXB0IG9uIGxvYWQgZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3N9ICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25sb2FkKGV2ZW50KSB7XG4gICAgZXZlbnQucGF0aFswXS5yZW1vdmUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzY3JpcHQgb24gZXJyb3IgcmVzb2x1dGlvblxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGVycm9yIFRoZSBzY3JpcHQgb24gZXJyb3IgbG9hZCBldmVudFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfb25lcnJvcihlcnJvcikge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGVycm9yKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIE1haWxDaGltcCBTY3JpcHQgY2FsbFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgVGhlIHN1Y2Nlc3MvZXJyb3IgbWVzc2FnZSBmcm9tIE1haWxDaGltcFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9jYWxsYmFjayhkYXRhKSB7XG4gICAgaWYgKHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0pIHtcbiAgICAgIHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0oZGF0YS5tc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gZXJyb3IgaGFuZGxlclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyBUaGUgZXJyb3IgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2Vycm9yKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1dBUk5JTkcnLCBtc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBzdWNjZXNzIGhhbmRsZXJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBtc2cgVGhlIHN1Y2Nlc3MgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX3N1Y2Nlc3MobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnU1VDQ0VTUycsIG1zZyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVzZW50IHRoZSByZXNwb25zZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSBUaGUgbWVzc2FnZSB0eXBlXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbXNnICBUaGUgbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX21lc3NhZ2luZyh0eXBlLCBtc2cgPSAnbm8gbWVzc2FnZScpIHtcbiAgICBsZXQgc3RyaW5ncyA9IE9iamVjdC5rZXlzKE5ld3NsZXR0ZXIuc3RyaW5nS2V5cyk7XG4gICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgIGxldCBhbGVydEJveCA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBOZXdzbGV0dGVyLnNlbGVjdG9yc1tgJHt0eXBlfV9CT1hgXVxuICAgICk7XG5cbiAgICBsZXQgYWxlcnRCb3hNc2cgPSBhbGVydEJveC5xdWVyeVNlbGVjdG9yKFxuICAgICAgTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YX1RFWFRcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBsb2NhbGl6ZWQgc3RyaW5nLCB0aGVzZSBzaG91bGQgYmUgd3JpdHRlbiB0byB0aGUgRE9NIGFscmVhZHkuXG4gICAgLy8gVGhlIHV0aWxpdHkgY29udGFpbnMgYSBnbG9iYWwgbWV0aG9kIGZvciByZXRyaWV2aW5nIHRoZW0uXG4gICAgbGV0IHN0cmluZ0tleXMgPSBzdHJpbmdzLmZpbHRlcihzID0+IG1zZy5pbmNsdWRlcyhOZXdzbGV0dGVyLnN0cmluZ0tleXNbc10pKTtcbiAgICBtc2cgPSAoc3RyaW5nS2V5cy5sZW5ndGgpID8gdGhpcy5zdHJpbmdzW3N0cmluZ0tleXNbMF1dIDogbXNnO1xuICAgIGhhbmRsZWQgPSAoc3RyaW5nS2V5cy5sZW5ndGgpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgLy8gUmVwbGFjZSBzdHJpbmcgdGVtcGxhdGVzIHdpdGggdmFsdWVzIGZyb20gZWl0aGVyIG91ciBmb3JtIGRhdGEgb3JcbiAgICAvLyB0aGUgTmV3c2xldHRlciBzdHJpbmdzIG9iamVjdC5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IE5ld3NsZXR0ZXIudGVtcGxhdGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBOZXdzbGV0dGVyLnRlbXBsYXRlc1t4XTtcbiAgICAgIGxldCBrZXkgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7eyAnLCAnJykucmVwbGFjZSgnIH19JywgJycpO1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5fZGF0YVtrZXldIHx8IHRoaXMuc3RyaW5nc1trZXldO1xuICAgICAgbGV0IHJlZyA9IG5ldyBSZWdFeHAodGVtcGxhdGUsICdnaScpO1xuXG4gICAgICBtc2cgPSBtc2cucmVwbGFjZShyZWcsICh2YWx1ZSkgPyB2YWx1ZSA6ICcnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gbXNnO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0VSUk9SJykge1xuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLkVSUl9QTEVBU0VfVFJZX0xBVEVSO1xuICAgIH1cblxuICAgIGlmIChhbGVydEJveCkgdGhpcy5fZWxlbWVudFNob3coYWxlcnRCb3gsIGFsZXJ0Qm94TXNnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudHNSZXNldCgpIHtcbiAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3JBbGwoTmV3c2xldHRlci5zZWxlY3RvcnMuQUxFUlRfQk9YRVMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKCF0YXJnZXRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhOZXdzbGV0dGVyLmNsYXNzZXMuSElEREVOKSkge1xuICAgICAgICB0YXJnZXRzW2ldLmNsYXNzTGlzdC5hZGQoTmV3c2xldHRlci5jbGFzc2VzLkhJRERFTik7XG5cbiAgICAgICAgTmV3c2xldHRlci5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LnJlbW92ZShpdGVtKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgICAgIHRhcmdldHNbaV0uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgIHRhcmdldHNbaV0ucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9ycy5BTEVSVF9CT1hfVEVYVClcbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnb2ZmJyk7XG4gICAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgIE1lc3NhZ2UgY29udGFpbmVyXG4gICAqIEBwYXJhbSAge29iamVjdH0gY29udGVudCBDb250ZW50IHRoYXQgY2hhbmdlcyBkeW5hbWljYWxseSB0aGF0IHNob3VsZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgYW5ub3VuY2VkIHRvIHNjcmVlbiByZWFkZXJzLlxuICAgKiBAcmV0dXJuIHtDbGFzc30gICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRTaG93KHRhcmdldCwgY29udGVudCkge1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKE5ld3NsZXR0ZXIuY2xhc3Nlcy5ISURERU4pO1xuICAgIE5ld3NsZXR0ZXIuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKGl0ZW0pXG4gICAgKTtcbiAgICAvLyBTY3JlZW4gUmVhZGVyc1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgIGlmIChjb250ZW50KSB7XG4gICAgICBjb250ZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJveHkgZnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIHByb3BlciBrZXlcbiAgICogQHBhcmFtICB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBmb3IgdGhlIHN0b3JlZCBrZXlzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICBUaGUgZGVzaXJlZCBrZXkuXG4gICAqL1xuICBfa2V5KGtleSkge1xuICAgIHJldHVybiBOZXdzbGV0dGVyLmtleXNba2V5XTtcbiAgfVxufVxuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGRhdGEga2V5cyAqL1xuTmV3c2xldHRlci5rZXlzID0ge1xuICBNQ19SRVNVTFQ6ICdyZXN1bHQnLFxuICBNQ19NU0c6ICdtc2cnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQVBJIGVuZHBvaW50cyAqL1xuTmV3c2xldHRlci5lbmRwb2ludHMgPSB7XG4gIE1BSU46ICcvcG9zdCcsXG4gIE1BSU5fSlNPTjogJy9wb3N0LWpzb24nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIE1haWxjaGltcCBjYWxsYmFjayByZWZlcmVuY2UuICovXG5OZXdzbGV0dGVyLmNhbGxiYWNrID0gJ0FjY2Vzc055Y05ld3NsZXR0ZXJDYWxsYmFjayc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBET00gc2VsZWN0b3JzIGZvciB0aGUgaW5zdGFuY2UncyBjb25jZXJucyAqL1xuTmV3c2xldHRlci5zZWxlY3RvcnMgPSB7XG4gIEVMRU1FTlQ6ICdbZGF0YS1qcz1cIm5ld3NsZXR0ZXJcIl0nLFxuICBBTEVSVF9CT1hFUzogJ1tkYXRhLWpzLW5ld3NsZXR0ZXIqPVwiYWxlcnQtYm94LVwiXScsXG4gIFdBUk5JTkdfQk9YOiAnW2RhdGEtanMtbmV3c2xldHRlcj1cImFsZXJ0LWJveC13YXJuaW5nXCJdJyxcbiAgU1VDQ0VTU19CT1g6ICdbZGF0YS1qcy1uZXdzbGV0dGVyPVwiYWxlcnQtYm94LXN1Y2Nlc3NcIl0nLFxuICBBTEVSVF9CT1hfVEVYVDogJ1tkYXRhLWpzLW5ld3NsZXR0ZXI9XCJhbGVydC1ib3hfX3RleHRcIl0nXG59O1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gRE9NIHNlbGVjdG9yIGZvciB0aGUgaW5zdGFuY2UgKi9cbk5ld3NsZXR0ZXIuc2VsZWN0b3IgPSBOZXdzbGV0dGVyLnNlbGVjdG9ycy5FTEVNRU5UO1xuXG4vKiogQHR5cGUge09iamVjdH0gU3RyaW5nIHJlZmVyZW5jZXMgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zdHJpbmdLZXlzID0ge1xuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAndG9vIG1hbnknLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAnaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdsb29rcyBmYWtlIG9yIGludmFsaWQnXG59O1xuXG4vKiogQHR5cGUge09iamVjdH0gQXZhaWxhYmxlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIuc3RyaW5ncyA9IHtcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkLicsXG4gIFZBTElEX0VNQUlMX1JFUVVJUkVEOiAnRW1haWwgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX0NIRUNLQk9YX0JPUk9VR0g6ICdQbGVhc2Ugc2VsZWN0IGEgYm9yb3VnaC4nLFxuICBFUlJfUExFQVNFX1RSWV9MQVRFUjogJ1RoZXJlIHdhcyBhbiBlcnJvciB3aXRoIHlvdXIgc3VibWlzc2lvbi4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nLFxuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4gV2UgbmVlZCB0byBjb25maXJtIHlvdXIgZW1haWwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZHJlc3MuIFRvIGNvbXBsZXRlIHRoZSBzdWJzY3JpcHRpb24gcHJvY2VzcywgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3BsZWFzZSBjbGljayB0aGUgbGluayBpbiB0aGUgZW1haWwgd2UganVzdCBzZW50IHlvdS4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAnUmVjaXBpZW50IFwie3sgRU1BSUwgfX1cIiBoYXMgdG9vICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAnbWFueSByZWNlbnQgc2lnbnVwIHJlcXVlc3RzJyxcbiAgRVJSX0FMUkVBRFlfU1VCU0NSSUJFRDogJ3t7IEVNQUlMIH19IGlzIGFscmVhZHkgc3Vic2NyaWJlZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RvIGxpc3Qge3sgTElTVF9OQU1FIH19LicsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnVGhpcyBlbWFpbCBhZGRyZXNzIGxvb2tzIGZha2Ugb3IgaW52YWxpZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIGVudGVyIGEgcmVhbCBlbWFpbCBhZGRyZXNzLicsXG4gIExJU1RfTkFNRTogJ0FDQ0VTUyBOWUMgLSBOZXdzbGV0dGVyJ1xufTtcblxuLyoqIEB0eXBlIHtBcnJheX0gUGxhY2Vob2xkZXJzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBpbiBtZXNzYWdlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIudGVtcGxhdGVzID0gW1xuICAne3sgRU1BSUwgfX0nLFxuICAne3sgTElTVF9OQU1FIH19J1xuXTtcblxuTmV3c2xldHRlci5jbGFzc2VzID0ge1xuICBBTklNQVRFOiAnYW5pbWF0ZWQgZmFkZUluVXAnLFxuICBISURERU46ICdoaWRkZW4nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOZXdzbGV0dGVyO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBDb29raWVzIGZyb20gJ2pzLWNvb2tpZS9kaXN0L2pzLmNvb2tpZS5tanMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhpcyBjb250cm9scyB0aGUgdGV4dCBzaXplciBtb2R1bGUgYXQgdGhlIHRvcCBvZiBwYWdlLiBBIHRleHQtc2l6ZS1YIGNsYXNzXG4gKiBpcyBhZGRlZCB0byB0aGUgaHRtbCByb290IGVsZW1lbnQuIFggaXMgYW4gaW50ZWdlciB0byBpbmRpY2F0ZSB0aGUgc2NhbGUgb2ZcbiAqIHRleHQgYWRqdXN0bWVudCB3aXRoIDAgYmVpbmcgbmV1dHJhbC5cbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUZXh0Q29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCAtIFRoZSBodG1sIGVsZW1lbnQgZm9yIHRoZSBjb21wb25lbnQuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoZWwpIHtcbiAgICAvKiogQHByaXZhdGUge0hUTUxFbGVtZW50fSBUaGUgY29tcG9uZW50IGVsZW1lbnQuICovXG4gICAgdGhpcy5lbCA9IGVsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtOdW1iZXJ9IFRoZSByZWxhdGl2ZSBzY2FsZSBvZiB0ZXh0IGFkanVzdG1lbnQuICovXG4gICAgdGhpcy5fdGV4dFNpemUgPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSBXaGV0aGVyIHRoZSB0ZXh0U2l6ZXIgaXMgZGlzcGxheWVkLiAqL1xuICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSBXaGV0aGVyIHRoZSBtYXAgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuICovXG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7b2JqZWN0fSBUaGUgdG9nZ2xlIGluc3RhbmNlIGZvciB0aGUgVGV4dCBDb250cm9sbGVyICovXG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLlRPR0dMRVxuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBldmVudCBsaXN0ZW5lcnMgdG8gY29udHJvbGxlci4gQ2hlY2tzIGZvciB0ZXh0U2l6ZSBjb29raWUgYW5kXG4gICAqIHNldHMgdGhlIHRleHQgc2l6ZSBjbGFzcyBhcHByb3ByaWF0ZWx5LlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIGluaXQoKSB7XG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBjb25zdCBidG5TbWFsbGVyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFRleHRDb250cm9sbGVyLnNlbGVjdG9ycy5TTUFMTEVSKTtcbiAgICBjb25zdCBidG5MYXJnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLkxBUkdFUik7XG5cbiAgICBidG5TbWFsbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuX3RleHRTaXplIC0gMTtcblxuICAgICAgaWYgKG5ld1NpemUgPj0gVGV4dENvbnRyb2xsZXIubWluKSB7XG4gICAgICAgIHRoaXMuX2FkanVzdFNpemUobmV3U2l6ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBidG5MYXJnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBuZXdTaXplID0gdGhpcy5fdGV4dFNpemUgKyAxO1xuXG4gICAgICBpZiAobmV3U2l6ZSA8PSBUZXh0Q29udHJvbGxlci5tYXgpIHtcbiAgICAgICAgdGhpcy5fYWRqdXN0U2l6ZShuZXdTaXplKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGEgdGV4dCBzaXplIGNvb2tpZSwgc2V0IHRoZSB0ZXh0U2l6ZSB2YXJpYWJsZSB0byB0aGUgc2V0dGluZy5cbiAgICAvLyBJZiBub3QsIHRleHRTaXplIGluaXRpYWwgc2V0dGluZyByZW1haW5zIGF0IHplcm8gYW5kIHdlIHRvZ2dsZSBvbiB0aGVcbiAgICAvLyB0ZXh0IHNpemVyL2xhbmd1YWdlIGNvbnRyb2xzIGFuZCBhZGQgYSBjb29raWUuXG4gICAgaWYgKENvb2tpZXMuZ2V0KCd0ZXh0U2l6ZScpKSB7XG4gICAgICBjb25zdCBzaXplID0gcGFyc2VJbnQoQ29va2llcy5nZXQoJ3RleHRTaXplJyksIDEwKTtcblxuICAgICAgdGhpcy5fdGV4dFNpemUgPSBzaXplO1xuICAgICAgdGhpcy5fYWRqdXN0U2l6ZShzaXplKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcbiAgICAgIGh0bWwuY2xhc3NMaXN0LmFkZChgdGV4dC1zaXplLSR7dGhpcy5fdGV4dFNpemV9YCk7XG5cbiAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgdGhpcy5fc2V0Q29va2llKCk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2hvd3MgdGhlIHRleHQgc2l6ZXIgY29udHJvbHMuXG4gICAqIEByZXR1cm4ge3RoaXN9IFRleHRTaXplclxuICAgKi9cbiAgc2hvdygpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuXG4gICAgLy8gUmV0cmlldmUgc2VsZWN0b3JzIHJlcXVpcmVkIGZvciB0aGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICBsZXQgZWwgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLlRPR0dMRSk7XG4gICAgbGV0IHRhcmdldFNlbGVjdG9yID0gYCMke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWA7XG4gICAgbGV0IHRhcmdldCA9IHRoaXMuZWwucXVlcnlTZWxlY3Rvcih0YXJnZXRTZWxlY3Rvcik7XG5cbiAgICAvLyBJbnZva2UgbWFpbiB0b2dnbGluZyBtZXRob2QgZnJvbSB0b2dnbGUuanNcbiAgICB0aGlzLl90b2dnbGUuZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGB0ZXh0U2l6ZWAgY29va2llIHRvIHN0b3JlIHRoZSB2YWx1ZSBvZiB0aGlzLl90ZXh0U2l6ZS4gRXhwaXJlc1xuICAgKiBpbiAxIGhvdXIgKDEvMjQgb2YgYSBkYXkpLlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIF9zZXRDb29raWUoKSB7XG4gICAgQ29va2llcy5zZXQoJ3RleHRTaXplJywgdGhpcy5fdGV4dFNpemUsIHtleHBpcmVzOiAoMS8yNCl9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0ZXh0LXNpemUtWCBjbGFzcyBvbiB0aGUgaHRtbCByb290IGVsZW1lbnQuIFVwZGF0ZXMgdGhlIGNvb2tpZVxuICAgKiBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzaXplIC0gbmV3IHNpemUgdG8gc2V0LlxuICAgKiBAcmV0dXJuIHt0aGlzfSBUZXh0U2l6ZXJcbiAgICovXG4gIF9hZGp1c3RTaXplKHNpemUpIHtcbiAgICBjb25zdCBvcmlnaW5hbFNpemUgPSB0aGlzLl90ZXh0U2l6ZTtcbiAgICBjb25zdCBodG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xuXG4gICAgaWYgKHNpemUgIT09IG9yaWdpbmFsU2l6ZSkge1xuICAgICAgdGhpcy5fdGV4dFNpemUgPSBzaXplO1xuICAgICAgdGhpcy5fc2V0Q29va2llKCk7XG5cbiAgICAgIGh0bWwuY2xhc3NMaXN0LnJlbW92ZShgdGV4dC1zaXplLSR7b3JpZ2luYWxTaXplfWApO1xuICAgIH1cblxuICAgIGh0bWwuY2xhc3NMaXN0LmFkZChgdGV4dC1zaXplLSR7c2l6ZX1gKTtcblxuICAgIHRoaXMuX2NoZWNrRm9yTWluTWF4KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgdGV4dCBzaXplIGFnYWluc3QgdGhlIG1pbiBhbmQgbWF4LiBJZiB0aGUgbGltaXRzIGFyZVxuICAgKiByZWFjaGVkLCBkaXNhYmxlIHRoZSBjb250cm9scyBmb3IgZ29pbmcgc21hbGxlci9sYXJnZXIgYXMgYXBwcm9wcmlhdGUuXG4gICAqIEByZXR1cm4ge3RoaXN9IFRleHRTaXplclxuICAgKi9cbiAgX2NoZWNrRm9yTWluTWF4KCkge1xuICAgIGNvbnN0IGJ0blNtYWxsZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzLlNNQUxMRVIpO1xuICAgIGNvbnN0IGJ0bkxhcmdlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcnMuTEFSR0VSKTtcblxuICAgIGlmICh0aGlzLl90ZXh0U2l6ZSA8PSBUZXh0Q29udHJvbGxlci5taW4pIHtcbiAgICAgIHRoaXMuX3RleHRTaXplID0gVGV4dENvbnRyb2xsZXIubWluO1xuICAgICAgYnRuU21hbGxlci5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgIH0gZWxzZVxuICAgICAgYnRuU21hbGxlci5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG5cbiAgICBpZiAodGhpcy5fdGV4dFNpemUgPj0gVGV4dENvbnRyb2xsZXIubWF4KSB7XG4gICAgICB0aGlzLl90ZXh0U2l6ZSA9IFRleHRDb250cm9sbGVyLm1heDtcbiAgICAgIGJ0bkxhcmdlci5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgIH0gZWxzZVxuICAgICAgYnRuTGFyZ2VyLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7SW50ZWdlcn0gVGhlIG1pbmltdW0gdGV4dCBzaXplICovXG5UZXh0Q29udHJvbGxlci5taW4gPSAtMztcblxuLyoqIEB0eXBlIHtJbnRlZ2VyfSBUaGUgbWF4aW11bSB0ZXh0IHNpemUgKi9cblRleHRDb250cm9sbGVyLm1heCA9IDM7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgY29tcG9uZW50IHNlbGVjdG9yICovXG5UZXh0Q29udHJvbGxlci5zZWxlY3RvciA9ICdbZGF0YS1qcz1cInRleHQtY29udHJvbGxlclwiXSc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBlbGVtZW50IHNlbGVjdG9ycyB3aXRoaW4gdGhlIGNvbXBvbmVudCAqL1xuVGV4dENvbnRyb2xsZXIuc2VsZWN0b3JzID0ge1xuICBMQVJHRVI6ICdbZGF0YS1qcyo9XCJ0ZXh0LWxhcmdlclwiXScsXG4gIFNNQUxMRVI6ICdbZGF0YS1qcyo9XCJ0ZXh0LXNtYWxsZXJcIl0nLFxuICBUT0dHTEU6ICdbZGF0YS1qcyo9XCJ0ZXh0LWNvbnRyb2xsZXJfX2NvbnRyb2xcIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUZXh0Q29udHJvbGxlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2Zvcm1zL2Zvcm1zJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuaW1wb3J0IEljb25zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9pY29ucy9pY29ucyc7XG5pbXBvcnQgVHJhY2sgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RyYWNrL3RyYWNrJztcbmltcG9ydCBDb3B5IGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9jb3B5L2NvcHknO1xuXG4vLyBFbGVtZW50c1xuLy8gaW1wb3J0IElucHV0c0F1dG9jb21wbGV0ZSBmcm9tICcuLi9lbGVtZW50cy9pbnB1dHMvaW5wdXRzLWF1dG9jb21wbGV0ZSc7XG5pbXBvcnQgVG9vbHRpcHMgZnJvbSAnLi4vZWxlbWVudHMvdG9vbHRpcHMvdG9vbHRpcHMnO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgRGlzY2xhaW1lciBmcm9tICcuLi9jb21wb25lbnRzL2Rpc2NsYWltZXIvZGlzY2xhaW1lcic7XG5pbXBvcnQgRmlsdGVyIGZyb20gJy4uL2NvbXBvbmVudHMvZmlsdGVyL2ZpbHRlcic7XG5pbXBvcnQgTmVhcmJ5U3RvcHMgZnJvbSAnLi4vY29tcG9uZW50cy9uZWFyYnktc3RvcHMvbmVhcmJ5LXN0b3BzJztcbmltcG9ydCBTaGFyZUZvcm0gZnJvbSAnLi4vY29tcG9uZW50cy9zaGFyZS1mb3JtL3NoYXJlLWZvcm0nO1xuaW1wb3J0IFdlYlNoYXJlIGZyb20gJy4uL2NvbXBvbmVudHMvd2ViLXNoYXJlL3dlYi1zaGFyZSc7XG5cbi8vIE9iamVjdHNcbmltcG9ydCBBbGVydEJhbm5lciBmcm9tICcuLi9vYmplY3RzL2FsZXJ0LWJhbm5lci9hbGVydC1iYW5uZXInO1xuaW1wb3J0IE5ld3NsZXR0ZXIgZnJvbSAnLi4vb2JqZWN0cy9uZXdzbGV0dGVyL25ld3NsZXR0ZXInO1xuaW1wb3J0IFRleHRDb250cm9sbGVyIGZyb20gJy4uL29iamVjdHMvdGV4dC1jb250cm9sbGVyL3RleHQtY29udHJvbGxlcic7XG4vKiogaW1wb3J0IGNvbXBvbmVudHMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuLiAqL1xuXG4vKipcbiAqIFRoZSBNYWluIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIG1haW4ge1xuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgSWNvbnMgVXRpbGl0eVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGluc3RhbmNlIG9mIEljb25zXG4gICAqL1xuICBpY29ucyhwYXRoID0gJ3N2Zy9pY29ucy5zdmcnKSB7XG4gICAgcmV0dXJuIG5ldyBJY29ucyhwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUb2dnbGUgVXRpbGl0eVxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgVG9nZ2xlIENsYXNzXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgSW5zdGFuY2Ugb2YgdG9nZ2xlXG4gICAqL1xuICB0b2dnbGUoc2V0dGluZ3MgPSBmYWxzZSkge1xuICAgIHJldHVybiAoc2V0dGluZ3MpID8gbmV3IFRvZ2dsZShzZXR0aW5ncykgOiBuZXcgVG9nZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgc2VsZWN0b3JcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gc3VibWl0XG4gICAqL1xuICB2YWxpZChzZWxlY3Rvciwgc3VibWl0KSB7XG4gICAgdGhpcy5mb3JtID0gbmV3IEZvcm1zKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKTtcblxuICAgIHRoaXMuZm9ybS5zdWJtaXQgPSBzdWJtaXQ7XG5cbiAgICB0aGlzLmZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJy5jLXF1ZXN0aW9uX19jb250YWluZXInO1xuXG4gICAgdGhpcy5mb3JtLndhdGNoKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVG9vbHRpcHMgZWxlbWVudFxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBUb29sdGlwcyBDbGFzc1xuICAgKiBAcmV0dXJuIHtub2RlbGlzdH0gICAgICAgICAgVG9vbHRpcCBlbGVtZW50c1xuICAgKi9cbiAgdG9vbHRpcHMoZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFRvb2x0aXBzLnNlbGVjdG9yKSkge1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBuZXcgVG9vbHRpcHMoZWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKGVsZW1lbnRzLmxlbmd0aCkgPyBlbGVtZW50cyA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGluc3RhbmNlIG9mIEZpbHRlclxuICAgKi9cbiAgZmlsdGVyKCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgQWNjb3JkaW9uIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGluc3RhbmNlIG9mIE5lYXJieVN0b3BzXG4gICAqL1xuICBuZWFyYnlTdG9wcygpIHtcbiAgICByZXR1cm4gbmV3IE5lYXJieVN0b3BzKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmV3c2xldHRlciBPYmplY3RcbiAgICogQHJldHVybiB7T2JqZWN0fSBpbnN0YW5jZSBvZiBOZXdzbGV0dGVyXG4gICAqL1xuICBuZXdzbGV0dGVyKGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBOZXdzbGV0dGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgfVxuXG4gLyoqXG4gICogQW4gQVBJIGZvciB0aGUgQXV0b2NvbXBsZXRlIE9iamVjdFxuICAqXG4gICogQHBhcmFtICB7T2JqZWN0fSAgc2V0dGluZ3MgIFNldHRpbmdzIGZvciB0aGUgQXV0b2NvbXBsZXRlIENsYXNzXG4gICpcbiAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgSW5zdGFuY2Ugb2YgQXV0b2NvbXBsZXRlXG4gICovXG4gIC8vIGlucHV0c0F1dG9jb21wbGV0ZShzZXR0aW5ncyA9IHt9KSB7XG4gIC8vICAgcmV0dXJuIG5ldyBJbnB1dHNBdXRvY29tcGxldGUoc2V0dGluZ3MpO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFsZXJ0QmFubmVyIENvbXBvbmVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgQWxlcnRCYW5uZXJcbiAgICovXG4gIGFsZXJ0QmFubmVyKGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKEFsZXJ0QmFubmVyLnNlbGVjdG9yKSkge1xuICAgIHJldHVybiAoZWxlbWVudCkgPyBuZXcgQWxlcnRCYW5uZXIoZWxlbWVudCkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFNoYXJlRm9ybSBDb21wb25lbnRcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFNoYXJlRm9ybVxuICAgKi9cbiAgc2hhcmVGb3JtKGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChTaGFyZUZvcm0uc2VsZWN0b3IpKSB7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIG5ldyBTaGFyZUZvcm0oZWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKGVsZW1lbnRzLmxlbmd0aCkgPyBlbGVtZW50cyA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgV2ViU2hhcmUgQ29tcG9uZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBXZWJTaGFyZVxuICAgKi9cbiAgd2ViU2hhcmUoKSB7XG4gICAgcmV0dXJuIG5ldyBXZWJTaGFyZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIENvcHkgVXRpbGl0eVxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgQ29weVxuICAgKi9cbiAgY29weSgpIHtcbiAgICByZXR1cm4gbmV3IENvcHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBEaXNjbGFpbWVyIENvbXBvbmVudFxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgRGlzY2xhaW1lclxuICAgKi9cbiAgZGlzY2xhaW1lcigpIHtcbiAgICByZXR1cm4gbmV3IERpc2NsYWltZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUZXh0Q29udHJvbGxlciBPYmplY3RcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFRleHRDb250cm9sbGVyXG4gICAqL1xuICB0ZXh0Q29udHJvbGxlcihlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcikpIHtcbiAgICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IFRleHRDb250cm9sbGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUcmFjayBPYmplY3RcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFRyYWNrXG4gICAqL1xuICB0cmFjaygpIHtcbiAgICByZXR1cm4gbmV3IFRyYWNrKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFpbjtcbiJdLCJuYW1lcyI6WyJsZXQiLCJ0aGlzIiwiaSIsImNvbnN0IiwiVG9vbHRpcHMiLCJjb25zdHJ1Y3RvciIsImVsIiwidHJpZ2dlciIsInRvb2x0aXAiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0QXR0cmlidXRlIiwiYWN0aXZlIiwiY2xhc3NMaXN0IiwiYWRkIiwiQ3NzQ2xhc3MiLCJUT09MVElQIiwiSElEREVOIiwic2V0QXR0cmlidXRlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwicXVlcnlTZWxlY3RvciIsImFwcGVuZENoaWxkIiwicHJldmVudERlZmF1bHQiLCJ0b2dnbGUiLCJ3aW5kb3ciLCJoaWRlIiwiQWxsVGlwcyIsInB1c2giLCJzaG93IiwiaGlkZUFsbCIsInJlbW92ZSIsImJvZHkiLCJoaWRlVG9vbHRpcE9uY2UiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVwb3NpdGlvbiIsInBvcyIsInN0eWxlIiwiYXR0cnMiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwia2V5Iiwiam9pbiIsImciLCJ0dCIsInRyIiwidyIsIm9mZnNldFdpZHRoIiwiaW5uZXJXaWR0aCIsImxlZnQiLCJyaWdodCIsIndpZHRoIiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInNjcm9sbFkiLCJpbm5lckhlaWdodCIsInRvcCIsIm9mZnNldEhlaWdodCIsInNlbGVjdG9yIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJBY2NvcmRpb24iLCJfdG9nZ2xlIiwiVG9nZ2xlIiwiRGlzY2xhaW1lciIsInNlbGVjdG9ycyIsImNsYXNzZXMiLCJ0YXJnZXQiLCJtYXRjaGVzIiwiVE9HR0xFIiwiaWQiLCJBQ1RJVkUiLCJ0cmlnZ2VycyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJkaXNjbGFpbWVyIiwibGVuZ3RoIiwiQU5JTUFURUQiLCJBTklNQVRJT04iLCJzY3JvbGxUbyIsIlNDUkVFTl9ERVNLVE9QIiwib2Zmc2V0IiwiZGF0YXNldCIsInNjcm9sbE9mZnNldCIsIkZpbHRlciIsIm5hbWVzcGFjZSIsImluYWN0aXZlQ2xhc3MiLCJvYmplY3RQcm90byIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwic3ltVG9TdHJpbmdUYWciLCJlIiwiZnVuY1Byb3RvIiwiZnVuY1RvU3RyaW5nIiwiaGFzT3duUHJvcGVydHkiLCJNQVhfU0FGRV9JTlRFR0VSIiwiYXJnc1RhZyIsImZ1bmNUYWciLCJmcmVlRXhwb3J0cyIsImZyZWVNb2R1bGUiLCJtb2R1bGVFeHBvcnRzIiwib2JqZWN0VGFnIiwiZXJyb3JUYWciLCJlc2NhcGUiLCJOZWFyYnlTdG9wcyIsIl9lbGVtZW50cyIsIl9zdG9wcyIsIl9sb2NhdGlvbnMiLCJfZmV0Y2giLCJzdGF0dXMiLCJkYXRhIiwiX2xvY2F0ZSIsIl9hc3NpZ25Db2xvcnMiLCJfcmVuZGVyIiwic3RvcHMiLCJhbW91bnQiLCJwYXJzZUludCIsIl9vcHQiLCJkZWZhdWx0cyIsIkFNT1VOVCIsImxvYyIsIkpTT04iLCJwYXJzZSIsImdlbyIsImRpc3RhbmNlcyIsIl9rZXkiLCJyZXZlcnNlIiwiX2VxdWlyZWN0YW5ndWxhciIsInNvcnQiLCJhIiwiYiIsImRpc3RhbmNlIiwic2xpY2UiLCJ4Iiwic3RvcCIsImNhbGxiYWNrIiwiaGVhZGVycyIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJqc29uIiwiY29uc29sZSIsImRpciIsImNhdGNoIiwiZXJyb3IiLCJsYXQxIiwibG9uMSIsImxhdDIiLCJsb24yIiwiTWF0aCIsImRlZzJyYWQiLCJkZWciLCJQSSIsImFscGhhIiwiYWJzIiwiY29zIiwieSIsIlIiLCJzcXJ0IiwibG9jYXRpb25zIiwibG9jYXRpb25MaW5lcyIsImxpbmUiLCJsaW5lcyIsInNwbGl0IiwidHJ1bmtzIiwiaW5kZXhPZiIsImNvbXBpbGVkIiwidGVtcGxhdGUiLCJ0ZW1wbGF0ZXMiLCJTVUJXQVkiLCJpbm5lckhUTUwiLCJvcHQiLCJvcHRpb25zIiwiTE9DQVRJT04iLCJFTkRQT0lOVCIsImRlZmluaXRpb24iLCJPREFUQV9HRU8iLCJPREFUQV9DT09SIiwiT0RBVEFfTElORSIsIlRSVU5LIiwiTElORVMiLCJhcmd1bWVudHMiLCJnbG9iYWwiLCJTaGFyZUZvcm0iLCJzdHJpbmdzIiwicGF0dGVybnMiLCJzZW50IiwicGhvbmUiLCJQSE9ORSIsImNsZWF2ZSIsIkNsZWF2ZSIsInBob25lUmVnaW9uQ29kZSIsImRlbGltaXRlciIsInR5cGUiLCJmb3JtIiwiRm9ybXMiLCJGT1JNIiwiUkVRVUlSRUQiLCJ2YWxpZCIsInNhbml0aXplIiwicHJvY2Vzc2luZyIsInN1Ym1pdCIsImFmdGVyIiwiSU5QVVQiLCJmb2N1cyIsIl9kYXRhIiwic2VyaWFsaXplIiwiaGFzaCIsInRvIiwicmVwbGFjZSIsImlucHV0cyIsIklOUFVUUyIsImJ1dHRvbiIsIlNVQk1JVCIsIlBST0NFU1NJTkciLCJmb3JtRGF0YSIsIlVSTFNlYXJjaFBhcmFtcyIsImsiLCJhcHBlbmQiLCJodG1sIiwiaGFzQXR0cmlidXRlIiwibWV0aG9kIiwic3VjY2VzcyIsImZlZWRiYWNrIiwiZW5hYmxlIiwiU1VDQ0VTUyIsIktFWSIsIm1lc3NhZ2UiLCJjcmVhdGVFbGVtZW50IiwiTUVTU0FHRSIsImluc2VydEJlZm9yZSIsImNoaWxkTm9kZXMiLCJyZW1vdmVBdHRyaWJ1dGUiLCJFUlJPUiIsIlNFUlZFUiIsIlNFUlZFUl9URUxfSU5WQUxJRCIsIlZBTElEX1JFUVVJUkVEIiwiVkFMSURfRU1BSUxfSU5WQUxJRCIsIlZBTElEX1RFTF9JTlZBTElEIiwiV2ViU2hhcmUiLCJuYXZpZ2F0b3IiLCJzaGFyZSIsIml0ZW0iLCJ3ZWJTaGFyZSIsInJlcyIsImVyciIsIkFsZXJ0QmFubmVyIiwiZXhwaXJlcyIsIm5hbWUiLCJOQU1FIiwiQlVUVE9OIiwiY29udGFpbnMiLCJDb29raWVzIiwic2V0IiwiYWN0aXZlQ2xhc3MiLCJnZXQiLCJlbGVtZW50VG9nZ2xlIiwiTmV3c2xldHRlciIsIl9lbCIsImVuZHBvaW50cyIsInN0cmluZ0tleXMiLCJfY2FsbGJhY2siLCJfc3VibWl0IiwiX29ubG9hZCIsIl9vbmVycm9yIiwid2F0Y2giLCJhY3Rpb24iLCJNQUlOIiwiTUFJTl9KU09OIiwic2VyaWFsaXplciIsInByZXYiLCJwYXJhbXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNjcmlwdCIsIm9ubG9hZCIsIm9uZXJyb3IiLCJhc3luYyIsInNyYyIsImVuY29kZVVSSSIsInBhdGgiLCJtc2ciLCJfZXJyb3IiLCJfZWxlbWVudHNSZXNldCIsIl9tZXNzYWdpbmciLCJfc3VjY2VzcyIsImhhbmRsZWQiLCJhbGVydEJveCIsImFsZXJ0Qm94TXNnIiwiQUxFUlRfQk9YX1RFWFQiLCJmaWx0ZXIiLCJzIiwiaW5jbHVkZXMiLCJ2YWx1ZSIsInJlZyIsIlJlZ0V4cCIsIkVSUl9QTEVBU0VfVFJZX0xBVEVSIiwiX2VsZW1lbnRTaG93IiwidGFyZ2V0cyIsIkFMRVJUX0JPWEVTIiwiQU5JTUFURSIsImNvbnRlbnQiLCJNQ19SRVNVTFQiLCJNQ19NU0ciLCJFTEVNRU5UIiwiV0FSTklOR19CT1giLCJTVUNDRVNTX0JPWCIsIlNVQ0NFU1NfQ09ORklSTV9FTUFJTCIsIkVSUl9QTEVBU0VfRU5URVJfVkFMVUUiLCJFUlJfVE9PX01BTllfUkVDRU5UIiwiRVJSX0FMUkVBRFlfU1VCU0NSSUJFRCIsIkVSUl9JTlZBTElEX0VNQUlMIiwiVkFMSURfRU1BSUxfUkVRVUlSRUQiLCJWQUxJRF9DSEVDS0JPWF9CT1JPVUdIIiwiTElTVF9OQU1FIiwiVGV4dENvbnRyb2xsZXIiLCJfdGV4dFNpemUiLCJfYWN0aXZlIiwiX2luaXRpYWxpemVkIiwiaW5pdCIsImJ0blNtYWxsZXIiLCJTTUFMTEVSIiwiYnRuTGFyZ2VyIiwiTEFSR0VSIiwibmV3U2l6ZSIsIm1pbiIsIl9hZGp1c3RTaXplIiwibWF4Iiwic2l6ZSIsIl9zZXRDb29raWUiLCJ0YXJnZXRTZWxlY3RvciIsIm9yaWdpbmFsU2l6ZSIsIl9jaGVja0Zvck1pbk1heCIsIm1haW4iLCJpY29ucyIsIkljb25zIiwic2V0dGluZ3MiLCJFUlJPUl9NRVNTQUdFX1BBUkVOVCIsInRvb2x0aXBzIiwiZWxlbWVudHMiLCJhY2NvcmRpb24iLCJuZWFyYnlTdG9wcyIsIm5ld3NsZXR0ZXIiLCJhbGVydEJhbm5lciIsInNoYXJlRm9ybSIsImNvcHkiLCJDb3B5IiwidGV4dENvbnRyb2xsZXIi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QyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoQyxRQUFRLElBQUksV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2hDLFFBQVEsTUFBTSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDaEMsUUFBUSxRQUFRLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbkMsUUFBUSxVQUFVLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbkMsUUFBUSxPQUFPLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbkMsUUFBUSxZQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbkMsUUFBUSxLQUFLLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLElBQUksV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLFFBQVEsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxRQUFRLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNuQyxLQUFLO0FBQ0w7RUFDQSxJQUFJLEVBQUUsRUFBRTtFQUNSO0VBQ0EsUUFBUSxJQUFJLEVBQUUsb0JBQW9CO0FBQ2xDO0VBQ0E7RUFDQSxRQUFRLElBQUksRUFBRSxnQkFBZ0I7QUFDOUI7RUFDQTtFQUNBLFFBQVEsUUFBUSxFQUFFLHdDQUF3QztBQUMxRDtFQUNBO0VBQ0EsUUFBUSxNQUFNLEVBQUUsbUNBQW1DO0FBQ25EO0VBQ0E7RUFDQSxRQUFRLFVBQVUsRUFBRSx1REFBdUQ7QUFDM0U7RUFDQTtFQUNBLFFBQVEsT0FBTyxFQUFFLDJCQUEyQjtBQUM1QztFQUNBO0VBQ0EsUUFBUSxZQUFZLEVBQUUsa0JBQWtCO0FBQ3hDO0VBQ0E7RUFDQSxRQUFRLEtBQUssRUFBRSx3QkFBd0I7QUFDdkM7RUFDQTtFQUNBLFFBQVEsR0FBRyxFQUFFLHdCQUF3QjtBQUNyQztFQUNBO0VBQ0EsUUFBUSxPQUFPLEVBQUUsNENBQTRDO0FBQzdEO0VBQ0E7RUFDQSxRQUFRLEdBQUcsRUFBRSxtQkFBbUI7QUFDaEM7RUFDQTtFQUNBLFFBQVEsSUFBSSxFQUFFLFlBQVk7QUFDMUI7RUFDQTtFQUNBLFFBQVEsUUFBUSxFQUFFLGFBQWE7RUFDL0IsS0FBSztBQUNMO0VBQ0EsSUFBSSxlQUFlLEVBQUUsVUFBVSxLQUFLLEVBQUU7RUFDdEMsTUFBTSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLE9BQU8sRUFBRTtFQUN4RCxRQUFRLE9BQU8sSUFBSSxHQUFHLE9BQU8sQ0FBQztFQUM5QixPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDWjtFQUNBLE1BQU0sT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQztFQUN0QyxLQUFLO0FBQ0w7RUFDQSxJQUFJLE9BQU8sRUFBRSxVQUFVLEtBQUssRUFBRSxVQUFVLEVBQUU7RUFDMUMsUUFBUSxJQUFJLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNO0VBQzlDLFlBQVksRUFBRSxHQUFHLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztBQUN2QztFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsUUFBUSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUNsQztFQUNBLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSSxFQUFFLEVBQUU7RUFDNUIsWUFBWSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7RUFDckMsZ0JBQWdCLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNoRCxnQkFBZ0IsT0FBTztFQUN2QixvQkFBb0IsSUFBSSxFQUFFLEdBQUc7RUFDN0Isb0JBQW9CLE1BQU0sRUFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsR0FBRyxhQUFhO0VBQzVGLGlCQUFpQixDQUFDO0VBQ2xCLGFBQWE7RUFDYixTQUFTO0FBQ1Q7RUFDQSxRQUFRLE9BQU87RUFDZixZQUFZLElBQUksRUFBRSxTQUFTO0VBQzNCLFlBQVksTUFBTSxFQUFFLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTztFQUN0RixTQUFTLENBQUM7RUFDVixLQUFLO0VBQ0wsQ0FBQyxDQUFDO0FBQ0Y7RUFDQSxJQUFJLG9CQUFvQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDO0VBQ0EsSUFBSSxJQUFJLEdBQUc7RUFDWCxJQUFJLElBQUksRUFBRSxZQUFZO0VBQ3RCLEtBQUs7QUFDTDtFQUNBLElBQUksS0FBSyxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsRUFBRTtFQUNoQyxRQUFRLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDckMsS0FBSztBQUNMO0VBQ0EsSUFBSSxnQkFBZ0IsRUFBRSxVQUFVLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFO0VBQzlEO0VBQ0EsUUFBUSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0VBQ3JDLFlBQVksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQVMsR0FBRyxTQUFTLEdBQUcsRUFBRSxDQUFDO0VBQ2pGLFNBQVM7QUFDVDtFQUNBO0VBQ0EsUUFBUSxJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztFQUNsQyxRQUFRLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUU7RUFDOUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssT0FBTyxFQUFFO0VBQzFELGdCQUFnQixnQkFBZ0IsR0FBRyxPQUFPLENBQUM7RUFDM0MsYUFBYTtFQUNiLFNBQVMsQ0FBQyxDQUFDO0FBQ1g7RUFDQSxRQUFRLE9BQU8sZ0JBQWdCLENBQUM7RUFDaEMsS0FBSztBQUNMO0VBQ0EsSUFBSSx5QkFBeUIsRUFBRSxVQUFVLFNBQVMsRUFBRTtFQUNwRCxRQUFRLE9BQU8sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUNwRixLQUFLO0FBQ0w7RUFDQSxJQUFJLHFCQUFxQixFQUFFLFVBQVUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRTtFQUN6RjtFQUNBO0VBQ0EsTUFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFO0VBQ3ZDLFVBQVUsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO0VBQ2pDLE9BQU87QUFDUDtFQUNBLE1BQU0sT0FBTyxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztFQUNsRyxLQUFLO0FBQ0w7RUFDQSxJQUFJLGlCQUFpQixFQUFFLFVBQVUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRTtFQUNyRixRQUFRLElBQUksV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUM7QUFDbkQ7RUFDQSxRQUFRLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztFQUM5RixRQUFRLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztFQUM5RixRQUFRLFlBQVksR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7QUFDL0Q7RUFDQSxRQUFRLE9BQU8sQ0FBQyxZQUFZLEtBQUssQ0FBQyxLQUFLLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNsRixLQUFLO0FBQ0w7RUFDQSxJQUFJLGVBQWUsRUFBRSxVQUFVLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFO0VBQzdELFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3pCO0VBQ0E7RUFDQSxRQUFRLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7RUFDckMsWUFBWSxJQUFJLFdBQVcsR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxRjtFQUNBLFlBQVksT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUNsRCxTQUFTO0FBQ1Q7RUFDQTtFQUNBLFFBQVEsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRTtFQUM5QyxZQUFZLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFO0VBQ3hELGdCQUFnQixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDbkYsYUFBYSxDQUFDLENBQUM7RUFDZixTQUFTLENBQUMsQ0FBQztBQUNYO0VBQ0EsUUFBUSxPQUFPLEtBQUssQ0FBQztFQUNyQixLQUFLO0FBQ0w7RUFDQSxJQUFJLE9BQU8sRUFBRSxVQUFVLEdBQUcsRUFBRSxNQUFNLEVBQUU7RUFDcEMsUUFBUSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0VBQ3BDLEtBQUs7QUFDTDtFQUNBLElBQUksWUFBWSxFQUFFLFVBQVUsTUFBTSxFQUFFO0VBQ3BDLFFBQVEsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsUUFBUSxFQUFFLE9BQU8sRUFBRTtFQUMxRCxZQUFZLE9BQU8sUUFBUSxHQUFHLE9BQU8sQ0FBQztFQUN0QyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDZCxLQUFLO0FBQ0w7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJLHNCQUFzQixFQUFFLFVBQVUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUU7RUFDekg7RUFDQSxRQUFRLElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtFQUNoQyxVQUFVLE9BQU8sS0FBSyxDQUFDO0VBQ3ZCLFNBQVM7QUFDVDtFQUNBO0VBQ0EsUUFBUSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxLQUFLLE1BQU0sRUFBRTtFQUMxRDtFQUNBLFVBQVUsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLFVBQVUsSUFBSSxLQUFLLElBQUUsT0FBTyxLQUFLLEdBQUM7QUFDdEU7RUFDQSxVQUFVLE9BQU8sRUFBRSxDQUFDO0VBQ3BCLFNBQVM7QUFDVDtFQUNBLFFBQVEsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2hGO0VBQ0E7RUFDQTtFQUNBLFFBQVEsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsS0FBSyxNQUFNLEVBQUU7RUFDckQsVUFBVSxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7RUFDL0MsU0FBUztBQUNUO0VBQ0E7RUFDQSxRQUFRLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztFQUN6QyxLQUFLO0FBQ0w7RUFDQSxJQUFJLGlCQUFpQixFQUFFLFVBQVUsSUFBSSxFQUFFLE9BQU8sRUFBRTtFQUNoRCxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN0QjtFQUNBLFFBQVEsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7RUFDN0QsWUFBWSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7RUFDN0MsZ0JBQWdCLE9BQU8sQ0FBQyxDQUFDLENBQUM7RUFDMUIsYUFBYTtFQUNiLFNBQVM7QUFDVDtFQUNBLFFBQVEsT0FBTyxLQUFLLENBQUM7RUFDckIsS0FBSztBQUNMO0VBQ0EsSUFBSSxpQkFBaUIsRUFBRSxVQUFVLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUU7RUFDeEcsUUFBUSxJQUFJLE1BQU0sR0FBRyxFQUFFO0VBQ3ZCLFlBQVksa0JBQWtCLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDO0VBQ3RELFlBQVksZ0JBQWdCLENBQUM7QUFDN0I7RUFDQTtFQUNBLFFBQVEsSUFBSSxZQUFZLEtBQUssQ0FBQyxFQUFFO0VBQ2hDLFlBQVksT0FBTyxLQUFLLENBQUM7RUFDekIsU0FBUztBQUNUO0VBQ0EsUUFBUSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFLEtBQUssRUFBRTtFQUNoRCxZQUFZLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7RUFDbEMsZ0JBQWdCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQztFQUNoRCxvQkFBb0IsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0M7RUFDQSxnQkFBZ0IsSUFBSSxrQkFBa0IsRUFBRTtFQUN4QyxvQkFBb0IsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksZ0JBQWdCLENBQUM7RUFDL0csaUJBQWlCLE1BQU07RUFDdkIsb0JBQW9CLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztFQUNqRCxpQkFBaUI7QUFDakI7RUFDQSxnQkFBZ0IsSUFBSSxpQkFBaUIsRUFBRTtFQUN2QyxvQkFBb0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO0VBQ25DLHdCQUF3QixNQUFNLElBQUksZ0JBQWdCLENBQUM7RUFDbkQscUJBQXFCO0FBQ3JCO0VBQ0Esb0JBQW9CLE1BQU0sSUFBSSxHQUFHLENBQUM7RUFDbEMsaUJBQWlCLE1BQU07RUFDdkIsb0JBQW9CLE1BQU0sSUFBSSxHQUFHLENBQUM7QUFDbEM7RUFDQSxvQkFBb0IsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxLQUFLLEdBQUcsWUFBWSxHQUFHLENBQUMsRUFBRTtFQUMzRSx3QkFBd0IsTUFBTSxJQUFJLGdCQUFnQixDQUFDO0VBQ25ELHFCQUFxQjtFQUNyQixpQkFBaUI7QUFDakI7RUFDQTtFQUNBLGdCQUFnQixLQUFLLEdBQUcsSUFBSSxDQUFDO0VBQzdCLGFBQWE7RUFDYixTQUFTLENBQUMsQ0FBQztBQUNYO0VBQ0EsUUFBUSxPQUFPLE1BQU0sQ0FBQztFQUN0QixLQUFLO0FBQ0w7RUFDQTtFQUNBO0VBQ0EsSUFBSSxlQUFlLEVBQUUsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7RUFDbEUsUUFBUSxJQUFJLENBQUMsRUFBRSxFQUFFO0VBQ2pCLFlBQVksT0FBTztFQUNuQixTQUFTO0FBQ1Q7RUFDQSxRQUFRLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLO0VBQzFCLFlBQVksUUFBUSxHQUFHLFNBQVMsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDM0Q7RUFDQSxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtFQUNoRyxZQUFZLE9BQU87RUFDbkIsU0FBUztBQUNUO0VBQ0EsUUFBUSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNqQztFQUNBO0VBQ0EsUUFBUSxVQUFVLENBQUMsWUFBWTtFQUMvQixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDM0MsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ2QsS0FBSztBQUNMO0VBQ0E7RUFDQSxJQUFJLGtCQUFrQixFQUFFLFNBQVMsS0FBSyxFQUFFO0VBQ3hDLE1BQU0sSUFBSTtFQUNWLFFBQVEsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUM7RUFDL0UsUUFBUSxPQUFPLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUM1RCxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUU7RUFDbkI7RUFDQSxPQUFPO0FBQ1A7RUFDQSxNQUFNLE9BQU8sS0FBSyxDQUFDO0VBQ25CLEtBQUs7QUFDTDtFQUNBLElBQUksWUFBWSxFQUFFLFVBQVUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUU7RUFDcEQsUUFBUSxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQUU7RUFDcEQsWUFBWSxPQUFPO0VBQ25CLFNBQVM7QUFDVDtFQUNBO0VBQ0EsUUFBUSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxRQUFRLEVBQUU7RUFDekQsVUFBVSxPQUFPO0VBQ2pCLFNBQVM7QUFDVDtFQUNBLFFBQVEsSUFBSSxPQUFPLENBQUMsZUFBZSxFQUFFO0VBQ3JDLFlBQVksSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ2xEO0VBQ0EsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztFQUM5QyxZQUFZLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMzQixTQUFTLE1BQU07RUFDZixZQUFZLElBQUk7RUFDaEIsZ0JBQWdCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7RUFDOUQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0VBQ3hCO0VBQ0EsZ0JBQWdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUMsQ0FBQztFQUNsRixhQUFhO0VBQ2IsU0FBUztFQUNULEtBQUs7QUFDTDtFQUNBLElBQUksZ0JBQWdCLEVBQUUsU0FBUyxNQUFNLEVBQUU7RUFDdkMsUUFBUSxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0VBQ2pELFFBQVEsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLFVBQVUsRUFBRTtFQUN2RCxZQUFZLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUNuRSxTQUFTO0VBQ1QsUUFBUSxPQUFPLGFBQWEsQ0FBQztFQUM3QixLQUFLO0FBQ0w7RUFDQSxJQUFJLFNBQVMsRUFBRSxZQUFZO0VBQzNCLFFBQVEsT0FBTyxTQUFTLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7RUFDakUsS0FBSztBQUNMO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJLHlCQUF5QixFQUFFLFVBQVUsY0FBYyxFQUFFLGlCQUFpQixFQUFFO0VBQzVFLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO0VBQ3hFLFlBQVksT0FBTyxLQUFLLENBQUM7RUFDekIsU0FBUztBQUNUO0VBQ0EsUUFBUSxPQUFPLGlCQUFpQixLQUFLLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDakUsS0FBSztFQUNMLENBQUMsQ0FBQztBQUNGO0VBQ0EsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLElBQUksaUJBQWlCLEdBQUc7RUFDeEI7RUFDQTtFQUNBLElBQUksTUFBTSxFQUFFLFVBQVUsTUFBTSxFQUFFLElBQUksRUFBRTtFQUNwQyxRQUFRLE1BQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO0VBQzlCLFFBQVEsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUI7RUFDQTtFQUNBLFFBQVEsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUM5QyxRQUFRLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO0VBQ2xFLFFBQVEsTUFBTSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7RUFDbkMsUUFBUSxNQUFNLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixLQUFLLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDMUY7RUFDQTtFQUNBLFFBQVEsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztFQUNwQyxRQUFRLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUM7RUFDOUQsUUFBUSxNQUFNLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUNuQztFQUNBO0VBQ0EsUUFBUSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0VBQ2xDLFFBQVEsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUNqRSxRQUFRLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUM7RUFDcEQsUUFBUSxNQUFNLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUNsQztFQUNBO0VBQ0EsUUFBUSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0VBQ2xDLFFBQVEsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUNqRSxRQUFRLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7RUFDNUMsUUFBUSxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0VBQzVDLFFBQVEsTUFBTSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDbEM7RUFDQTtFQUNBLFFBQVEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztFQUN4QyxRQUFRLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7RUFDakcsUUFBUSxNQUFNLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0VBQ2xHLFFBQVEsTUFBTSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxHQUFHLENBQUM7RUFDbkUsUUFBUSxNQUFNLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixJQUFJLFVBQVUsQ0FBQztFQUMxRixRQUFRLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0VBQ2hFLFFBQVEsTUFBTSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxLQUFLLENBQUM7RUFDdEUsUUFBUSxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztBQUMxRDtFQUNBO0VBQ0EsUUFBUSxNQUFNLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNwRjtFQUNBLFFBQVEsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztFQUM1QyxRQUFRLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDNUM7RUFDQSxRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUM7RUFDdEYsUUFBUSxNQUFNLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztFQUM1RCxRQUFRLE1BQU0sQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDbkQsUUFBUSxNQUFNLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztFQUM5RCxRQUFRLE1BQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDcEQ7RUFDQSxRQUFRLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN0SDtFQUNBLFFBQVEsTUFBTSxDQUFDLFNBQVM7RUFDeEIsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLFNBQVM7RUFDdEUsaUJBQWlCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRztFQUNoQyxxQkFBcUIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHO0VBQ3BDLHlCQUF5QixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUc7RUFDM0MsNkJBQTZCLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRztFQUM3QyxnQ0FBZ0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDeEMsUUFBUSxNQUFNLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0VBQ3pELFFBQVEsTUFBTSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7RUFDNUQsUUFBUSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO0FBQ2xEO0VBQ0EsUUFBUSxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0VBQzFDLFFBQVEsTUFBTSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNuRDtFQUNBLFFBQVEsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sY0FBYyxLQUFLLFFBQVEsSUFBSSxjQUFjLElBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQztFQUN2RyxRQUFRLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNoRTtFQUNBLFFBQVEsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDN0I7RUFDQSxRQUFRLE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0VBQ2pDLFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDM0I7RUFDQSxRQUFRLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsS0FBSyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3hFO0VBQ0EsUUFBUSxPQUFPLE1BQU0sQ0FBQztFQUN0QixLQUFLO0VBQ0wsQ0FBQyxDQUFDO0FBQ0Y7RUFDQSxJQUFJLG1CQUFtQixHQUFHLGlCQUFpQixDQUFDO0FBQzVDO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsSUFBSSxNQUFNLEdBQUcsVUFBVSxPQUFPLEVBQUUsSUFBSSxFQUFFO0VBQ3RDLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0VBQ3JCLElBQUksSUFBSSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7QUFDcEM7RUFDQSxJQUFJLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0VBQ3JDLFFBQVEsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQ3hELFFBQVEsbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDNUUsS0FBSyxNQUFNO0VBQ1gsTUFBTSxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSyxXQUFXLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7RUFDdkUsUUFBUSxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQyxRQUFRLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0VBQ2pELE9BQU8sTUFBTTtFQUNiLFFBQVEsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7RUFDaEMsT0FBTztFQUNQLEtBQUs7QUFDTDtFQUNBLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7RUFDeEIsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7RUFDaEUsS0FBSztBQUNMO0VBQ0EsSUFBSSxJQUFJLG1CQUFtQixFQUFFO0VBQzdCLE1BQU0sSUFBSTtFQUNWO0VBQ0EsUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDLG9GQUFvRixDQUFDLENBQUM7RUFDM0csT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0VBQ2xCO0VBQ0EsT0FBTztFQUNQLEtBQUs7QUFDTDtFQUNBLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUN6QztFQUNBLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRTtFQUNBLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ2pCLENBQUMsQ0FBQztBQUNGO0VBQ0EsTUFBTSxDQUFDLFNBQVMsR0FBRztFQUNuQixJQUFJLElBQUksRUFBRSxZQUFZO0VBQ3RCLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQ2pEO0VBQ0E7RUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtFQUNoSSxZQUFZLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pDO0VBQ0EsWUFBWSxPQUFPO0VBQ25CLFNBQVM7QUFDVDtFQUNBLFFBQVEsR0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0Q7RUFDQSxRQUFRLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztFQUNsRCxRQUFRLEtBQUssQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ2xDO0VBQ0EsUUFBUSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDNUQsUUFBUSxLQUFLLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDOUQsUUFBUSxLQUFLLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzFELFFBQVEsS0FBSyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUN0RCxRQUFRLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDeEQ7RUFDQSxRQUFRLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQ3hFLFFBQVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7RUFDM0UsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7RUFDdkUsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDbkUsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckU7QUFDQTtFQUNBLFFBQVEsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7RUFDbkMsUUFBUSxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztFQUNsQyxRQUFRLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0VBQ2xDLFFBQVEsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7QUFDckM7RUFDQTtFQUNBO0VBQ0EsUUFBUSxJQUFJLEdBQUcsQ0FBQyxTQUFTLEtBQUssR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO0VBQ3JFLFlBQVksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7RUFDekMsU0FBUztFQUNULEtBQUs7QUFDTDtFQUNBLElBQUksb0JBQW9CLEVBQUUsWUFBWTtFQUN0QyxRQUFRLElBQUksS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUNqRDtFQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsWUFBWSxPQUFPO0VBQ25CLFNBQVM7QUFDVDtFQUNBLFFBQVEsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQjtFQUMxRCxZQUFZLEdBQUcsQ0FBQyxrQkFBa0I7RUFDbEMsWUFBWSxHQUFHLENBQUMsbUJBQW1CO0VBQ25DLFlBQVksR0FBRyxDQUFDLG1CQUFtQjtFQUNuQyxZQUFZLEdBQUcsQ0FBQywwQkFBMEI7RUFDMUMsWUFBWSxHQUFHLENBQUMsbUJBQW1CO0VBQ25DLFlBQVksR0FBRyxDQUFDLGtCQUFrQjtFQUNsQyxZQUFZLEdBQUcsQ0FBQyxNQUFNO0VBQ3RCLFlBQVksR0FBRyxDQUFDLGdCQUFnQjtFQUNoQyxZQUFZLEdBQUcsQ0FBQyxTQUFTO0VBQ3pCLFNBQVMsQ0FBQztFQUNWLEtBQUs7QUFDTDtFQUNBLElBQUksaUJBQWlCLEVBQUUsV0FBVztFQUNsQyxRQUFRLElBQUksS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUNqRDtFQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7RUFDdkIsWUFBWSxPQUFPO0VBQ25CLFNBQVM7QUFDVDtFQUNBLFFBQVEsR0FBRyxDQUFDLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdEYsUUFBUSxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7RUFDbkQsUUFBUSxHQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzdDLFFBQVEsR0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDN0QsS0FBSztBQUNMO0VBQ0EsSUFBSSxpQkFBaUIsRUFBRSxZQUFZO0VBQ25DLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQ2pEO0VBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtFQUN2QixZQUFZLE9BQU87RUFDbkIsU0FBUztBQUNUO0VBQ0EsUUFBUSxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQ2hHLFFBQVEsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxDQUFDO0VBQ25ELFFBQVEsR0FBRyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUM3QyxRQUFRLEdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzdELEtBQUs7QUFDTDtFQUNBLElBQUksa0JBQWtCLEVBQUUsWUFBWTtFQUNwQyxRQUFRLElBQUksS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUNqRDtFQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUU7RUFDeEIsWUFBWSxPQUFPO0VBQ25CLFNBQVM7QUFDVDtFQUNBO0VBQ0E7RUFDQSxRQUFRLElBQUk7RUFDWixZQUFZLEdBQUcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMsY0FBYztFQUMxRCxnQkFBZ0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO0VBQzNFLGdCQUFnQixHQUFHLENBQUMsU0FBUztFQUM3QixhQUFhLENBQUM7RUFDZCxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUU7RUFDckIsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7RUFDaEcsU0FBUztFQUNULEtBQUs7QUFDTDtFQUNBLElBQUksU0FBUyxFQUFFLFVBQVUsS0FBSyxFQUFFO0VBQ2hDLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVTtFQUNoRCxZQUFZLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPO0VBQ25ELFlBQVksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJO0VBQzlCLFlBQVksWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQy9DO0VBQ0E7RUFDQTtFQUNBLFFBQVEsS0FBSyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxtQkFBbUIsSUFBSSxRQUFRLEtBQUssQ0FBQyxDQUFDO0VBQ2hGLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUI7RUFDdEMsYUFBYSxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUM7RUFDL0UsVUFBVTtFQUNWLFlBQVksUUFBUSxHQUFHLENBQUMsQ0FBQztFQUN6QixTQUFTO0FBQ1Q7RUFDQSxRQUFRLEtBQUssQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDO0FBQzVDO0VBQ0E7RUFDQSxRQUFRLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDL0YsUUFBUSxJQUFJLFFBQVEsS0FBSyxDQUFDLElBQUksYUFBYSxFQUFFO0VBQzdDLFlBQVksR0FBRyxDQUFDLHNCQUFzQixHQUFHLGFBQWEsQ0FBQztFQUN2RCxTQUFTLE1BQU07RUFDZixZQUFZLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7RUFDL0MsU0FBUztFQUNULEtBQUs7QUFDTDtFQUNBLElBQUksUUFBUSxFQUFFLFlBQVk7RUFDMUIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDekMsS0FBSztBQUNMO0VBQ0EsSUFBSSxPQUFPLEVBQUUsWUFBWTtFQUN6QixRQUFRLElBQUksS0FBSyxHQUFHLElBQUk7RUFDeEIsWUFBWSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUNuQztFQUNBLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzlGLEtBQUs7QUFDTDtFQUNBLElBQUksS0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0VBQ3hCLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBRSxTQUFPO0VBQ3hFLFFBQVEsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2xDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUN6QixLQUFLO0FBQ0w7RUFDQSxJQUFJLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTtFQUN6QixRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUUsU0FBTztFQUN4RSxRQUFRLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNsQyxLQUFLO0FBQ0w7RUFDQSxJQUFJLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxFQUFFO0VBQ3BDLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSTtFQUN4QixZQUFZLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVTtFQUNsQyxZQUFZLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtFQUM5QixZQUFZLFVBQVUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUs7RUFDNUMsWUFBWSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQzVCO0VBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRTtFQUNoQyxZQUFZLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUN6RixTQUFTLE1BQU07RUFDZixZQUFZLFVBQVUsR0FBRyxVQUFVLENBQUM7RUFDcEMsU0FBUztBQUNUO0VBQ0EsUUFBUSxJQUFJO0VBQ1osWUFBWSxJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUU7RUFDakMsZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztFQUM1RCxhQUFhLE1BQU07RUFDbkIsZ0JBQWdCLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztFQUNqRSxhQUFhO0FBQ2I7RUFDQSxZQUFZLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMvQixTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUU7RUFDckI7RUFDQSxTQUFTO0VBQ1QsS0FBSztBQUNMO0VBQ0EsSUFBSSxPQUFPLEVBQUUsVUFBVSxLQUFLLEVBQUU7RUFDOUIsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxVQUFVO0VBQ2hELFlBQVksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDL0I7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsUUFBUSxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDN0YsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsc0JBQXNCLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtFQUMvRSxZQUFZLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUMxRixTQUFTO0FBQ1Q7RUFDQTtFQUNBLFFBQVEsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFO0VBQ3ZCLFlBQVksSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtFQUN4RSxnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ3BHLGFBQWEsTUFBTTtFQUNuQixnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUM5RCxhQUFhO0VBQ2IsWUFBWSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUNyQztFQUNBLFlBQVksT0FBTztFQUNuQixTQUFTO0FBQ1Q7RUFDQTtFQUNBLFFBQVEsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFO0VBQ3pCO0VBQ0E7RUFDQSxZQUFZLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsaUJBQWlCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7RUFDM0UsZ0JBQWdCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0VBQ2hDLGFBQWEsTUFBTTtFQUNuQixnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ2hFLGFBQWE7RUFDYixZQUFZLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3JDO0VBQ0EsWUFBWSxPQUFPO0VBQ25CLFNBQVM7QUFDVDtFQUNBO0VBQ0EsUUFBUSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7RUFDdEIsWUFBWSxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUM5RCxTQUFTO0FBQ1Q7RUFDQTtFQUNBLFFBQVEsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO0VBQ3RCLFlBQVksS0FBSyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDOUQsU0FBUztBQUNUO0VBQ0E7RUFDQSxRQUFRLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMzRTtFQUNBO0VBQ0EsUUFBUSxLQUFLLEdBQUcsSUFBSSxDQUFDLHNCQUFzQjtFQUMzQyxZQUFZLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxZQUFZO0VBQy9DLFlBQVksR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLGlCQUFpQjtFQUM1RSxTQUFTLENBQUM7QUFDVjtFQUNBO0VBQ0EsUUFBUSxLQUFLLEdBQUcsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDdEU7RUFDQTtFQUNBLFFBQVEsS0FBSyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLEtBQUssQ0FBQztFQUM1RCxRQUFRLEtBQUssR0FBRyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUM7QUFDNUQ7RUFDQTtFQUNBLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtFQUNwRSxZQUFZLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN2QztFQUNBO0VBQ0EsWUFBWSxJQUFJLEdBQUcsQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFO0VBQ3hDLGdCQUFnQixHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztFQUNuQyxnQkFBZ0IsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDekM7RUFDQSxnQkFBZ0IsT0FBTztFQUN2QixhQUFhO0VBQ2IsU0FBUztBQUNUO0VBQ0E7RUFDQSxRQUFRLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRTtFQUM1QixZQUFZLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUN0RCxTQUFTO0FBQ1Q7RUFDQTtFQUNBLFFBQVEsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuRDtFQUNBO0VBQ0EsUUFBUSxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUI7RUFDM0MsWUFBWSxLQUFLO0VBQ2pCLFlBQVksR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsWUFBWTtFQUN4QyxZQUFZLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsaUJBQWlCO0VBQ2hFLFNBQVMsQ0FBQztBQUNWO0VBQ0EsUUFBUSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztFQUNqQyxLQUFLO0FBQ0w7RUFDQSxJQUFJLDRCQUE0QixFQUFFLFVBQVUsS0FBSyxFQUFFO0VBQ25ELFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVTtFQUNoRCxZQUFZLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtFQUM5QixZQUFZLGNBQWMsQ0FBQztBQUMzQjtFQUNBO0VBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRTtFQUNwRSxZQUFZLE9BQU87RUFDbkIsU0FBUztBQUNUO0VBQ0EsUUFBUSxjQUFjLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDNUY7RUFDQSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztFQUMzQyxRQUFRLEdBQUcsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDN0MsUUFBUSxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3REO0VBQ0E7RUFDQSxRQUFRLElBQUksR0FBRyxDQUFDLGNBQWMsS0FBSyxjQUFjLENBQUMsSUFBSSxFQUFFO0VBQ3hELFlBQVksR0FBRyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO0FBQ3JEO0VBQ0EsWUFBWSxHQUFHLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDeEUsU0FBUztFQUNULEtBQUs7QUFDTDtFQUNBLElBQUksZ0JBQWdCLEVBQUUsWUFBWTtFQUNsQyxRQUFRLElBQUksS0FBSyxHQUFHLElBQUk7RUFDeEIsWUFBWSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUk7RUFDOUIsWUFBWSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUNuQztFQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7RUFDNUIsWUFBWSxPQUFPO0VBQ25CLFNBQVM7QUFDVDtFQUNBLFFBQVEsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7RUFDaEQsUUFBUSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztFQUMzQyxRQUFRLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDbEM7RUFDQSxRQUFRLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkc7RUFDQTtFQUNBO0VBQ0EsUUFBUSxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7RUFDN0IsWUFBWSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVk7RUFDMUMsZ0JBQWdCLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztFQUMvQyxnQkFBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQzlFLGdCQUFnQixLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztFQUMzQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEI7RUFDQSxZQUFZLE9BQU87RUFDbkIsU0FBUztBQUNUO0VBQ0EsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7RUFDdkMsUUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDdEUsUUFBUSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztFQUNuQyxLQUFLO0FBQ0w7RUFDQSxJQUFJLGtCQUFrQixFQUFFLFlBQVk7RUFDcEMsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJO0VBQ3hCLFlBQVksR0FBRyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDbkM7RUFDQSxRQUFRLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtFQUN2QyxZQUFZLE1BQU0sRUFBRTtFQUNwQixnQkFBZ0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0VBQ2pDLGdCQUFnQixRQUFRLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRTtFQUM3QyxhQUFhO0VBQ2IsU0FBUyxDQUFDLENBQUM7RUFDWCxLQUFLO0FBQ0w7RUFDQSxJQUFJLGtCQUFrQixFQUFFLFVBQVUsZUFBZSxFQUFFO0VBQ25ELFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQ2pEO0VBQ0EsUUFBUSxHQUFHLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztFQUM5QyxRQUFRLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0VBQ25DLFFBQVEsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0VBQ3pCLEtBQUs7QUFDTDtFQUNBLElBQUksV0FBVyxFQUFFLFVBQVUsS0FBSyxFQUFFO0VBQ2xDLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQ2pEO0VBQ0EsUUFBUSxLQUFLLEdBQUcsS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDOUU7RUFDQSxRQUFRLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRTtFQUN6QixZQUFZLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztFQUMvRCxTQUFTO0FBQ1Q7RUFDQSxRQUFRLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7QUFDM0M7RUFDQSxRQUFRLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztFQUNwQyxRQUFRLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDN0IsS0FBSztBQUNMO0VBQ0EsSUFBSSxXQUFXLEVBQUUsWUFBWTtFQUM3QixRQUFRLElBQUksS0FBSyxHQUFHLElBQUk7RUFDeEIsWUFBWSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVU7RUFDbEMsWUFBWSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUk7RUFDOUIsWUFBWSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDM0M7RUFDQSxRQUFRLElBQUksR0FBRyxDQUFDLGtCQUFrQixFQUFFO0VBQ3BDLFlBQVksUUFBUSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdEksU0FBUztBQUNUO0VBQ0EsUUFBUSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7RUFDekIsWUFBWSxRQUFRLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUNsRSxTQUFTLE1BQU07RUFDZixZQUFZLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUNyRixTQUFTO0FBQ1Q7RUFDQSxRQUFRLE9BQU8sUUFBUSxDQUFDO0VBQ3hCLEtBQUs7QUFDTDtFQUNBLElBQUksZ0JBQWdCLEVBQUUsWUFBWTtFQUNsQyxRQUFRLElBQUksS0FBSyxHQUFHLElBQUk7RUFDeEIsWUFBWSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUNuQztFQUNBLFFBQVEsT0FBTyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUM7RUFDcEUsS0FBSztBQUNMO0VBQ0EsSUFBSSxnQkFBZ0IsRUFBRSxZQUFZO0VBQ2xDLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSTtFQUN4QixZQUFZLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQ25DO0VBQ0EsUUFBUSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQztFQUNwRSxLQUFLO0FBQ0w7RUFDQSxJQUFJLGlCQUFpQixFQUFFLFlBQVk7RUFDbkMsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0VBQ2xDLEtBQUs7QUFDTDtFQUNBLElBQUksT0FBTyxFQUFFLFlBQVk7RUFDekIsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDekI7RUFDQSxRQUFRLEtBQUssQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQzNFLFFBQVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7RUFDOUUsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7RUFDMUUsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDdEUsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDeEUsS0FBSztBQUNMO0VBQ0EsSUFBSSxRQUFRLEVBQUUsWUFBWTtFQUMxQixRQUFRLE9BQU8saUJBQWlCLENBQUM7RUFDakMsS0FBSztFQUNMLENBQUMsQ0FBQztBQUNGO0VBQ0EsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDO0VBQzdDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDO0VBQ3ZDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDO0VBQ3ZDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7RUFDekMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0VBQ2pELE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0VBQ3JCLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQztBQUMvQztFQUNBO0VBQ0EsQ0FBQyxDQUFDLE9BQU8sY0FBYyxLQUFLLFFBQVEsSUFBSSxjQUFjLElBQUksY0FBYyxHQUFHLE1BQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDdEc7RUFDQTtFQUNBLElBQUksUUFBUSxHQUFHLE1BQU07Ozs7RUNwK0NyQixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDQyxXQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBQyxPQUFPLElBQUksR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25nRTtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDeEg7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBQyxPQUFPLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUMsT0FBTyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFDLE1BQU0sS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFDLElBQUksQ0FBQyxDQUFDLEVBQUVBLFdBQVMsQ0FBQyxDQUFDLENBQUMsS0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsR0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3YzTztFQUNBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyw0RUFBNEUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNIQUFzSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZFQUE2RSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseURBQXlELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxRUFBcUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJJQUEySSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNLQUFzSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVLQUF1SyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4REFBOEQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtXQUFrVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrTkFBK04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtNQUErTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLCtIQUErSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0RBQWdELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyR0FBMkcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtRkFBbUYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9GQUFvRixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkdBQTZHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUVBQWlFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUZBQW1GLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkZBQTZGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4a0JBQThrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDhrQkFBOGtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdHQUFnRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkVBQTJFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUdBQWlHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrSUFBa0ksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLHVGQUF1RixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0RBQWdELENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBT0MsZ0JBQU0sRUFBRUEsZ0JBQU0sQ0FBQ0EsZ0JBQU0sQ0FBQyxNQUFNLENBQUM7O0VDbEQ1NjFCLElBQUksQ0FBQyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUMsT0FBTyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQWdCLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUMsVUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFTLEdBQUcsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBQyxPQUFPLENBQUM7O0VDQTlxRDtFQVlBOzs7Ozs7RUFLQSxJQUFNQyxTQUFOLEdBTUVuTCxrQkFBVyxDQUFDeUQsT0FBRCxFQUFVOzs7RUFDbkIsT0FBS0EsT0FBTCxHQUFlQSxPQUFmO0VBRUE7Ozs7RUFHQSxPQUFLRixRQUFMLEdBQWdCNEgsU0FBUyxDQUFDNUgsUUFBMUI7RUFFQSxPQUFLTyxTQUFMLEdBQWlCcUgsU0FBUyxDQUFDckgsU0FBM0I7RUFFQSxPQUFLQyxPQUFMLEdBQWVvSCxTQUFTLENBQUNwSCxPQUF6QjtFQUVBLE9BQUtxSCxPQUFMLEdBQWVELFNBQVMsQ0FBQ0MsT0FBekI7RUFFQSxPQUFLQyxRQUFMLEdBQWdCRixTQUFTLENBQUNFLFFBQTFCO0VBRUEsT0FBS0MsSUFBTCxHQUFZSCxTQUFTLENBQUNHLElBQXRCO0VBRUE7Ozs7RUFHQSxPQUFLQyxLQUFMLEdBQWEsS0FBSzlILE9BQUwsQ0FBYXhDLGFBQWIsQ0FBMkIsS0FBSzZDLFNBQUwsQ0FBZTBILEtBQTFDLENBQWI7O0VBRUEsTUFBSSxLQUFLRCxLQUFULEVBQWdCO0VBQ2QsU0FBS0UsTUFBTCxHQUFjLElBQUlDLFFBQUosQ0FBVyxLQUFLSCxLQUFoQixFQUF1QjtFQUNuQ0EsTUFBQUEsS0FBSyxFQUFFLElBRDRCO0VBRW5DSSxNQUFBQSxlQUFlLEVBQUUsSUFGa0I7RUFHbkNDLE1BQUFBLFNBQVMsRUFBRTtFQUh3QixLQUF2QixDQUFkO0VBTUEsU0FBS0wsS0FBTCxDQUFXMUssWUFBWCxDQUF3QixTQUF4QixFQUFtQyxLQUFLd0ssUUFBTCxDQUFjRyxLQUFqRDtFQUVBLFNBQUtLLElBQUwsR0FBWSxNQUFaO0VBQ0QsR0FWRCxNQVVPO0VBQ0wsU0FBS0EsSUFBTCxHQUFZLE9BQVo7RUFDRDtFQUVEOzs7OztFQUdBLE9BQUtDLElBQUwsR0FBWSxJQUFJQyxLQUFKLENBQVUsS0FBS3RJLE9BQUwsQ0FBYXhDLGFBQWIsQ0FBMkIsS0FBSzZDLFNBQUwsQ0FBZWtJLElBQTFDLENBQVYsQ0FBWjtFQUVBLE9BQUtGLElBQUwsQ0FBVVYsT0FBVixHQUFvQixLQUFLQSxPQUF6QjtFQUVBLE9BQUtVLElBQUwsQ0FBVWhJLFNBQVYsR0FBc0I7RUFDcEIsZ0JBQVksS0FBS0EsU0FBTCxDQUFlbUksUUFEUDtFQUVwQiw0QkFBd0IsS0FBS25JLFNBQUwsQ0FBZWtJO0VBRm5CLEdBQXRCO0VBS0EsT0FBS0YsSUFBTCxDQUFVRSxJQUFWLENBQWVsTCxnQkFBZixDQUFnQyxRQUFoQyxZQUEyQ0MsT0FBVTtFQUNuREEsSUFBQUEsS0FBSyxDQUFDSSxjQUFOO0VBRUEsUUFBSXZCLE9BQUtrTSxJQUFMLENBQVVJLEtBQVYsQ0FBZ0JuTCxLQUFoQixNQUEyQixLQUEvQixJQUNFLE9BQU8sS0FBUDtFQUVGLFdBQUtvTCxRQUFMLEdBQ0dDLFVBREgsR0FFR0MsTUFGSCxDQUVVdEwsS0FGVixFQUdHc0gsSUFISCxXQUdRQyxtQkFBWUEsUUFBUSxDQUFDRSxJQUFULEtBSHBCLEVBSUdILElBSkgsV0FJUUMsVUFBWTtFQUNoQixhQUFLQSxRQUFMLENBQWNBLFFBQWQ7RUFDRCxLQU5ILEVBTUtLLEtBTkwsV0FNV2xDLE1BQVE7RUFDZixRQUNFZ0MsT0FBTyxDQUFDQyxHQUFSLENBQVlqQyxJQUFaO0VBQ0gsS0FUSDtFQVVELEdBaEJEO0VBa0JBOzs7O0VBR0EsT0FBS3JGLE1BQUwsR0FBYyxJQUFJd0MsTUFBSixDQUFXO0VBQ3ZCSCxJQUFBQSxPQUFPLEVBQUUsS0FBS0EsT0FBTCxDQUFheEMsYUFBYixDQUEyQixLQUFLNkMsU0FBTCxDQUFlSSxNQUExQyxDQURjO0VBRXZCb0ksSUFBQUEsS0FBSyxjQUFRO0VBQ1gsYUFBSzdJLE9BQUwsQ0FBYXhDLGFBQWIsQ0FBMkJyQixPQUFLa0UsU0FBTCxDQUFleUksS0FBMUMsRUFBaURDLEtBQWpEO0VBQ0Q7RUFKc0IsR0FBWCxDQUFkO0VBT0EsU0FBTyxJQUFQOzs7Ozs7OztzQkFPRkwsZ0NBQVc7RUFDVDtFQUNBLE9BQUtNLEtBQUwsR0FBYUMsU0FBUyxDQUFDLEtBQUtaLElBQUwsQ0FBVUUsSUFBWCxFQUFpQjtFQUFDVyxJQUFBQSxJQUFJLEVBQUU7RUFBUCxHQUFqQixDQUF0QixDQUZTOztFQUtULE1BQUksS0FBS3BCLEtBQUwsSUFBYyxLQUFLa0IsS0FBTCxDQUFXRyxFQUE3QixJQUNFLEtBQUtILEtBQUwsQ0FBV0csRUFBWCxHQUFnQixLQUFLSCxLQUFMLENBQVdHLEVBQVgsQ0FBY0MsT0FBZCxDQUFzQixNQUF0QixFQUE4QixFQUE5QixDQUFoQjtFQUVGLFNBQU8sSUFBUDs7Ozs7Ozs7c0JBT0ZULG9DQUFhO0VBQ1g7RUFDQSxNQUFJVSxNQUFNLEdBQUcsS0FBS2hCLElBQUwsQ0FBVUUsSUFBVixDQUFlMUgsZ0JBQWYsQ0FBZ0MsS0FBS1IsU0FBTCxDQUFlaUosTUFBL0MsQ0FBYjs7RUFFQSxPQUFLcE4sSUFBSUUsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR2lOLE1BQU0sQ0FBQ3RJLE1BQTNCLEVBQW1DM0UsQ0FBQyxFQUFwQyxJQUNFaU4sTUFBTSxDQUFDak4sQ0FBRCxDQUFOLENBQVVnQixZQUFWLENBQXVCLFVBQXZCLEVBQW1DLElBQW5DOztFQUVGLE1BQUltTSxNQUFNLEdBQUcsS0FBS2xCLElBQUwsQ0FBVUUsSUFBVixDQUFlL0ssYUFBZixDQUE2QixLQUFLNkMsU0FBTCxDQUFlbUosTUFBNUMsQ0FBYjtFQUVBRCxFQUFBQSxNQUFNLENBQUNuTSxZQUFQLENBQW9CLFVBQXBCLEVBQWdDLElBQWhDLEVBVFc7O0VBWVgsT0FBS2lMLElBQUwsQ0FBVUUsSUFBVixDQUFleEwsU0FBZixDQUF5QkMsR0FBekIsQ0FBNkIsS0FBS3NELE9BQUwsQ0FBYW1KLFVBQTFDO0VBRUEsU0FBTyxJQUFQOzs7Ozs7OztzQkFPRmIsNEJBQVM7OztFQUNQO0VBQ0E7RUFDQTtFQUNBLE1BQUljLFFBQVEsR0FBRyxJQUFJQyxlQUFKLEVBQWY7RUFFQWpMLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLEtBQUtxSyxLQUFqQixFQUF3QnBLLEdBQXhCLFdBQTRCZ0wsR0FBSztFQUMvQkYsSUFBQUEsUUFBUSxDQUFDRyxNQUFULENBQWdCRCxDQUFoQixFQUFtQnpOLE9BQUs2TSxLQUFMLENBQVdZLENBQVgsQ0FBbkI7RUFDRCxHQUZEO0VBSUEsTUFBSUUsSUFBSSxHQUFHbk4sUUFBUSxDQUFDYSxhQUFULENBQXVCLE1BQXZCLENBQVg7O0VBRUEsTUFBSXNNLElBQUksQ0FBQ0MsWUFBTCxDQUFrQixNQUFsQixDQUFKLEVBQStCO0VBQzdCTCxJQUFBQSxRQUFRLENBQUNHLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0JDLElBQUksQ0FBQ2pOLFlBQUwsQ0FBa0IsTUFBbEIsQ0FBeEI7RUFDRDs7RUFFRCxTQUFPOEgsS0FBSyxDQUFDLEtBQUswRCxJQUFMLENBQVVFLElBQVYsQ0FBZTFMLFlBQWYsQ0FBNEIsUUFBNUIsQ0FBRCxFQUF3QztFQUNsRG1OLElBQUFBLE1BQU0sRUFBRSxLQUFLM0IsSUFBTCxDQUFVRSxJQUFWLENBQWUxTCxZQUFmLENBQTRCLFFBQTVCLENBRDBDO0VBRWxEc0IsSUFBQUEsSUFBSSxFQUFFdUw7RUFGNEMsR0FBeEMsQ0FBWjs7Ozs7Ozs7O3NCQVdGN0UsOEJBQVM3QixJQUFELEVBQU87RUFDYixNQUFJQSxJQUFJLENBQUNpSCxPQUFULEVBQWtCO0VBQ2hCLFNBQUtBLE9BQUw7RUFDRCxHQUZELE1BRU87RUFDTCxRQUFJakgsSUFBSSxDQUFDbUMsS0FBTCxLQUFlLEtBQW5CLEVBQTBCO0VBQ3hCLFdBQUsrRSxRQUFMLENBQWMsb0JBQWQsRUFBb0NDLE1BQXBDO0VBQ0QsS0FGRCxNQUVPO0VBQ0wsV0FBS0QsUUFBTCxDQUFjLFFBQWQsRUFBd0JDLE1BQXhCO0VBQ0Q7RUFDRjs7RUFFRCxJQUNFbkYsT0FBTyxDQUFDQyxHQUFSLENBQVlqQyxJQUFaO0VBRUYsU0FBTyxJQUFQOzs7Ozs7Ozs7c0JBUUZpSCw4QkFBVTs7O0VBQ1IsT0FBSzVCLElBQUwsQ0FBVUUsSUFBVixDQUFleEwsU0FBZixDQUNHcU0sT0FESCxDQUNXLEtBQUs5SSxPQUFMLENBQWFtSixVQUR4QixFQUNvQyxLQUFLbkosT0FBTCxDQUFhOEosT0FEakQ7RUFHQSxPQUFLRCxNQUFMO0VBRUEsT0FBSzlCLElBQUwsQ0FBVUUsSUFBVixDQUFlbEwsZ0JBQWYsQ0FBZ0MsT0FBaEMsY0FBK0M7RUFDN0MsV0FBS2dMLElBQUwsQ0FBVUUsSUFBVixDQUFleEwsU0FBZixDQUF5Qm1CLE1BQXpCLENBQWdDL0IsT0FBS21FLE9BQUwsQ0FBYThKLE9BQTdDO0VBQ0QsR0FGRCxFQU5ROztFQVdSLE1BQUksS0FBS3ZDLElBQVQsSUFBZSxLQUFLQSxJQUFMLENBQVUsSUFBVjtFQUVmLFNBQU8sSUFBUDs7Ozs7Ozs7O3NCQVFGMUMsd0JBQU1OLFFBQUQsRUFBVztFQUNkLE9BQUtxRixRQUFMLENBQWMsUUFBZCxFQUF3QkMsTUFBeEI7RUFFQSxJQUNFbkYsT0FBTyxDQUFDQyxHQUFSLENBQVlKLFFBQVo7RUFFRixTQUFPLElBQVA7Ozs7Ozs7Ozs7c0JBU0ZxRiw4QkFBU0csR0FBRCxFQUFNO0VBQ1o7RUFDQSxNQUFJQyxPQUFPLEdBQUczTixRQUFRLENBQUM0TixhQUFULENBQXVCLEtBQXZCLENBQWQsQ0FGWTs7RUFLWkQsRUFBQUEsT0FBTyxDQUFDdk4sU0FBUixDQUFrQkMsR0FBbEIsUUFBeUIsS0FBS3NELE9BQUwsQ0FBYStKLEdBQWIsTUFBb0IsS0FBSy9KLE9BQUwsQ0FBYWtLO0VBQzFERixFQUFBQSxPQUFPLENBQUN6RCxTQUFSLEdBQW9CLEtBQUtjLE9BQUwsQ0FBYTBDLEdBQWIsQ0FBcEIsQ0FOWTs7RUFTWixPQUFLaEMsSUFBTCxDQUFVRSxJQUFWLENBQWVrQyxZQUFmLENBQTRCSCxPQUE1QixFQUFxQyxLQUFLakMsSUFBTCxDQUFVRSxJQUFWLENBQWVtQyxVQUFmLENBQTBCLENBQTFCLENBQXJDO0VBQ0EsT0FBS3JDLElBQUwsQ0FBVUUsSUFBVixDQUFleEwsU0FBZixDQUF5QkMsR0FBekIsQ0FBNkIsS0FBS3NELE9BQUwsQ0FBYStKLEdBQWIsQ0FBN0I7RUFFQSxTQUFPLElBQVA7Ozs7Ozs7O3NCQU9GRiw0QkFBUztFQUNQO0VBQ0EsTUFBSWQsTUFBTSxHQUFHLEtBQUtoQixJQUFMLENBQVVFLElBQVYsQ0FBZTFILGdCQUFmLENBQWdDLEtBQUtSLFNBQUwsQ0FBZWlKLE1BQS9DLENBQWI7O0VBRUEsT0FBS3BOLElBQUlFLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdpTixNQUFNLENBQUN0SSxNQUEzQixFQUFtQzNFLENBQUMsRUFBcEMsSUFDRWlOLE1BQU0sQ0FBQ2pOLENBQUQsQ0FBTixDQUFVdU8sZUFBVixDQUEwQixVQUExQjs7RUFFRixNQUFJcEIsTUFBTSxHQUFHLEtBQUtsQixJQUFMLENBQVVFLElBQVYsQ0FBZS9LLGFBQWYsQ0FBNkIsS0FBSzZDLFNBQUwsQ0FBZW1KLE1BQTVDLENBQWI7RUFFQUQsRUFBQUEsTUFBTSxDQUFDb0IsZUFBUCxDQUF1QixVQUF2QixFQVRPOztFQVlQLE9BQUt0QyxJQUFMLENBQVVFLElBQVYsQ0FBZXhMLFNBQWYsQ0FBeUJtQixNQUF6QixDQUFnQyxLQUFLb0MsT0FBTCxDQUFhbUosVUFBN0M7RUFFQSxTQUFPLElBQVA7O0VBSUo7OztFQUNBL0IsU0FBUyxDQUFDNUgsUUFBVixHQUFxQix3QkFBckI7RUFFQTs7RUFDQTRILFNBQVMsQ0FBQ3JILFNBQVYsR0FBc0I7RUFDcEJrSSxFQUFBQSxJQUFJLEVBQUUsTUFEYztFQUVwQmUsRUFBQUEsTUFBTSxFQUFFLE9BRlk7RUFHcEJ2QixFQUFBQSxLQUFLLEVBQUUsbUJBSGE7RUFJcEJ5QixFQUFBQSxNQUFNLEVBQUUsdUJBSlk7RUFLcEJoQixFQUFBQSxRQUFRLEVBQUUsbUJBTFU7RUFNcEIvSCxFQUFBQSxNQUFNLEVBQUUsa0NBTlk7RUFPcEJxSSxFQUFBQSxLQUFLLEVBQUU7RUFQYSxDQUF0QjtFQVVBOzs7OztFQUlBcEIsU0FBUyxDQUFDcEgsT0FBVixHQUFvQjtFQUNsQnNLLEVBQUFBLEtBQUssRUFBRSxPQURXO0VBRWxCQyxFQUFBQSxNQUFNLEVBQUUsT0FGVTtFQUdsQkMsRUFBQUEsa0JBQWtCLEVBQUUsT0FIRjtFQUlsQk4sRUFBQUEsT0FBTyxFQUFFLFVBSlM7RUFLbEJmLEVBQUFBLFVBQVUsRUFBRSxZQUxNO0VBTWxCVyxFQUFBQSxPQUFPLEVBQUU7RUFOUyxDQUFwQjtFQVNBOzs7O0VBR0ExQyxTQUFTLENBQUNDLE9BQVYsR0FBb0I7RUFDbEJrRCxFQUFBQSxNQUFNLEVBQUUsK0NBRFU7RUFFbEJDLEVBQUFBLGtCQUFrQixFQUFFLCtEQUZGO0VBR2xCQyxFQUFBQSxjQUFjLEVBQUUsa0JBSEU7RUFJbEJDLEVBQUFBLG1CQUFtQixFQUFFLDZCQUpIO0VBS2xCQyxFQUFBQSxpQkFBaUIsRUFBRTtFQUxELENBQXBCO0VBUUE7Ozs7RUFHQXZELFNBQVMsQ0FBQ0UsUUFBVixHQUFxQjtFQUNuQkcsRUFBQUEsS0FBSyxFQUFFO0VBRFksQ0FBckI7RUFJQUwsU0FBUyxDQUFDRyxJQUFWLEdBQWlCLEtBQWpCOztFQ2xUQTs7OztFQUdBLElBQU1xRCxRQUFOLEdBSUUzTyxpQkFBVyxHQUFHOzs7RUFDWixPQUFLdUQsUUFBTCxHQUFnQm9MLFFBQVEsQ0FBQ3BMLFFBQXpCO0VBRUEsT0FBSzJFLFFBQUwsR0FBZ0J5RyxRQUFRLENBQUN6RyxRQUF6Qjs7RUFFQSxNQUFJMEcsU0FBUyxDQUFDQyxLQUFkLEVBQXFCO0VBQ25CO0VBQ0F6TyxJQUFBQSxRQUFRLENBQUNrRSxnQkFBVCxDQUEwQixLQUFLZixRQUEvQixFQUF5Q0MsT0FBekMsV0FBaURzTCxNQUFRO0VBQ3ZEQSxNQUFBQSxJQUFJLENBQUNWLGVBQUwsQ0FBcUIsZUFBckI7RUFDQVUsTUFBQUEsSUFBSSxDQUFDVixlQUFMLENBQXFCLGVBQXJCO0VBQ0QsS0FIRCxFQUZtQjs7RUFRbkJoTyxJQUFBQSxRQUFRLENBQUNhLGFBQVQsQ0FBdUIsTUFBdkIsRUFBK0JILGdCQUEvQixDQUFnRCxPQUFoRCxZQUF5REMsT0FBUztFQUNoRSxVQUFJLENBQUNBLEtBQUssQ0FBQ2lELE1BQU4sQ0FBYUMsT0FBYixDQUFxQnJFLE9BQUsyRCxRQUExQixDQUFMLElBQ0U7RUFFRixhQUFLRSxPQUFMLEdBQWUxQyxLQUFLLENBQUNpRCxNQUFyQjtFQUVBLGFBQUt5QyxJQUFMLEdBQVlXLElBQUksQ0FBQ0MsS0FBTCxDQUFXekgsT0FBSzZELE9BQUwsQ0FBYXFCLE9BQWIsQ0FBcUJpSyxRQUFoQyxDQUFaO0VBRUEsYUFBS0YsS0FBTCxDQUFXalAsT0FBSzZHLElBQWhCO0VBQ0QsS0FURDtFQVVELEdBbEJELE1Ba0JPO0VBQ0w7RUFDQSxTQUFLckYsTUFBTCxHQUFjLElBQUl3QyxNQUFKLENBQVc7RUFDdkJMLE1BQUFBLFFBQVEsRUFBRSxLQUFLQTtFQURRLEtBQVgsQ0FBZDtFQUdEOztFQUVELFNBQU8sSUFBUDs7Ozs7Ozs7Ozs7cUJBVUZzTCx3QkFBTXBJLElBQUQsRUFBWTtpQ0FBUCxHQUFHOztFQUNYLFNBQU9tSSxTQUFTLENBQUNDLEtBQVYsQ0FBZ0JwSSxJQUFoQixFQUNKNEIsSUFESSxXQUNDMkcsS0FBTztFQUNYTCxJQUFBQSxRQUFRLENBQUN6RyxRQUFULENBQWtCekIsSUFBbEI7RUFDRCxHQUhJLEVBR0ZrQyxLQUhFLFdBR0lzRyxLQUFPO0VBQ2QsSUFBMkM7RUFDekN4RyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWXVHLEdBQVo7RUFDRDtFQUNGLEdBUEksQ0FBUDs7RUFXSjs7O0VBQ0FOLFFBQVEsQ0FBQ3BMLFFBQVQsR0FBb0Isd0JBQXBCO0VBRUE7O0VBQ0FvTCxRQUFRLENBQUN6RyxRQUFULGVBQTBCO0VBQ3hCLEVBQTJDO0VBQ3pDTyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxVQUFaO0VBQ0Q7RUFDRixDQUpEOztFQ25FQTtFQUNBLFNBQVMsTUFBTSxJQUFJOztBQUFDO0VBQ3BCLEVBQUUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0VBQ2xCLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDN0MsSUFBSSxJQUFJLFVBQVUsR0FBR3VDLFdBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNsQyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksVUFBVSxFQUFFO0VBQ2hDLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNwQyxLQUFLO0VBQ0wsR0FBRztFQUNILEVBQUUsT0FBTyxNQUFNO0VBQ2YsQ0FBQztBQUNEO0VBQ0EsU0FBUyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0VBQ3BCLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDO0VBQzFELENBQUM7QUFDRDtFQUNBLFNBQVMsSUFBSSxFQUFFLFNBQVMsRUFBRTtFQUMxQixFQUFFLFNBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFO0VBQ3hDLElBQUksSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7RUFDekMsTUFBTSxNQUFNO0VBQ1osS0FBSztBQUNMO0VBQ0EsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEQ7RUFDQSxJQUFJLElBQUksT0FBTyxVQUFVLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRTtFQUNoRCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQztFQUNqRixLQUFLO0VBQ0wsSUFBSSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDNUIsTUFBTSxVQUFVLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7RUFDNUQsS0FBSztBQUNMO0VBQ0EsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUs7RUFDM0IsUUFBUSxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7RUFDbkMsUUFBUSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPO0VBQ2pELFFBQVEsMkRBQTJEO0VBQ25FLFFBQVEsa0JBQWtCO0VBQzFCLE9BQU8sQ0FBQztBQUNSO0VBQ0EsSUFBSSxHQUFHLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3pDLE9BQU8sT0FBTyxDQUFDLDBCQUEwQixFQUFFLGtCQUFrQixDQUFDO0VBQzlELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNoQztFQUNBLElBQUksSUFBSSxxQkFBcUIsR0FBRyxFQUFFLENBQUM7RUFDbkMsSUFBSSxLQUFLLElBQUksYUFBYSxJQUFJLFVBQVUsRUFBRTtFQUMxQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7RUFDdEMsUUFBUSxRQUFRO0VBQ2hCLE9BQU87RUFDUCxNQUFNLHFCQUFxQixJQUFJLElBQUksR0FBRyxhQUFhLENBQUM7RUFDcEQsTUFBTSxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsS0FBSyxJQUFJLEVBQUU7RUFDOUMsUUFBUSxRQUFRO0VBQ2hCLE9BQU87QUFDUDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsTUFBTSxxQkFBcUIsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUM3RSxLQUFLO0FBQ0w7RUFDQSxJQUFJLFFBQVEsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxxQkFBcUIsQ0FBQztFQUN4RSxHQUFHO0FBQ0g7RUFDQSxFQUFFLFNBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRTtFQUNyQixJQUFJLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUN2RSxNQUFNLE1BQU07RUFDWixLQUFLO0FBQ0w7RUFDQTtFQUNBO0VBQ0EsSUFBSSxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNyRSxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztFQUNqQixJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQzdDLE1BQU0sSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUN4QyxNQUFNLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVDO0VBQ0EsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0VBQ3BDLFFBQVEsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckMsT0FBTztBQUNQO0VBQ0EsTUFBTSxJQUFJO0VBQ1YsUUFBUSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDcEMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDO0VBQ2pCLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hFO0VBQ0EsUUFBUSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7RUFDMUIsVUFBVSxLQUFLO0VBQ2YsU0FBUztFQUNULE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO0VBQ3BCLEtBQUs7QUFDTDtFQUNBLElBQUksT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUc7RUFDL0IsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLEdBQUcsR0FBRztFQUNaLElBQUksUUFBUSxFQUFFO0VBQ2QsTUFBTSxJQUFJLEVBQUUsR0FBRztFQUNmLEtBQUs7RUFDTCxJQUFJLEdBQUcsRUFBRSxHQUFHO0VBQ1osSUFBSSxHQUFHLEVBQUUsR0FBRztFQUNaLElBQUksTUFBTSxFQUFFLFVBQVUsR0FBRyxFQUFFLFVBQVUsRUFBRTtFQUN2QyxNQUFNLEdBQUc7RUFDVCxRQUFRLEdBQUc7RUFDWCxRQUFRLEVBQUU7RUFDVixRQUFRLE1BQU0sQ0FBQyxVQUFVLEVBQUU7RUFDM0IsVUFBVSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0VBQ3JCLFNBQVMsQ0FBQztFQUNWLE9BQU8sQ0FBQztFQUNSLEtBQUs7RUFDTCxJQUFJLGFBQWEsRUFBRSxJQUFJO0VBQ3ZCLEdBQUcsQ0FBQztBQUNKO0VBQ0EsRUFBRSxPQUFPLEdBQUc7RUFDWixDQUFDO0FBQ0Q7RUFDQSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7O0VDaEhwQzs7OztFQUdBLElBQU1pRSxXQUFOLEdBS0VsUCxvQkFBVyxDQUFDeUQsT0FBRCxFQUFVOzs7RUFDbkIsT0FBS0YsUUFBTCxHQUFnQjJMLFdBQVcsQ0FBQzNMLFFBQTVCO0VBRUEsT0FBS08sU0FBTCxHQUFpQm9MLFdBQVcsQ0FBQ3BMLFNBQTdCO0VBRUEsT0FBSzJDLElBQUwsR0FBWXlJLFdBQVcsQ0FBQ3pJLElBQXhCO0VBRUEsT0FBSzBJLE9BQUwsR0FBZUQsV0FBVyxDQUFDQyxPQUEzQjtFQUVBLE9BQUsxTCxPQUFMLEdBQWVBLE9BQWY7RUFFQSxPQUFLMkwsSUFBTCxHQUFZM0wsT0FBTyxDQUFDcUIsT0FBUixDQUFnQixLQUFLMkIsSUFBTCxDQUFVNEksSUFBMUIsQ0FBWjtFQUVBLE9BQUtyQyxNQUFMLEdBQWN2SixPQUFPLENBQUN4QyxhQUFSLENBQXNCLEtBQUs2QyxTQUFMLENBQWV3TCxNQUFyQyxDQUFkO0VBRUE7Ozs7RUFHQSxPQUFLM0wsT0FBTCxHQUFlLElBQUlDLE1BQUosQ0FBVztFQUN4QkwsSUFBQUEsUUFBUSxFQUFFLEtBQUtPLFNBQUwsQ0FBZXdMLE1BREQ7RUFFeEJoRCxJQUFBQSxLQUFLLGNBQVE7RUFDWCxVQUFJN0ksT0FBTyxDQUFDakQsU0FBUixDQUFrQitPLFFBQWxCLENBQTJCM0wsTUFBTSxDQUFDc0IsYUFBbEMsQ0FBSixJQUNFc0ssU0FBTyxDQUFDQyxHQUFSLENBQVk3UCxPQUFLd1AsSUFBakIsRUFBdUIsV0FBdkIsRUFBb0M7RUFBQ0QsUUFBQUEsT0FBTyxFQUFFdlAsT0FBS3VQO0VBQWYsT0FBcEMsSUFERixLQUVLLElBQUkxTCxPQUFPLENBQUNqRCxTQUFSLENBQWtCK08sUUFBbEIsQ0FBMkIzTCxNQUFNLENBQUM4TCxXQUFsQyxDQUFKLElBQ0hGLFNBQU8sQ0FBQzdOLE1BQVIsQ0FBZS9CLE9BQUt3UCxJQUFwQjtFQUNIO0VBUHVCLEdBQVgsQ0FBZixDQWxCbUI7O0VBNkJuQixNQUFJSSxTQUFPLENBQUNHLEdBQVIsQ0FBWSxLQUFLUCxJQUFqQixLQUEwQjNMLE9BQU8sQ0FBQ2pELFNBQVIsQ0FBa0IrTyxRQUFsQixDQUEyQjNMLE1BQU0sQ0FBQzhMLFdBQWxDLENBQTlCLElBQ0UsS0FBSy9MLE9BQUwsQ0FBYWlNLGFBQWIsQ0FBMkIsS0FBSzVDLE1BQWhDLEVBQXdDdkosT0FBeEM7RUFFRixTQUFPLElBQVA7Ozs7Ozs7O3dCQU9GckMsNEJBQVM7RUFDUCxPQUFLdUMsT0FBTCxDQUFhaU0sYUFBYixDQUEyQixLQUFLNUMsTUFBaEMsRUFBd0MsS0FBS3ZKLE9BQTdDOztFQUVBLFNBQU8sSUFBUDs7RUFJSjs7O0VBQ0F5TCxXQUFXLENBQUMzTCxRQUFaLEdBQXVCLDJCQUF2QjtFQUVBOztFQUNBMkwsV0FBVyxDQUFDcEwsU0FBWixHQUF3QjtFQUN0QixZQUFVO0VBRFksQ0FBeEI7RUFJQTs7RUFDQW9MLFdBQVcsQ0FBQ3pJLElBQVosR0FBbUI7RUFDakIsVUFBUTtFQURTLENBQW5CO0VBSUE7O0VBQ0F5SSxXQUFXLENBQUNDLE9BQVosR0FBc0IsR0FBdEI7O0VDbkVBOzs7OztFQUlBLElBQU1VLFVBQU4sR0FNRTdQLG1CQUFXLENBQUN5RCxPQUFELEVBQVU7OztFQUNuQixPQUFLcU0sR0FBTCxHQUFXck0sT0FBWDtFQUVBLE9BQUtyQixJQUFMLEdBQVl5TixVQUFVLENBQUN6TixJQUF2QjtFQUVBLE9BQUsyTixTQUFMLEdBQWlCRixVQUFVLENBQUNFLFNBQTVCO0VBRUEsT0FBSzdILFFBQUwsR0FBZ0IySCxVQUFVLENBQUMzSCxRQUEzQjtFQUVBLE9BQUtwRSxTQUFMLEdBQWlCK0wsVUFBVSxDQUFDL0wsU0FBNUI7RUFFQSxPQUFLUCxRQUFMLEdBQWdCc00sVUFBVSxDQUFDdE0sUUFBM0I7RUFFQSxPQUFLeU0sVUFBTCxHQUFrQkgsVUFBVSxDQUFDRyxVQUE3QjtFQUVBLE9BQUs1RSxPQUFMLEdBQWV5RSxVQUFVLENBQUN6RSxPQUExQjtFQUVBLE9BQUtoQixTQUFMLEdBQWlCeUYsVUFBVSxDQUFDekYsU0FBNUI7RUFFQSxPQUFLckcsT0FBTCxHQUFlOEwsVUFBVSxDQUFDOUwsT0FBMUIsQ0FuQm1CO0VBc0JuQjs7RUFDQTFDLEVBQUFBLE1BQU0sQ0FBQ3dPLFVBQVUsQ0FBQzNILFFBQVosQ0FBTixhQUErQnpCLE1BQVM7RUFDdEMsV0FBS3dKLFNBQUwsQ0FBZXhKLElBQWY7RUFDRCxHQUZEOztFQUlBLE9BQUtxRixJQUFMLEdBQVksSUFBSUMsS0FBSixDQUFVLEtBQUsrRCxHQUFMLENBQVM3TyxhQUFULENBQXVCLE1BQXZCLENBQVYsQ0FBWjtFQUVBLE9BQUs2SyxJQUFMLENBQVVWLE9BQVYsR0FBb0IsS0FBS0EsT0FBekI7O0VBRUEsT0FBS1UsSUFBTCxDQUFVTyxNQUFWLGFBQW9CdEwsT0FBVTtFQUM1QkEsSUFBQUEsS0FBSyxDQUFDSSxjQUFOOztFQUVBLFdBQUsrTyxPQUFMLENBQWFuUCxLQUFiLEVBQ0dzSCxJQURILENBQ1F6SSxPQUFLdVEsT0FEYixFQUVHeEgsS0FGSCxDQUVTL0ksT0FBS3dRLFFBRmQ7RUFHRCxHQU5EOztFQVFBLE9BQUt0RSxJQUFMLENBQVV1RSxLQUFWO0VBRUEsU0FBTyxJQUFQOzs7Ozs7Ozs7Ozt1QkFVRkgsNEJBQVFuUCxLQUFELEVBQVE7RUFDYkEsRUFBQUEsS0FBSyxDQUFDSSxjQUFOLEdBRGE7O0VBSWIsT0FBS3NMLEtBQUwsR0FBYUMsU0FBUyxDQUFDM0wsS0FBSyxDQUFDaUQsTUFBUCxFQUFlO0VBQUMySSxJQUFBQSxJQUFJLEVBQUU7RUFBUCxHQUFmLENBQXRCLENBSmE7RUFPYjs7RUFDQSxNQUFJMkQsTUFBTSxHQUFHdlAsS0FBSyxDQUFDaUQsTUFBTixDQUFhc00sTUFBYixDQUFvQnpELE9BQXBCLEdBQ1JnRCxVQUFVLENBQUNFLFNBQVgsQ0FBcUJRLGdCQUFZVixVQUFVLENBQUNFLFNBQVgsQ0FBcUJTLGtCQUQzRCxDQVJhOztFQWFiRixFQUFBQSxNQUFNLEdBQUdBLE1BQU0sR0FBRzVELFNBQVMsQ0FBQzNMLEtBQUssQ0FBQ2lELE1BQVAsRUFBZTtFQUFDeU0sSUFBQUEsVUFBVSxjQUFpQjs7OztFQUNwRSxVQUFJQyxJQUFJLEdBQUksT0FBT0MsTUFBTSxDQUFDLENBQUQsQ0FBYixLQUFxQixRQUF0QixHQUFrQ0EsTUFBTSxDQUFDLENBQUQsQ0FBeEMsR0FBOEMsRUFBekQ7RUFFQSxjQUFVRCxJQUFLLFVBQUdDLE1BQU0sQ0FBQyxDQUFELEVBQUksVUFBR0EsTUFBTSxDQUFDLENBQUQ7RUFDdEM7RUFKeUMsR0FBZixDQUEzQixDQWJhO0VBb0JiOztFQUNBTCxFQUFBQSxNQUFNLEdBQU1BLE1BQU8sbUJBQVlULFVBQVUsQ0FBQzNILFNBQTFDLENBckJhOztFQXdCYixTQUFPLElBQUkwSSxPQUFKLFdBQWFDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtFQUN0QyxRQUFNQyxNQUFNLEdBQUczUSxRQUFRLENBQUM0TixhQUFULENBQXVCLFFBQXZCLENBQWY7RUFFQTVOLElBQUFBLFFBQVEsQ0FBQ3dCLElBQVQsQ0FBY1YsV0FBZCxDQUEwQjZQLE1BQTFCO0VBQ0FBLElBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxHQUFnQkgsT0FBaEI7RUFDQUUsSUFBQUEsTUFBTSxDQUFDRSxPQUFQLEdBQWlCSCxNQUFqQjtFQUNBQyxJQUFBQSxNQUFNLENBQUNHLEtBQVAsR0FBZSxJQUFmO0VBQ0FILElBQUFBLE1BQU0sQ0FBQ0ksR0FBUCxHQUFhQyxTQUFTLENBQUNkLE1BQUQsQ0FBdEI7RUFDRCxHQVJNLENBQVA7Ozs7Ozs7Ozt1QkFnQkZILDRCQUFRcFAsS0FBRCxFQUFRO0VBQ2JBLEVBQUFBLEtBQUssQ0FBQ3NRLElBQU4sQ0FBVyxDQUFYLEVBQWMxUCxNQUFkO0VBRUEsU0FBTyxJQUFQOzs7Ozs7Ozs7dUJBUUZ5Tyw4QkFBU3hILEtBQUQsRUFBUTtFQUNkO0VBQ0EsSUFBMkNILE9BQU8sQ0FBQ0MsR0FBUixDQUFZRSxLQUFaO0VBRTNDLFNBQU8sSUFBUDs7Ozs7Ozs7O3VCQVFGcUgsZ0NBQVV4SixJQUFELEVBQU87RUFDZCxNQUFJLGFBQVNBLElBQUksQ0FBQyxLQUFLZSxJQUFMLENBQVUsV0FBVixDQUFELElBQWpCLEVBQThDO0VBQzVDLGlCQUFTZixJQUFJLENBQUMsS0FBS2UsSUFBTCxDQUFVLFdBQVYsQ0FBRCxLQUE0QmYsSUFBSSxDQUFDNkssR0FBOUM7RUFDRCxHQUZELE1BRU87RUFDTDtFQUNBLE1BQTJDN0ksT0FBTyxDQUFDQyxHQUFSLENBQVlqQyxJQUFaO0VBQzVDOztFQUVELFNBQU8sSUFBUDs7Ozs7Ozs7O3VCQVFGOEssMEJBQU9ELEdBQUQsRUFBTTtFQUNWLE9BQUtFLGNBQUw7O0VBQ0EsT0FBS0MsVUFBTCxDQUFnQixTQUFoQixFQUEyQkgsR0FBM0I7O0VBRUEsU0FBTyxJQUFQOzs7Ozs7Ozs7dUJBUUZJLDhCQUFTSixHQUFELEVBQU07RUFDWixPQUFLRSxjQUFMOztFQUNBLE9BQUtDLFVBQUwsQ0FBZ0IsU0FBaEIsRUFBMkJILEdBQTNCOztFQUVBLFNBQU8sSUFBUDs7Ozs7Ozs7Ozt1QkFTRkcsa0NBQVc1RixJQUFELEVBQU95RixHQUFQLEVBQTJCOytCQUFqQixHQUFHOztFQUNyQixNQUFJbEcsT0FBTyxHQUFHakosTUFBTSxDQUFDQyxJQUFQLENBQVl5TixVQUFVLENBQUNHLFVBQXZCLENBQWQ7RUFDQSxNQUFJMkIsT0FBTyxHQUFHLEtBQWQ7O0VBRUEsTUFBSUMsUUFBUSxHQUFHLEtBQUs5QixHQUFMLENBQVM3TyxhQUFULENBQ2I0TyxVQUFVLENBQUMvTCxTQUFYLEVBQXdCK0gsSUFBSyxXQURoQixDQUFmOztFQUlBLE1BQUlnRyxXQUFXLEdBQUdELFFBQVEsQ0FBQzNRLGFBQVQsQ0FDaEI0TyxVQUFVLENBQUMvTCxTQUFYLENBQXFCZ08sY0FETCxDQUFsQixDQVJtQztFQWFuQzs7RUFDQSxNQUFJOUIsVUFBVSxHQUFHNUUsT0FBTyxDQUFDMkcsTUFBUixXQUFlQyxZQUFLVixHQUFHLENBQUNXLFFBQUosQ0FBYXBDLFVBQVUsQ0FBQ0csVUFBWCxDQUFzQmdDLENBQXRCLENBQWIsSUFBcEIsQ0FBakI7RUFDQVYsRUFBQUEsR0FBRyxHQUFJdEIsVUFBVSxDQUFDeEwsTUFBWixHQUFzQixLQUFLNEcsT0FBTCxDQUFhNEUsVUFBVSxDQUFDLENBQUQsQ0FBdkIsQ0FBdEIsR0FBb0RzQixHQUExRDtFQUNBSyxFQUFBQSxPQUFPLEdBQUkzQixVQUFVLENBQUN4TCxNQUFaLEdBQXNCLElBQXRCLEdBQTZCLEtBQXZDLENBaEJtQztFQW1CbkM7O0VBQ0EsT0FBSzdFLElBQUlxSSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHNkgsVUFBVSxDQUFDekYsU0FBWCxDQUFxQjVGLE1BQXpDLEVBQWlEd0QsQ0FBQyxFQUFsRCxFQUFzRDtFQUNwRCxRQUFJbUMsUUFBUSxHQUFHMEYsVUFBVSxDQUFDekYsU0FBWCxDQUFxQnBDLENBQXJCLENBQWY7RUFDQSxRQUFJMUYsR0FBRyxHQUFHNkgsUUFBUSxDQUFDMEMsT0FBVCxDQUFpQixLQUFqQixFQUF3QixFQUF4QixFQUE0QkEsT0FBNUIsQ0FBb0MsS0FBcEMsRUFBMkMsRUFBM0MsQ0FBVjtFQUNBLFFBQUlxRixLQUFLLEdBQUcsS0FBS3pGLEtBQUwsQ0FBV25LLEdBQVgsS0FBbUIsS0FBSzhJLE9BQUwsQ0FBYTlJLEdBQWIsQ0FBL0I7RUFDQSxRQUFJNlAsR0FBRyxHQUFHLElBQUlDLE1BQUosQ0FBV2pJLFFBQVgsRUFBcUIsSUFBckIsQ0FBVjtFQUVBbUgsSUFBQUEsR0FBRyxHQUFHQSxHQUFHLENBQUN6RSxPQUFKLENBQVlzRixHQUFaLEVBQWtCRCxLQUFELEdBQVVBLEtBQVYsR0FBa0IsRUFBbkMsQ0FBTjtFQUNEOztFQUVELE1BQUlQLE9BQUosRUFBYTtFQUNYRSxJQUFBQSxXQUFXLENBQUN2SCxTQUFaLEdBQXdCZ0gsR0FBeEI7RUFDRCxHQUZELE1BRU8sSUFBSXpGLElBQUksS0FBSyxPQUFiLEVBQXNCO0VBQzNCZ0csSUFBQUEsV0FBVyxDQUFDdkgsU0FBWixHQUF3QixLQUFLYyxPQUFMLENBQWFpSCxvQkFBckM7RUFDRDs7RUFFRCxNQUFJVCxRQUFKLElBQWMsS0FBS1UsWUFBTCxDQUFrQlYsUUFBbEIsRUFBNEJDLFdBQTVCO0VBRWQsU0FBTyxJQUFQOzs7Ozs7Ozt1QkFPRkwsNENBQWlCO0VBQ2YsTUFBSWUsT0FBTyxHQUFHLEtBQUt6QyxHQUFMLENBQVN4TCxnQkFBVCxDQUEwQnVMLFVBQVUsQ0FBQy9MLFNBQVgsQ0FBcUIwTyxXQUEvQyxDQUFkOztFQUVBO1FBQ0UsSUFBSSxDQUFDRCxPQUFPLENBQUMxUyxDQUFELENBQVAsQ0FBV1csU0FBWCxDQUFxQitPLFFBQXJCLENBQThCTSxVQUFVLENBQUM5TCxPQUFYLENBQW1CbkQsTUFBakQsQ0FBTCxFQUErRDtFQUM3RDJSLElBQUFBLE9BQU8sQ0FBQzFTLENBQUQsQ0FBUCxDQUFXVyxTQUFYLENBQXFCQyxHQUFyQixDQUF5Qm9QLFVBQVUsQ0FBQzlMLE9BQVgsQ0FBbUJuRCxNQUE1QztFQUVBaVAsSUFBQUEsVUFBVSxDQUFDOUwsT0FBWCxDQUFtQjBPLE9BQW5CLENBQTJCMUksS0FBM0IsQ0FBaUMsR0FBakMsRUFBc0N2RyxPQUF0QyxXQUErQ3NMLGVBQzdDeUQsT0FBTyxDQUFDMVMsQ0FBRCxDQUFQLENBQVdXLFNBQVgsQ0FBcUJtQixNQUFyQixDQUE0Qm1OLElBQTVCLElBREYsRUFINkQ7O0VBUTdEeUQsSUFBQUEsT0FBTyxDQUFDMVMsQ0FBRCxDQUFQLENBQVdnQixZQUFYLENBQXdCLGFBQXhCLEVBQXVDLE1BQXZDO0VBQ0EwUixJQUFBQSxPQUFPLENBQUMxUyxDQUFELENBQVAsQ0FBV29CLGFBQVgsQ0FBeUI0TyxVQUFVLENBQUMvTCxTQUFYLENBQXFCZ08sY0FBOUMsRUFDR2pSLFlBREgsQ0FDZ0IsV0FEaEIsRUFDNkIsS0FEN0I7RUFFRDs7O1dBWkVsQixJQUFJRSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHMFMsT0FBTyxDQUFDL04sTUFBNUIsRUFBb0MzRSxDQUFDLEVBQXJDOztFQWNBLFNBQU8sSUFBUDs7Ozs7Ozs7Ozs7dUJBVUZ5UyxzQ0FBYXRPLE1BQUQsRUFBUzBPLE9BQVQsRUFBa0I7RUFDNUIxTyxFQUFBQSxNQUFNLENBQUN4RCxTQUFQLENBQWlCWSxNQUFqQixDQUF3QnlPLFVBQVUsQ0FBQzlMLE9BQVgsQ0FBbUJuRCxNQUEzQztFQUNBaVAsRUFBQUEsVUFBVSxDQUFDOUwsT0FBWCxDQUFtQjBPLE9BQW5CLENBQTJCMUksS0FBM0IsQ0FBaUMsR0FBakMsRUFBc0N2RyxPQUF0QyxXQUErQ3NMLGVBQzdDOUssTUFBTSxDQUFDeEQsU0FBUCxDQUFpQlksTUFBakIsQ0FBd0IwTixJQUF4QixJQURGLEVBRjRCOztFQU01QjlLLEVBQUFBLE1BQU0sQ0FBQ25ELFlBQVAsQ0FBb0IsYUFBcEIsRUFBbUMsTUFBbkM7O0VBRUEsTUFBSTZSLE9BQUosRUFBYTtFQUNYQSxJQUFBQSxPQUFPLENBQUM3UixZQUFSLENBQXFCLFdBQXJCLEVBQWtDLFFBQWxDO0VBQ0Q7O0VBRUQsU0FBTyxJQUFQOzs7Ozs7Ozs7dUJBUUYyRyxzQkFBS2xGLEdBQUQsRUFBTTtFQUNSLFNBQU91TixVQUFVLENBQUN6TixJQUFYLENBQWdCRSxHQUFoQixDQUFQOztFQUlKOzs7RUFDQXVOLFVBQVUsQ0FBQ3pOLElBQVgsR0FBa0I7RUFDaEJ1USxFQUFBQSxTQUFTLEVBQUUsUUFESztFQUVoQkMsRUFBQUEsTUFBTSxFQUFFO0VBRlEsQ0FBbEI7RUFLQTs7RUFDQS9DLFVBQVUsQ0FBQ0UsU0FBWCxHQUF1QjtFQUNyQlEsRUFBQUEsSUFBSSxFQUFFLE9BRGU7RUFFckJDLEVBQUFBLFNBQVMsRUFBRTtFQUZVLENBQXZCO0VBS0E7O0VBQ0FYLFVBQVUsQ0FBQzNILFFBQVgsR0FBc0IsNkJBQXRCO0VBRUE7O0VBQ0EySCxVQUFVLENBQUMvTCxTQUFYLEdBQXVCO0VBQ3JCK08sRUFBQUEsT0FBTyxFQUFFLHdCQURZO0VBRXJCTCxFQUFBQSxXQUFXLEVBQUUsb0NBRlE7RUFHckJNLEVBQUFBLFdBQVcsRUFBRSwwQ0FIUTtFQUlyQkMsRUFBQUEsV0FBVyxFQUFFLDBDQUpRO0VBS3JCakIsRUFBQUEsY0FBYyxFQUFFO0VBTEssQ0FBdkI7RUFRQTs7RUFDQWpDLFVBQVUsQ0FBQ3RNLFFBQVgsR0FBc0JzTSxVQUFVLENBQUMvTCxTQUFYLENBQXFCK08sT0FBM0M7RUFFQTs7RUFDQWhELFVBQVUsQ0FBQ0csVUFBWCxHQUF3QjtFQUN0QmdELEVBQUFBLHFCQUFxQixFQUFFLG9CQUREO0VBRXRCQyxFQUFBQSxzQkFBc0IsRUFBRSxzQkFGRjtFQUd0QkMsRUFBQUEsbUJBQW1CLEVBQUUsVUFIQztFQUl0QkMsRUFBQUEsc0JBQXNCLEVBQUUsdUJBSkY7RUFLdEJDLEVBQUFBLGlCQUFpQixFQUFFO0VBTEcsQ0FBeEI7RUFRQTs7RUFDQXZELFVBQVUsQ0FBQ3pFLE9BQVgsR0FBcUI7RUFDbkJvRCxFQUFBQSxjQUFjLEVBQUUseUJBREc7RUFFbkI2RSxFQUFBQSxvQkFBb0IsRUFBRSxvQkFGSDtFQUduQjVFLEVBQUFBLG1CQUFtQixFQUFFLDZCQUhGO0VBSW5CNkUsRUFBQUEsc0JBQXNCLEVBQUUsMEJBSkw7RUFLbkJqQixFQUFBQSxvQkFBb0IsRUFBRSw4Q0FDQSx5QkFOSDtFQU9uQlcsRUFBQUEscUJBQXFCLEVBQUUsc0RBQ0EsaURBREEsR0FFQSxzREFUSjtFQVVuQkMsRUFBQUEsc0JBQXNCLEVBQUUsc0JBVkw7RUFXbkJDLEVBQUFBLG1CQUFtQixFQUFFLHFDQUNBLDZCQVpGO0VBYW5CQyxFQUFBQSxzQkFBc0IsRUFBRSx1Q0FDQSwwQkFkTDtFQWVuQkMsRUFBQUEsaUJBQWlCLEVBQUUsK0NBQ0Esb0NBaEJBO0VBaUJuQkcsRUFBQUEsU0FBUyxFQUFFO0VBakJRLENBQXJCO0VBb0JBOztFQUNBMUQsVUFBVSxDQUFDekYsU0FBWCxHQUF1QixDQUNyQixhQURxQixFQUVyQixpQkFGcUIsQ0FBdkI7RUFLQXlGLFVBQVUsQ0FBQzlMLE9BQVgsR0FBcUI7RUFDbkIwTyxFQUFBQSxPQUFPLEVBQUUsbUJBRFU7RUFFbkI3UixFQUFBQSxNQUFNLEVBQUU7RUFGVyxDQUFyQjs7RUMxVUE7RUFNQTs7Ozs7OztFQU1BLElBQU00UyxjQUFOLEdBS0V4VCx1QkFBVyxDQUFDQyxFQUFELEVBQUs7RUFDZDtFQUNBLE9BQUtBLEVBQUwsR0FBVUEsRUFBVjtFQUVBOztFQUNBLE9BQUt3VCxTQUFMLEdBQWlCLENBQWpCO0VBRUE7O0VBQ0EsT0FBS0MsT0FBTCxHQUFlLEtBQWY7RUFFQTs7RUFDQSxPQUFLQyxZQUFMLEdBQW9CLEtBQXBCO0VBRUE7O0VBQ0EsT0FBS2hRLE9BQUwsR0FBZSxJQUFJQyxNQUFKLENBQVc7RUFDeEJMLElBQUFBLFFBQVEsRUFBRWlRLGNBQWMsQ0FBQzFQLFNBQWYsQ0FBeUJJO0VBRFgsR0FBWCxDQUFmO0VBSUEsT0FBSzBQLElBQUw7RUFFQSxTQUFPLElBQVA7Ozs7Ozs7OzsyQkFRRkEsd0JBQU87OztFQUNMLE1BQUksS0FBS0QsWUFBVCxJQUNFLE9BQU8sSUFBUDtFQUVGLE1BQU1FLFVBQVUsR0FBRyxLQUFLNVQsRUFBTCxDQUFRZ0IsYUFBUixDQUFzQnVTLGNBQWMsQ0FBQzFQLFNBQWYsQ0FBeUJnUSxPQUEvQyxDQUFuQjtFQUNBLE1BQU1DLFNBQVMsR0FBRyxLQUFLOVQsRUFBTCxDQUFRZ0IsYUFBUixDQUFzQnVTLGNBQWMsQ0FBQzFQLFNBQWYsQ0FBeUJrUSxNQUEvQyxDQUFsQjtFQUVBSCxFQUFBQSxVQUFVLENBQUMvUyxnQkFBWCxDQUE0QixPQUE1QixZQUFxQ0MsT0FBUztFQUM1Q0EsSUFBQUEsS0FBSyxDQUFDSSxjQUFOO0VBRUEsUUFBTThTLE9BQU8sR0FBR3JVLE9BQUs2VCxTQUFMLEdBQWlCLENBQWpDOztFQUVBLFFBQUlRLE9BQU8sSUFBSVQsY0FBYyxDQUFDVSxHQUE5QixFQUFtQztFQUNqQyxhQUFLQyxXQUFMLENBQWlCRixPQUFqQjtFQUNEO0VBQ0YsR0FSRDtFQVVBRixFQUFBQSxTQUFTLENBQUNqVCxnQkFBVixDQUEyQixPQUEzQixZQUFvQ0MsT0FBUztFQUMzQ0EsSUFBQUEsS0FBSyxDQUFDSSxjQUFOO0VBRUEsUUFBTThTLE9BQU8sR0FBR3JVLE9BQUs2VCxTQUFMLEdBQWlCLENBQWpDOztFQUVBLFFBQUlRLE9BQU8sSUFBSVQsY0FBYyxDQUFDWSxHQUE5QixFQUFtQztFQUNqQyxhQUFLRCxXQUFMLENBQWlCRixPQUFqQjtFQUNEO0VBQ0YsR0FSRCxFQWpCSztFQTRCTDtFQUNBOztFQUNBLE1BQUl6RSxTQUFPLENBQUNHLEdBQVIsQ0FBWSxVQUFaLENBQUosRUFBNkI7RUFDM0IsUUFBTTBFLElBQUksR0FBR3ROLFFBQVEsQ0FBQ3lJLFNBQU8sQ0FBQ0csR0FBUixDQUFZLFVBQVosQ0FBRCxFQUEwQixFQUExQixDQUFyQjtFQUVBLFNBQUs4RCxTQUFMLEdBQWlCWSxJQUFqQjs7RUFDQSxTQUFLRixXQUFMLENBQWlCRSxJQUFqQjtFQUNELEdBTEQsTUFLTztFQUNMLFFBQU05RyxJQUFJLEdBQUduTixRQUFRLENBQUNhLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBYjtFQUNBc00sSUFBQUEsSUFBSSxDQUFDL00sU0FBTCxDQUFlQyxHQUFmLGtCQUFnQyxLQUFLZ1Q7RUFFckMsU0FBS2hTLElBQUw7O0VBQ0EsU0FBSzZTLFVBQUw7RUFDRDs7RUFFRCxPQUFLWCxZQUFMLEdBQW9CLElBQXBCO0VBRUEsU0FBTyxJQUFQOzs7Ozs7OzsyQkFPRmxTLHdCQUFPO0VBQ0wsT0FBS2lTLE9BQUwsR0FBZSxJQUFmLENBREs7O0VBSUwsTUFBSXpULEVBQUUsR0FBRyxLQUFLQSxFQUFMLENBQVFnQixhQUFSLENBQXNCdVMsY0FBYyxDQUFDMVAsU0FBZixDQUF5QkksTUFBL0MsQ0FBVDtFQUNBLE1BQUlxUSxjQUFjLEdBQUksT0FBR3RVLEVBQUUsQ0FBQ0ssWUFBSCxDQUFnQixlQUFoQixFQUF6QjtFQUNBLE1BQUkwRCxNQUFNLEdBQUcsS0FBSy9ELEVBQUwsQ0FBUWdCLGFBQVIsQ0FBc0JzVCxjQUF0QixDQUFiLENBTks7O0VBU0wsT0FBSzVRLE9BQUwsQ0FBYWlNLGFBQWIsQ0FBMkIzUCxFQUEzQixFQUErQitELE1BQS9COztFQUVBLFNBQU8sSUFBUDs7Ozs7Ozs7OzJCQVFGc1Esb0NBQWE7RUFDWDlFLEVBQUFBLFNBQU8sQ0FBQ0MsR0FBUixDQUFZLFVBQVosRUFBd0IsS0FBS2dFLFNBQTdCLEVBQXdDO0VBQUN0RSxJQUFBQSxPQUFPLEVBQUcsSUFBRTtFQUFiLEdBQXhDO0VBQ0EsU0FBTyxJQUFQOzs7Ozs7Ozs7OzJCQVNGZ0Ysb0NBQVlFLElBQUQsRUFBTztFQUNoQixNQUFNRyxZQUFZLEdBQUcsS0FBS2YsU0FBMUI7RUFDQSxNQUFNbEcsSUFBSSxHQUFHbk4sUUFBUSxDQUFDYSxhQUFULENBQXVCLE1BQXZCLENBQWI7O0VBRUEsTUFBSW9ULElBQUksS0FBS0csWUFBYixFQUEyQjtFQUN6QixTQUFLZixTQUFMLEdBQWlCWSxJQUFqQjs7RUFDQSxTQUFLQyxVQUFMOztFQUVBL0csSUFBQUEsSUFBSSxDQUFDL00sU0FBTCxDQUFlbUIsTUFBZixpQkFBbUM2UztFQUNwQzs7RUFFRGpILEVBQUFBLElBQUksQ0FBQy9NLFNBQUwsQ0FBZUMsR0FBZixpQkFBZ0M0VDs7RUFFaEMsT0FBS0ksZUFBTDs7RUFFQSxTQUFPLElBQVA7Ozs7Ozs7OzsyQkFRRkEsOENBQWtCO0VBQ2hCLE1BQU1aLFVBQVUsR0FBRyxLQUFLNVQsRUFBTCxDQUFRZ0IsYUFBUixDQUFzQnVTLGNBQWMsQ0FBQzFQLFNBQWYsQ0FBeUJnUSxPQUEvQyxDQUFuQjtFQUNBLE1BQU1DLFNBQVMsR0FBRyxLQUFLOVQsRUFBTCxDQUFRZ0IsYUFBUixDQUFzQnVTLGNBQWMsQ0FBQzFQLFNBQWYsQ0FBeUJrUSxNQUEvQyxDQUFsQjs7RUFFQSxNQUFJLEtBQUtQLFNBQUwsSUFBa0JELGNBQWMsQ0FBQ1UsR0FBckMsRUFBMEM7RUFDeEMsU0FBS1QsU0FBTCxHQUFpQkQsY0FBYyxDQUFDVSxHQUFoQztFQUNBTCxJQUFBQSxVQUFVLENBQUNoVCxZQUFYLENBQXdCLFVBQXhCLEVBQW9DLEVBQXBDO0VBQ0QsR0FIRCxRQUlFZ1QsVUFBVSxDQUFDekYsZUFBWCxDQUEyQixVQUEzQjs7RUFFRixNQUFJLEtBQUtxRixTQUFMLElBQWtCRCxjQUFjLENBQUNZLEdBQXJDLEVBQTBDO0VBQ3hDLFNBQUtYLFNBQUwsR0FBaUJELGNBQWMsQ0FBQ1ksR0FBaEM7RUFDQUwsSUFBQUEsU0FBUyxDQUFDbFQsWUFBVixDQUF1QixVQUF2QixFQUFtQyxFQUFuQztFQUNELEdBSEQsUUFJRWtULFNBQVMsQ0FBQzNGLGVBQVYsQ0FBMEIsVUFBMUI7O0VBRUYsU0FBTyxJQUFQOztFQUlKOzs7RUFDQW9GLGNBQWMsQ0FBQ1UsR0FBZixHQUFxQixDQUFDLENBQXRCO0VBRUE7O0VBQ0FWLGNBQWMsQ0FBQ1ksR0FBZixHQUFxQixDQUFyQjtFQUVBOztFQUNBWixjQUFjLENBQUNqUSxRQUFmLEdBQTBCLDZCQUExQjtFQUVBOztFQUNBaVEsY0FBYyxDQUFDMVAsU0FBZixHQUEyQjtFQUN6QmtRLEVBQUFBLE1BQU0sRUFBRSwwQkFEaUI7RUFFekJGLEVBQUFBLE9BQU8sRUFBRSwyQkFGZ0I7RUFHekI1UCxFQUFBQSxNQUFNLEVBQUU7RUFIaUIsQ0FBM0I7O0VDM0pBOztFQUVBOzs7OztNQUlNd1EsSUFBTjs7aUJBTUVDLHdCQUFNdEQsSUFBRCxFQUF5QjtpQ0FBcEIsR0FBRzs7RUFDWCxTQUFPLElBQUl1RCxLQUFKLENBQVV2RCxJQUFWLENBQVA7Ozs7Ozs7OztpQkFRRmpRLDBCQUFPeVQsUUFBRCxFQUFtQjt5Q0FBVixHQUFHOztFQUNoQixTQUFRQSxRQUFELEdBQWEsSUFBSWpSLE1BQUosQ0FBV2lSLFFBQVgsQ0FBYixHQUFvQyxJQUFJalIsTUFBSixFQUEzQzs7Ozs7Ozs7O2lCQVFGc0ksd0JBQU0zSSxRQUFELEVBQVc4SSxNQUFYLEVBQW1CO0VBQ3RCLE9BQUtQLElBQUwsR0FBWSxJQUFJQyxLQUFKLENBQVUzTCxRQUFRLENBQUNhLGFBQVQsQ0FBdUJzQyxRQUF2QixDQUFWLENBQVo7RUFFQSxPQUFLdUksSUFBTCxDQUFVTyxNQUFWLEdBQW1CQSxNQUFuQjtFQUVBLE9BQUtQLElBQUwsQ0FBVWhJLFNBQVYsQ0FBb0JnUixvQkFBcEIsR0FBMkMsd0JBQTNDO0VBRUEsT0FBS2hKLElBQUwsQ0FBVXVFLEtBQVY7Ozs7Ozs7OztpQkFRRjBFLDhCQUFTQyxRQUFELEVBQTBEO3lDQUFqRCxHQUFHNVUsUUFBUSxDQUFDa0UsZ0JBQVQsQ0FBMEJ2RSxRQUFRLENBQUN3RCxRQUFuQzs7RUFDbEJ5UixFQUFBQSxRQUFRLENBQUN4UixPQUFULFdBQWlCQyxTQUFXO0VBQzFCLFFBQUkxRCxRQUFKLENBQWEwRCxPQUFiO0VBQ0QsR0FGRDtFQUlBLFNBQVF1UixRQUFRLENBQUN4USxNQUFWLEdBQW9Cd1EsUUFBcEIsR0FBK0IsSUFBdEM7Ozs7Ozs7O2lCQU9GakQsNEJBQVM7RUFDUCxTQUFPLElBQUkvTSxNQUFKLEVBQVA7Ozs7Ozs7O2lCQU9GaVEsa0NBQVk7RUFDVixTQUFPLElBQUl2UixTQUFKLEVBQVA7Ozs7Ozs7O2lCQU9Gd1Isc0NBQWM7RUFDWixTQUFPLElBQUkvTyxXQUFKLEVBQVA7Ozs7Ozs7O2lCQU9GZ1Asa0NBQVcxUixPQUFELEVBQXdEO3VDQUFoRCxHQUFHckQsUUFBUSxDQUFDYSxhQUFULENBQXVCNE8sVUFBVSxDQUFDdE0sUUFBbEM7O0VBQ25CLFNBQVFFLE9BQUQsR0FBWSxJQUFJb00sVUFBSixDQUFlcE0sT0FBZixDQUFaLEdBQXNDLElBQTdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztpQkFtQkYyUixvQ0FBWTNSLE9BQUQsRUFBeUQ7dUNBQWpELEdBQUdyRCxRQUFRLENBQUNhLGFBQVQsQ0FBdUJpTyxXQUFXLENBQUMzTCxRQUFuQzs7RUFDcEIsU0FBUUUsT0FBRCxHQUFZLElBQUl5TCxXQUFKLENBQWdCekwsT0FBaEIsQ0FBWixHQUF1QyxJQUE5Qzs7Ozs7Ozs7O2lCQVFGNFIsZ0NBQVVMLFFBQUQsRUFBMkQ7eUNBQWxELEdBQUc1VSxRQUFRLENBQUNrRSxnQkFBVCxDQUEwQjZHLFNBQVMsQ0FBQzVILFFBQXBDOztFQUNuQnlSLEVBQUFBLFFBQVEsQ0FBQ3hSLE9BQVQsV0FBaUJDLFNBQVc7RUFDMUIsUUFBSTBILFNBQUosQ0FBYzFILE9BQWQ7RUFDRCxHQUZEO0VBSUEsU0FBUXVSLFFBQVEsQ0FBQ3hRLE1BQVYsR0FBb0J3USxRQUFwQixHQUErQixJQUF0Qzs7Ozs7Ozs7O2lCQVFGakcsZ0NBQVc7RUFDVCxTQUFPLElBQUlKLFFBQUosRUFBUDs7Ozs7Ozs7O2lCQVFGMkcsd0JBQU87RUFDTCxTQUFPLElBQUlDLElBQUosRUFBUDs7Ozs7Ozs7aUJBT0ZoUixvQ0FBYTtFQUNYLFNBQU8sSUFBSVYsVUFBSixFQUFQOzs7Ozs7Ozs7aUJBUUYyUiwwQ0FBZS9SLE9BQUQsRUFBNEQ7dUNBQXBELEdBQUdyRCxRQUFRLENBQUNhLGFBQVQsQ0FBdUJ1UyxjQUFjLENBQUNqUSxRQUF0Qzs7RUFDdkIsU0FBUUUsT0FBRCxHQUFZLElBQUkrUCxjQUFKLENBQW1CL1AsT0FBbkIsQ0FBWixHQUEwQyxJQUFqRDs7Ozs7Ozs7O2lCQVFGZ1MsMEJBQVE7RUFDTixTQUFPLElBQUlDLEtBQUosRUFBUDs7Ozs7Ozs7OyJ9
