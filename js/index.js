(function() {
  var DragDrop, Kaleidoscope, c, cyclePos, dragger, gui, image, imagesPath, kaleidoscope, onChange, onMouseMoved, options, presetImages, sameImageCycles, startAnimation, toggleInteractive, tr, tx, ty, update, _i, _len, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this;

  Kaleidoscope = (function() {
    Kaleidoscope.prototype.HALF_PI = Math.PI / 2;

    Kaleidoscope.prototype.TWO_PI = Math.PI * 2;

    Kaleidoscope.prototype.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    Kaleidoscope.prototype.viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    function Kaleidoscope(options) {
      var key, val, _ref, _ref1;
      this.options = options != null ? options : {};
      this.defaults = {
        offsetRotation: 0.0,
        offsetScale: 1.0,
        offsetX: 0.0,
        offsetY: 0.0,
        radius: this.viewportWidth / 2,
        slices: 28,
        zoom: 1.0
      };
      _ref = this.defaults;
      for (key in _ref) {
        val = _ref[key];
        this[key] = val;
      }
      _ref1 = this.options;
      for (key in _ref1) {
        val = _ref1[key];
        this[key] = val;
      }
      if (this.domElement == null) {
        this.domElement = document.createElement('canvas');
      }
      if (this.context == null) {
        this.context = this.domElement.getContext('2d');
      }
      if (this.image == null) {
        this.image = document.createElement('img');
      }
    }

    Kaleidoscope.prototype.draw = function() {
      var cx, index, scale, step, _i, _ref, _results;
      this.domElement.width = this.domElement.height = this.radius * 2;
      this.context.fillStyle = this.context.createPattern(this.image, 'repeat');
      scale = this.zoom * (this.radius / Math.min(this.image.width, this.image.height));
      step = this.TWO_PI / this.slices;
      cx = this.image.width / 2;
      _results = [];
      for (index = _i = 0, _ref = this.slices; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
        this.context.save();
        this.context.translate(this.radius, this.radius);
        this.context.rotate(index * step);
        this.context.beginPath();
        this.context.moveTo(-0.5, -0.5);
        this.context.arc(0, 0, this.radius, step * -0.51, step * 0.51);
        this.context.lineTo(0.5, 0.5);
        this.context.closePath();
        this.context.rotate(this.HALF_PI);
        this.context.scale([-1, 1][index % 2], 1);
        this.context.translate(this.offsetX - cx, this.offsetY);
        this.context.rotate(this.offsetRotation);
        this.context.scale(this.offsetScale, this.offsetScale);
        this.context.fill();
        _results.push(this.context.restore());
      }
      return _results;
    };

    return Kaleidoscope;

  })();

  DragDrop = (function() {
    function DragDrop(callback, context, filter) {
      var disable;
      this.callback = callback;
      this.context = context != null ? context : document;
      this.filter = filter != null ? filter : /^image/i;
      this.onDrop = __bind(this.onDrop, this);
      disable = function(event) {
        event.stopPropagation();
        return event.preventDefault();
      };
      this.context.addEventListener('dragleave', disable);
      this.context.addEventListener('dragenter', disable);
      this.context.addEventListener('dragover', disable);
      this.context.addEventListener('drop', this.onDrop, false);
    }

    DragDrop.prototype.onDrop = function(event) {
      var file, reader,
        _this = this;
      event.stopPropagation();
      event.preventDefault();
      file = event.dataTransfer.files[0];
      if (this.filter.test(file.type)) {
        reader = new FileReader;
        reader.onload = function(event) {
          return typeof _this.callback === "function" ? _this.callback(event.target.result) : void 0;
        };
        return reader.readAsDataURL(file);
      }
    };

    return DragDrop;

  })();

  imagesPath = 'http://apps.gordeenko.com/Kaleidoscope/patterns/';

  presetImages = ['pic.jpg', 'pic1.jpg', 'pic2.jpg', 'pic3.jpg', 'pic4.jpg'];

  image = new Image;

  image.onload = function() {
    return kaleidoscope.draw();
  };

  image.src = imagesPath + presetImages[Math.round(Math.random() * 4)];

  kaleidoscope = new Kaleidoscope({
    image: image,
    slices: 20
  });

  kaleidoscope.domElement.style.position = 'absolute';

  kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';

  kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';

  kaleidoscope.domElement.style.left = '50%';

  kaleidoscope.domElement.style.top = '50%';

  document.body.appendChild(kaleidoscope.domElement);

  dragger = new DragDrop(function(data) {
    return kaleidoscope.image.src = data;
  });

  tx = kaleidoscope.offsetX;

  ty = kaleidoscope.offsetY;

  tr = kaleidoscope.offsetRotation;

  options = {
    interactive: false,
    ease: 0.1
  };

  onMouseMoved = function(event) {
    if (options.interactive) {
      tx = event.pageX;
      return tr = event.pageY / kaleidoscope.viewportHeight * 360 / 100;
    }
  };

  (startAnimation = function() {
    ty -= .5;
    return setTimeout(startAnimation, 1000 / 60);
  })();

  document.querySelector('canvas').addEventListener('mousemove', onMouseMoved, false);

  toggleInteractive = function() {
    return options.interactive = options.interactive === false;
  };

  document.querySelector('canvas').addEventListener('click', toggleInteractive, false);

  (update = function() {
    var delta, theta;
    delta = tr - kaleidoscope.offsetRotation;
    theta = Math.atan2(Math.sin(delta), Math.cos(delta));
    kaleidoscope.offsetX += (tx - kaleidoscope.offsetX) * options.ease;
    kaleidoscope.offsetY += (ty - kaleidoscope.offsetY) * options.ease;
    kaleidoscope.offsetRotation += (theta - kaleidoscope.offsetRotation) * options.ease;
    kaleidoscope.draw();
    return setTimeout(update, 1000 / 60);
  })();

  sameImageCycles = 1;

  (cyclePos = function() {
    tx += 100;
    if (sameImageCycles++ > 2) {
      sameImageCycles = 1;
      image.src = imagesPath + presetImages[Math.round(Math.random() * 4)];
    }
    return setTimeout(cyclePos, 1000 * 60);
  })();

  gui = new dat.GUI;

  gui.add(kaleidoscope, 'slices').min(6).max(50).step(2);

  gui.add(kaleidoscope, 'offsetScale').min(0.5).max(2.0);

  gui.close();

  onChange = function() {
    kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';
    kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';
    options.interactive = false;
    return kaleidoscope.draw();
  };

  _ref = gui.__controllers;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    c = _ref[_i];
    if (c.property !== 'interactive') {
      c.onChange(onChange);
    }
  }

}).call(this);
