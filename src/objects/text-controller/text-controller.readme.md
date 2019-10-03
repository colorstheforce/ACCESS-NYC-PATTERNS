#### Global Script

The Text Controller Object requires JavaScript for showing and hiding the text control options and for resizing the page's text size. It uses a Cookie to store the user's preferred text size. To use the Text Controller Object throught the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.textController();
    </script>

This will instantiate the Text Controller Object and attach event listeners for toggling the options and text resize controls.

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script. You must pass a dom selection of the Text Controller Object to the instantiated class. A selector reference is stored in the class.

    // ES6
    import TextController from 'src/objects/text-controller/text-controller';

    // CommonJS
    import TextController from 'dist/objects/text-controller/text-controller.common';

    <!-- IFFE -->
    <script src="dist/objects/text-controller/text-controller.iffe.js"></script>

    let element = document.querySelector(TextController.selector);
    new TextController(element);