
# Kaleidoscope
  
class Kaleidoscope
  
  HALF_PI: Math.PI / 2
  TWO_PI: Math.PI * 2
  
  viewportHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)  
  viewportWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  
  constructor: ( @options = {} ) ->
    
    @defaults =
      offsetRotation: 0.0
      offsetScale: 1.0
      offsetX: 0.0
      offsetY: 0.0
      radius: @viewportWidth / 2
      slices: 28      
      zoom: 1.0
        
    @[ key ] = val for key, val of @defaults
    @[ key ] = val for key, val of @options
      
    @domElement ?= document.createElement 'canvas'
    @context ?= @domElement.getContext '2d'
    @image ?= document.createElement 'img'
    
  draw: ->
    
    @domElement.width = @domElement.height = @radius * 2
    @context.fillStyle = @context.createPattern @image, 'repeat'
    
    scale = @zoom * ( @radius / Math.min @image.width, @image.height )
    step = @TWO_PI / @slices
    cx = @image.width / 2

    for index in [ 0..@slices ]
      
      @context.save()
      @context.translate @radius, @radius
      @context.rotate index * step
      
      @context.beginPath()
      @context.moveTo -0.5, -0.5
      @context.arc 0, 0, @radius, step * -0.51, step * 0.51
      @context.lineTo 0.5, 0.5
      @context.closePath()
      
      @context.rotate @HALF_PI
      #@context.scale scale, scale
      @context.scale [-1,1][index % 2], 1
      @context.translate @offsetX - cx, @offsetY
      @context.rotate @offsetRotation
      @context.scale @offsetScale, @offsetScale
      
      @context.fill()
      @context.restore()

# Drag & Drop
  
class DragDrop
  
  constructor: ( @callback, @context = document, @filter = /^image/i ) ->
    
    disable = ( event ) ->
      do event.stopPropagation
      do event.preventDefault
    
    @context.addEventListener 'dragleave', disable
    @context.addEventListener 'dragenter', disable
    @context.addEventListener 'dragover', disable
    @context.addEventListener 'drop', @onDrop, no
      
  onDrop: ( event ) =>
    
    do event.stopPropagation
    do event.preventDefault
      
    file = event.dataTransfer.files[0]
    
    if @filter.test file.type
      
      reader = new FileReader
      reader.onload = ( event ) => @callback? event.target.result
      reader.readAsDataURL file

# Init kaleidoscope
imagesPath = 'http://apps.gordeenko.com/Kaleidoscope/patterns/'
presetImages = ['pic.jpg', 'pic1.jpg', 'pic2.jpg', 'pic3.jpg', 'pic4.jpg']
  
image = new Image
image.onload = => do kaleidoscope.draw
image.src = imagesPath + presetImages[Math.round(Math.random()*4)]

kaleidoscope = new Kaleidoscope
  image: image
  slices: 20

kaleidoscope.domElement.style.position = 'absolute'
kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px'
kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px'
kaleidoscope.domElement.style.left = '50%'
kaleidoscope.domElement.style.top = '50%'
document.body.appendChild kaleidoscope.domElement
  
# Init drag & drop

dragger = new DragDrop ( data ) -> kaleidoscope.image.src = data
  
# Mouse events
  
tx = kaleidoscope.offsetX
ty = kaleidoscope.offsetY
tr = kaleidoscope.offsetRotation


options =
  interactive: no
  animate: yes
  reverse: no
  cycleImages: yes
  cycleOffset: yes
  ease: 0.1
  animationSpeed: 0.5

# Mouse movement
onMouseMoved = ( event ) =>
  
  if options.interactive
    
    tx = event.pageX
    tr = event.pageY / kaleidoscope.viewportHeight * 360 / 100
    #tr = Math.atan2 tx, ty 
  
do startAnimation = =>
  
  if options.animate
    if options.reverse
      ty += options.animationSpeed
    else
      ty -= options.animationSpeed

  setTimeout startAnimation, 1000/60

document.querySelector('canvas').addEventListener 'mousemove', onMouseMoved, no
                
# Init

#startAnimation()
  
toggleInteractive = =>
  options.interactive = options.interactive == false
  
document.querySelector('canvas').addEventListener 'click', toggleInteractive, no
                
do update = =>

  delta = tr - kaleidoscope.offsetRotation
  theta = Math.atan2( Math.sin( delta ), Math.cos( delta ) )

  kaleidoscope.offsetX += ( tx - kaleidoscope.offsetX ) * options.ease
  kaleidoscope.offsetY += ( ty - kaleidoscope.offsetY ) * options.ease
  kaleidoscope.offsetRotation += ( theta - kaleidoscope.offsetRotation ) * options.ease

  do kaleidoscope.draw
  
  setTimeout update, 1000/60
  
sameImageCycles = 1
  
do cyclePos = => 
  
  if options.cycleOffset
    tx += 100
    if sameImageCycles++ > 2
      sameImageCycles = 1
      if options.cycleImages
        image.src = imagesPath + presetImages[Math.round(Math.random()*4)]
    
  setTimeout cyclePos, 1000 * 60
    
# Init gui

gui = new dat.GUI
#gui.add( kaleidoscope, 'zoom' ).min( 0.25 ).max( 2.0 )
gui.add( kaleidoscope, 'slices' ).min( 6 ).max( 50 ).step( 2 )
#gui.add( kaleidoscope, 'radius' ).min( 200 ).max( 500 )
#gui.add( kaleidoscope, 'offsetX' ).min( -kaleidoscope.radius ).max( kaleidoscope.radius ).listen()
#gui.add( kaleidoscope, 'offsetY' ).min( -kaleidoscope.radius ).max( kaleidoscope.radius ).listen()
#gui.add( kaleidoscope, 'offsetRotation' ).min( -Math.PI ).max( Math.PI ).listen()
gui.add( kaleidoscope, 'offsetScale' ).min( 0.5 ).max( 2.0 )
#gui.add( options, 'interactive' ).listen()
gui.add( options, 'animationSpeed').min( 0.1 ).max( 5.0 )
gui.add options, 'animate'
gui.add options, 'cycleImages'
gui.add options, 'cycleOffset'
gui.add options, 'reverse'
gui.close()

onChange = =>

  kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px'
  kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px'
    
  options.interactive = no
    
  do kaleidoscope.draw

( c.onChange onChange unless c.property is 'interactive' ) for c in gui.__controllers
  
