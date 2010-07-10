Ext.ns('Ext.ux.Mitchell');

Ext.ux.Mitchell.WindowDrawer = Ext.extend(Ext.Window, {
	closable        : false,
	resizable       : false,
	frame           : true,
	draggable       : false,
	modal           : false,
	closeAction     : 'hide',
	// private
	init            : function(parent) {
		this.win = parent;
		this.alignToParams = {};
		this.resizeHandles = this.side;
		parent.drawers = parent.drawers || {};
		parent.drawers[this.side] = this;
		parent.on({
			scope         : this,
			tofront       : this.onBeforeShow,
			toback        : this.onBeforeShow,
			resize        : this.onParentResize,
//			resize        : this.alignAndShow,
			show          : this.alignAndShow,
			beforedestroy : this.destroy,
			afterrender   : function(p) {
				// render WindowDrawer to parent's container, if available
				this.renderTo = p.el;
			}
		});
		
        /**
         * Manage the ghosting, but NOT for IE, which is a complete fail.  IE's filter css prevents the child ghost
         * from appearing.
         */


        if (! Ext.isIE) {
        	var drawerGhost = null;
            var drawer =  this;
            parent.ghost = parent.ghost.createSequence(function() {
                if (drawer.el && ! drawer.hidden) {
                    var winGhost    = this.activeGhost,
                        drawerGhost = drawer.ghost();

                    winGhost.appendChild(drawerGhost);
                    drawerGhost.anchorTo(winGhost.dom, drawer.alignToParams.alignTo, drawer.alignToParams.alignToXY);
                    drawerGhost.applyStyles('z-index: -1;');
                    winGhost.applyStyles('overflow: visible;');
                }
            });
            parent.unghost = parent.unghost.createInterceptor(function() {
                if (drawer.activeGhost) {
                    drawer.unghost();
                    if (Ext.isWebKit || Ext.isGecko4 || Ext.isOpera) {
                    	drawer.anchorTo(this.el.dom, drawer.alignToParams.alignTo, drawer.alignToParams.alignToXY);
                    }
                }
            });
        }
	},
	// private
	initComponent   : function() {
		this.on({
			beforeshow  : {
				scope : this,
				fn    : this.onBeforeShow
			},
			beforehide  : {
				scope : this,
				fn    : this.onBeforeHide
			},
			afterrender : {
				scope : this,
				fn    : function() {
					this.el.show();
				}
			}
		});
		if (this.size) {
			if (this.side == 'e' || this.side == 'w') {
				this.width = this.size;
			} else {
				this.height = this.size;
			}
		}
		Ext.ux.Mitchell.WindowDrawer.superclass.initComponent.apply(this);
	},
	// private
	onBeforeResize  : function() {
		if (!this.hidden) {
			this.showAgain = true;
		}
		this.hide(true);
	},
	onAfterAnimHide : function() {
		
	},
	// private
	alignAndShow    : function() {
		this.setAlignment();
		if (this.showAgain) {
			this.show(true);
		}
		this.showAgain = false;
	},
	onParentResize  : function() {
		if (this.el) {
			this.CSS3clear();
			this.onBeforeShow();
			this.animDuration = 0.00001;
            this.afterShow(false);
            delete this.animDuration;
		}
	},
	setZIndex       : function() {
		return this.constructor.superclass.setZIndex.call(this, -3);
	},
	setAlignment    :  function() {
		if (! this.el) {
			return;
		}
		switch (this.side) {
			case "n":
				this.setWidth(this.win.el.getWidth() - 10);
				Ext.apply(this.alignToParams, {
					alignTo        : 'tl',
					alignToXY      :  [5, (this.el.getComputedHeight() * -1) + 5],
					alignToXYCSS3  :  [5, 5],
					slideDirection : 'b'
				});
			break;
			case "s":
				this.setWidth(this.win.el.getWidth() - 10);
				Ext.apply(this.alignToParams, {
					alignTo        : 'bl',
					alignToXY      :  [5, (Ext.isIE6)? -2 : -7],
					alignToXYCSS3  :  [5, (Ext.isIE6)? (this.el.getComputedHeight() * -1) : ((this.el.getComputedHeight() * -1) - 5)],
					slideDirection : 't'
				});
			break;
			case "w":
				this.setHeight(this.win.el.getHeight() - 10);
				Ext.apply(this.alignToParams, {
					alignTo        : 'tl',
					alignToXY      :  [(this.el.getComputedWidth() * -1) + 5, 5],
					alignToXYCSS3  :  [5, 5],
					slideDirection : 'r'
				});
			break;
			case "e":
				this.setHeight(this.win.el.getHeight() - 10);
				Ext.apply(this.alignToParams, {
					alignTo        : 'tr',
					alignToXY      :  [-5, 5],
					alignToXYCSS3  :  [(this.el.getComputedWidth() * -1) - 5, 5],
					slideDirection : 'l'
				});
			break;
		}
		if (!this.hidden) {
			this.el.alignTo(this.win.el, this.alignToParams.alignTo, (Ext.isWebKit || Ext.isGecko4 || Ext.isOpera) ? this.alignToParams.alignToXYCSS3 : this.alignToParams.alignToXY);
			// Simple fix for IE, where the bwrap doesn't properly resize.
			if (Ext.isIE) {
				this.bwrap.hide();
				this.bwrap.show();
			}
		}
		// force doLayout()
		this.doLayout();
	},
	//private
	onBeforeHide : function() {
		if (this.animate) {
			this.getEl().addClass('x-panel-animated');
		}
	},
	hide            : function(skipAnim) {
		if (this.hidden) {
			return;
		}
		if (this.animate === true && !skipAnim) {
			if (this.el.shadow) {
				this.el.disableShadow();
			}
			if (Ext.isWebKit || Ext.isGecko4 || Ext.isOpera) {
				this.CSS3slide({
					duration  : this.animDuration || .25,
					direction : "in"
				});
			} else {
				this.el.slideOut(this.alignToParams.slideDirection, {
	                duration : this.animDuration || .25,
	                callback : this.onAfterAnimHide,
	                scope    : this
	            });
			}
			this.hidden = true;
		} else {
			Ext.ux.Mitchell.WindowDrawer.superclass.hide.call(this);
		}
	},
	// private
	onBeforeShow    : function() {
		if (! this.rendered) {
            this.render(this.renderTo);
        }
		this.setAlignment();
        this.setZIndex();
	},
	show            : function(skipAnim) {
		if (this.hidden && this.fireEvent("beforeshow", this) !== false) {
            this.hidden = false;
            this.onBeforeShow();
            this.afterShow(!!skipAnim);
        }
    },
	afterShow       : function(skipAnim) {
    	if (this.animate && !skipAnim) {
    		this.getEl().removeClass('x-panel-animated');
    		if (Ext.isWebKit || Ext.isGecko4 || Ext.isOpera) {
    			this.CSS3slide({
					duration  : this.animDuration || .25,
					direction : "out"
				});
    		} else {
    			this.el.slideIn(this.alignToParams.slideDirection, {
                    scope    : this,
                    duration : this.animDuration || .25,
                    callback : function() {
                        if (this.el.shadow) { // honour WindowDrawer's "shadow" config
                            // re-enable shadows after animation
                            this.el.enableShadow(true);
                            this.el.shadow.show();
                            alert(this.el.shadow.isVisible());
                        }
                        // REQUIRED!!
                        this.el.show(); // somehow forces the shadow to appear
                    }
                });
    		}
    	} else {
    		Ext.ux.Mitchell.WindowDrawer.superclass.afterShow.call(this);
    	}
	},
	CSS3clear       : function() {
		this.el.setStyle({
			"-webkit-transition": "",
			"-moz-transition": "",
			"-o-transition": "",
			"-webkit-transform": "",
			"-moz-transform": "",
			"-o-transform": ""
		});
	},
	CSS3slide       : function(o) {
		var transform = "";
		if (o.direction === "in") {
			transform = (this.side === "n" || this.side === "s") ? "translateY(0px)" : "translateX(0px)";
		} else {
			switch(this.side) {
				case 'n' :
					transform = "translateY(-"+this.height+"px)";
				break;
				case 's' :
					transform = "translateY("+this.height+"px)";
				break;
				case 'e' :
					transform = "translateX("+this.width+"px)";
				break;
				case 'w' :
					transform = "translateX(-"+this.width+"px)";
				break;
			}
		}
		if (o.callback) {
			if (Ext.isWebKit) {
				this.el.addListener("webkitTransitionEnd", o.callback, this, {
					single: true
				});
			} else if (Ext.isGecko4) {
				this.el.addListener("transitionend", o.callback, this, {
					single: true
				});
			} else if (Ext.isOpera) {
				this.el.addListener("oTransitionEnd", o.callback, this, {
					single: true
				});
			}
		}
		this.el.setStyle({
			"-webkit-transition": "-webkit-transform "+o.duration+"s ease-in",
			"-moz-transition": "-moz-transform "+o.duration+"s ease-in",
			"-o-transition": "-o-transform "+o.duration+"s ease-in",
			"-webkit-transform": transform,
			"-moz-transform": transform,
			"-o-transform": transform
		});
	},
	// private
	toFront: Ext.emptyFn
});