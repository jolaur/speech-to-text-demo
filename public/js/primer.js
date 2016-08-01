Primer = function(container, width, height) {
  this.container = container
  this.width = width
  this.height = height
  
  this.actions = []
  
  this.init()
}

Primer.prototype = {
  init: function() {
    $("html head").append("<style>.primer_text { position: absolute; margin: 0; padding: 0; line-height: normal; z-index: 0;}</style>")
    
    var el = $(this.container).eq(0)
    
    el.append('<div id="primer_text"></div>')
    var tel = $("#primer_text", el).eq(0)
    tel.css("position", "relative")
    this.element = tel
    
    el.append('<canvas width="' + this.width + '" height="' + this.height + '" style="z-index: 1;"></canvas>')
    var jelc = $('canvas', el)
    var elc = jelc[0]
    this.context = elc.getContext('2d')
    
    this.root = new Primer.Layer()
    this.root.bind(this)
    
    this.setupExt()
    
    var self = this
    jelc.eq(0).mousemove(function(e) {
      var bounds = e.currentTarget.getBoundingClientRect()
      e.localX = e.clientX - bounds.left
      e.localY = e.clientY - bounds.top
      self.ghost(e)
    })
  },
  
  get primer() {
    return this
  },
  
  get x() {
    return 0
  },
  
  get y() {
    return 0
  },
  
  get globalX() {
    return 0
  },
  
  get globalY() {
    return 0
  },
  
  addChild: function(child) {
    child.bind(this)
    this.root.addChild(child)
    this.draw()
  },
  
  removeChild: function(child) {
    this.root.removeChild(child)
    this.draw()
  },
  
  draw: function() {
    this.context.clearRect(0, 0, this.width, this.height)
    $(".primer_text", this.element).remove()
    this.setupExt()
    this.root.draw()
  },
  
  ghost: function(e) {
    this.root.ghost(e)
    for(var i in this.actions) {
      var action = this.actions[i]
      action[0](action[1])
    }
    this.actions = []
  },
  
  setupExt: function() {
    this.context.ext = {
      textAlign: "left",
      font: "10px sans-serif"
    }
  }
}

Primer.Layer = function() {
  this.primer = null
  
  this.children = []
  this.calls = []
  
  this.xVal = 0
  this.yVal = 0
  
  this.visibleVal = true
  
  this.mouseoverVal = function() { }
  this.mouseoutVal = function() { }
  
  this.mouseWithin = false
}

Primer.Layer.prototype = {
  bind: function(parent) {
    this.parent = parent
    this.primer = parent.primer
    
    for(var i in this.children) {
      this.children[i].bind(this)
    }
  },
  
  get context() {
    return this.primer.context
  },
  
  get element() {
    return this.primer.element
  },
  
  /* x and y getters and setters */
  
  get x() {
    return this.xVal
  },
  
  set x(xVal) {
    this.xVal = xVal
    if(this.primer) this.primer.draw()
  },
  
  get y() {
    return this.yVal
  },
  
  set y(yVal) {
    this.yVal = yVal
    if(this.primer) this.primer.draw()
  },
  
  /* global x and y getters */
  
  get globalX() {
    return this.x + this.parent.globalX
  },
  
  get globalY() {
    return this.y + this.parent.globalY
  },
  
  /* visibility getter/setter */
  
  get visible() {
    return this.visibleVal
  },
  
  set visible(visibleVal) {
    this.visibleVal = visibleVal
    if(this.primer) this.primer.draw()
  },
  
  /* children */
  
  addChild: function(child) {
    child.bind(this)
    this.children.push(child)
    if(this.primer) this.primer.draw()
  },
  
  removeChild: function(child) {
    var newChildren = []
    for (var i = 0; i < this.children.length; i++) {
      var c = this.children[i]
      if (c != child) {
        newChildren.push(c)
      }
    }
    this.children = newChildren
  },
  
  /* events */
  
  mouseover: function(fn) {
    this.mouseoverVal = fn
  },
  
  mouseout: function(fn) {
    this.mouseoutVal = fn
  },
  
  /* canvas api */
  
  set fillStyle(a) {
    this.calls.push(["fillStyle", a])
  },
  
  set strokeStyle(a) {
    this.calls.push(["strokeStyle", a])
  },
  
  beginPath: function() {
    this.calls.push(["beginPath"])
  },
  
  moveTo: function(a, b) {
    this.calls.push(["moveTo", a, b])
  },
  
  lineTo: function(a, b) {
    this.calls.push(["lineTo", a, b])
  },
  
  quadraticCurveTo: function(a, b, c, d) {
    this.calls.push(["quadraticCurveTo", a, b, c, d])
  },
  
  arc: function(a, b, c, d, e, f) {
    this.calls.push(["arc", a, b, c, d, e, f])
  },
  
  fill: function() {
    this.calls.push(["fill"])
  },
  
  stroke: function() {
    this.calls.push(["stroke"])
  },
  
  fillRect: function(a, b, c, d) {
    this.calls.push(["fillRect", a, b, c, d])
  },
  
  fillText: function(a, b, c, d) {
    this.calls.push(["fillText", a, b, c, d])
  },
  
  set textAlign(a) {
    this.calls.push(["textAlign", a])
  },
  
  set font(a) {
    this.calls.push(["font", a])
  },
  
  /* meta canvas api */
  
  rect: function(x, y, w, h) {
    this.beginPath()
    this.moveTo(x, y)
    this.lineTo(x + w, y)
    this.lineTo(x + w, y + h)
    this.lineTo(x, y + h)
    this.lineTo(x, y)
  },
  
  roundedRect: function(x, y, w, h, rad) {
    this.beginPath()
    this.moveTo(x, y + rad);
    this.lineTo(x, y + h - rad);
    this.quadraticCurveTo(x, y + h, x + rad, y + h);
    this.lineTo(x + w - rad, y + h);
    this.quadraticCurveTo(x + w, y + h, x + w, y + h - rad);
    this.lineTo(x + w, y + rad);
    this.quadraticCurveTo(x + w, y, x + w - rad, y);
    this.lineTo(x + rad, y);
    this.quadraticCurveTo(x, y, x, y + rad);
  },
  
  fillRoundedRect: function(x, y, w, h, rad) {
    this.roundedRect(x, y, w, h, rad)
    this.fill()
  },
  
  /* draw */
  
  draw: function() {
    if(!this.visible) { return }
    
    this.context.save()
    this.context.translate(this.x, this.y)
    
    for(var i in this.calls) {
      var call = this.calls[i]
      
      switch(call[0]) {
        case "strokeStyle":      this.context.strokeStyle = call[1]; break
        case "fillStyle":        this.context.fillStyle = call[1]; break
        case "fillRect":         this.context.fillRect(call[1], call[2], call[3], call[4]); break
        case "beginPath":        this.context.beginPath(); break
        case "moveTo":           this.context.moveTo(call[1], call[2]); break
        case "lineTo":           this.context.lineTo(call[1], call[2]); break
        case "quadraticCurveTo": this.context.quadraticCurveTo(call[1], call[2], call[3], call[4]); break
        case "arc":              this.context.arc(call[1], call[2], call[3], call[4], call[5], call[6]); break
        case "fill":             this.context.fill(); break
        case "stroke":           this.context.stroke(); break
        
        case "fillText":         this.extFillText(call[1], call[2], call[3], call[4]); break
        case "textAlign":        this.context.ext.textAlign = call[1]
        case "font":             this.context.ext.font = call[1]
      }
    }
    
    for(var i in this.children) {
      this.children[i].draw()
    }
    
    this.context.restore()
  },
  
  /* canvas extensions */
  
  extFillText: function(text, x, y, width) {
    var styles = ''
    styles += 'left: ' + (this.globalX + x) + 'px;'
    styles += 'top: ' + (this.globalY + y) + 'px;'
    styles += 'width: ' + width + 'px;'
    styles += 'text-align: ' + this.context.ext.textAlign + ';'
    styles += 'color: ' + this.context.fillStyle + ';'
    styles += 'font: ' + this.context.ext.font + ';'
    this.element.append('<p class="primer_text" style="' + styles + '">' + text + '</p>')
  },
  
  /* ghost */
  
  ghost: function(e) {
    if(!this.visible) { return }
    
    this.context.save()
    this.context.translate(this.x, this.y)
    
    for(var i in this.calls) {
      var call = this.calls[i]
      
      switch(call[0]) {
        case "fillRect":         this.ghostFillRect(e, call[1], call[2], call[3], call[4]); break
        case "beginPath":        this.context.beginPath(); break
        case "moveTo":           this.context.moveTo(call[1], call[2]); break
        case "lineTo":           this.context.lineTo(call[1], call[2]); break
        case "quadraticCurveTo": this.context.quadraticCurveTo(call[1], call[2], call[3], call[4]); break
        case "arc":              this.context.arc(call[1], call[2], call[3], call[4], call[5], call[6]); break
        case "fill":             this.ghostFill(e); break
      }
    }
    
    for(var i in this.children) {
      
        e.localX -= this.x
        e.localY -= this.y
      
      this.children[i].ghost(e)
    }
    
    this.context.restore()
  },
  
  ghostDetect: function(e) {
    
      testX = e.localX - this.x
      testY = e.localY - this.y
    
    if(this.context.isPointInPath(testX, testY)) {
      if(!this.mouseWithin) {
        this.primer.actions.push([this.mouseoverVal, e])
      }
      
      this.mouseWithin = true
    } else {
      if(this.mouseWithin) {
        this.primer.actions.push([this.mouseoutVal, e])
      }
      
      this.mouseWithin = false
    }
  },
  
  ghostFillRect: function(e, x, y, w, h) {
    this.context.beginPath()
    this.context.moveTo(x, y)
    this.context.lineTo(x + w, y)
    this.context.lineTo(x + w, y + h)
    this.context.lineTo(x, y + h)
    this.context.lineTo(x, y)
    
    // console.log([e.localX, e.localY])
    
    this.ghostDetect(e)
  },
  
  ghostFill: function(e) {
    this.ghostDetect(e)
  }
}
