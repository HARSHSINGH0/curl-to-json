(function () {
	function r(e, n, t) {
		function o(i, f) {
			if (!n[i]) {
				if (!e[i]) {
					var c = "function" == typeof require && require;
					if (!f && c) return c(i, !0);
					if (u) return u(i, !0);
					var a = new Error("Cannot find module '" + i + "'");
					throw ((a.code = "MODULE_NOT_FOUND"), a);
				}
				var p = (n[i] = { exports: {} });
				e[i][0].call(
					p.exports,
					function (r) {
						var n = e[i][1][r];
						return o(n || r);
					},
					p,
					p.exports,
					r,
					e,
					n,
					t
				);
			}
			return n[i].exports;
		}
		for (
			var u = "function" == typeof require && require, i = 0;
			i < t.length;
			i++
		)
			o(t[i]);
		return o;
	}
	return r;
})()(
	{
		1: [function (require, module, exports) {}, {}],
		2: [
			function (require, module, exports) {
				(function (global) {
					(function () {
						"use strict";

						var possibleNames = [
							"BigInt64Array",
							"BigUint64Array",
							"Float32Array",
							"Float64Array",
							"Int16Array",
							"Int32Array",
							"Int8Array",
							"Uint16Array",
							"Uint32Array",
							"Uint8Array",
							"Uint8ClampedArray",
						];

						var g = typeof globalThis === "undefined" ? global : globalThis;

						module.exports = function availableTypedArrays() {
							var out = [];
							for (var i = 0; i < possibleNames.length; i++) {
								if (typeof g[possibleNames[i]] === "function") {
									out[out.length] = possibleNames[i];
								}
							}
							return out;
						};
					}.call(this));
				}.call(
					this,
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				));
			},
			{},
		],
		3: [
			function (require, module, exports) {
				"use strict";

				var GetIntrinsic = require("get-intrinsic");

				var callBind = require("./");

				var $indexOf = callBind(GetIntrinsic("String.prototype.indexOf"));

				module.exports = function callBoundIntrinsic(name, allowMissing) {
					var intrinsic = GetIntrinsic(name, !!allowMissing);
					if (
						typeof intrinsic === "function" &&
						$indexOf(name, ".prototype.") > -1
					) {
						return callBind(intrinsic);
					}
					return intrinsic;
				};
			},
			{ "./": 4, "get-intrinsic": 8 },
		],
		4: [
			function (require, module, exports) {
				"use strict";

				var bind = require("function-bind");
				var GetIntrinsic = require("get-intrinsic");

				var $apply = GetIntrinsic("%Function.prototype.apply%");
				var $call = GetIntrinsic("%Function.prototype.call%");
				var $reflectApply =
					GetIntrinsic("%Reflect.apply%", true) || bind.call($call, $apply);

				var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);
				var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
				var $max = GetIntrinsic("%Math.max%");

				if ($defineProperty) {
					try {
						$defineProperty({}, "a", { value: 1 });
					} catch (e) {
						// IE 8 has a broken defineProperty
						$defineProperty = null;
					}
				}

				module.exports = function callBind(originalFunction) {
					var func = $reflectApply(bind, $call, arguments);
					if ($gOPD && $defineProperty) {
						var desc = $gOPD(func, "length");
						if (desc.configurable) {
							// original length, plus the receiver, minus any additional arguments (after the receiver)
							$defineProperty(func, "length", {
								value:
									1 + $max(0, originalFunction.length - (arguments.length - 1)),
							});
						}
					}
					return func;
				};

				var applyBind = function applyBind() {
					return $reflectApply(bind, $apply, arguments);
				};

				if ($defineProperty) {
					$defineProperty(module.exports, "apply", { value: applyBind });
				} else {
					module.exports.apply = applyBind;
				}
			},
			{ "function-bind": 7, "get-intrinsic": 8 },
		],
		5: [
			function (require, module, exports) {
				"use strict";

				var isCallable = require("is-callable");

				var toStr = Object.prototype.toString;
				var hasOwnProperty = Object.prototype.hasOwnProperty;

				var forEachArray = function forEachArray(array, iterator, receiver) {
					for (var i = 0, len = array.length; i < len; i++) {
						if (hasOwnProperty.call(array, i)) {
							if (receiver == null) {
								iterator(array[i], i, array);
							} else {
								iterator.call(receiver, array[i], i, array);
							}
						}
					}
				};

				var forEachString = function forEachString(string, iterator, receiver) {
					for (var i = 0, len = string.length; i < len; i++) {
						// no such thing as a sparse string.
						if (receiver == null) {
							iterator(string.charAt(i), i, string);
						} else {
							iterator.call(receiver, string.charAt(i), i, string);
						}
					}
				};

				var forEachObject = function forEachObject(object, iterator, receiver) {
					for (var k in object) {
						if (hasOwnProperty.call(object, k)) {
							if (receiver == null) {
								iterator(object[k], k, object);
							} else {
								iterator.call(receiver, object[k], k, object);
							}
						}
					}
				};

				var forEach = function forEach(list, iterator, thisArg) {
					if (!isCallable(iterator)) {
						throw new TypeError("iterator must be a function");
					}

					var receiver;
					if (arguments.length >= 3) {
						receiver = thisArg;
					}

					if (toStr.call(list) === "[object Array]") {
						forEachArray(list, iterator, receiver);
					} else if (typeof list === "string") {
						forEachString(list, iterator, receiver);
					} else {
						forEachObject(list, iterator, receiver);
					}
				};

				module.exports = forEach;
			},
			{ "is-callable": 16 },
		],
		6: [
			function (require, module, exports) {
				"use strict";

				/* eslint no-invalid-this: 1 */

				var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
				var slice = Array.prototype.slice;
				var toStr = Object.prototype.toString;
				var funcType = "[object Function]";

				module.exports = function bind(that) {
					var target = this;
					if (typeof target !== "function" || toStr.call(target) !== funcType) {
						throw new TypeError(ERROR_MESSAGE + target);
					}
					var args = slice.call(arguments, 1);

					var bound;
					var binder = function () {
						if (this instanceof bound) {
							var result = target.apply(
								this,
								args.concat(slice.call(arguments))
							);
							if (Object(result) === result) {
								return result;
							}
							return this;
						} else {
							return target.apply(that, args.concat(slice.call(arguments)));
						}
					};

					var boundLength = Math.max(0, target.length - args.length);
					var boundArgs = [];
					for (var i = 0; i < boundLength; i++) {
						boundArgs.push("$" + i);
					}

					bound = Function(
						"binder",
						"return function (" +
							boundArgs.join(",") +
							"){ return binder.apply(this,arguments); }"
					)(binder);

					if (target.prototype) {
						var Empty = function Empty() {};
						Empty.prototype = target.prototype;
						bound.prototype = new Empty();
						Empty.prototype = null;
					}

					return bound;
				};
			},
			{},
		],
		7: [
			function (require, module, exports) {
				"use strict";

				var implementation = require("./implementation");

				module.exports = Function.prototype.bind || implementation;
			},
			{ "./implementation": 6 },
		],
		8: [
			function (require, module, exports) {
				"use strict";

				var undefined;

				var $SyntaxError = SyntaxError;
				var $Function = Function;
				var $TypeError = TypeError;

				// eslint-disable-next-line consistent-return
				var getEvalledConstructor = function (expressionSyntax) {
					try {
						return $Function(
							'"use strict"; return (' + expressionSyntax + ").constructor;"
						)();
					} catch (e) {}
				};

				var $gOPD = Object.getOwnPropertyDescriptor;
				if ($gOPD) {
					try {
						$gOPD({}, "");
					} catch (e) {
						$gOPD = null; // this is IE 8, which has a broken gOPD
					}
				}

				var throwTypeError = function () {
					throw new $TypeError();
				};
				var ThrowTypeError = $gOPD
					? (function () {
							try {
								// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
								arguments.callee; // IE 8 does not throw here
								return throwTypeError;
							} catch (calleeThrows) {
								try {
									// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
									return $gOPD(arguments, "callee").get;
								} catch (gOPDthrows) {
									return throwTypeError;
								}
							}
					  })()
					: throwTypeError;

				var hasSymbols = require("has-symbols")();

				var getProto =
					Object.getPrototypeOf ||
					function (x) {
						return x.__proto__;
					}; // eslint-disable-line no-proto

				var needsEval = {};

				var TypedArray =
					typeof Uint8Array === "undefined" ? undefined : getProto(Uint8Array);

				var INTRINSICS = {
					"%AggregateError%":
						typeof AggregateError === "undefined" ? undefined : AggregateError,
					"%Array%": Array,
					"%ArrayBuffer%":
						typeof ArrayBuffer === "undefined" ? undefined : ArrayBuffer,
					"%ArrayIteratorPrototype%": hasSymbols
						? getProto([][Symbol.iterator]())
						: undefined,
					"%AsyncFromSyncIteratorPrototype%": undefined,
					"%AsyncFunction%": needsEval,
					"%AsyncGenerator%": needsEval,
					"%AsyncGeneratorFunction%": needsEval,
					"%AsyncIteratorPrototype%": needsEval,
					"%Atomics%": typeof Atomics === "undefined" ? undefined : Atomics,
					"%BigInt%": typeof BigInt === "undefined" ? undefined : BigInt,
					"%BigInt64Array%":
						typeof BigInt64Array === "undefined" ? undefined : BigInt64Array,
					"%BigUint64Array%":
						typeof BigUint64Array === "undefined" ? undefined : BigUint64Array,
					"%Boolean%": Boolean,
					"%DataView%": typeof DataView === "undefined" ? undefined : DataView,
					"%Date%": Date,
					"%decodeURI%": decodeURI,
					"%decodeURIComponent%": decodeURIComponent,
					"%encodeURI%": encodeURI,
					"%encodeURIComponent%": encodeURIComponent,
					"%Error%": Error,
					"%eval%": eval, // eslint-disable-line no-eval
					"%EvalError%": EvalError,
					"%Float32Array%":
						typeof Float32Array === "undefined" ? undefined : Float32Array,
					"%Float64Array%":
						typeof Float64Array === "undefined" ? undefined : Float64Array,
					"%FinalizationRegistry%":
						typeof FinalizationRegistry === "undefined"
							? undefined
							: FinalizationRegistry,
					"%Function%": $Function,
					"%GeneratorFunction%": needsEval,
					"%Int8Array%":
						typeof Int8Array === "undefined" ? undefined : Int8Array,
					"%Int16Array%":
						typeof Int16Array === "undefined" ? undefined : Int16Array,
					"%Int32Array%":
						typeof Int32Array === "undefined" ? undefined : Int32Array,
					"%isFinite%": isFinite,
					"%isNaN%": isNaN,
					"%IteratorPrototype%": hasSymbols
						? getProto(getProto([][Symbol.iterator]()))
						: undefined,
					"%JSON%": typeof JSON === "object" ? JSON : undefined,
					"%Map%": typeof Map === "undefined" ? undefined : Map,
					"%MapIteratorPrototype%":
						typeof Map === "undefined" || !hasSymbols
							? undefined
							: getProto(new Map()[Symbol.iterator]()),
					"%Math%": Math,
					"%Number%": Number,
					"%Object%": Object,
					"%parseFloat%": parseFloat,
					"%parseInt%": parseInt,
					"%Promise%": typeof Promise === "undefined" ? undefined : Promise,
					"%Proxy%": typeof Proxy === "undefined" ? undefined : Proxy,
					"%RangeError%": RangeError,
					"%ReferenceError%": ReferenceError,
					"%Reflect%": typeof Reflect === "undefined" ? undefined : Reflect,
					"%RegExp%": RegExp,
					"%Set%": typeof Set === "undefined" ? undefined : Set,
					"%SetIteratorPrototype%":
						typeof Set === "undefined" || !hasSymbols
							? undefined
							: getProto(new Set()[Symbol.iterator]()),
					"%SharedArrayBuffer%":
						typeof SharedArrayBuffer === "undefined"
							? undefined
							: SharedArrayBuffer,
					"%String%": String,
					"%StringIteratorPrototype%": hasSymbols
						? getProto(""[Symbol.iterator]())
						: undefined,
					"%Symbol%": hasSymbols ? Symbol : undefined,
					"%SyntaxError%": $SyntaxError,
					"%ThrowTypeError%": ThrowTypeError,
					"%TypedArray%": TypedArray,
					"%TypeError%": $TypeError,
					"%Uint8Array%":
						typeof Uint8Array === "undefined" ? undefined : Uint8Array,
					"%Uint8ClampedArray%":
						typeof Uint8ClampedArray === "undefined"
							? undefined
							: Uint8ClampedArray,
					"%Uint16Array%":
						typeof Uint16Array === "undefined" ? undefined : Uint16Array,
					"%Uint32Array%":
						typeof Uint32Array === "undefined" ? undefined : Uint32Array,
					"%URIError%": URIError,
					"%WeakMap%": typeof WeakMap === "undefined" ? undefined : WeakMap,
					"%WeakRef%": typeof WeakRef === "undefined" ? undefined : WeakRef,
					"%WeakSet%": typeof WeakSet === "undefined" ? undefined : WeakSet,
				};

				try {
					null.error; // eslint-disable-line no-unused-expressions
				} catch (e) {
					// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
					var errorProto = getProto(getProto(e));
					INTRINSICS["%Error.prototype%"] = errorProto;
				}

				var doEval = function doEval(name) {
					var value;
					if (name === "%AsyncFunction%") {
						value = getEvalledConstructor("async function () {}");
					} else if (name === "%GeneratorFunction%") {
						value = getEvalledConstructor("function* () {}");
					} else if (name === "%AsyncGeneratorFunction%") {
						value = getEvalledConstructor("async function* () {}");
					} else if (name === "%AsyncGenerator%") {
						var fn = doEval("%AsyncGeneratorFunction%");
						if (fn) {
							value = fn.prototype;
						}
					} else if (name === "%AsyncIteratorPrototype%") {
						var gen = doEval("%AsyncGenerator%");
						if (gen) {
							value = getProto(gen.prototype);
						}
					}

					INTRINSICS[name] = value;

					return value;
				};

				var LEGACY_ALIASES = {
					"%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
					"%ArrayPrototype%": ["Array", "prototype"],
					"%ArrayProto_entries%": ["Array", "prototype", "entries"],
					"%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
					"%ArrayProto_keys%": ["Array", "prototype", "keys"],
					"%ArrayProto_values%": ["Array", "prototype", "values"],
					"%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
					"%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
					"%AsyncGeneratorPrototype%": [
						"AsyncGeneratorFunction",
						"prototype",
						"prototype",
					],
					"%BooleanPrototype%": ["Boolean", "prototype"],
					"%DataViewPrototype%": ["DataView", "prototype"],
					"%DatePrototype%": ["Date", "prototype"],
					"%ErrorPrototype%": ["Error", "prototype"],
					"%EvalErrorPrototype%": ["EvalError", "prototype"],
					"%Float32ArrayPrototype%": ["Float32Array", "prototype"],
					"%Float64ArrayPrototype%": ["Float64Array", "prototype"],
					"%FunctionPrototype%": ["Function", "prototype"],
					"%Generator%": ["GeneratorFunction", "prototype"],
					"%GeneratorPrototype%": [
						"GeneratorFunction",
						"prototype",
						"prototype",
					],
					"%Int8ArrayPrototype%": ["Int8Array", "prototype"],
					"%Int16ArrayPrototype%": ["Int16Array", "prototype"],
					"%Int32ArrayPrototype%": ["Int32Array", "prototype"],
					"%JSONParse%": ["JSON", "parse"],
					"%JSONStringify%": ["JSON", "stringify"],
					"%MapPrototype%": ["Map", "prototype"],
					"%NumberPrototype%": ["Number", "prototype"],
					"%ObjectPrototype%": ["Object", "prototype"],
					"%ObjProto_toString%": ["Object", "prototype", "toString"],
					"%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
					"%PromisePrototype%": ["Promise", "prototype"],
					"%PromiseProto_then%": ["Promise", "prototype", "then"],
					"%Promise_all%": ["Promise", "all"],
					"%Promise_reject%": ["Promise", "reject"],
					"%Promise_resolve%": ["Promise", "resolve"],
					"%RangeErrorPrototype%": ["RangeError", "prototype"],
					"%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
					"%RegExpPrototype%": ["RegExp", "prototype"],
					"%SetPrototype%": ["Set", "prototype"],
					"%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
					"%StringPrototype%": ["String", "prototype"],
					"%SymbolPrototype%": ["Symbol", "prototype"],
					"%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
					"%TypedArrayPrototype%": ["TypedArray", "prototype"],
					"%TypeErrorPrototype%": ["TypeError", "prototype"],
					"%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
					"%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
					"%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
					"%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
					"%URIErrorPrototype%": ["URIError", "prototype"],
					"%WeakMapPrototype%": ["WeakMap", "prototype"],
					"%WeakSetPrototype%": ["WeakSet", "prototype"],
				};

				var bind = require("function-bind");
				var hasOwn = require("has");
				var $concat = bind.call(Function.call, Array.prototype.concat);
				var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
				var $replace = bind.call(Function.call, String.prototype.replace);
				var $strSlice = bind.call(Function.call, String.prototype.slice);
				var $exec = bind.call(Function.call, RegExp.prototype.exec);

				/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
				var rePropName =
					/[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
				var reEscapeChar =
					/\\(\\)?/g; /** Used to match backslashes in property paths. */
				var stringToPath = function stringToPath(string) {
					var first = $strSlice(string, 0, 1);
					var last = $strSlice(string, -1);
					if (first === "%" && last !== "%") {
						throw new $SyntaxError(
							"invalid intrinsic syntax, expected closing `%`"
						);
					} else if (last === "%" && first !== "%") {
						throw new $SyntaxError(
							"invalid intrinsic syntax, expected opening `%`"
						);
					}
					var result = [];
					$replace(
						string,
						rePropName,
						function (match, number, quote, subString) {
							result[result.length] = quote
								? $replace(subString, reEscapeChar, "$1")
								: number || match;
						}
					);
					return result;
				};
				/* end adaptation */

				var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
					var intrinsicName = name;
					var alias;
					if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
						alias = LEGACY_ALIASES[intrinsicName];
						intrinsicName = "%" + alias[0] + "%";
					}

					if (hasOwn(INTRINSICS, intrinsicName)) {
						var value = INTRINSICS[intrinsicName];
						if (value === needsEval) {
							value = doEval(intrinsicName);
						}
						if (typeof value === "undefined" && !allowMissing) {
							throw new $TypeError(
								"intrinsic " +
									name +
									" exists, but is not available. Please file an issue!"
							);
						}

						return {
							alias: alias,
							name: intrinsicName,
							value: value,
						};
					}

					throw new $SyntaxError("intrinsic " + name + " does not exist!");
				};

				module.exports = function GetIntrinsic(name, allowMissing) {
					if (typeof name !== "string" || name.length === 0) {
						throw new $TypeError("intrinsic name must be a non-empty string");
					}
					if (arguments.length > 1 && typeof allowMissing !== "boolean") {
						throw new $TypeError('"allowMissing" argument must be a boolean');
					}

					if ($exec(/^%?[^%]*%?$/, name) === null) {
						throw new $SyntaxError(
							"`%` may not be present anywhere but at the beginning and end of the intrinsic name"
						);
					}
					var parts = stringToPath(name);
					var intrinsicBaseName = parts.length > 0 ? parts[0] : "";

					var intrinsic = getBaseIntrinsic(
						"%" + intrinsicBaseName + "%",
						allowMissing
					);
					var intrinsicRealName = intrinsic.name;
					var value = intrinsic.value;
					var skipFurtherCaching = false;

					var alias = intrinsic.alias;
					if (alias) {
						intrinsicBaseName = alias[0];
						$spliceApply(parts, $concat([0, 1], alias));
					}

					for (var i = 1, isOwn = true; i < parts.length; i += 1) {
						var part = parts[i];
						var first = $strSlice(part, 0, 1);
						var last = $strSlice(part, -1);
						if (
							(first === '"' ||
								first === "'" ||
								first === "`" ||
								last === '"' ||
								last === "'" ||
								last === "`") &&
							first !== last
						) {
							throw new $SyntaxError(
								"property names with quotes must have matching quotes"
							);
						}
						if (part === "constructor" || !isOwn) {
							skipFurtherCaching = true;
						}

						intrinsicBaseName += "." + part;
						intrinsicRealName = "%" + intrinsicBaseName + "%";

						if (hasOwn(INTRINSICS, intrinsicRealName)) {
							value = INTRINSICS[intrinsicRealName];
						} else if (value != null) {
							if (!(part in value)) {
								if (!allowMissing) {
									throw new $TypeError(
										"base intrinsic for " +
											name +
											" exists, but the property is not available."
									);
								}
								return void undefined;
							}
							if ($gOPD && i + 1 >= parts.length) {
								var desc = $gOPD(value, part);
								isOwn = !!desc;

								// By convention, when a data property is converted to an accessor
								// property to emulate a data property that does not suffer from
								// the override mistake, that accessor's getter is marked with
								// an `originalValue` property. Here, when we detect this, we
								// uphold the illusion by pretending to see that original data
								// property, i.e., returning the value rather than the getter
								// itself.
								if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
									value = desc.get;
								} else {
									value = value[part];
								}
							} else {
								isOwn = hasOwn(value, part);
								value = value[part];
							}

							if (isOwn && !skipFurtherCaching) {
								INTRINSICS[intrinsicRealName] = value;
							}
						}
					}
					return value;
				};
			},
			{ "function-bind": 7, has: 13, "has-symbols": 10 },
		],
		9: [
			function (require, module, exports) {
				"use strict";

				var GetIntrinsic = require("get-intrinsic");

				var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);

				if ($gOPD) {
					try {
						$gOPD([], "length");
					} catch (e) {
						// IE 8 has a broken gOPD
						$gOPD = null;
					}
				}

				module.exports = $gOPD;
			},
			{ "get-intrinsic": 8 },
		],
		10: [
			function (require, module, exports) {
				"use strict";

				var origSymbol = typeof Symbol !== "undefined" && Symbol;
				var hasSymbolSham = require("./shams");

				module.exports = function hasNativeSymbols() {
					if (typeof origSymbol !== "function") {
						return false;
					}
					if (typeof Symbol !== "function") {
						return false;
					}
					if (typeof origSymbol("foo") !== "symbol") {
						return false;
					}
					if (typeof Symbol("bar") !== "symbol") {
						return false;
					}

					return hasSymbolSham();
				};
			},
			{ "./shams": 11 },
		],
		11: [
			function (require, module, exports) {
				"use strict";

				/* eslint complexity: [2, 18], max-statements: [2, 33] */
				module.exports = function hasSymbols() {
					if (
						typeof Symbol !== "function" ||
						typeof Object.getOwnPropertySymbols !== "function"
					) {
						return false;
					}
					if (typeof Symbol.iterator === "symbol") {
						return true;
					}

					var obj = {};
					var sym = Symbol("test");
					var symObj = Object(sym);
					if (typeof sym === "string") {
						return false;
					}

					if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
						return false;
					}
					if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
						return false;
					}

					// temp disabled per https://github.com/ljharb/object.assign/issues/17
					// if (sym instanceof Symbol) { return false; }
					// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
					// if (!(symObj instanceof Symbol)) { return false; }

					// if (typeof Symbol.prototype.toString !== 'function') { return false; }
					// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

					var symVal = 42;
					obj[sym] = symVal;
					for (sym in obj) {
						return false;
					} // eslint-disable-line no-restricted-syntax, no-unreachable-loop
					if (
						typeof Object.keys === "function" &&
						Object.keys(obj).length !== 0
					) {
						return false;
					}

					if (
						typeof Object.getOwnPropertyNames === "function" &&
						Object.getOwnPropertyNames(obj).length !== 0
					) {
						return false;
					}

					var syms = Object.getOwnPropertySymbols(obj);
					if (syms.length !== 1 || syms[0] !== sym) {
						return false;
					}

					if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
						return false;
					}

					if (typeof Object.getOwnPropertyDescriptor === "function") {
						var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
						if (descriptor.value !== symVal || descriptor.enumerable !== true) {
							return false;
						}
					}

					return true;
				};
			},
			{},
		],
		12: [
			function (require, module, exports) {
				"use strict";

				var hasSymbols = require("has-symbols/shams");

				module.exports = function hasToStringTagShams() {
					return hasSymbols() && !!Symbol.toStringTag;
				};
			},
			{ "has-symbols/shams": 11 },
		],
		13: [
			function (require, module, exports) {
				"use strict";

				var bind = require("function-bind");

				module.exports = bind.call(
					Function.call,
					Object.prototype.hasOwnProperty
				);
			},
			{ "function-bind": 7 },
		],
		14: [
			function (require, module, exports) {
				if (typeof Object.create === "function") {
					// implementation from standard node.js 'util' module
					module.exports = function inherits(ctor, superCtor) {
						if (superCtor) {
							ctor.super_ = superCtor;
							ctor.prototype = Object.create(superCtor.prototype, {
								constructor: {
									value: ctor,
									enumerable: false,
									writable: true,
									configurable: true,
								},
							});
						}
					};
				} else {
					// old school shim for old browsers
					module.exports = function inherits(ctor, superCtor) {
						if (superCtor) {
							ctor.super_ = superCtor;
							var TempCtor = function () {};
							TempCtor.prototype = superCtor.prototype;
							ctor.prototype = new TempCtor();
							ctor.prototype.constructor = ctor;
						}
					};
				}
			},
			{},
		],
		15: [
			function (require, module, exports) {
				"use strict";

				var hasToStringTag = require("has-tostringtag/shams")();
				var callBound = require("call-bind/callBound");

				var $toString = callBound("Object.prototype.toString");

				var isStandardArguments = function isArguments(value) {
					if (
						hasToStringTag &&
						value &&
						typeof value === "object" &&
						Symbol.toStringTag in value
					) {
						return false;
					}
					return $toString(value) === "[object Arguments]";
				};

				var isLegacyArguments = function isArguments(value) {
					if (isStandardArguments(value)) {
						return true;
					}
					return (
						value !== null &&
						typeof value === "object" &&
						typeof value.length === "number" &&
						value.length >= 0 &&
						$toString(value) !== "[object Array]" &&
						$toString(value.callee) === "[object Function]"
					);
				};

				var supportsStandardArguments = (function () {
					return isStandardArguments(arguments);
				})();

				isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

				module.exports = supportsStandardArguments
					? isStandardArguments
					: isLegacyArguments;
			},
			{ "call-bind/callBound": 3, "has-tostringtag/shams": 12 },
		],
		16: [
			function (require, module, exports) {
				"use strict";

				var fnToStr = Function.prototype.toString;
				var reflectApply =
					typeof Reflect === "object" && Reflect !== null && Reflect.apply;
				var badArrayLike;
				var isCallableMarker;
				if (
					typeof reflectApply === "function" &&
					typeof Object.defineProperty === "function"
				) {
					try {
						badArrayLike = Object.defineProperty({}, "length", {
							get: function () {
								throw isCallableMarker;
							},
						});
						isCallableMarker = {};
						// eslint-disable-next-line no-throw-literal
						reflectApply(
							function () {
								throw 42;
							},
							null,
							badArrayLike
						);
					} catch (_) {
						if (_ !== isCallableMarker) {
							reflectApply = null;
						}
					}
				} else {
					reflectApply = null;
				}

				var constructorRegex = /^\s*class\b/;
				var isES6ClassFn = function isES6ClassFunction(value) {
					try {
						var fnStr = fnToStr.call(value);
						return constructorRegex.test(fnStr);
					} catch (e) {
						return false; // not a function
					}
				};

				var tryFunctionObject = function tryFunctionToStr(value) {
					try {
						if (isES6ClassFn(value)) {
							return false;
						}
						fnToStr.call(value);
						return true;
					} catch (e) {
						return false;
					}
				};
				var toStr = Object.prototype.toString;
				var objectClass = "[object Object]";
				var fnClass = "[object Function]";
				var genClass = "[object GeneratorFunction]";
				var ddaClass = "[object HTMLAllCollection]"; // IE 11
				var ddaClass2 = "[object HTML document.all class]";
				var ddaClass3 = "[object HTMLCollection]"; // IE 9-10
				var hasToStringTag =
					typeof Symbol === "function" && !!Symbol.toStringTag; // better: use `has-tostringtag`

				var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

				var isDDA = function isDocumentDotAll() {
					return false;
				};
				if (typeof document === "object") {
					// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
					var all = document.all;
					if (toStr.call(all) === toStr.call(document.all)) {
						isDDA = function isDocumentDotAll(value) {
							/* globals document: false */
							// in IE 6-8, typeof document.all is "object" and it's truthy
							if (
								(isIE68 || !value) &&
								(typeof value === "undefined" || typeof value === "object")
							) {
								try {
									var str = toStr.call(value);
									return (
										(str === ddaClass ||
											str === ddaClass2 ||
											str === ddaClass3 || // opera 12.16
											str === objectClass) && // IE 6-8
										value("") == null
									); // eslint-disable-line eqeqeq
								} catch (e) {
									/**/
								}
							}
							return false;
						};
					}
				}

				module.exports = reflectApply
					? function isCallable(value) {
							if (isDDA(value)) {
								return true;
							}
							if (!value) {
								return false;
							}
							if (typeof value !== "function" && typeof value !== "object") {
								return false;
							}
							try {
								reflectApply(value, null, badArrayLike);
							} catch (e) {
								if (e !== isCallableMarker) {
									return false;
								}
							}
							return !isES6ClassFn(value) && tryFunctionObject(value);
					  }
					: function isCallable(value) {
							if (isDDA(value)) {
								return true;
							}
							if (!value) {
								return false;
							}
							if (typeof value !== "function" && typeof value !== "object") {
								return false;
							}
							if (hasToStringTag) {
								return tryFunctionObject(value);
							}
							if (isES6ClassFn(value)) {
								return false;
							}
							var strClass = toStr.call(value);
							if (
								strClass !== fnClass &&
								strClass !== genClass &&
								!/^\[object HTML/.test(strClass)
							) {
								return false;
							}
							return tryFunctionObject(value);
					  };
			},
			{},
		],
		17: [
			function (require, module, exports) {
				"use strict";

				var toStr = Object.prototype.toString;
				var fnToStr = Function.prototype.toString;
				var isFnRegex = /^\s*(?:function)?\*/;
				var hasToStringTag = require("has-tostringtag/shams")();
				var getProto = Object.getPrototypeOf;
				var getGeneratorFunc = function () {
					// eslint-disable-line consistent-return
					if (!hasToStringTag) {
						return false;
					}
					try {
						return Function("return function*() {}")();
					} catch (e) {}
				};
				var GeneratorFunction;

				module.exports = function isGeneratorFunction(fn) {
					if (typeof fn !== "function") {
						return false;
					}
					if (isFnRegex.test(fnToStr.call(fn))) {
						return true;
					}
					if (!hasToStringTag) {
						var str = toStr.call(fn);
						return str === "[object GeneratorFunction]";
					}
					if (!getProto) {
						return false;
					}
					if (typeof GeneratorFunction === "undefined") {
						var generatorFunc = getGeneratorFunc();
						GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
					}
					return getProto(fn) === GeneratorFunction;
				};
			},
			{ "has-tostringtag/shams": 12 },
		],
		18: [
			function (require, module, exports) {
				(function (global) {
					(function () {
						"use strict";

						var forEach = require("for-each");
						var availableTypedArrays = require("available-typed-arrays");
						var callBound = require("call-bind/callBound");

						var $toString = callBound("Object.prototype.toString");
						var hasToStringTag = require("has-tostringtag/shams")();
						var gOPD = require("gopd");

						var g = typeof globalThis === "undefined" ? global : globalThis;
						var typedArrays = availableTypedArrays();

						var $indexOf =
							callBound("Array.prototype.indexOf", true) ||
							function indexOf(array, value) {
								for (var i = 0; i < array.length; i += 1) {
									if (array[i] === value) {
										return i;
									}
								}
								return -1;
							};
						var $slice = callBound("String.prototype.slice");
						var toStrTags = {};
						var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
						if (hasToStringTag && gOPD && getPrototypeOf) {
							forEach(typedArrays, function (typedArray) {
								var arr = new g[typedArray]();
								if (Symbol.toStringTag in arr) {
									var proto = getPrototypeOf(arr);
									var descriptor = gOPD(proto, Symbol.toStringTag);
									if (!descriptor) {
										var superProto = getPrototypeOf(proto);
										descriptor = gOPD(superProto, Symbol.toStringTag);
									}
									toStrTags[typedArray] = descriptor.get;
								}
							});
						}

						var tryTypedArrays = function tryAllTypedArrays(value) {
							var anyTrue = false;
							forEach(toStrTags, function (getter, typedArray) {
								if (!anyTrue) {
									try {
										anyTrue = getter.call(value) === typedArray;
									} catch (e) {
										/**/
									}
								}
							});
							return anyTrue;
						};

						module.exports = function isTypedArray(value) {
							if (!value || typeof value !== "object") {
								return false;
							}
							if (!hasToStringTag || !(Symbol.toStringTag in value)) {
								var tag = $slice($toString(value), 8, -1);
								return $indexOf(typedArrays, tag) > -1;
							}
							if (!gOPD) {
								return false;
							}
							return tryTypedArrays(value);
						};
					}.call(this));
				}.call(
					this,
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				));
			},
			{
				"available-typed-arrays": 2,
				"call-bind/callBound": 3,
				"for-each": 5,
				gopd: 9,
				"has-tostringtag/shams": 12,
			},
		],
		19: [
			function (require, module, exports) {
				(function (process) {
					(function () {
						// 'path' module extracted from Node.js v8.11.1 (only the posix part)
						// transplited with Babel

						// Copyright Joyent, Inc. and other Node contributors.
						//
						// Permission is hereby granted, free of charge, to any person obtaining a
						// copy of this software and associated documentation files (the
						// "Software"), to deal in the Software without restriction, including
						// without limitation the rights to use, copy, modify, merge, publish,
						// distribute, sublicense, and/or sell copies of the Software, and to permit
						// persons to whom the Software is furnished to do so, subject to the
						// following conditions:
						//
						// The above copyright notice and this permission notice shall be included
						// in all copies or substantial portions of the Software.
						//
						// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
						// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
						// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
						// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
						// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
						// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
						// USE OR OTHER DEALINGS IN THE SOFTWARE.

						"use strict";

						function assertPath(path) {
							if (typeof path !== "string") {
								throw new TypeError(
									"Path must be a string. Received " + JSON.stringify(path)
								);
							}
						}

						// Resolves . and .. elements in a path with directory names
						function normalizeStringPosix(path, allowAboveRoot) {
							var res = "";
							var lastSegmentLength = 0;
							var lastSlash = -1;
							var dots = 0;
							var code;
							for (var i = 0; i <= path.length; ++i) {
								if (i < path.length) code = path.charCodeAt(i);
								else if (code === 47 /*/*/) break;
								else code = 47 /*/*/;
								if (code === 47 /*/*/) {
									if (lastSlash === i - 1 || dots === 1) {
										// NOOP
									} else if (lastSlash !== i - 1 && dots === 2) {
										if (
											res.length < 2 ||
											lastSegmentLength !== 2 ||
											res.charCodeAt(res.length - 1) !== 46 /*.*/ ||
											res.charCodeAt(res.length - 2) !== 46 /*.*/
										) {
											if (res.length > 2) {
												var lastSlashIndex = res.lastIndexOf("/");
												if (lastSlashIndex !== res.length - 1) {
													if (lastSlashIndex === -1) {
														res = "";
														lastSegmentLength = 0;
													} else {
														res = res.slice(0, lastSlashIndex);
														lastSegmentLength =
															res.length - 1 - res.lastIndexOf("/");
													}
													lastSlash = i;
													dots = 0;
													continue;
												}
											} else if (res.length === 2 || res.length === 1) {
												res = "";
												lastSegmentLength = 0;
												lastSlash = i;
												dots = 0;
												continue;
											}
										}
										if (allowAboveRoot) {
											if (res.length > 0) res += "/..";
											else res = "..";
											lastSegmentLength = 2;
										}
									} else {
										if (res.length > 0)
											res += "/" + path.slice(lastSlash + 1, i);
										else res = path.slice(lastSlash + 1, i);
										lastSegmentLength = i - lastSlash - 1;
									}
									lastSlash = i;
									dots = 0;
								} else if (code === 46 /*.*/ && dots !== -1) {
									++dots;
								} else {
									dots = -1;
								}
							}
							return res;
						}

						function _format(sep, pathObject) {
							var dir = pathObject.dir || pathObject.root;
							var base =
								pathObject.base ||
								(pathObject.name || "") + (pathObject.ext || "");
							if (!dir) {
								return base;
							}
							if (dir === pathObject.root) {
								return dir + base;
							}
							return dir + sep + base;
						}

						var posix = {
							// path.resolve([from ...], to)
							resolve: function resolve() {
								var resolvedPath = "";
								var resolvedAbsolute = false;
								var cwd;

								for (
									var i = arguments.length - 1;
									i >= -1 && !resolvedAbsolute;
									i--
								) {
									var path;
									if (i >= 0) path = arguments[i];
									else {
										if (cwd === undefined) cwd = process.cwd();
										path = cwd;
									}

									assertPath(path);

									// Skip empty entries
									if (path.length === 0) {
										continue;
									}

									resolvedPath = path + "/" + resolvedPath;
									resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
								}

								// At this point the path should be resolved to a full absolute path, but
								// handle relative paths to be safe (might happen when process.cwd() fails)

								// Normalize the path
								resolvedPath = normalizeStringPosix(
									resolvedPath,
									!resolvedAbsolute
								);

								if (resolvedAbsolute) {
									if (resolvedPath.length > 0) return "/" + resolvedPath;
									else return "/";
								} else if (resolvedPath.length > 0) {
									return resolvedPath;
								} else {
									return ".";
								}
							},

							normalize: function normalize(path) {
								assertPath(path);

								if (path.length === 0) return ".";

								var isAbsolute = path.charCodeAt(0) === 47; /*/*/
								var trailingSeparator =
									path.charCodeAt(path.length - 1) === 47; /*/*/

								// Normalize the path
								path = normalizeStringPosix(path, !isAbsolute);

								if (path.length === 0 && !isAbsolute) path = ".";
								if (path.length > 0 && trailingSeparator) path += "/";

								if (isAbsolute) return "/" + path;
								return path;
							},

							isAbsolute: function isAbsolute(path) {
								assertPath(path);
								return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
							},

							join: function join() {
								if (arguments.length === 0) return ".";
								var joined;
								for (var i = 0; i < arguments.length; ++i) {
									var arg = arguments[i];
									assertPath(arg);
									if (arg.length > 0) {
										if (joined === undefined) joined = arg;
										else joined += "/" + arg;
									}
								}
								if (joined === undefined) return ".";
								return posix.normalize(joined);
							},

							relative: function relative(from, to) {
								assertPath(from);
								assertPath(to);

								if (from === to) return "";

								from = posix.resolve(from);
								to = posix.resolve(to);

								if (from === to) return "";

								// Trim any leading backslashes
								var fromStart = 1;
								for (; fromStart < from.length; ++fromStart) {
									if (from.charCodeAt(fromStart) !== 47 /*/*/) break;
								}
								var fromEnd = from.length;
								var fromLen = fromEnd - fromStart;

								// Trim any leading backslashes
								var toStart = 1;
								for (; toStart < to.length; ++toStart) {
									if (to.charCodeAt(toStart) !== 47 /*/*/) break;
								}
								var toEnd = to.length;
								var toLen = toEnd - toStart;

								// Compare paths to find the longest common path from root
								var length = fromLen < toLen ? fromLen : toLen;
								var lastCommonSep = -1;
								var i = 0;
								for (; i <= length; ++i) {
									if (i === length) {
										if (toLen > length) {
											if (to.charCodeAt(toStart + i) === 47 /*/*/) {
												// We get here if `from` is the exact base path for `to`.
												// For example: from='/foo/bar'; to='/foo/bar/baz'
												return to.slice(toStart + i + 1);
											} else if (i === 0) {
												// We get here if `from` is the root
												// For example: from='/'; to='/foo'
												return to.slice(toStart + i);
											}
										} else if (fromLen > length) {
											if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
												// We get here if `to` is the exact base path for `from`.
												// For example: from='/foo/bar/baz'; to='/foo/bar'
												lastCommonSep = i;
											} else if (i === 0) {
												// We get here if `to` is the root.
												// For example: from='/foo'; to='/'
												lastCommonSep = 0;
											}
										}
										break;
									}
									var fromCode = from.charCodeAt(fromStart + i);
									var toCode = to.charCodeAt(toStart + i);
									if (fromCode !== toCode) break;
									else if (fromCode === 47 /*/*/) lastCommonSep = i;
								}

								var out = "";
								// Generate the relative path based on the path difference between `to`
								// and `from`
								for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
									if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
										if (out.length === 0) out += "..";
										else out += "/..";
									}
								}

								// Lastly, append the rest of the destination (`to`) path that comes after
								// the common path parts
								if (out.length > 0)
									return out + to.slice(toStart + lastCommonSep);
								else {
									toStart += lastCommonSep;
									if (to.charCodeAt(toStart) === 47 /*/*/) ++toStart;
									return to.slice(toStart);
								}
							},

							_makeLong: function _makeLong(path) {
								return path;
							},

							dirname: function dirname(path) {
								assertPath(path);
								if (path.length === 0) return ".";
								var code = path.charCodeAt(0);
								var hasRoot = code === 47; /*/*/
								var end = -1;
								var matchedSlash = true;
								for (var i = path.length - 1; i >= 1; --i) {
									code = path.charCodeAt(i);
									if (code === 47 /*/*/) {
										if (!matchedSlash) {
											end = i;
											break;
										}
									} else {
										// We saw the first non-path separator
										matchedSlash = false;
									}
								}

								if (end === -1) return hasRoot ? "/" : ".";
								if (hasRoot && end === 1) return "//";
								return path.slice(0, end);
							},

							basename: function basename(path, ext) {
								if (ext !== undefined && typeof ext !== "string")
									throw new TypeError('"ext" argument must be a string');
								assertPath(path);

								var start = 0;
								var end = -1;
								var matchedSlash = true;
								var i;

								if (
									ext !== undefined &&
									ext.length > 0 &&
									ext.length <= path.length
								) {
									if (ext.length === path.length && ext === path) return "";
									var extIdx = ext.length - 1;
									var firstNonSlashEnd = -1;
									for (i = path.length - 1; i >= 0; --i) {
										var code = path.charCodeAt(i);
										if (code === 47 /*/*/) {
											// If we reached a path separator that was not part of a set of path
											// separators at the end of the string, stop now
											if (!matchedSlash) {
												start = i + 1;
												break;
											}
										} else {
											if (firstNonSlashEnd === -1) {
												// We saw the first non-path separator, remember this index in case
												// we need it if the extension ends up not matching
												matchedSlash = false;
												firstNonSlashEnd = i + 1;
											}
											if (extIdx >= 0) {
												// Try to match the explicit extension
												if (code === ext.charCodeAt(extIdx)) {
													if (--extIdx === -1) {
														// We matched the extension, so mark this as the end of our path
														// component
														end = i;
													}
												} else {
													// Extension does not match, so our result is the entire path
													// component
													extIdx = -1;
													end = firstNonSlashEnd;
												}
											}
										}
									}

									if (start === end) end = firstNonSlashEnd;
									else if (end === -1) end = path.length;
									return path.slice(start, end);
								} else {
									for (i = path.length - 1; i >= 0; --i) {
										if (path.charCodeAt(i) === 47 /*/*/) {
											// If we reached a path separator that was not part of a set of path
											// separators at the end of the string, stop now
											if (!matchedSlash) {
												start = i + 1;
												break;
											}
										} else if (end === -1) {
											// We saw the first non-path separator, mark this as the end of our
											// path component
											matchedSlash = false;
											end = i + 1;
										}
									}

									if (end === -1) return "";
									return path.slice(start, end);
								}
							},

							extname: function extname(path) {
								assertPath(path);
								var startDot = -1;
								var startPart = 0;
								var end = -1;
								var matchedSlash = true;
								// Track the state of characters (if any) we see before our first dot and
								// after any path separator we find
								var preDotState = 0;
								for (var i = path.length - 1; i >= 0; --i) {
									var code = path.charCodeAt(i);
									if (code === 47 /*/*/) {
										// If we reached a path separator that was not part of a set of path
										// separators at the end of the string, stop now
										if (!matchedSlash) {
											startPart = i + 1;
											break;
										}
										continue;
									}
									if (end === -1) {
										// We saw the first non-path separator, mark this as the end of our
										// extension
										matchedSlash = false;
										end = i + 1;
									}
									if (code === 46 /*.*/) {
										// If this is our first dot, mark it as the start of our extension
										if (startDot === -1) startDot = i;
										else if (preDotState !== 1) preDotState = 1;
									} else if (startDot !== -1) {
										// We saw a non-dot and non-path separator before our dot, so we should
										// have a good chance at having a non-empty extension
										preDotState = -1;
									}
								}

								if (
									startDot === -1 ||
									end === -1 ||
									// We saw a non-dot character immediately before the dot
									preDotState === 0 ||
									// The (right-most) trimmed path component is exactly '..'
									(preDotState === 1 &&
										startDot === end - 1 &&
										startDot === startPart + 1)
								) {
									return "";
								}
								return path.slice(startDot, end);
							},

							format: function format(pathObject) {
								if (pathObject === null || typeof pathObject !== "object") {
									throw new TypeError(
										'The "pathObject" argument must be of type Object. Received type ' +
											typeof pathObject
									);
								}
								return _format("/", pathObject);
							},

							parse: function parse(path) {
								assertPath(path);

								var ret = { root: "", dir: "", base: "", ext: "", name: "" };
								if (path.length === 0) return ret;
								var code = path.charCodeAt(0);
								var isAbsolute = code === 47; /*/*/
								var start;
								if (isAbsolute) {
									ret.root = "/";
									start = 1;
								} else {
									start = 0;
								}
								var startDot = -1;
								var startPart = 0;
								var end = -1;
								var matchedSlash = true;
								var i = path.length - 1;

								// Track the state of characters (if any) we see before our first dot and
								// after any path separator we find
								var preDotState = 0;

								// Get non-dir info
								for (; i >= start; --i) {
									code = path.charCodeAt(i);
									if (code === 47 /*/*/) {
										// If we reached a path separator that was not part of a set of path
										// separators at the end of the string, stop now
										if (!matchedSlash) {
											startPart = i + 1;
											break;
										}
										continue;
									}
									if (end === -1) {
										// We saw the first non-path separator, mark this as the end of our
										// extension
										matchedSlash = false;
										end = i + 1;
									}
									if (code === 46 /*.*/) {
										// If this is our first dot, mark it as the start of our extension
										if (startDot === -1) startDot = i;
										else if (preDotState !== 1) preDotState = 1;
									} else if (startDot !== -1) {
										// We saw a non-dot and non-path separator before our dot, so we should
										// have a good chance at having a non-empty extension
										preDotState = -1;
									}
								}

								if (
									startDot === -1 ||
									end === -1 ||
									// We saw a non-dot character immediately before the dot
									preDotState === 0 ||
									// The (right-most) trimmed path component is exactly '..'
									(preDotState === 1 &&
										startDot === end - 1 &&
										startDot === startPart + 1)
								) {
									if (end !== -1) {
										if (startPart === 0 && isAbsolute)
											ret.base = ret.name = path.slice(1, end);
										else ret.base = ret.name = path.slice(startPart, end);
									}
								} else {
									if (startPart === 0 && isAbsolute) {
										ret.name = path.slice(1, startDot);
										ret.base = path.slice(1, end);
									} else {
										ret.name = path.slice(startPart, startDot);
										ret.base = path.slice(startPart, end);
									}
									ret.ext = path.slice(startDot, end);
								}

								if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
								else if (isAbsolute) ret.dir = "/";

								return ret;
							},

							sep: "/",
							delimiter: ":",
							win32: null,
							posix: null,
						};

						posix.posix = posix;

						module.exports = posix;
					}.call(this));
				}.call(this, require("_process")));
			},
			{ _process: 20 },
		],
		20: [
			function (require, module, exports) {
				// shim for using process in browser
				var process = (module.exports = {});

				// cached from whatever global is present so that test runners that stub it
				// don't break things.  But we need to wrap it in a try catch in case it is
				// wrapped in strict mode code which doesn't define any globals.  It's inside a
				// function because try/catches deoptimize in certain engines.

				var cachedSetTimeout;
				var cachedClearTimeout;

				function defaultSetTimout() {
					throw new Error("setTimeout has not been defined");
				}
				function defaultClearTimeout() {
					throw new Error("clearTimeout has not been defined");
				}
				(function () {
					try {
						if (typeof setTimeout === "function") {
							cachedSetTimeout = setTimeout;
						} else {
							cachedSetTimeout = defaultSetTimout;
						}
					} catch (e) {
						cachedSetTimeout = defaultSetTimout;
					}
					try {
						if (typeof clearTimeout === "function") {
							cachedClearTimeout = clearTimeout;
						} else {
							cachedClearTimeout = defaultClearTimeout;
						}
					} catch (e) {
						cachedClearTimeout = defaultClearTimeout;
					}
				})();
				function runTimeout(fun) {
					if (cachedSetTimeout === setTimeout) {
						//normal enviroments in sane situations
						return setTimeout(fun, 0);
					}
					// if setTimeout wasn't available but was latter defined
					if (
						(cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
						setTimeout
					) {
						cachedSetTimeout = setTimeout;
						return setTimeout(fun, 0);
					}
					try {
						// when when somebody has screwed with setTimeout but no I.E. maddness
						return cachedSetTimeout(fun, 0);
					} catch (e) {
						try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
							return cachedSetTimeout.call(null, fun, 0);
						} catch (e) {
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
							return cachedSetTimeout.call(this, fun, 0);
						}
					}
				}
				function runClearTimeout(marker) {
					if (cachedClearTimeout === clearTimeout) {
						//normal enviroments in sane situations
						return clearTimeout(marker);
					}
					// if clearTimeout wasn't available but was latter defined
					if (
						(cachedClearTimeout === defaultClearTimeout ||
							!cachedClearTimeout) &&
						clearTimeout
					) {
						cachedClearTimeout = clearTimeout;
						return clearTimeout(marker);
					}
					try {
						// when when somebody has screwed with setTimeout but no I.E. maddness
						return cachedClearTimeout(marker);
					} catch (e) {
						try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
							return cachedClearTimeout.call(null, marker);
						} catch (e) {
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
							// Some versions of I.E. have different rules for clearTimeout vs setTimeout
							return cachedClearTimeout.call(this, marker);
						}
					}
				}
				var queue = [];
				var draining = false;
				var currentQueue;
				var queueIndex = -1;

				function cleanUpNextTick() {
					if (!draining || !currentQueue) {
						return;
					}
					draining = false;
					if (currentQueue.length) {
						queue = currentQueue.concat(queue);
					} else {
						queueIndex = -1;
					}
					if (queue.length) {
						drainQueue();
					}
				}

				function drainQueue() {
					if (draining) {
						return;
					}
					var timeout = runTimeout(cleanUpNextTick);
					draining = true;

					var len = queue.length;
					while (len) {
						currentQueue = queue;
						queue = [];
						while (++queueIndex < len) {
							if (currentQueue) {
								currentQueue[queueIndex].run();
							}
						}
						queueIndex = -1;
						len = queue.length;
					}
					currentQueue = null;
					draining = false;
					runClearTimeout(timeout);
				}

				process.nextTick = function (fun) {
					var args = new Array(arguments.length - 1);
					if (arguments.length > 1) {
						for (var i = 1; i < arguments.length; i++) {
							args[i - 1] = arguments[i];
						}
					}
					queue.push(new Item(fun, args));
					if (queue.length === 1 && !draining) {
						runTimeout(drainQueue);
					}
				};

				// v8 likes predictible objects
				function Item(fun, array) {
					this.fun = fun;
					this.array = array;
				}
				Item.prototype.run = function () {
					this.fun.apply(null, this.array);
				};
				process.title = "browser";
				process.browser = true;
				process.env = {};
				process.argv = [];
				process.version = ""; // empty string to avoid regexp issues
				process.versions = {};

				function noop() {}

				process.on = noop;
				process.addListener = noop;
				process.once = noop;
				process.off = noop;
				process.removeListener = noop;
				process.removeAllListeners = noop;
				process.emit = noop;
				process.prependListener = noop;
				process.prependOnceListener = noop;

				process.listeners = function (name) {
					return [];
				};

				process.binding = function (name) {
					throw new Error("process.binding is not supported");
				};

				process.cwd = function () {
					return "/";
				};
				process.chdir = function (dir) {
					throw new Error("process.chdir is not supported");
				};
				process.umask = function () {
					return 0;
				};
			},
			{},
		],
		21: [
			function (require, module, exports) {
				module.exports = function isBuffer(arg) {
					return (
						arg &&
						typeof arg === "object" &&
						typeof arg.copy === "function" &&
						typeof arg.fill === "function" &&
						typeof arg.readUInt8 === "function"
					);
				};
			},
			{},
		],
		22: [
			function (require, module, exports) {
				// Currently in sync with Node.js lib/internal/util/types.js
				// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

				"use strict";

				var isArgumentsObject = require("is-arguments");
				var isGeneratorFunction = require("is-generator-function");
				var whichTypedArray = require("which-typed-array");
				var isTypedArray = require("is-typed-array");

				function uncurryThis(f) {
					return f.call.bind(f);
				}

				var BigIntSupported = typeof BigInt !== "undefined";
				var SymbolSupported = typeof Symbol !== "undefined";

				var ObjectToString = uncurryThis(Object.prototype.toString);

				var numberValue = uncurryThis(Number.prototype.valueOf);
				var stringValue = uncurryThis(String.prototype.valueOf);
				var booleanValue = uncurryThis(Boolean.prototype.valueOf);

				if (BigIntSupported) {
					var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
				}

				if (SymbolSupported) {
					var symbolValue = uncurryThis(Symbol.prototype.valueOf);
				}

				function checkBoxedPrimitive(value, prototypeValueOf) {
					if (typeof value !== "object") {
						return false;
					}
					try {
						prototypeValueOf(value);
						return true;
					} catch (e) {
						return false;
					}
				}

				exports.isArgumentsObject = isArgumentsObject;
				exports.isGeneratorFunction = isGeneratorFunction;
				exports.isTypedArray = isTypedArray;

				// Taken from here and modified for better browser support
				// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
				function isPromise(input) {
					return (
						(typeof Promise !== "undefined" && input instanceof Promise) ||
						(input !== null &&
							typeof input === "object" &&
							typeof input.then === "function" &&
							typeof input.catch === "function")
					);
				}
				exports.isPromise = isPromise;

				function isArrayBufferView(value) {
					if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
						return ArrayBuffer.isView(value);
					}

					return isTypedArray(value) || isDataView(value);
				}
				exports.isArrayBufferView = isArrayBufferView;

				function isUint8Array(value) {
					return whichTypedArray(value) === "Uint8Array";
				}
				exports.isUint8Array = isUint8Array;

				function isUint8ClampedArray(value) {
					return whichTypedArray(value) === "Uint8ClampedArray";
				}
				exports.isUint8ClampedArray = isUint8ClampedArray;

				function isUint16Array(value) {
					return whichTypedArray(value) === "Uint16Array";
				}
				exports.isUint16Array = isUint16Array;

				function isUint32Array(value) {
					return whichTypedArray(value) === "Uint32Array";
				}
				exports.isUint32Array = isUint32Array;

				function isInt8Array(value) {
					return whichTypedArray(value) === "Int8Array";
				}
				exports.isInt8Array = isInt8Array;

				function isInt16Array(value) {
					return whichTypedArray(value) === "Int16Array";
				}
				exports.isInt16Array = isInt16Array;

				function isInt32Array(value) {
					return whichTypedArray(value) === "Int32Array";
				}
				exports.isInt32Array = isInt32Array;

				function isFloat32Array(value) {
					return whichTypedArray(value) === "Float32Array";
				}
				exports.isFloat32Array = isFloat32Array;

				function isFloat64Array(value) {
					return whichTypedArray(value) === "Float64Array";
				}
				exports.isFloat64Array = isFloat64Array;

				function isBigInt64Array(value) {
					return whichTypedArray(value) === "BigInt64Array";
				}
				exports.isBigInt64Array = isBigInt64Array;

				function isBigUint64Array(value) {
					return whichTypedArray(value) === "BigUint64Array";
				}
				exports.isBigUint64Array = isBigUint64Array;

				function isMapToString(value) {
					return ObjectToString(value) === "[object Map]";
				}
				isMapToString.working =
					typeof Map !== "undefined" && isMapToString(new Map());

				function isMap(value) {
					if (typeof Map === "undefined") {
						return false;
					}

					return isMapToString.working
						? isMapToString(value)
						: value instanceof Map;
				}
				exports.isMap = isMap;

				function isSetToString(value) {
					return ObjectToString(value) === "[object Set]";
				}
				isSetToString.working =
					typeof Set !== "undefined" && isSetToString(new Set());
				function isSet(value) {
					if (typeof Set === "undefined") {
						return false;
					}

					return isSetToString.working
						? isSetToString(value)
						: value instanceof Set;
				}
				exports.isSet = isSet;

				function isWeakMapToString(value) {
					return ObjectToString(value) === "[object WeakMap]";
				}
				isWeakMapToString.working =
					typeof WeakMap !== "undefined" && isWeakMapToString(new WeakMap());
				function isWeakMap(value) {
					if (typeof WeakMap === "undefined") {
						return false;
					}

					return isWeakMapToString.working
						? isWeakMapToString(value)
						: value instanceof WeakMap;
				}
				exports.isWeakMap = isWeakMap;

				function isWeakSetToString(value) {
					return ObjectToString(value) === "[object WeakSet]";
				}
				isWeakSetToString.working =
					typeof WeakSet !== "undefined" && isWeakSetToString(new WeakSet());
				function isWeakSet(value) {
					return isWeakSetToString(value);
				}
				exports.isWeakSet = isWeakSet;

				function isArrayBufferToString(value) {
					return ObjectToString(value) === "[object ArrayBuffer]";
				}
				isArrayBufferToString.working =
					typeof ArrayBuffer !== "undefined" &&
					isArrayBufferToString(new ArrayBuffer());
				function isArrayBuffer(value) {
					if (typeof ArrayBuffer === "undefined") {
						return false;
					}

					return isArrayBufferToString.working
						? isArrayBufferToString(value)
						: value instanceof ArrayBuffer;
				}
				exports.isArrayBuffer = isArrayBuffer;

				function isDataViewToString(value) {
					return ObjectToString(value) === "[object DataView]";
				}
				isDataViewToString.working =
					typeof ArrayBuffer !== "undefined" &&
					typeof DataView !== "undefined" &&
					isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1));
				function isDataView(value) {
					if (typeof DataView === "undefined") {
						return false;
					}

					return isDataViewToString.working
						? isDataViewToString(value)
						: value instanceof DataView;
				}
				exports.isDataView = isDataView;

				// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
				var SharedArrayBufferCopy =
					typeof SharedArrayBuffer !== "undefined"
						? SharedArrayBuffer
						: undefined;
				function isSharedArrayBufferToString(value) {
					return ObjectToString(value) === "[object SharedArrayBuffer]";
				}
				function isSharedArrayBuffer(value) {
					if (typeof SharedArrayBufferCopy === "undefined") {
						return false;
					}

					if (typeof isSharedArrayBufferToString.working === "undefined") {
						isSharedArrayBufferToString.working = isSharedArrayBufferToString(
							new SharedArrayBufferCopy()
						);
					}

					return isSharedArrayBufferToString.working
						? isSharedArrayBufferToString(value)
						: value instanceof SharedArrayBufferCopy;
				}
				exports.isSharedArrayBuffer = isSharedArrayBuffer;

				function isAsyncFunction(value) {
					return ObjectToString(value) === "[object AsyncFunction]";
				}
				exports.isAsyncFunction = isAsyncFunction;

				function isMapIterator(value) {
					return ObjectToString(value) === "[object Map Iterator]";
				}
				exports.isMapIterator = isMapIterator;

				function isSetIterator(value) {
					return ObjectToString(value) === "[object Set Iterator]";
				}
				exports.isSetIterator = isSetIterator;

				function isGeneratorObject(value) {
					return ObjectToString(value) === "[object Generator]";
				}
				exports.isGeneratorObject = isGeneratorObject;

				function isWebAssemblyCompiledModule(value) {
					return ObjectToString(value) === "[object WebAssembly.Module]";
				}
				exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

				function isNumberObject(value) {
					return checkBoxedPrimitive(value, numberValue);
				}
				exports.isNumberObject = isNumberObject;

				function isStringObject(value) {
					return checkBoxedPrimitive(value, stringValue);
				}
				exports.isStringObject = isStringObject;

				function isBooleanObject(value) {
					return checkBoxedPrimitive(value, booleanValue);
				}
				exports.isBooleanObject = isBooleanObject;

				function isBigIntObject(value) {
					return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
				}
				exports.isBigIntObject = isBigIntObject;

				function isSymbolObject(value) {
					return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
				}
				exports.isSymbolObject = isSymbolObject;

				function isBoxedPrimitive(value) {
					return (
						isNumberObject(value) ||
						isStringObject(value) ||
						isBooleanObject(value) ||
						isBigIntObject(value) ||
						isSymbolObject(value)
					);
				}
				exports.isBoxedPrimitive = isBoxedPrimitive;

				function isAnyArrayBuffer(value) {
					return (
						typeof Uint8Array !== "undefined" &&
						(isArrayBuffer(value) || isSharedArrayBuffer(value))
					);
				}
				exports.isAnyArrayBuffer = isAnyArrayBuffer;

				["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(function (
					method
				) {
					Object.defineProperty(exports, method, {
						enumerable: false,
						value: function () {
							throw new Error(method + " is not supported in userland");
						},
					});
				});
			},
			{
				"is-arguments": 15,
				"is-generator-function": 17,
				"is-typed-array": 18,
				"which-typed-array": 24,
			},
		],
		23: [
			function (require, module, exports) {
				(function (process) {
					(function () {
						// Copyright Joyent, Inc. and other Node contributors.
						//
						// Permission is hereby granted, free of charge, to any person obtaining a
						// copy of this software and associated documentation files (the
						// "Software"), to deal in the Software without restriction, including
						// without limitation the rights to use, copy, modify, merge, publish,
						// distribute, sublicense, and/or sell copies of the Software, and to permit
						// persons to whom the Software is furnished to do so, subject to the
						// following conditions:
						//
						// The above copyright notice and this permission notice shall be included
						// in all copies or substantial portions of the Software.
						//
						// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
						// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
						// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
						// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
						// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
						// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
						// USE OR OTHER DEALINGS IN THE SOFTWARE.

						var getOwnPropertyDescriptors =
							Object.getOwnPropertyDescriptors ||
							function getOwnPropertyDescriptors(obj) {
								var keys = Object.keys(obj);
								var descriptors = {};
								for (var i = 0; i < keys.length; i++) {
									descriptors[keys[i]] = Object.getOwnPropertyDescriptor(
										obj,
										keys[i]
									);
								}
								return descriptors;
							};

						var formatRegExp = /%[sdj%]/g;
						exports.format = function (f) {
							if (!isString(f)) {
								var objects = [];
								for (var i = 0; i < arguments.length; i++) {
									objects.push(inspect(arguments[i]));
								}
								return objects.join(" ");
							}

							var i = 1;
							var args = arguments;
							var len = args.length;
							var str = String(f).replace(formatRegExp, function (x) {
								if (x === "%%") return "%";
								if (i >= len) return x;
								switch (x) {
									case "%s":
										return String(args[i++]);
									case "%d":
										return Number(args[i++]);
									case "%j":
										try {
											return JSON.stringify(args[i++]);
										} catch (_) {
											return "[Circular]";
										}
									default:
										return x;
								}
							});
							for (var x = args[i]; i < len; x = args[++i]) {
								if (isNull(x) || !isObject(x)) {
									str += " " + x;
								} else {
									str += " " + inspect(x);
								}
							}
							return str;
						};

						// Mark that a method should not be used.
						// Returns a modified function which warns once by default.
						// If --no-deprecation is set, then it is a no-op.
						exports.deprecate = function (fn, msg) {
							if (
								typeof process !== "undefined" &&
								process.noDeprecation === true
							) {
								return fn;
							}

							// Allow for deprecating things in the process of starting up.
							if (typeof process === "undefined") {
								return function () {
									return exports.deprecate(fn, msg).apply(this, arguments);
								};
							}

							var warned = false;
							function deprecated() {
								if (!warned) {
									if (process.throwDeprecation) {
										throw new Error(msg);
									} else if (process.traceDeprecation) {
										console.trace(msg);
									} else {
										console.error(msg);
									}
									warned = true;
								}
								return fn.apply(this, arguments);
							}

							return deprecated;
						};

						var debugs = {};
						var debugEnvRegex = /^$/;

						if (process.env.NODE_DEBUG) {
							var debugEnv = process.env.NODE_DEBUG;
							debugEnv = debugEnv
								.replace(/[|\\{}()[\]^$+?.]/g, "\\$&")
								.replace(/\*/g, ".*")
								.replace(/,/g, "$|^")
								.toUpperCase();
							debugEnvRegex = new RegExp("^" + debugEnv + "$", "i");
						}
						exports.debuglog = function (set) {
							set = set.toUpperCase();
							if (!debugs[set]) {
								if (debugEnvRegex.test(set)) {
									var pid = process.pid;
									debugs[set] = function () {
										var msg = exports.format.apply(exports, arguments);
										console.error("%s %d: %s", set, pid, msg);
									};
								} else {
									debugs[set] = function () {};
								}
							}
							return debugs[set];
						};

						/**
						 * Echos the value of a value. Trys to print the value out
						 * in the best way possible given the different types.
						 *
						 * @param {Object} obj The object to print out.
						 * @param {Object} opts Optional options object that alters the output.
						 */
						/* legacy: obj, showHidden, depth, colors*/
						function inspect(obj, opts) {
							// default options
							var ctx = {
								seen: [],
								stylize: stylizeNoColor,
							};
							// legacy...
							if (arguments.length >= 3) ctx.depth = arguments[2];
							if (arguments.length >= 4) ctx.colors = arguments[3];
							if (isBoolean(opts)) {
								// legacy...
								ctx.showHidden = opts;
							} else if (opts) {
								// got an "options" object
								exports._extend(ctx, opts);
							}
							// set default options
							if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
							if (isUndefined(ctx.depth)) ctx.depth = 2;
							if (isUndefined(ctx.colors)) ctx.colors = false;
							if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
							if (ctx.colors) ctx.stylize = stylizeWithColor;
							return formatValue(ctx, obj, ctx.depth);
						}
						exports.inspect = inspect;

						// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
						inspect.colors = {
							bold: [1, 22],
							italic: [3, 23],
							underline: [4, 24],
							inverse: [7, 27],
							white: [37, 39],
							grey: [90, 39],
							black: [30, 39],
							blue: [34, 39],
							cyan: [36, 39],
							green: [32, 39],
							magenta: [35, 39],
							red: [31, 39],
							yellow: [33, 39],
						};

						// Don't use 'blue' not visible on cmd.exe
						inspect.styles = {
							special: "cyan",
							number: "yellow",
							boolean: "yellow",
							undefined: "grey",
							null: "bold",
							string: "green",
							date: "magenta",
							// "name": intentionally not styling
							regexp: "red",
						};

						function stylizeWithColor(str, styleType) {
							var style = inspect.styles[styleType];

							if (style) {
								return (
									"\u001b[" +
									inspect.colors[style][0] +
									"m" +
									str +
									"\u001b[" +
									inspect.colors[style][1] +
									"m"
								);
							} else {
								return str;
							}
						}

						function stylizeNoColor(str, styleType) {
							return str;
						}

						function arrayToHash(array) {
							var hash = {};

							array.forEach(function (val, idx) {
								hash[val] = true;
							});

							return hash;
						}

						function formatValue(ctx, value, recurseTimes) {
							// Provide a hook for user-specified inspect functions.
							// Check that value is an object with an inspect function on it
							if (
								ctx.customInspect &&
								value &&
								isFunction(value.inspect) &&
								// Filter out the util module, it's inspect function is special
								value.inspect !== exports.inspect &&
								// Also filter out any prototype objects using the circular check.
								!(value.constructor && value.constructor.prototype === value)
							) {
								var ret = value.inspect(recurseTimes, ctx);
								if (!isString(ret)) {
									ret = formatValue(ctx, ret, recurseTimes);
								}
								return ret;
							}

							// Primitive types cannot have properties
							var primitive = formatPrimitive(ctx, value);
							if (primitive) {
								return primitive;
							}

							// Look up the keys of the object.
							var keys = Object.keys(value);
							var visibleKeys = arrayToHash(keys);

							if (ctx.showHidden) {
								keys = Object.getOwnPropertyNames(value);
							}

							// IE doesn't make error fields non-enumerable
							// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
							if (
								isError(value) &&
								(keys.indexOf("message") >= 0 ||
									keys.indexOf("description") >= 0)
							) {
								return formatError(value);
							}

							// Some type of object without properties can be shortcutted.
							if (keys.length === 0) {
								if (isFunction(value)) {
									var name = value.name ? ": " + value.name : "";
									return ctx.stylize("[Function" + name + "]", "special");
								}
								if (isRegExp(value)) {
									return ctx.stylize(
										RegExp.prototype.toString.call(value),
										"regexp"
									);
								}
								if (isDate(value)) {
									return ctx.stylize(
										Date.prototype.toString.call(value),
										"date"
									);
								}
								if (isError(value)) {
									return formatError(value);
								}
							}

							var base = "",
								array = false,
								braces = ["{", "}"];

							// Make Array say that they are Array
							if (isArray(value)) {
								array = true;
								braces = ["[", "]"];
							}

							// Make functions say that they are functions
							if (isFunction(value)) {
								var n = value.name ? ": " + value.name : "";
								base = " [Function" + n + "]";
							}

							// Make RegExps say that they are RegExps
							if (isRegExp(value)) {
								base = " " + RegExp.prototype.toString.call(value);
							}

							// Make dates with properties first say the date
							if (isDate(value)) {
								base = " " + Date.prototype.toUTCString.call(value);
							}

							// Make error with message first say the error
							if (isError(value)) {
								base = " " + formatError(value);
							}

							if (keys.length === 0 && (!array || value.length == 0)) {
								return braces[0] + base + braces[1];
							}

							if (recurseTimes < 0) {
								if (isRegExp(value)) {
									return ctx.stylize(
										RegExp.prototype.toString.call(value),
										"regexp"
									);
								} else {
									return ctx.stylize("[Object]", "special");
								}
							}

							ctx.seen.push(value);

							var output;
							if (array) {
								output = formatArray(
									ctx,
									value,
									recurseTimes,
									visibleKeys,
									keys
								);
							} else {
								output = keys.map(function (key) {
									return formatProperty(
										ctx,
										value,
										recurseTimes,
										visibleKeys,
										key,
										array
									);
								});
							}

							ctx.seen.pop();

							return reduceToSingleString(output, base, braces);
						}

						function formatPrimitive(ctx, value) {
							if (isUndefined(value))
								return ctx.stylize("undefined", "undefined");
							if (isString(value)) {
								var simple =
									"'" +
									JSON.stringify(value)
										.replace(/^"|"$/g, "")
										.replace(/'/g, "\\'")
										.replace(/\\"/g, '"') +
									"'";
								return ctx.stylize(simple, "string");
							}
							if (isNumber(value)) return ctx.stylize("" + value, "number");
							if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
							// For some reason typeof null is "object", so special case here.
							if (isNull(value)) return ctx.stylize("null", "null");
						}

						function formatError(value) {
							return "[" + Error.prototype.toString.call(value) + "]";
						}

						function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
							var output = [];
							for (var i = 0, l = value.length; i < l; ++i) {
								if (hasOwnProperty(value, String(i))) {
									output.push(
										formatProperty(
											ctx,
											value,
											recurseTimes,
											visibleKeys,
											String(i),
											true
										)
									);
								} else {
									output.push("");
								}
							}
							keys.forEach(function (key) {
								if (!key.match(/^\d+$/)) {
									output.push(
										formatProperty(
											ctx,
											value,
											recurseTimes,
											visibleKeys,
											key,
											true
										)
									);
								}
							});
							return output;
						}

						function formatProperty(
							ctx,
							value,
							recurseTimes,
							visibleKeys,
							key,
							array
						) {
							var name, str, desc;
							desc = Object.getOwnPropertyDescriptor(value, key) || {
								value: value[key],
							};
							if (desc.get) {
								if (desc.set) {
									str = ctx.stylize("[Getter/Setter]", "special");
								} else {
									str = ctx.stylize("[Getter]", "special");
								}
							} else {
								if (desc.set) {
									str = ctx.stylize("[Setter]", "special");
								}
							}
							if (!hasOwnProperty(visibleKeys, key)) {
								name = "[" + key + "]";
							}
							if (!str) {
								if (ctx.seen.indexOf(desc.value) < 0) {
									if (isNull(recurseTimes)) {
										str = formatValue(ctx, desc.value, null);
									} else {
										str = formatValue(ctx, desc.value, recurseTimes - 1);
									}
									if (str.indexOf("\n") > -1) {
										if (array) {
											str = str
												.split("\n")
												.map(function (line) {
													return "  " + line;
												})
												.join("\n")
												.slice(2);
										} else {
											str =
												"\n" +
												str
													.split("\n")
													.map(function (line) {
														return "   " + line;
													})
													.join("\n");
										}
									}
								} else {
									str = ctx.stylize("[Circular]", "special");
								}
							}
							if (isUndefined(name)) {
								if (array && key.match(/^\d+$/)) {
									return str;
								}
								name = JSON.stringify("" + key);
								if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
									name = name.slice(1, -1);
									name = ctx.stylize(name, "name");
								} else {
									name = name
										.replace(/'/g, "\\'")
										.replace(/\\"/g, '"')
										.replace(/(^"|"$)/g, "'");
									name = ctx.stylize(name, "string");
								}
							}

							return name + ": " + str;
						}

						function reduceToSingleString(output, base, braces) {
							var numLinesEst = 0;
							var length = output.reduce(function (prev, cur) {
								numLinesEst++;
								if (cur.indexOf("\n") >= 0) numLinesEst++;
								return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
							}, 0);

							if (length > 60) {
								return (
									braces[0] +
									(base === "" ? "" : base + "\n ") +
									" " +
									output.join(",\n  ") +
									" " +
									braces[1]
								);
							}

							return (
								braces[0] + base + " " + output.join(", ") + " " + braces[1]
							);
						}

						// NOTE: These type checking functions intentionally don't use `instanceof`
						// because it is fragile and can be easily faked with `Object.create()`.
						exports.types = require("./support/types");

						function isArray(ar) {
							return Array.isArray(ar);
						}
						exports.isArray = isArray;

						function isBoolean(arg) {
							return typeof arg === "boolean";
						}
						exports.isBoolean = isBoolean;

						function isNull(arg) {
							return arg === null;
						}
						exports.isNull = isNull;

						function isNullOrUndefined(arg) {
							return arg == null;
						}
						exports.isNullOrUndefined = isNullOrUndefined;

						function isNumber(arg) {
							return typeof arg === "number";
						}
						exports.isNumber = isNumber;

						function isString(arg) {
							return typeof arg === "string";
						}
						exports.isString = isString;

						function isSymbol(arg) {
							return typeof arg === "symbol";
						}
						exports.isSymbol = isSymbol;

						function isUndefined(arg) {
							return arg === void 0;
						}
						exports.isUndefined = isUndefined;

						function isRegExp(re) {
							return isObject(re) && objectToString(re) === "[object RegExp]";
						}
						exports.isRegExp = isRegExp;
						exports.types.isRegExp = isRegExp;

						function isObject(arg) {
							return typeof arg === "object" && arg !== null;
						}
						exports.isObject = isObject;

						function isDate(d) {
							return isObject(d) && objectToString(d) === "[object Date]";
						}
						exports.isDate = isDate;
						exports.types.isDate = isDate;

						function isError(e) {
							return (
								isObject(e) &&
								(objectToString(e) === "[object Error]" || e instanceof Error)
							);
						}
						exports.isError = isError;
						exports.types.isNativeError = isError;

						function isFunction(arg) {
							return typeof arg === "function";
						}
						exports.isFunction = isFunction;

						function isPrimitive(arg) {
							return (
								arg === null ||
								typeof arg === "boolean" ||
								typeof arg === "number" ||
								typeof arg === "string" ||
								typeof arg === "symbol" || // ES6 symbol
								typeof arg === "undefined"
							);
						}
						exports.isPrimitive = isPrimitive;

						exports.isBuffer = require("./support/isBuffer");

						function objectToString(o) {
							return Object.prototype.toString.call(o);
						}

						function pad(n) {
							return n < 10 ? "0" + n.toString(10) : n.toString(10);
						}

						var months = [
							"Jan",
							"Feb",
							"Mar",
							"Apr",
							"May",
							"Jun",
							"Jul",
							"Aug",
							"Sep",
							"Oct",
							"Nov",
							"Dec",
						];

						// 26 Feb 16:19:34
						function timestamp() {
							var d = new Date();
							var time = [
								pad(d.getHours()),
								pad(d.getMinutes()),
								pad(d.getSeconds()),
							].join(":");
							return [d.getDate(), months[d.getMonth()], time].join(" ");
						}

						// log is just a thin wrapper to console.log that prepends a timestamp
						exports.log = function () {
							console.log(
								"%s - %s",
								timestamp(),
								exports.format.apply(exports, arguments)
							);
						};

						/**
						 * Inherit the prototype methods from one constructor into another.
						 *
						 * The Function.prototype.inherits from lang.js rewritten as a standalone
						 * function (not on Function.prototype). NOTE: If this file is to be loaded
						 * during bootstrapping this function needs to be rewritten using some native
						 * functions as prototype setup using normal JavaScript does not work as
						 * expected during bootstrapping (see mirror.js in r114903).
						 *
						 * @param {function} ctor Constructor function which needs to inherit the
						 *     prototype.
						 * @param {function} superCtor Constructor function to inherit prototype from.
						 */
						exports.inherits = require("inherits");

						exports._extend = function (origin, add) {
							// Don't do anything if add isn't an object
							if (!add || !isObject(add)) return origin;

							var keys = Object.keys(add);
							var i = keys.length;
							while (i--) {
								origin[keys[i]] = add[keys[i]];
							}
							return origin;
						};

						function hasOwnProperty(obj, prop) {
							return Object.prototype.hasOwnProperty.call(obj, prop);
						}

						var kCustomPromisifiedSymbol =
							typeof Symbol !== "undefined"
								? Symbol("util.promisify.custom")
								: undefined;

						exports.promisify = function promisify(original) {
							if (typeof original !== "function")
								throw new TypeError(
									'The "original" argument must be of type Function'
								);

							if (
								kCustomPromisifiedSymbol &&
								original[kCustomPromisifiedSymbol]
							) {
								var fn = original[kCustomPromisifiedSymbol];
								if (typeof fn !== "function") {
									throw new TypeError(
										'The "util.promisify.custom" argument must be of type Function'
									);
								}
								Object.defineProperty(fn, kCustomPromisifiedSymbol, {
									value: fn,
									enumerable: false,
									writable: false,
									configurable: true,
								});
								return fn;
							}

							function fn() {
								var promiseResolve, promiseReject;
								var promise = new Promise(function (resolve, reject) {
									promiseResolve = resolve;
									promiseReject = reject;
								});

								var args = [];
								for (var i = 0; i < arguments.length; i++) {
									args.push(arguments[i]);
								}
								args.push(function (err, value) {
									if (err) {
										promiseReject(err);
									} else {
										promiseResolve(value);
									}
								});

								try {
									original.apply(this, args);
								} catch (err) {
									promiseReject(err);
								}

								return promise;
							}

							Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

							if (kCustomPromisifiedSymbol)
								Object.defineProperty(fn, kCustomPromisifiedSymbol, {
									value: fn,
									enumerable: false,
									writable: false,
									configurable: true,
								});
							return Object.defineProperties(
								fn,
								getOwnPropertyDescriptors(original)
							);
						};

						exports.promisify.custom = kCustomPromisifiedSymbol;

						function callbackifyOnRejected(reason, cb) {
							// `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
							// Because `null` is a special error value in callbacks which means "no error
							// occurred", we error-wrap so the callback consumer can distinguish between
							// "the promise rejected with null" or "the promise fulfilled with undefined".
							if (!reason) {
								var newReason = new Error(
									"Promise was rejected with a falsy value"
								);
								newReason.reason = reason;
								reason = newReason;
							}
							return cb(reason);
						}

						function callbackify(original) {
							if (typeof original !== "function") {
								throw new TypeError(
									'The "original" argument must be of type Function'
								);
							}

							// We DO NOT return the promise as it gives the user a false sense that
							// the promise is actually somehow related to the callback's execution
							// and that the callback throwing will reject the promise.
							function callbackified() {
								var args = [];
								for (var i = 0; i < arguments.length; i++) {
									args.push(arguments[i]);
								}

								var maybeCb = args.pop();
								if (typeof maybeCb !== "function") {
									throw new TypeError(
										"The last argument must be of type Function"
									);
								}
								var self = this;
								var cb = function () {
									return maybeCb.apply(self, arguments);
								};
								// In true node style we process the callback on `nextTick` with all the
								// implications (stack, `uncaughtException`, `async_hooks`)
								original.apply(this, args).then(
									function (ret) {
										process.nextTick(cb.bind(null, null, ret));
									},
									function (rej) {
										process.nextTick(callbackifyOnRejected.bind(null, rej, cb));
									}
								);
							}

							Object.setPrototypeOf(
								callbackified,
								Object.getPrototypeOf(original)
							);
							Object.defineProperties(
								callbackified,
								getOwnPropertyDescriptors(original)
							);
							return callbackified;
						}
						exports.callbackify = callbackify;
					}.call(this));
				}.call(this, require("_process")));
			},
			{
				"./support/isBuffer": 21,
				"./support/types": 22,
				_process: 20,
				inherits: 14,
			},
		],
		24: [
			function (require, module, exports) {
				(function (global) {
					(function () {
						"use strict";

						var forEach = require("for-each");
						var availableTypedArrays = require("available-typed-arrays");
						var callBound = require("call-bind/callBound");
						var gOPD = require("gopd");

						var $toString = callBound("Object.prototype.toString");
						var hasToStringTag = require("has-tostringtag/shams")();

						var g = typeof globalThis === "undefined" ? global : globalThis;
						var typedArrays = availableTypedArrays();

						var $slice = callBound("String.prototype.slice");
						var toStrTags = {};
						var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
						if (hasToStringTag && gOPD && getPrototypeOf) {
							forEach(typedArrays, function (typedArray) {
								if (typeof g[typedArray] === "function") {
									var arr = new g[typedArray]();
									if (Symbol.toStringTag in arr) {
										var proto = getPrototypeOf(arr);
										var descriptor = gOPD(proto, Symbol.toStringTag);
										if (!descriptor) {
											var superProto = getPrototypeOf(proto);
											descriptor = gOPD(superProto, Symbol.toStringTag);
										}
										toStrTags[typedArray] = descriptor.get;
									}
								}
							});
						}

						var tryTypedArrays = function tryAllTypedArrays(value) {
							var foundName = false;
							forEach(toStrTags, function (getter, typedArray) {
								if (!foundName) {
									try {
										var name = getter.call(value);
										if (name === typedArray) {
											foundName = name;
										}
									} catch (e) {}
								}
							});
							return foundName;
						};

						var isTypedArray = require("is-typed-array");

						module.exports = function whichTypedArray(value) {
							if (!isTypedArray(value)) {
								return false;
							}
							if (!hasToStringTag || !(Symbol.toStringTag in value)) {
								return $slice($toString(value), 8, -1);
							}
							return tryTypedArrays(value);
						};
					}.call(this));
				}.call(
					this,
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				));
			},
			{
				"available-typed-arrays": 2,
				"call-bind/callBound": 3,
				"for-each": 5,
				gopd: 9,
				"has-tostringtag/shams": 12,
				"is-typed-array": 18,
			},
		],
		25: [
			function (require, module, exports) {
				(function (global) {
					(function () {
						const curlConverter = require("curl-to-json-object");
						global.window.curltojsonobject = curlConverter;
						//yargsParser
						//curltojsonobject
					}.call(this));
				}.call(
					this,
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				));
			},
			{ "curl-to-json-object": 26 },
		],
		26: [
			function (require, module, exports) {
				const convertToJson = (curl_request) => {
					const argvs = require("yargs-parser")(curl_request);

					const json = {
						header: {},
						method: "GET",
					};

					const isJson = (str) => {
						try {
							JSON.parse(str);
						} catch (e) {
							return false;
						}
						return true;
					};

					const removeQuotes = (str) => str.replace(/['"]+/g, "");

					const stringIsUrl = (url) => {
						return /^(ftp|http|https):\/\/[^ "]+$/.test(url);
					};

					const parseField = (string) => {
						return string.split(/: (.+)/);
					};

					const parseHeader = (header) => {
						let parsedHeader = {};
						if (Array.isArray(header)) {
							header.forEach((item, index) => {
								const field = parseField(item);
								parsedHeader[field[0]] = field[1];
							});
						} else {
							const field = parseField(header);
							parsedHeader[field[0]] = field[1];
						}

						return parsedHeader;
					};

					const parseData = (data) => {
						let jsonObj = {};
						json.header["Content-Type"] = "application/json";

						if (Array.isArray(data)) {
							if (isJson(data[0])) {
								data.forEach((item) => {
									const parsedItem = JSON.parse(item);
									jsonObj = {
										...jsonObj,
										...parsedItem,
									};
								});

								return jsonObj;
							}

							if (data[0].includes("=")) {
								return parseDataUrlEncode(data);
							}
						} else {
							if (isJson(data)) {
								return JSON.parse(data);
							}
							if (data.includes("=")) {
								return parseDataUrlEncode(data);
							}
							return data;
						}
					};

					const parseDataUrlEncode = (data) => {
						let jsonUrlEncoded = "";
						json.header["Content-Type"] = "application/x-www-form-urlencoded";

						if (Array.isArray(data)) {
							data.forEach((item, index) => {
								if (index === 0) {
									jsonUrlEncoded = encodeURI(item);
								} else {
									jsonUrlEncoded = jsonUrlEncoded + "&" + encodeURI(item);
								}
							});
							return jsonUrlEncoded;
						} else {
							return data;
						}
					};

					for (const argv in argvs) {
						switch (argv) {
							case "_":
								{
									const _ = argvs[argv];
									_.forEach((item) => {
										item = removeQuotes(item);

										if (stringIsUrl(item)) {
											json.url = item;
										}
									});
								}
								break;

							case "X":
							case "request":
								json.method = argvs[argv];
								break;

							case "H":
							case "header":
								{
									const parsedHeader = parseHeader(argvs[argv]);
									json.header = {
										...json.header,
										...parsedHeader,
									};
									if (parsedHeader.Cookie) {
										json.cookies = {};
										json.cookies = cookieStrToObject(parsedHeader.Cookie);
									}
								}
								break;

							case "u":
							case "user":
								json.header["Authorization"] = argvs[argv];
								break;

							case "A":
							case "user-agent":
								json.header["user-agent"] = argvs[argv];
								break;

							case "I":
							case "head":
								json.method = "HEAD";
								break;

							case "b":
							case "cookie":
								json.header["Set-Cookie"] = argvs[argv];
								break;

							case "d":
							case "data":
							case "data-raw":
							case "data-ascii":
								const str = parseData(argvs[argv]);

								const params = new URLSearchParams(str);
								json.data = Object.fromEntries(params.entries());
								break;

							case "data-urlencode":
								json.data = parseDataUrlEncode(argvs[argv]);
								break;

							case "compressed":
								if (!json.header["Accept-Encoding"]) {
									json.header["Accept-Encoding"] =
										argvs[argv] || "deflate, gzip";
								}
								json.compressed = true;
								break;

							default:
								break;
						}
					}

					return json;
				};

				module.exports = exports.default = convertToJson;
			},
			{ "yargs-parser": 27 },
		],
		27: [
			function (require, module, exports) {
				(function (process) {
					(function () {
						"use strict";

						var util = require("util");
						var fs = require("fs");
						var path = require("path");

						function camelCase(str) {
							const isCamelCase =
								str !== str.toLowerCase() && str !== str.toUpperCase();
							if (!isCamelCase) {
								str = str.toLowerCase();
							}
							if (str.indexOf("-") === -1 && str.indexOf("_") === -1) {
								return str;
							} else {
								let camelcase = "";
								let nextChrUpper = false;
								const leadingHyphens = str.match(/^-+/);
								for (
									let i = leadingHyphens ? leadingHyphens[0].length : 0;
									i < str.length;
									i++
								) {
									let chr = str.charAt(i);
									if (nextChrUpper) {
										nextChrUpper = false;
										chr = chr.toUpperCase();
									}
									if (i !== 0 && (chr === "-" || chr === "_")) {
										nextChrUpper = true;
									} else if (chr !== "-" && chr !== "_") {
										camelcase += chr;
									}
								}
								return camelcase;
							}
						}
						function decamelize(str, joinString) {
							const lowercase = str.toLowerCase();
							joinString = joinString || "-";
							let notCamelcase = "";
							for (let i = 0; i < str.length; i++) {
								const chrLower = lowercase.charAt(i);
								const chrString = str.charAt(i);
								if (chrLower !== chrString && i > 0) {
									notCamelcase += `${joinString}${lowercase.charAt(i)}`;
								} else {
									notCamelcase += chrString;
								}
							}
							return notCamelcase;
						}
						function looksLikeNumber(x) {
							if (x === null || x === undefined) return false;
							if (typeof x === "number") return true;
							if (/^0x[0-9a-f]+$/i.test(x)) return true;
							if (/^0[^.]/.test(x)) return false;
							return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
						}

						function tokenizeArgString(argString) {
							if (Array.isArray(argString)) {
								return argString.map((e) =>
									typeof e !== "string" ? e + "" : e
								);
							}
							argString = argString.trim();
							let i = 0;
							let prevC = null;
							let c = null;
							let opening = null;
							const args = [];
							for (let ii = 0; ii < argString.length; ii++) {
								prevC = c;
								c = argString.charAt(ii);
								if (c === " " && !opening) {
									if (!(prevC === " ")) {
										i++;
									}
									continue;
								}
								if (c === opening) {
									opening = null;
								} else if ((c === "'" || c === '"') && !opening) {
									opening = c;
								}
								if (!args[i]) args[i] = "";
								args[i] += c;
							}
							return args;
						}

						var DefaultValuesForTypeKey;
						(function (DefaultValuesForTypeKey) {
							DefaultValuesForTypeKey["BOOLEAN"] = "boolean";
							DefaultValuesForTypeKey["STRING"] = "string";
							DefaultValuesForTypeKey["NUMBER"] = "number";
							DefaultValuesForTypeKey["ARRAY"] = "array";
						})(DefaultValuesForTypeKey || (DefaultValuesForTypeKey = {}));

						let mixin;
						class YargsParser {
							constructor(_mixin) {
								mixin = _mixin;
							}
							parse(argsInput, options) {
								const opts = Object.assign(
									{
										alias: undefined,
										array: undefined,
										boolean: undefined,
										config: undefined,
										configObjects: undefined,
										configuration: undefined,
										coerce: undefined,
										count: undefined,
										default: undefined,
										envPrefix: undefined,
										narg: undefined,
										normalize: undefined,
										string: undefined,
										number: undefined,
										__: undefined,
										key: undefined,
									},
									options
								);
								const args = tokenizeArgString(argsInput);
								const aliases = combineAliases(
									Object.assign(Object.create(null), opts.alias)
								);
								const configuration = Object.assign(
									{
										"boolean-negation": true,
										"camel-case-expansion": true,
										"combine-arrays": false,
										"dot-notation": true,
										"duplicate-arguments-array": true,
										"flatten-duplicate-arrays": true,
										"greedy-arrays": true,
										"halt-at-non-option": false,
										"nargs-eats-options": false,
										"negation-prefix": "no-",
										"parse-numbers": true,
										"parse-positional-numbers": true,
										"populate--": false,
										"set-placeholder-key": false,
										"short-option-groups": true,
										"strip-aliased": false,
										"strip-dashed": false,
										"unknown-options-as-args": false,
									},
									opts.configuration
								);
								const defaults = Object.assign(
									Object.create(null),
									opts.default
								);
								const configObjects = opts.configObjects || [];
								const envPrefix = opts.envPrefix;
								const notFlagsOption = configuration["populate--"];
								const notFlagsArgv = notFlagsOption ? "--" : "_";
								const newAliases = Object.create(null);
								const defaulted = Object.create(null);
								const __ = opts.__ || mixin.format;
								const flags = {
									aliases: Object.create(null),
									arrays: Object.create(null),
									bools: Object.create(null),
									strings: Object.create(null),
									numbers: Object.create(null),
									counts: Object.create(null),
									normalize: Object.create(null),
									configs: Object.create(null),
									nargs: Object.create(null),
									coercions: Object.create(null),
									keys: [],
								};
								const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
								const negatedBoolean = new RegExp(
									"^--" + configuration["negation-prefix"] + "(.+)"
								);
								[]
									.concat(opts.array || [])
									.filter(Boolean)
									.forEach(function (opt) {
										const key = typeof opt === "object" ? opt.key : opt;
										const assignment = Object.keys(opt)
											.map(function (key) {
												const arrayFlagKeys = {
													boolean: "bools",
													string: "strings",
													number: "numbers",
												};
												return arrayFlagKeys[key];
											})
											.filter(Boolean)
											.pop();
										if (assignment) {
											flags[assignment][key] = true;
										}
										flags.arrays[key] = true;
										flags.keys.push(key);
									});
								[]
									.concat(opts.boolean || [])
									.filter(Boolean)
									.forEach(function (key) {
										flags.bools[key] = true;
										flags.keys.push(key);
									});
								[]
									.concat(opts.string || [])
									.filter(Boolean)
									.forEach(function (key) {
										flags.strings[key] = true;
										flags.keys.push(key);
									});
								[]
									.concat(opts.number || [])
									.filter(Boolean)
									.forEach(function (key) {
										flags.numbers[key] = true;
										flags.keys.push(key);
									});
								[]
									.concat(opts.count || [])
									.filter(Boolean)
									.forEach(function (key) {
										flags.counts[key] = true;
										flags.keys.push(key);
									});
								[]
									.concat(opts.normalize || [])
									.filter(Boolean)
									.forEach(function (key) {
										flags.normalize[key] = true;
										flags.keys.push(key);
									});
								if (typeof opts.narg === "object") {
									Object.entries(opts.narg).forEach(([key, value]) => {
										if (typeof value === "number") {
											flags.nargs[key] = value;
											flags.keys.push(key);
										}
									});
								}
								if (typeof opts.coerce === "object") {
									Object.entries(opts.coerce).forEach(([key, value]) => {
										if (typeof value === "function") {
											flags.coercions[key] = value;
											flags.keys.push(key);
										}
									});
								}
								if (typeof opts.config !== "undefined") {
									if (
										Array.isArray(opts.config) ||
										typeof opts.config === "string"
									) {
										[]
											.concat(opts.config)
											.filter(Boolean)
											.forEach(function (key) {
												flags.configs[key] = true;
											});
									} else if (typeof opts.config === "object") {
										Object.entries(opts.config).forEach(([key, value]) => {
											if (
												typeof value === "boolean" ||
												typeof value === "function"
											) {
												flags.configs[key] = value;
											}
										});
									}
								}
								extendAliases(opts.key, aliases, opts.default, flags.arrays);
								Object.keys(defaults).forEach(function (key) {
									(flags.aliases[key] || []).forEach(function (alias) {
										defaults[alias] = defaults[key];
									});
								});
								let error = null;
								checkConfiguration();
								let notFlags = [];
								const argv = Object.assign(Object.create(null), { _: [] });
								const argvReturn = {};
								for (let i = 0; i < args.length; i++) {
									const arg = args[i];
									const truncatedArg = arg.replace(/^-{3,}/, "---");
									let broken;
									let key;
									let letters;
									let m;
									let next;
									let value;
									if (arg !== "--" && isUnknownOptionAsArg(arg)) {
										pushPositional(arg);
									} else if (truncatedArg.match(/---+(=|$)/)) {
										pushPositional(arg);
										continue;
									} else if (
										arg.match(/^--.+=/) ||
										(!configuration["short-option-groups"] &&
											arg.match(/^-.+=/))
									) {
										m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
										if (m !== null && Array.isArray(m) && m.length >= 3) {
											if (checkAllAliases(m[1], flags.arrays)) {
												i = eatArray(i, m[1], args, m[2]);
											} else if (checkAllAliases(m[1], flags.nargs) !== false) {
												i = eatNargs(i, m[1], args, m[2]);
											} else {
												setArg(m[1], m[2]);
											}
										}
									} else if (
										arg.match(negatedBoolean) &&
										configuration["boolean-negation"]
									) {
										m = arg.match(negatedBoolean);
										if (m !== null && Array.isArray(m) && m.length >= 2) {
											key = m[1];
											setArg(
												key,
												checkAllAliases(key, flags.arrays) ? [false] : false
											);
										}
									} else if (
										arg.match(/^--.+/) ||
										(!configuration["short-option-groups"] &&
											arg.match(/^-[^-]+/))
									) {
										m = arg.match(/^--?(.+)/);
										if (m !== null && Array.isArray(m) && m.length >= 2) {
											key = m[1];
											if (checkAllAliases(key, flags.arrays)) {
												i = eatArray(i, key, args);
											} else if (checkAllAliases(key, flags.nargs) !== false) {
												i = eatNargs(i, key, args);
											} else {
												next = args[i + 1];
												if (
													next !== undefined &&
													(!next.match(/^-/) || next.match(negative)) &&
													!checkAllAliases(key, flags.bools) &&
													!checkAllAliases(key, flags.counts)
												) {
													setArg(key, next);
													i++;
												} else if (/^(true|false)$/.test(next)) {
													setArg(key, next);
													i++;
												} else {
													setArg(key, defaultValue(key));
												}
											}
										}
									} else if (arg.match(/^-.\..+=/)) {
										m = arg.match(/^-([^=]+)=([\s\S]*)$/);
										if (m !== null && Array.isArray(m) && m.length >= 3) {
											setArg(m[1], m[2]);
										}
									} else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
										next = args[i + 1];
										m = arg.match(/^-(.\..+)/);
										if (m !== null && Array.isArray(m) && m.length >= 2) {
											key = m[1];
											if (
												next !== undefined &&
												!next.match(/^-/) &&
												!checkAllAliases(key, flags.bools) &&
												!checkAllAliases(key, flags.counts)
											) {
												setArg(key, next);
												i++;
											} else {
												setArg(key, defaultValue(key));
											}
										}
									} else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
										letters = arg.slice(1, -1).split("");
										broken = false;
										for (let j = 0; j < letters.length; j++) {
											next = arg.slice(j + 2);
											if (letters[j + 1] && letters[j + 1] === "=") {
												value = arg.slice(j + 3);
												key = letters[j];
												if (checkAllAliases(key, flags.arrays)) {
													i = eatArray(i, key, args, value);
												} else if (
													checkAllAliases(key, flags.nargs) !== false
												) {
													i = eatNargs(i, key, args, value);
												} else {
													setArg(key, value);
												}
												broken = true;
												break;
											}
											if (next === "-") {
												setArg(letters[j], next);
												continue;
											}
											if (
												/[A-Za-z]/.test(letters[j]) &&
												/^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) &&
												checkAllAliases(next, flags.bools) === false
											) {
												setArg(letters[j], next);
												broken = true;
												break;
											}
											if (letters[j + 1] && letters[j + 1].match(/\W/)) {
												setArg(letters[j], next);
												broken = true;
												break;
											} else {
												setArg(letters[j], defaultValue(letters[j]));
											}
										}
										key = arg.slice(-1)[0];
										if (!broken && key !== "-") {
											if (checkAllAliases(key, flags.arrays)) {
												i = eatArray(i, key, args);
											} else if (checkAllAliases(key, flags.nargs) !== false) {
												i = eatNargs(i, key, args);
											} else {
												next = args[i + 1];
												if (
													next !== undefined &&
													(!/^(-|--)[^-]/.test(next) || next.match(negative)) &&
													!checkAllAliases(key, flags.bools) &&
													!checkAllAliases(key, flags.counts)
												) {
													setArg(key, next);
													i++;
												} else if (/^(true|false)$/.test(next)) {
													setArg(key, next);
													i++;
												} else {
													setArg(key, defaultValue(key));
												}
											}
										}
									} else if (
										arg.match(/^-[0-9]$/) &&
										arg.match(negative) &&
										checkAllAliases(arg.slice(1), flags.bools)
									) {
										key = arg.slice(1);
										setArg(key, defaultValue(key));
									} else if (arg === "--") {
										notFlags = args.slice(i + 1);
										break;
									} else if (configuration["halt-at-non-option"]) {
										notFlags = args.slice(i);
										break;
									} else {
										pushPositional(arg);
									}
								}
								applyEnvVars(argv, true);
								applyEnvVars(argv, false);
								setConfig(argv);
								setConfigObjects();
								applyDefaultsAndAliases(argv, flags.aliases, defaults, true);
								applyCoercions(argv);
								if (configuration["set-placeholder-key"])
									setPlaceholderKeys(argv);
								Object.keys(flags.counts).forEach(function (key) {
									if (!hasKey(argv, key.split("."))) setArg(key, 0);
								});
								if (notFlagsOption && notFlags.length) argv[notFlagsArgv] = [];
								notFlags.forEach(function (key) {
									argv[notFlagsArgv].push(key);
								});
								if (
									configuration["camel-case-expansion"] &&
									configuration["strip-dashed"]
								) {
									Object.keys(argv)
										.filter((key) => key !== "--" && key.includes("-"))
										.forEach((key) => {
											delete argv[key];
										});
								}
								if (configuration["strip-aliased"]) {
									[]
										.concat(...Object.keys(aliases).map((k) => aliases[k]))
										.forEach((alias) => {
											if (
												configuration["camel-case-expansion"] &&
												alias.includes("-")
											) {
												delete argv[
													alias
														.split(".")
														.map((prop) => camelCase(prop))
														.join(".")
												];
											}
											delete argv[alias];
										});
								}
								function pushPositional(arg) {
									const maybeCoercedNumber = maybeCoerceNumber("_", arg);
									if (
										typeof maybeCoercedNumber === "string" ||
										typeof maybeCoercedNumber === "number"
									) {
										argv._.push(maybeCoercedNumber);
									}
								}
								function eatNargs(i, key, args, argAfterEqualSign) {
									let ii;
									let toEat = checkAllAliases(key, flags.nargs);
									toEat = typeof toEat !== "number" || isNaN(toEat) ? 1 : toEat;
									if (toEat === 0) {
										if (!isUndefined(argAfterEqualSign)) {
											error = Error(__("Argument unexpected for: %s", key));
										}
										setArg(key, defaultValue(key));
										return i;
									}
									let available = isUndefined(argAfterEqualSign) ? 0 : 1;
									if (configuration["nargs-eats-options"]) {
										if (args.length - (i + 1) + available < toEat) {
											error = Error(
												__("Not enough arguments following: %s", key)
											);
										}
										available = toEat;
									} else {
										for (ii = i + 1; ii < args.length; ii++) {
											if (
												!args[ii].match(/^-[^0-9]/) ||
												args[ii].match(negative) ||
												isUnknownOptionAsArg(args[ii])
											)
												available++;
											else break;
										}
										if (available < toEat)
											error = Error(
												__("Not enough arguments following: %s", key)
											);
									}
									let consumed = Math.min(available, toEat);
									if (!isUndefined(argAfterEqualSign) && consumed > 0) {
										setArg(key, argAfterEqualSign);
										consumed--;
									}
									for (ii = i + 1; ii < consumed + i + 1; ii++) {
										setArg(key, args[ii]);
									}
									return i + consumed;
								}
								function eatArray(i, key, args, argAfterEqualSign) {
									let argsToSet = [];
									let next = argAfterEqualSign || args[i + 1];
									const nargsCount = checkAllAliases(key, flags.nargs);
									if (
										checkAllAliases(key, flags.bools) &&
										!/^(true|false)$/.test(next)
									) {
										argsToSet.push(true);
									} else if (
										isUndefined(next) ||
										(isUndefined(argAfterEqualSign) &&
											/^-/.test(next) &&
											!negative.test(next) &&
											!isUnknownOptionAsArg(next))
									) {
										if (defaults[key] !== undefined) {
											const defVal = defaults[key];
											argsToSet = Array.isArray(defVal) ? defVal : [defVal];
										}
									} else {
										if (!isUndefined(argAfterEqualSign)) {
											argsToSet.push(processValue(key, argAfterEqualSign));
										}
										for (let ii = i + 1; ii < args.length; ii++) {
											if (
												(!configuration["greedy-arrays"] &&
													argsToSet.length > 0) ||
												(nargsCount &&
													typeof nargsCount === "number" &&
													argsToSet.length >= nargsCount)
											)
												break;
											next = args[ii];
											if (
												/^-/.test(next) &&
												!negative.test(next) &&
												!isUnknownOptionAsArg(next)
											)
												break;
											i = ii;
											argsToSet.push(processValue(key, next));
										}
									}
									if (
										typeof nargsCount === "number" &&
										((nargsCount && argsToSet.length < nargsCount) ||
											(isNaN(nargsCount) && argsToSet.length === 0))
									) {
										error = Error(
											__("Not enough arguments following: %s", key)
										);
									}
									setArg(key, argsToSet);
									return i;
								}
								function setArg(key, val) {
									if (/-/.test(key) && configuration["camel-case-expansion"]) {
										const alias = key
											.split(".")
											.map(function (prop) {
												return camelCase(prop);
											})
											.join(".");
										addNewAlias(key, alias);
									}
									const value = processValue(key, val);
									const splitKey = key.split(".");
									setKey(argv, splitKey, value);
									if (flags.aliases[key]) {
										flags.aliases[key].forEach(function (x) {
											const keyProperties = x.split(".");
											setKey(argv, keyProperties, value);
										});
									}
									if (splitKey.length > 1 && configuration["dot-notation"]) {
										(flags.aliases[splitKey[0]] || []).forEach(function (x) {
											let keyProperties = x.split(".");
											const a = [].concat(splitKey);
											a.shift();
											keyProperties = keyProperties.concat(a);
											if (
												!(flags.aliases[key] || []).includes(
													keyProperties.join(".")
												)
											) {
												setKey(argv, keyProperties, value);
											}
										});
									}
									if (
										checkAllAliases(key, flags.normalize) &&
										!checkAllAliases(key, flags.arrays)
									) {
										const keys = [key].concat(flags.aliases[key] || []);
										keys.forEach(function (key) {
											Object.defineProperty(argvReturn, key, {
												enumerable: true,
												get() {
													return val;
												},
												set(value) {
													val =
														typeof value === "string"
															? mixin.normalize(value)
															: value;
												},
											});
										});
									}
								}
								function addNewAlias(key, alias) {
									if (!(flags.aliases[key] && flags.aliases[key].length)) {
										flags.aliases[key] = [alias];
										newAliases[alias] = true;
									}
									if (!(flags.aliases[alias] && flags.aliases[alias].length)) {
										addNewAlias(alias, key);
									}
								}
								function processValue(key, val) {
									if (
										typeof val === "string" &&
										(val[0] === "'" || val[0] === '"') &&
										val[val.length - 1] === val[0]
									) {
										val = val.substring(1, val.length - 1);
									}
									if (
										checkAllAliases(key, flags.bools) ||
										checkAllAliases(key, flags.counts)
									) {
										if (typeof val === "string") val = val === "true";
									}
									let value = Array.isArray(val)
										? val.map(function (v) {
												return maybeCoerceNumber(key, v);
										  })
										: maybeCoerceNumber(key, val);
									if (
										checkAllAliases(key, flags.counts) &&
										(isUndefined(value) || typeof value === "boolean")
									) {
										value = increment();
									}
									if (
										checkAllAliases(key, flags.normalize) &&
										checkAllAliases(key, flags.arrays)
									) {
										if (Array.isArray(val))
											value = val.map((val) => {
												return mixin.normalize(val);
											});
										else value = mixin.normalize(val);
									}
									return value;
								}
								function maybeCoerceNumber(key, value) {
									if (!configuration["parse-positional-numbers"] && key === "_")
										return value;
									if (
										!checkAllAliases(key, flags.strings) &&
										!checkAllAliases(key, flags.bools) &&
										!Array.isArray(value)
									) {
										const shouldCoerceNumber =
											looksLikeNumber(value) &&
											configuration["parse-numbers"] &&
											Number.isSafeInteger(Math.floor(parseFloat(`${value}`)));
										if (
											shouldCoerceNumber ||
											(!isUndefined(value) &&
												checkAllAliases(key, flags.numbers))
										) {
											value = Number(value);
										}
									}
									return value;
								}
								function setConfig(argv) {
									const configLookup = Object.create(null);
									applyDefaultsAndAliases(
										configLookup,
										flags.aliases,
										defaults
									);
									Object.keys(flags.configs).forEach(function (configKey) {
										const configPath =
											argv[configKey] || configLookup[configKey];
										if (configPath) {
											try {
												let config = null;
												const resolvedConfigPath = mixin.resolve(
													mixin.cwd(),
													configPath
												);
												const resolveConfig = flags.configs[configKey];
												if (typeof resolveConfig === "function") {
													try {
														config = resolveConfig(resolvedConfigPath);
													} catch (e) {
														config = e;
													}
													if (config instanceof Error) {
														error = config;
														return;
													}
												} else {
													config = mixin.require(resolvedConfigPath);
												}
												setConfigObject(config);
											} catch (ex) {
												if (ex.name === "PermissionDenied") error = ex;
												else if (argv[configKey])
													error = Error(
														__("Invalid JSON config file: %s", configPath)
													);
											}
										}
									});
								}
								function setConfigObject(config, prev) {
									Object.keys(config).forEach(function (key) {
										const value = config[key];
										const fullKey = prev ? prev + "." + key : key;
										if (
											typeof value === "object" &&
											value !== null &&
											!Array.isArray(value) &&
											configuration["dot-notation"]
										) {
											setConfigObject(value, fullKey);
										} else {
											if (
												!hasKey(argv, fullKey.split(".")) ||
												(checkAllAliases(fullKey, flags.arrays) &&
													configuration["combine-arrays"])
											) {
												setArg(fullKey, value);
											}
										}
									});
								}
								function setConfigObjects() {
									if (typeof configObjects !== "undefined") {
										configObjects.forEach(function (configObject) {
											setConfigObject(configObject);
										});
									}
								}
								function applyEnvVars(argv, configOnly) {
									if (typeof envPrefix === "undefined") return;
									const prefix = typeof envPrefix === "string" ? envPrefix : "";
									const env = mixin.env();
									Object.keys(env).forEach(function (envVar) {
										if (prefix === "" || envVar.lastIndexOf(prefix, 0) === 0) {
											const keys = envVar.split("__").map(function (key, i) {
												if (i === 0) {
													key = key.substring(prefix.length);
												}
												return camelCase(key);
											});
											if (
												((configOnly && flags.configs[keys.join(".")]) ||
													!configOnly) &&
												!hasKey(argv, keys)
											) {
												setArg(keys.join("."), env[envVar]);
											}
										}
									});
								}
								function applyCoercions(argv) {
									let coerce;
									const applied = new Set();
									Object.keys(argv).forEach(function (key) {
										if (!applied.has(key)) {
											coerce = checkAllAliases(key, flags.coercions);
											if (typeof coerce === "function") {
												try {
													const value = maybeCoerceNumber(
														key,
														coerce(argv[key])
													);
													[]
														.concat(flags.aliases[key] || [], key)
														.forEach((ali) => {
															applied.add(ali);
															argv[ali] = value;
														});
												} catch (err) {
													error = err;
												}
											}
										}
									});
								}
								function setPlaceholderKeys(argv) {
									flags.keys.forEach((key) => {
										if (~key.indexOf(".")) return;
										if (typeof argv[key] === "undefined") argv[key] = undefined;
									});
									return argv;
								}
								function applyDefaultsAndAliases(
									obj,
									aliases,
									defaults,
									canLog = false
								) {
									Object.keys(defaults).forEach(function (key) {
										if (!hasKey(obj, key.split("."))) {
											setKey(obj, key.split("."), defaults[key]);
											if (canLog) defaulted[key] = true;
											(aliases[key] || []).forEach(function (x) {
												if (hasKey(obj, x.split("."))) return;
												setKey(obj, x.split("."), defaults[key]);
											});
										}
									});
								}
								function hasKey(obj, keys) {
									let o = obj;
									if (!configuration["dot-notation"]) keys = [keys.join(".")];
									keys.slice(0, -1).forEach(function (key) {
										o = o[key] || {};
									});
									const key = keys[keys.length - 1];
									if (typeof o !== "object") return false;
									else return key in o;
								}
								function setKey(obj, keys, value) {
									let o = obj;
									if (!configuration["dot-notation"]) keys = [keys.join(".")];
									keys.slice(0, -1).forEach(function (key) {
										key = sanitizeKey(key);
										if (typeof o === "object" && o[key] === undefined) {
											o[key] = {};
										}
										if (typeof o[key] !== "object" || Array.isArray(o[key])) {
											if (Array.isArray(o[key])) {
												o[key].push({});
											} else {
												o[key] = [o[key], {}];
											}
											o = o[key][o[key].length - 1];
										} else {
											o = o[key];
										}
									});
									const key = sanitizeKey(keys[keys.length - 1]);
									const isTypeArray = checkAllAliases(
										keys.join("."),
										flags.arrays
									);
									const isValueArray = Array.isArray(value);
									let duplicate = configuration["duplicate-arguments-array"];
									if (!duplicate && checkAllAliases(key, flags.nargs)) {
										duplicate = true;
										if (
											(!isUndefined(o[key]) && flags.nargs[key] === 1) ||
											(Array.isArray(o[key]) &&
												o[key].length === flags.nargs[key])
										) {
											o[key] = undefined;
										}
									}
									if (value === increment()) {
										o[key] = increment(o[key]);
									} else if (Array.isArray(o[key])) {
										if (duplicate && isTypeArray && isValueArray) {
											o[key] = configuration["flatten-duplicate-arrays"]
												? o[key].concat(value)
												: (Array.isArray(o[key][0]) ? o[key] : [o[key]]).concat(
														[value]
												  );
										} else if (
											!duplicate &&
											Boolean(isTypeArray) === Boolean(isValueArray)
										) {
											o[key] = value;
										} else {
											o[key] = o[key].concat([value]);
										}
									} else if (o[key] === undefined && isTypeArray) {
										o[key] = isValueArray ? value : [value];
									} else if (
										duplicate &&
										!(
											o[key] === undefined ||
											checkAllAliases(key, flags.counts) ||
											checkAllAliases(key, flags.bools)
										)
									) {
										o[key] = [o[key], value];
									} else {
										o[key] = value;
									}
								}
								function extendAliases(...args) {
									args.forEach(function (obj) {
										Object.keys(obj || {}).forEach(function (key) {
											if (flags.aliases[key]) return;
											flags.aliases[key] = [].concat(aliases[key] || []);
											flags.aliases[key].concat(key).forEach(function (x) {
												if (
													/-/.test(x) &&
													configuration["camel-case-expansion"]
												) {
													const c = camelCase(x);
													if (
														c !== key &&
														flags.aliases[key].indexOf(c) === -1
													) {
														flags.aliases[key].push(c);
														newAliases[c] = true;
													}
												}
											});
											flags.aliases[key].concat(key).forEach(function (x) {
												if (
													x.length > 1 &&
													/[A-Z]/.test(x) &&
													configuration["camel-case-expansion"]
												) {
													const c = decamelize(x, "-");
													if (
														c !== key &&
														flags.aliases[key].indexOf(c) === -1
													) {
														flags.aliases[key].push(c);
														newAliases[c] = true;
													}
												}
											});
											flags.aliases[key].forEach(function (x) {
												flags.aliases[x] = [key].concat(
													flags.aliases[key].filter(function (y) {
														return x !== y;
													})
												);
											});
										});
									});
								}
								function checkAllAliases(key, flag) {
									const toCheck = [].concat(flags.aliases[key] || [], key);
									const keys = Object.keys(flag);
									const setAlias = toCheck.find((key) => keys.includes(key));
									return setAlias ? flag[setAlias] : false;
								}
								function hasAnyFlag(key) {
									const flagsKeys = Object.keys(flags);
									const toCheck = [].concat(flagsKeys.map((k) => flags[k]));
									return toCheck.some(function (flag) {
										return Array.isArray(flag) ? flag.includes(key) : flag[key];
									});
								}
								function hasFlagsMatching(arg, ...patterns) {
									const toCheck = [].concat(...patterns);
									return toCheck.some(function (pattern) {
										const match = arg.match(pattern);
										return match && hasAnyFlag(match[1]);
									});
								}
								function hasAllShortFlags(arg) {
									if (arg.match(negative) || !arg.match(/^-[^-]+/)) {
										return false;
									}
									let hasAllFlags = true;
									let next;
									const letters = arg.slice(1).split("");
									for (let j = 0; j < letters.length; j++) {
										next = arg.slice(j + 2);
										if (!hasAnyFlag(letters[j])) {
											hasAllFlags = false;
											break;
										}
										if (
											(letters[j + 1] && letters[j + 1] === "=") ||
											next === "-" ||
											(/[A-Za-z]/.test(letters[j]) &&
												/^-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) ||
											(letters[j + 1] && letters[j + 1].match(/\W/))
										) {
											break;
										}
									}
									return hasAllFlags;
								}
								function isUnknownOptionAsArg(arg) {
									return (
										configuration["unknown-options-as-args"] &&
										isUnknownOption(arg)
									);
								}
								function isUnknownOption(arg) {
									arg = arg.replace(/^-{3,}/, "--");
									if (arg.match(negative)) {
										return false;
									}
									if (hasAllShortFlags(arg)) {
										return false;
									}
									const flagWithEquals = /^-+([^=]+?)=[\s\S]*$/;
									const normalFlag = /^-+([^=]+?)$/;
									const flagEndingInHyphen = /^-+([^=]+?)-$/;
									const flagEndingInDigits = /^-+([^=]+?\d+)$/;
									const flagEndingInNonWordCharacters = /^-+([^=]+?)\W+.*$/;
									return !hasFlagsMatching(
										arg,
										flagWithEquals,
										negatedBoolean,
										normalFlag,
										flagEndingInHyphen,
										flagEndingInDigits,
										flagEndingInNonWordCharacters
									);
								}
								function defaultValue(key) {
									if (
										!checkAllAliases(key, flags.bools) &&
										!checkAllAliases(key, flags.counts) &&
										`${key}` in defaults
									) {
										return defaults[key];
									} else {
										return defaultForType(guessType(key));
									}
								}
								function defaultForType(type) {
									const def = {
										[DefaultValuesForTypeKey.BOOLEAN]: true,
										[DefaultValuesForTypeKey.STRING]: "",
										[DefaultValuesForTypeKey.NUMBER]: undefined,
										[DefaultValuesForTypeKey.ARRAY]: [],
									};
									return def[type];
								}
								function guessType(key) {
									let type = DefaultValuesForTypeKey.BOOLEAN;
									if (checkAllAliases(key, flags.strings))
										type = DefaultValuesForTypeKey.STRING;
									else if (checkAllAliases(key, flags.numbers))
										type = DefaultValuesForTypeKey.NUMBER;
									else if (checkAllAliases(key, flags.bools))
										type = DefaultValuesForTypeKey.BOOLEAN;
									else if (checkAllAliases(key, flags.arrays))
										type = DefaultValuesForTypeKey.ARRAY;
									return type;
								}
								function isUndefined(num) {
									return num === undefined;
								}
								function checkConfiguration() {
									Object.keys(flags.counts).find((key) => {
										if (checkAllAliases(key, flags.arrays)) {
											error = Error(
												__(
													"Invalid configuration: %s, opts.count excludes opts.array.",
													key
												)
											);
											return true;
										} else if (checkAllAliases(key, flags.nargs)) {
											error = Error(
												__(
													"Invalid configuration: %s, opts.count excludes opts.narg.",
													key
												)
											);
											return true;
										}
										return false;
									});
								}
								return {
									aliases: Object.assign({}, flags.aliases),
									argv: Object.assign(argvReturn, argv),
									configuration: configuration,
									defaulted: Object.assign({}, defaulted),
									error: error,
									newAliases: Object.assign({}, newAliases),
								};
							}
						}
						function combineAliases(aliases) {
							const aliasArrays = [];
							const combined = Object.create(null);
							let change = true;
							Object.keys(aliases).forEach(function (key) {
								aliasArrays.push([].concat(aliases[key], key));
							});
							while (change) {
								change = false;
								for (let i = 0; i < aliasArrays.length; i++) {
									for (let ii = i + 1; ii < aliasArrays.length; ii++) {
										const intersect = aliasArrays[i].filter(function (v) {
											return aliasArrays[ii].indexOf(v) !== -1;
										});
										if (intersect.length) {
											aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii]);
											aliasArrays.splice(ii, 1);
											change = true;
											break;
										}
									}
								}
							}
							aliasArrays.forEach(function (aliasArray) {
								aliasArray = aliasArray.filter(function (v, i, self) {
									return self.indexOf(v) === i;
								});
								const lastAlias = aliasArray.pop();
								if (lastAlias !== undefined && typeof lastAlias === "string") {
									combined[lastAlias] = aliasArray;
								}
							});
							return combined;
						}
						function increment(orig) {
							return orig !== undefined ? orig + 1 : 1;
						}
						function sanitizeKey(key) {
							if (key === "__proto__") return "___proto___";
							return key;
						}

						const minNodeVersion =
							process && process.env && process.env.YARGS_MIN_NODE_VERSION
								? Number(process.env.YARGS_MIN_NODE_VERSION)
								: 10;
						if (process && process.version) {
							const major = Number(process.version.match(/v([^.]+)/)[1]);
							if (major < minNodeVersion) {
								throw Error(
									`yargs parser supports a minimum Node.js version of ${minNodeVersion}. Read our version support policy: https://github.com/yargs/yargs-parser#supported-nodejs-versions`
								);
							}
						}
						const env = process ? process.env : {};
						const parser = new YargsParser({
							cwd: process.cwd,
							env: () => {
								return env;
							},
							format: util.format,
							normalize: path.normalize,
							resolve: path.resolve,
							require: (path) => {
								if (typeof require !== "undefined") {
									return require(path);
								} else if (path.match(/\.json$/)) {
									return fs.readFileSync(path, "utf8");
								} else {
									throw Error("only .json config files are supported in ESM");
								}
							},
						});
						const yargsParser = function Parser(args, opts) {
							const result = parser.parse(args.slice(), opts);
							return result.argv;
						};
						yargsParser.detailed = function (args, opts) {
							return parser.parse(args.slice(), opts);
						};
						yargsParser.camelCase = camelCase;
						yargsParser.decamelize = decamelize;
						yargsParser.looksLikeNumber = looksLikeNumber;

						module.exports = yargsParser;
					}.call(this));
				}.call(this, require("_process")));
			},
			{ _process: 20, fs: 1, path: 19, util: 23 },
		],
	},
	{},
	[25]
);
function cookieStrToObject(cookieStr) {
	let cookieObj = {};
	let keyValuePairs = cookieStr.split("; ");
	keyValuePairs.forEach((pair) => {
		let [key, value] = pair.split("=");
		cookieObj[key] = value;
	});
	return cookieObj;
}
