/*
 *
 *  模块管理器
 *
 */
define(function(require, exports, module) {
	var klass = require('./Klass');
	var _moduleManager = klass(null, {
		_modules: [],
		_viewStack: [],
		_currentModuleName: "",
		_currentModule: null,
		_switchModule: function(moduleName) {
			var module = this._findModule(moduleName);
			if (module) {
				this._setCurrentModule(module);
				this._viewStack.push(moduleName);
			}
		},
		_findModule: function(moduleName) {
			for (var i = 0; i < this._modules; i++) {
				if (this._modules[i].name == moduleName) return this._modules[i];
			}
			return false;
		},
		_setCurrentModule: function(module) {
			this._currentModule && this._currentModule.freeze();
			this._currentModule && this._currentModule.deleteView();
			this._currentModule = module;
			this._currentModuleName = module.name;
			this._currentModule.unfreeze();
			this._currentModule.render();
		},
		_addModule: function(module) {
			this._modules.push(module);
			this._setCurrentModule(module);
		},
		backModule: function() {
			this._viewStack.pop();
			var moduleName = this._viewStack.pop();
			this._switchModule(moduleName);
		}

	});

	module.exports = klass(null,{
		__construct:function(){
			this.moduleManager = new _moduleManager();
		},
		add: function(module) {
			this.moduleManager._addModule(module);
		},
		get: function(moduleName) {
			this.moduleManager._switchModule(moduleName);
		},
		backModule: function() {
			this.moduleManager.backModule();
		}
	});
});