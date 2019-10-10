#### Global Script

The Disclaimer Component Toggle requires JavaScript for showing and hiding the Disclaimer. To use the Disclaimer Component Toggle through the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.toggle();
      access.disclaimer();
    </script>

This will instantiate the Disclaimer Component and Toggle Utility, attaching event listeners for toggling the disclaimer visible.

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script.

    // ES6
    import Disclaimer from 'src/components/disclaimer/disclaimer';
    import Toggle from 'src/utilities/toggle/toggle';

    // CommonJS
    import Disclaimer from 'dist/components/disclaimer/disclaimer.common';
    import Toggle from 'dist/utilities/toggle/toggle.common';

    <!-- IFFE -->
    <script src="dist/components/disclaimer/disclaimer.iffe.js"></script>
    <script src="dist/utilities/toggle/toggle.iffe.js"></script>

    new Toggle();
    new Disclaimer();

#### Polyfills

The [Toggle Utility](/toggle) reqiures polyfills for IE11 support. See the ["Toggle Usage" section](toggle#toggle-usage) for more details.