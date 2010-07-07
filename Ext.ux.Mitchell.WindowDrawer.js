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
			resize        : this.alignAndShow,
			show          : this.alignAndShow,
			beforedestroy : this.destroy,
			afterrender   : function(p) {
				// render WindowDrawer to parent's container, if available
				this.renderTo = p.el;
			}
		});
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
					halignToXY     :  [5, 5],
					slideDirection : 'b'
				});
			break;
			case "s":
				this.setWidth(this.win.el.getWidth() - 10);
				Ext.apply(this.alignToParams, {
					alignTo        : 'bl',
					alignToXY      :  [5, (Ext.isIE6)? -2 : -7],
					halignToXY     :  [5, (Ext.isIE6)? (this.el.getComputedHeight() * -1) : ((this.el.getComputedHeight() * -1) - 5)],
					slideDirection : 't'
				});
			break;
			case "w":
				this.setHeight(this.win.el.getHeight() - 10);
				Ext.apply(this.alignToParams, {
					alignTo        : 'tl',
					alignToXY      :  [(this.el.getComputedWidth() * -1) + 5, 5],
					halignToXY     :  [5, 5],
					slideDirection : 'r'
				});
			break;
			case "e":
				this.setHeight(this.win.el.getHeight() - 10);
				Ext.apply(this.alignToParams, {
					alignTo        : 'tr',
					alignToXY      :  [-5, 5],
					halignToXY     :  [(this.el.getComputedWidth() * -1) - 5, 5],
					slideDirection : 'l'
				});
			break;
		}
		if (!this.hidden) {
			this.el.alignTo(this.win.el, this.alignToParams.alignTo, this.alignToParams.alignToXY);
			// Simple fix for IE, where the bwrap doesn't properly resize.
			if (Ext.isIE) {
				this.bwrap.hide();
				this.bwrap.show();
			}
		} else {
			this.el.alignTo(this.win.el, this.alignToParams.alignTo, this.alignToParams.halignToXY);
		}
		// force doLayout()
		this.doLayout();
	},
	hide            : function(skipAnim) {
		if (this.hidden) {
			return;
		}
		if (this.animate === true && !skipAnim) {
			if (this.el.shadow) {
				this.el.disableShadow();
			}
			if (Ext.isWebKit || Ext.isGecko3) {
				this.CSS3slideIn({
					duration: this.animDuration || .25
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
		if (this.hidden) {
			this.setAlignment();
		}
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
    	this.el.show();
    	if (this.animate && !skipAnim) {
    		if (Ext.isWebKit || Ext.isGecko3) {
				this.CSS3slideOut({
					duration: this.animDuration || .25
				});
    		} else {
    			
    		}
    	} else {
    		Ext.ux.Mitchell.WindowDrawer.superclass.afterShow.call(this);
    	}
	},
	CSS3slideIn     : function(o) {
		var transform = "";
		switch(this.side) {
			case 'n' :
				transform = "translateY(0px)";
			break;
			case 's' :
				transform = "translateY(0px)";
			break;
			case 'w' :
				transform = "translateX(0px)";
			break;
			case 'e' :
				transform = "translateX(0px)";
			break;
		}
		this.el.setStyle({
			"-webkit-transition": "all "+o.duration+"s ease-in",
			"-moz-transition": "all 5s ease-in",
			"-webkit-transform": transform,
			"-moz-transform": transform
		});
	},
	
	CSS3slideOut    : function(o) {
		var transform = "";
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
		this.el.setStyle({
			"-webkit-transition": "all "+o.duration+"s ease-in",
			"-moz-transition": "all 5s ease-in",
			"-webkit-transform": transform,
			"-moz-transform": transform
		});
	},
	// private
	toFront: Ext.emptyFn
});