'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Tooltips =
/*#__PURE__*/
function () {
  /**
   * @param {HTMLElement} el - The trigger element for the component.
   * @constructor
   */
  function Tooltips(el) {
    var _this = this;

    _classCallCheck(this, Tooltips);

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

      _this.toggle();
    });
    window.addEventListener('hashchange', function () {
      _this.hide();
    });
    Tooltips.AllTips.push(this);
    return this;
  }
  /**
   * Displays the tooltips. Sets a one-time listener on the body to close the
   * tooltip when a click event bubbles up to it.
   * @method
   * @return {this} Tooltip
   */


  _createClass(Tooltips, [{
    key: "show",
    value: function show() {
      var _this2 = this;

      Tooltips.hideAll();
      this.tooltip.classList.remove(Tooltips.CssClass.HIDDEN);
      this.tooltip.setAttribute('aria-hidden', 'false');
      var body = document.querySelector('body');

      var hideTooltipOnce = function hideTooltipOnce() {
        _this2.hide();

        body.removeEventListener('click', hideTooltipOnce);
      };

      body.addEventListener('click', hideTooltipOnce);
      window.addEventListener('resize', function () {
        _this2.reposition();
      });
      this.reposition();
      this.active = true;
      return this;
    }
    /**
     * Hides the tooltip and removes the click event listener on the body.
     * @method
     * @return {this} Tooltip
     */

  }, {
    key: "hide",
    value: function hide() {
      this.tooltip.classList.add(Tooltips.CssClass.HIDDEN);
      this.tooltip.setAttribute('aria-hidden', 'true');
      this.active = false;
      return this;
    }
    /**
     * Toggles the state of the tooltips.
     * @method
     * @return {this} Tooltip
     */

  }, {
    key: "toggle",
    value: function toggle() {
      if (this.active) {
        this.hide();
      } else {
        this.show();
      }

      return this;
    }
    /**
     * Positions the tooltip beneath the triggering element.
     * @method
     * @return {this} Tooltip
     */

  }, {
    key: "reposition",
    value: function reposition() {
      var pos = {
        'position': 'absolute',
        'left': 'auto',
        'right': 'auto',
        'top': 'auto',
        'width': ''
      };

      var style = function style(attrs) {
        return Object.keys(attrs).map(function (key) {
          return "".concat(key, ": ").concat(attrs[key]);
        }).join('; ');
      };

      var g = 24; // Gutter. Minimum distance from screen edge.

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
      } // Set styling positions, reversing left and right if this is an RTL lang.


      pos.top = tr.offsetTop + tr.offsetHeight + 'px';
      this.tooltip.setAttribute('style', style(pos));
      return this;
    }
  }]);

  return Tooltips;
}();

Tooltips.selector = '[data-js*="tooltip-control"]';
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

module.exports = Tooltips;
