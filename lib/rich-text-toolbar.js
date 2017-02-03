var firepad = firepad || { };

firepad.RichTextToolbar = (function(global) {
  var utils = firepad.utils;

  function RichTextToolbar(imageInsertionUI) {
    this.imageInsertionUI = imageInsertionUI;
    this.element_ = this.makeElement_();
  }

  utils.makeEventEmitter(RichTextToolbar, ['bold', 'italic', 'underline', 'strike', 'font', 'font-size', 'color', 'highlight', 'line-height',
    'left', 'center', 'right', 'unordered-list', 'ordered-list', 'todo-list', 'indent-increase', 'indent-decrease',
                                           'undo', 'redo', 'insert-image']);

  RichTextToolbar.prototype.element = function() { return this.element_; };

  RichTextToolbar.prototype.makeButton_ = function(eventName, title, iconName, iconType) {
    var self = this;
    var className;    
    iconName = iconName || eventName;
    iconType = iconType || 'fontawesome';

    if(iconType === 'fontawesome') {
      className = 'fa fa-' + iconName;
    }
    else {
      className = 'firepad-tb-' + iconName;
    }

    var btn = utils.elt('a', [
      utils.elt('i', '', { 'class': className } )
    ], { 'class': 'firepad-btn', 'title': title, 'data-toggle': 'tooltip' });

    utils.on(btn, 'click', utils.stopEventAnd(function() { self.trigger(eventName); }));

    return btn;
  }

  RichTextToolbar.prototype.makeElement_ = function() {
    var self = this;

    var font = this.makeFontDropdown_();
    var fontSize = this.makeFontSizeDropdown_();
    var color = this.makeColorDropdown_();
    var lineHeight = this.makeLineHeightDropdown_();

    var toolbarOptions = [
      utils.elt('div', [font], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [fontSize], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [color], { 'class': 'firepad-btn-group'}),

      utils.elt('div', [
        self.makeButton_('bold', 'Bold'), 
        self.makeButton_('italic', 'Italic'), 
        self.makeButton_('underline', 'Underline'), 
        self.makeButton_('highlight', 'Highlight', 'magic')
      ], { 'class': 'firepad-btn-group'}),

      utils.elt('div', [
        self.makeButton_('unordered-list', 'Unordered List', 'list-2', 'firepad'), 
        self.makeButton_('ordered-list', 'Ordered List', 'numbered-list', 'firepad'),
        self.makeButton_('todo-list', 'Todo List', 'list', 'firepad')
      ], { 'class': 'firepad-btn-group'}),

      utils.elt('div', [
        self.makeButton_('indent-decrease', 'Outdent', 'outdent'), 
        lineHeight,
        self.makeButton_('indent-increase', 'Indent', 'indent')
      ], { 'class': 'firepad-btn-group'}),

      utils.elt('div', [
        self.makeButton_('left', 'Align Left', 'align-left'),
        self.makeButton_('center', 'Align Center', 'align-center'), 
        self.makeButton_('right', 'Align Right', 'align-right')
      ], { 'class': 'firepad-btn-group'}),

      utils.elt('div', [
        self.makeButton_('undo', 'Undo', 'undo', 'firepad'), 
        self.makeButton_('redo', 'Redo', 'redo', 'firepad')
      ], { 'class': 'firepad-btn-group'})
    ];

    if (self.imageInsertionUI) {
      toolbarOptions.push(utils.elt('div', [self.makeButton_('insert-image', 'Insert Image', 'picture-o')], { 'class': 'firepad-btn-group' }));
    }

    var toolbarWrapper = utils.elt('div', toolbarOptions, { 'class': 'firepad-toolbar-wrapper' });
    var toolbar = utils.elt('div', null, { 'class': 'firepad-toolbar' });
    toolbar.appendChild(toolbarWrapper)

    return toolbar;
  };

  RichTextToolbar.prototype.makeFontDropdown_ = function() {
    // NOTE: There must be matching .css styles in firepad.css.
    var fonts = ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Times New Roman', 'Verdana'];

    var items = [];
    for(var i = 0; i < fonts.length; i++) {
      var content = utils.elt('span', fonts[i]);
      content.setAttribute('style', 'font-family:' + fonts[i]);
      items.push({ content: content, value: fonts[i] });
    }
    return this.makeDropdown_('Font', 'font', items);
  };

  RichTextToolbar.prototype.makeFontSizeDropdown_ = function() {
    // NOTE: There must be matching .css styles in firepad.css.
    var sizes = [9, 10, 12, 14, 18, 24, 32, 42];

    var items = [];
    for(var i = 0; i < sizes.length; i++) {
      var content = utils.elt('span', sizes[i].toString());
      content.setAttribute('style', 'font-size:' + sizes[i] + 'px; line-height:' + (sizes[i]-6) + 'px;');
      items.push({ content: content, value: sizes[i] });
    }
    return this.makeDropdown_('Size', 'font-size', items, 'px');
  };

  RichTextToolbar.prototype.makeColorDropdown_ = function() {
    var colors = ['#333', '#ff5f5f', '#ffd05f', '#6cff5f', '#5fa2ff', '#c55fff', 'grey'];

    var items = [];
    for(var i = 0; i < colors.length; i++) {
      var content = utils.elt('div');
      content.className = 'firepad-color-dropdown-item';
      content.setAttribute('style', 'background-color:' + colors[i]);
      items.push({ content: content, value: colors[i] });
    }
    return this.makeDropdown_('Color', 'color', items);
  };

  RichTextToolbar.prototype.makeLineHeightDropdown_ = function() {
    var heights = ['1', '1.5', '2'];

    var items = [];
    for(var i = 0; i < heights.length; i++) {
      var content = utils.elt('span', heights[i]);
      content.className = 'firepad-color-dropdown-item';
      items.push({ content: content, value: heights[i] });
    }
    return this.makeDropdown_('Line Height', 'line-height', items, '', 'text-height');
  };

  RichTextToolbar.prototype.makeDropdown_ = function(title, eventName, items, value_suffix, iconName) {
    value_suffix = value_suffix || "";
    iconName = iconName || false;
    var self = this;
    var button;
    var list = utils.elt('ul', [ ], { 'class': 'firepad-dropdown-menu' });

    if(iconName) {
      button = utils.elt('a', [        
        utils.elt('i', '', { 'class': 'fa fa-' + iconName } )
      ], { 'class': 'firepad-btn firepad-dropdown', 'title': title, 'data-toggle': 'tooltip' });
    }
    else {
      button = utils.elt('a', title + ' \u25be', { 'class': 'firepad-btn firepad-dropdown' });
    }

    button.appendChild(list);

    var isShown = false;
    function showDropdown() {
      if (!isShown) {
        list.style.display = 'block';
        utils.on(document, 'click', hideDropdown, /*capture=*/true);
        isShown = true;
      }
    }

    var justDismissed = false;
    function hideDropdown() {
      if (isShown) {
        list.style.display = '';
        utils.off(document, 'click', hideDropdown, /*capture=*/true);
        isShown = false;
      }
      // HACK so we can avoid re-showing the dropdown if you click on the dropdown header to dismiss it.
      justDismissed = true;
      setTimeout(function() { justDismissed = false; }, 0);
    }

    function addItem(content, value) {
      if (typeof content !== 'object') {
        content = document.createTextNode(String(content));
      }
      var element = utils.elt('a', [content]);

      utils.on(element, 'click', utils.stopEventAnd(function() {
        hideDropdown();
        self.trigger(eventName, value + value_suffix);
      }));

      list.appendChild(element);
    }

    for(var i = 0; i < items.length; i++) {
      var content = items[i].content, value = items[i].value;
      addItem(content, value);
    }

    utils.on(button, 'click', utils.stopEventAnd(function() {
      if (!justDismissed) {
        showDropdown();
      }
    }));

    return button;
  };

  return RichTextToolbar;
})();
