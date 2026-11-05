/*! wud-queue-card 1.1.0 | MIT License */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ?? (i5 = r6.getPropertyOptions(t4)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r6;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 || (o6 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t4 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/const.ts
var CARD_VERSION = "1.1.0";
var START_TIMEOUT = 6e4;
var VERSION_GRACE = 12e4;
var DONE_KEEP = 6e5;

// src/containers.ts
var WUD_IMAGE = /(^|\/)(getwud\/wud|fmartinou\/whats-up-docker)$/;
function isWud(entity) {
  return !!entity && entity.entity_id.startsWith("update.") && typeof entity.attributes.watcher === "string" && typeof entity.attributes.image_name === "string";
}
function isSelfUpdateHelper(entity) {
  return /-self-update-\d+$/.test(String(entity.attributes.name ?? ""));
}
function wudEntities(hass, device) {
  return Object.keys(hass.states).filter((id) => isWud(hass.states[id]) && !isSelfUpdateHelper(hass.states[id])).filter((id) => !device || hass.entities?.[id]?.device_id === device).sort();
}
function selectedEntities(hass, config) {
  const exclude = new Set(config.exclude ?? []);
  const ids = config.entities?.length ? config.entities : wudEntities(hass, config.device);
  return ids.filter((id) => {
    const entity = hass.states[id];
    return !exclude.has(id) && isWud(entity) && !isSelfUpdateHelper(entity);
  });
}
function text(value) {
  return typeof value === "string" ? value : "";
}
function containerOf(entity) {
  if (entity.state !== "on" && entity.state !== "off") {
    return void 0;
  }
  const a3 = entity.attributes;
  return {
    entity_id: entity.entity_id,
    watcher: text(a3.watcher),
    stack: text(a3.stack) || text(a3.labels_com_docker_compose_project),
    // A name given with WUD's own label wins; WUD's default display name is the container's, which
    // compose fills with the project and a number.
    name: text(a3.labels_wud_display_name) || text(a3.labels_com_docker_compose_service) || text(a3.display_name) || text(a3.name) || entity.entity_id,
    image: text(a3.image_name),
    installed: text(a3.installed_version),
    latest: text(a3.latest_version),
    pending: entity.state === "on",
    // WUD sets this while it installs. Home Assistant turns a percentage into true, and gives the number as
    // update_percentage. After WUD has replaced itself its entity keeps saying so, so only a container still without
    // its update counts.
    installing: entity.state === "on" && a3.in_progress === true,
    status: text(a3.status),
    created: text(a3.image_created)
  };
}
function byName(a3, b3) {
  return a3.name.localeCompare(b3.name);
}
function projectsOf(containers) {
  const watchers = new Set(containers.map((c4) => c4.watcher)).size > 1;
  const projects = /* @__PURE__ */ new Map();
  for (const container of containers) {
    const key = `${container.watcher}|${container.stack || `:${container.entity_id}`}`;
    projects.set(key, [...projects.get(key) ?? [], container]);
  }
  const result = [...projects.entries()].map(([key, members]) => {
    const host = watchers && members[0].watcher ? ` (${members[0].watcher})` : "";
    const name = (members[0].stack || members[0].name) + host;
    const images = /* @__PURE__ */ new Map();
    for (const container of members) {
      const image = `${container.image || container.entity_id}@${container.latest}`;
      images.set(image, [...images.get(image) ?? [], container]);
    }
    const single = images.size === 1;
    const units = [...images.entries()].map(([unitKey, list]) => {
      const sorted = [...list].sort(byName);
      const image = list[0].image || list[0].entity_id;
      return {
        key: `${key}/${unitKey}`,
        // A unit of several services is named after its project when it is all there is in it,
        // otherwise after its image.
        name: sorted.length === 1 ? sorted[0].name : single ? name : image.split("/").pop() ?? image,
        containers: sorted,
        pending: sorted.some((c4) => c4.pending),
        installing: sorted.some((c4) => c4.installing),
        wud: WUD_IMAGE.test(image)
      };
    });
    if (units.length === 1 && units[0].containers.length === 1) {
      units[0].name += host;
    }
    units.sort((a3, b3) => Number(a3.wud) - Number(b3.wud) || byName(a3, b3));
    return { key, name, units };
  });
  const hasWud = (project) => project.units.some((unit) => unit.wud);
  const shown = (project) => ({
    name: project.units.length === 1 ? project.units[0].name : project.name
  });
  return result.sort((a3, b3) => Number(hasWud(a3)) - Number(hasWud(b3)) || byName(shown(a3), shown(b3)));
}
function follow(unit, install, now) {
  const started = install.started || unit.installing;
  const ended = unit.installing ? void 0 : started ? install.ended ?? now : void 0;
  const next = { ...install, started, ended };
  if (unit.containers.every((c4) => c4.installed === install.targets[c4.entity_id])) {
    return { install: { ...next, ended: install.ended ?? ended ?? now }, status: "done" };
  }
  if (install.error !== void 0) {
    return { install: next, status: "failed", reason: "service" };
  }
  if (unit.installing) {
    return { install: next, status: "running" };
  }
  if (started) {
    return now - (ended ?? now) > VERSION_GRACE ? { install: next, status: "failed", reason: "version" } : { install: next, status: "running" };
  }
  return now - install.at > START_TIMEOUT ? { install: next, status: "failed", reason: "start" } : { install: next, status: "running" };
}
function servicesDone(unit, install) {
  return install ? unit.containers.filter((c4) => c4.installed === install.targets[c4.entity_id]).length : 0;
}
function queueEntityId(hass) {
  return Object.entries(hass.entities ?? {}).find(([id, e5]) => e5?.platform === "wud_queue" && id.startsWith("sensor."))?.[0];
}
function queueOf(hass) {
  const id = queueEntityId(hass);
  const state = id && hass.states[id];
  if (!state || !Array.isArray(state.attributes.items)) {
    return void 0;
  }
  return {
    state: state.state,
    stopping: state.attributes.stopping === true,
    items: state.attributes.items
  };
}
function followQueue(unit, queue) {
  const ids = new Set(unit.containers.map((c4) => c4.entity_id));
  const item = [...queue.items].reverse().find((i5) => i5.entities.some((e5) => ids.has(e5.entity_id)));
  if (!item) {
    return void 0;
  }
  const versions = new Map(item.entities.map((e5) => [e5.entity_id, e5]));
  const install = {
    at: 0,
    from: Object.fromEntries(unit.containers.map((c4) => [c4.entity_id, versions.get(c4.entity_id)?.from ?? c4.installed])),
    targets: Object.fromEntries(unit.containers.map((c4) => [c4.entity_id, versions.get(c4.entity_id)?.to ?? c4.installed])),
    started: true
  };
  if (unit.containers.every((c4) => c4.installed === install.targets[c4.entity_id])) {
    return { install, status: "done" };
  }
  return {
    install: { ...install, ...item.error ? { error: item.error } : {} },
    status: item.status,
    ...item.reason ? { reason: item.reason } : {}
  };
}
function retryable(hass, queue) {
  return queue.items.some((item) => item.status !== "done" && item.entities.some((e5) => hass.states[e5.entity_id]?.state === "on"));
}

// src/localize/languages/en.json
var en_default = {
  common: {
    name: "WUD Queue card",
    description: "What's Up Docker's container updates, grouped by compose project",
    title: "Docker containers",
    invalid_configuration: "Invalid configuration",
    invalid_height: "Invalid height. height and max_height must be positive numbers of pixels, and height_mode auto, fixed or max.",
    invalid_row_step: "Invalid rounding. row_step must be full or half.",
    no_entities: "No What's Up Docker update entities found",
    all_current: "All up to date",
    available: "Updates available",
    updating: "Updating {name}",
    failed: "{name} was not updated",
    current_count: "{n} up to date",
    pending_count: "{n} waiting for an update",
    show: "Show",
    hide: "Hide",
    services: "{n} services",
    services_done: "{done}/{n} services",
    install: "Update {name}",
    update_all: "Update all",
    stop: "Stop queue",
    stopping: "Stopping",
    retry: "Retry",
    queue_stopped: "Queue stopped",
    clear: "Clear",
    containers: "{n} containers",
    containers_one: "{n} container",
    projects: "{n} compose projects",
    projects_one: "{n} compose project",
    oldest_image: "Oldest image: {name}, built {age}",
    not_running: "{n} containers not running",
    not_running_one: "{n} container not running"
  },
  status: {
    queued: "Queued",
    running: "Updating",
    done: "Updated",
    failed: "Failed",
    not_run: "Not installed"
  },
  error: {
    service: "Home Assistant did not send the update to What's Up Docker. {message}",
    start: "What's Up Docker did not start the update within a minute. Is it running?",
    version: "The update ended, but the container is still on {version}. Check What's Up Docker's logs.",
    timeout: "The update did not finish within half an hour. Check What's Up Docker's logs."
  },
  editor: {
    title: "Title",
    device: "What's Up Docker device",
    device_helper: "Shows every update of the chosen WUD device. Leave empty to show the updates of all WUD devices.",
    entities: "Containers",
    entities_helper: "If you set update entities by hand, only they are shown.",
    exclude: "Leave out",
    exclude_helper: "Update entities never shown. For when you want to show everything from a device except these.",
    row_step: "Rounding in a sections view",
    row_step_helper: "With automatic row height, the card's height is rounded up to whole rows, or to half rows to save space.",
    row_step_full: "Whole rows",
    row_step_half: "Half rows"
  }
};

// src/localize/languages/fi.json
var fi_default = {
  common: {
    name: "WUD-jonokortti",
    description: "What's Up Dockerin konttip\xE4ivitykset compose-projekteittain",
    title: "Docker-kontit",
    invalid_configuration: "Virheelliset asetukset",
    invalid_height: "Virheellinen korkeus. Korkeuksien (height ja max_height) on oltava positiivisia lukuja pikselein\xE4, ja korkeustilan (height_mode) auto, fixed tai max.",
    invalid_row_step: "Virheellinen py\xF6ristys. Py\xF6ristyksen (row_step) on oltava full tai half.",
    no_entities: "What's Up Dockerin p\xE4ivitysentiteettej\xE4 ei l\xF6ytynyt",
    all_current: "Kaikki ajan tasalla",
    available: "P\xE4ivityksi\xE4 saatavilla",
    updating: "P\xE4ivitet\xE4\xE4n {name}",
    failed: "{name} ei p\xE4ivittynyt",
    current_count: "{n} ajan tasalla",
    pending_count: "{n} odottaa p\xE4ivityst\xE4",
    show: "N\xE4yt\xE4",
    hide: "Piilota",
    services: "{n} palvelua",
    services_done: "{done}/{n} palvelua",
    install: "P\xE4ivit\xE4 {name}",
    update_all: "P\xE4ivit\xE4 kaikki",
    stop: "Pys\xE4yt\xE4 jono",
    stopping: "Pys\xE4htyy",
    retry: "Yrit\xE4 uudelleen",
    queue_stopped: "Jono pys\xE4ytetty",
    clear: "Kuittaa",
    containers: "{n} konttia",
    containers_one: "{n} kontti",
    projects: "{n} compose-projektia",
    projects_one: "{n} compose-projekti",
    oldest_image: "Vanhin image: {name}, tehty {age}",
    not_running: "{n} konttia ei k\xE4ynniss\xE4",
    not_running_one: "{n} kontti ei k\xE4ynniss\xE4"
  },
  status: {
    queued: "Jonossa",
    running: "P\xE4ivitet\xE4\xE4n",
    done: "P\xE4ivitetty",
    failed: "Ep\xE4onnistui",
    not_run: "Ei asennettu"
  },
  error: {
    service: "Home Assistant ei v\xE4litt\xE4nyt p\xE4ivityst\xE4 What's Up Dockerille. {message}",
    start: "What's Up Docker ei aloittanut p\xE4ivityst\xE4 minuutissa. Onko se k\xE4ynniss\xE4?",
    version: "P\xE4ivitys p\xE4\xE4ttyi, mutta kontti on yh\xE4 versiossa {version}. Tarkista What's Up Dockerin lokit.",
    timeout: "P\xE4ivitys ei valmistunut puolessa tunnissa. Tarkista What's Up Dockerin lokit."
  },
  editor: {
    title: "Otsikko",
    device: "What's Up Docker -laite",
    device_helper: "N\xE4ytt\xE4\xE4 kaikki valitun WUD-laitteen p\xE4ivitykset. J\xE4t\xE4 tyhj\xE4ksi n\xE4ytt\xE4\xE4ksesi kaikkien WUD-laitteiden p\xE4ivitykset.",
    entities: "Kontit",
    entities_helper: "Jos asetat k\xE4sin p\xE4ivitysentiteettej\xE4, ainoastaan ne n\xE4ytet\xE4\xE4n.",
    exclude: "J\xE4t\xE4 pois",
    exclude_helper: "P\xE4ivitysentiteetit, joita ei koskaan n\xE4ytet\xE4. Kun haluat n\xE4ytt\xE4\xE4 laitteelta kaiken, paitsi n\xE4m\xE4.",
    row_step: "Py\xF6ristys osioihin jaetussa n\xE4kym\xE4ss\xE4",
    row_step_helper: "Automaattisella rivikorkeudella kortin korkeus py\xF6ristet\xE4\xE4n yl\xF6sp\xE4in kokonaisiin riveihin, tai tilan s\xE4\xE4st\xE4miseksi puolikkaisiin riveihin.",
    row_step_full: "Kokonaisiin riveihin",
    row_step_half: "Puolikkaisiin riveihin"
  }
};

// src/localize/localize.ts
var FILES = { "./languages/en.json": en_default, "./languages/fi.json": fi_default };
var LANGUAGES = Object.fromEntries(
  Object.entries(FILES).map(([path, table]) => [path.replace(/^.*\/|\.json$/g, "").toLowerCase(), table])
);
var LANGUAGE_CODES = Object.keys(LANGUAGES).sort();
function translate(language, key) {
  const code = (language ?? "en").split(/[-_]/)[0].toLowerCase();
  return read(LANGUAGES[code], key) ?? read(LANGUAGES.en, key) ?? key;
}
function read(table, key) {
  let value = table;
  for (const part of key.split(".")) {
    if (value === null || typeof value !== "object") {
      return void 0;
    }
    value = value[part];
  }
  return typeof value === "string" ? value : void 0;
}
function browserLanguage() {
  return document.documentElement.lang || navigator.language || "en";
}

// src/height.ts
var HEIGHT_MODES = ["auto", "fixed", "max"];
var pixels = (value) => value == null || typeof value === "number" && Number.isFinite(value) && value > 0;
function validHeight(config) {
  return (config.height_mode == null || HEIGHT_MODES.includes(config.height_mode)) && pixels(config.height) && pixels(config.max_height);
}
function heightMode(config) {
  return config.height_mode ?? (config.height ? "fixed" : config.max_height ? "max" : "auto");
}
var ROW_HEIGHT = 56;
var ROW_GAP = 8;
function heightStyle(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout === "grid" && typeof rows === "number") {
    return "height: 100%";
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return `height: ${Math.max(config.height, minimum)}px`;
  }
  return mode === "max" && config.max_height ? `max-height: ${Math.max(config.max_height, minimum)}px` : "";
}
function gridMinRows(minimum) {
  return Math.max(1, Math.ceil((minimum + ROW_GAP) / (ROW_HEIGHT + ROW_GAP)));
}
function heightCardSize(config, content, minimum = 0) {
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return Math.max(1, Math.round(Math.max(config.height, minimum) / 50));
  }
  return mode === "max" && config.max_height ? Math.max(1, Math.min(content, Math.round(Math.max(config.max_height, minimum) / 50))) : content;
}

// src/rows.ts
var ROW_STEPS = ["full", "half"];
var ROW_PX = 64;
var ROW_GAP_PX = 8;
function validRowStep(config) {
  return config.row_step === void 0 || config.row_step === null || ROW_STEPS.includes(config.row_step);
}
var step = (config) => config.row_step === "half" ? ROW_PX / 2 : ROW_PX;
function filledHeight(content, config, limit = Infinity) {
  return Math.min(Math.max(1, Math.ceil((content + ROW_GAP_PX) / step(config))) * step(config) - ROW_GAP_PX, limit);
}
function fillLimit(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout !== "grid" || typeof rows === "number") {
    return 0;
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return 0;
  }
  if (mode !== "max" || !config.max_height) {
    return Infinity;
  }
  const down = Math.floor((config.max_height + ROW_GAP_PX) / step(config)) * step(config) - ROW_GAP_PX;
  return Math.max(down, filledHeight(minimum, config));
}
function filledStyle(config, layout, minimum, filled) {
  const limit = fillLimit(config, layout, minimum);
  if (!limit) {
    return heightStyle(config, layout, minimum);
  }
  return [limit < Infinity && `max-height: ${limit}px`, filled && `min-height: ${filled}px`].filter(Boolean).join("; ");
}
function rowStepSchema(config, text2) {
  if (heightMode(config) === "fixed" && config.height) {
    return [];
  }
  return [
    {
      name: "row_step",
      selector: {
        select: { mode: "dropdown", options: ROW_STEPS.map((value) => ({ value, label: text2(`editor.row_step_${value}`) })) }
      }
    }
  ];
}
function rowStepData(config) {
  return { ...config, row_step: config.row_step ?? "full" };
}
function tidyRowStep(config) {
  const tidied = { ...config };
  if (tidied.row_step !== "half" || heightMode(tidied) === "fixed" && tidied.height) {
    delete tidied.row_step;
  }
  return tidied;
}

// src/editor.ts
function schema(hass, config, text2) {
  const entities = wudEntities(hass);
  return [
    { name: "title", selector: { text: {} } },
    // WUD reaches Home Assistant over MQTT; its devices are the ones that own WUD's update entities.
    {
      name: "device",
      selector: { device: { filter: { integration: "mqtt" }, entity: { domain: "update" } } }
    },
    { name: "entities", selector: { entity: { multiple: true, include_entities: entities } } },
    { name: "exclude", selector: { entity: { multiple: true, include_entities: entities } } },
    ...rowStepSchema(config, text2)
  ];
}
var WudQueueCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this.config = { type: "custom:wud-queue-card" };
  }
  setConfig(config) {
    this.config = { ...config };
  }
  render() {
    if (!this.hass) {
      return A;
    }
    return b2`
            <ha-form
                .hass=${this.hass}
                .data=${rowStepData(this.config)}
                .schema=${schema(this.hass, this.config, (key) => this.text(key))}
                .computeLabel=${(entry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
  }
  valueChanged(event) {
    const config = tidyRowStep(event.detail.value);
    for (const key of ["title", "device", "entities", "exclude"]) {
      const value = config[key];
      if (value === void 0 || value === null || String(value) === "" || Array.isArray(value) && value.length === 0) {
        delete config[key];
      }
    }
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  text(key) {
    return translate(this.language(), key);
  }
  helper(name) {
    const key = `editor.${name}_helper`;
    const helper = translate(this.language(), key);
    return helper === key ? void 0 : helper;
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
};
__decorateClass([
  n4({ attribute: false })
], WudQueueCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], WudQueueCardEditor.prototype, "config", 2);
WudQueueCardEditor = __decorateClass([
  t3("wud-queue-card-editor")
], WudQueueCardEditor);

// src/fade.ts
var fadeStyles = i`
    .fades {
        --fade-length: min(24px, 25%);
        scroll-padding-block: calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px)) var(--fade-length, 24px);
    }

    .fade-top {
        mask-image: linear-gradient(
            to bottom,
            #000 var(--fade-top-offset, 0px),
            transparent var(--fade-top-offset, 0px),
            #000 calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px))
        );
    }

    .fade-bottom {
        mask-image: linear-gradient(to top, transparent, #000 var(--fade-length, 24px));
    }

    .fade-top.fade-bottom {
        mask-image: linear-gradient(
            to bottom,
            #000 var(--fade-top-offset, 0px),
            transparent var(--fade-top-offset, 0px),
            #000 calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px)),
            #000 calc(100% - var(--fade-length, 24px)),
            transparent
        );
    }
`;
function markFade(part) {
  const hidden = part.scrollHeight - part.clientHeight;
  part.classList.toggle("fade-top", hidden > 1 && part.scrollTop > 1);
  part.classList.toggle("fade-bottom", hidden > 1 && hidden - part.scrollTop > 1);
}
var onScroll = (event) => markFade(event.currentTarget);
var ScrollFade = class {
  constructor(host, parts) {
    this.host = host;
    this.parts = parts;
    /** Each followed part with the children whose size it watches. */
    this.followed = /* @__PURE__ */ new Map();
    this.resized = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver((entries) => {
      for (const { target } of entries) {
        const part = this.followed.has(target) ? target : target.parentElement;
        if (part && this.followed.has(part)) {
          markFade(part);
        }
      }
    });
    host.addController(this);
  }
  hostConnected() {
    if (this.host.hasUpdated) {
      this.follow();
    }
  }
  hostUpdated() {
    if (this.host.isConnected) {
      this.follow();
    }
  }
  hostDisconnected() {
    for (const part of [...this.followed.keys()]) {
      this.forget(part);
    }
  }
  follow() {
    const now = new Set(this.parts());
    for (const part of [...this.followed.keys()]) {
      if (!now.has(part)) {
        this.forget(part);
      }
    }
    for (const part of now) {
      if (!this.followed.has(part)) {
        part.addEventListener("scroll", onScroll, { passive: true });
        this.resized?.observe(part);
      }
      part.classList.add("fades");
      const before = this.followed.get(part) ?? [];
      const children = [...part.children];
      before.filter((child) => !children.includes(child)).forEach((child) => this.resized?.unobserve(child));
      children.filter((child) => !before.includes(child)).forEach((child) => this.resized?.observe(child));
      this.followed.set(part, children);
      markFade(part);
    }
  }
  forget(part) {
    this.followed.get(part)?.forEach((child) => this.resized?.unobserve(child));
    this.followed.delete(part);
    part.removeEventListener("scroll", onScroll);
    this.resized?.unobserve(part);
    part.classList.remove("fades", "fade-top", "fade-bottom");
  }
};

// src/wud-queue-card.ts
console.info(
  `%c  WUD-QUEUE-CARD 
%c  ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
var registry = window;
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
  type: "wud-queue-card",
  name: translate(browserLanguage(), "common.name"),
  description: translate(browserLanguage(), "common.description"),
  documentationURL: "https://github.com/jesmak/wud-queue-card",
  preview: true
});
var HELD_FRAME_PX = 44 + 14 + 12 + 6 + 2 * 34 + 4 + 2;
var FIRST_ROW_PX = [
  [214, 126],
  [180, 134],
  [160, 152],
  [150, 222],
  [0, 313]
];
var DOCKER_EPOCH = Date.UTC(2013, 0, 1);
var px = (value) => parseFloat(value) || 0;
var SLACK_PX = 0.01;
var LARGE_CHECK_PX = 120;
var CARD_PARTS = [".hd", ".hd-sub", ".bar", ".list", ".idle", ".message"].map((part) => `:scope > ${part}`).join(", ");
function listEndHeight(list) {
  const style = getComputedStyle(list);
  let height = px(style.paddingTop) + px(style.paddingBottom);
  for (const child of list.children) {
    const part = child;
    const partStyle = getComputedStyle(part);
    const margins = px(partStyle.marginTop) + px(partStyle.marginBottom);
    if (!part.classList.contains("fold")) {
      height += margins + part.getBoundingClientRect().height;
      continue;
    }
    const inner = part.firstElementChild;
    const content = inner?.firstElementChild;
    const last = content?.lastElementChild;
    if (!part.classList.contains("open") || !content || !last) {
      continue;
    }
    const contentStyle = getComputedStyle(content);
    height += margins + last.getBoundingClientRect().bottom + px(getComputedStyle(last).marginBottom) + px(contentStyle.paddingBottom) - content.getBoundingClientRect().top;
  }
  return height;
}
function running(unit, followed) {
  return unit.installing || followed.get(unit.key)?.status === "running";
}
var WudQueueCard = class extends i4 {
  constructor() {
    super();
    this.installs = /* @__PURE__ */ new Map();
    this.now = Date.now();
    /** Each container as last seen with a usable entity, for while WUD recreates it. */
    this.known = /* @__PURE__ */ new Map();
    this.acting = false;
    this.sliding = false;
    this.filled = 0;
    this.spare = 0;
    this.width = 0;
    this.beside = false;
    this.largeCheck = false;
    this.resizes = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(() => this.measureSoon());
    /** How each remembered install is going, worked out once per update. */
    this.followed = /* @__PURE__ */ new Map();
    /** The projects to show, worked out once per update. */
    this.projectList = [];
    this.slid = (event) => {
      if (event.propertyName !== "grid-template-rows" || event.target !== event.currentTarget) {
        return;
      }
      const moving = [...this.renderRoot.querySelectorAll(".fold")].some(
        (fold) => fold !== event.currentTarget && (fold.getAnimations?.().length ?? 0) > 0
      );
      if (!moving) {
        window.clearTimeout(this.slideTimer);
        this.sliding = false;
      }
    };
    new ScrollFade(this, () => this.heightStyle() ? this.renderRoot.querySelectorAll(".fold.open .scroll, .idle") : []);
  }
  static getConfigElement() {
    return document.createElement("wud-queue-card-editor");
  }
  static getStubConfig() {
    return {};
  }
  setConfig(config) {
    const list = (value) => {
      if (value === void 0 || Array.isArray(value) && value.every((v2) => typeof v2 === "string")) {
        return value;
      }
      if (typeof value === "string") {
        return [value];
      }
      throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
    };
    if (!config) {
      throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
    }
    const entities = list(config.entities);
    const exclude = list(config.exclude);
    if (!validHeight(config)) {
      throw new Error(translate(browserLanguage(), "common.invalid_height"));
    }
    if (!validRowStep(config)) {
      throw new Error(translate(browserLanguage(), "common.invalid_row_step"));
    }
    this.config = { ...config, entities, exclude };
  }
  getCardSize() {
    const pending = this.projects().flatMap((p3) => p3.units).filter((u3) => u3.pending).length;
    return heightCardSize(this.config ?? {}, 2 + Math.min(pending, 6), this.minimumHeight());
  }
  // No max_columns: a long version or digest has room to stay on one line in a wide card. Below 9 columns, a waiting row in
  // a compose project has too little room left for its name beside the project's indent, its icon and its button.
  getGridOptions() {
    return { columns: 12, min_columns: 9, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
  }
  /**
   * Held to a height, the header, the status line, the progress bar, both section lines and the first waiting row with its
   * project's label still fit, at any width the card's 9 columns or more allow, or at its measured width if narrower. The
   * texts above the open section keep to one line then.
   */
  minimumHeight() {
    const width = this.width || Infinity;
    return HELD_FRAME_PX + FIRST_ROW_PX.find(([least]) => width >= least)[1];
  }
  heightStyle() {
    return heightStyle(this.config ?? {}, this.layout, this.minimumHeight());
  }
  connectedCallback() {
    super.connectedCallback();
    this.now = Date.now();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this.timer);
    this.timer = void 0;
    window.clearTimeout(this.slideTimer);
    this.sliding = false;
    this.resizes?.disconnect();
    cancelAnimationFrame(this.frame ?? 0);
  }
  updated() {
    if (!this.isConnected) {
      return;
    }
    const card = this.renderRoot.querySelector("ha-card");
    if (card) {
      this.resizes?.observe(card);
    }
    this.measureSoon();
  }
  measureSoon() {
    cancelAnimationFrame(this.frame ?? 0);
    this.frame = requestAnimationFrame(() => {
      if (this.measureBeside() && this.measureIdle()) {
        this.fillRows();
      }
    });
  }
  /**
   * Held to a set height with nothing waiting, the check under the line is the large one when the room fits it with its
   * lines, so the room doesn't scroll for it. The room's height comes from the card and the lines' from its width, so
   * neither changes with the check's size and the choice can't flip back and forth. Returns false when the layout changed.
   */
  measureIdle() {
    const idle = this.renderRoot.querySelector("ha-card > .idle");
    const lines = idle?.querySelector(":scope > .idle-lines");
    if (!idle?.clientHeight || !lines) {
      return true;
    }
    const style = getComputedStyle(idle);
    const room = idle.clientHeight - px(style.paddingTop) - px(style.paddingBottom);
    const large = LARGE_CHECK_PX + px(style.rowGap) + px(getComputedStyle(lines).height) <= room + SLACK_PX;
    if (large === this.largeCheck) return true;
    this.largeCheck = large;
    return false;
  }
  /**
   * Puts the waiting rows' versions beside their names only when they fit there: when a name's longest word, the gap and
   * the whole version fit in the row's texts, and no row is taller than with its version under its name. Then every
   * waiting row, a shut section's included, so the list keeps one layout. The list is held to its drawn height meanwhile,
   * its overflow clipped, so nothing around it moves, and a section that scrolls is put back where it was.
   * Returns false when the layout changed.
   */
  measureBeside() {
    const card = this.renderRoot.querySelector("ha-card");
    const list = card?.querySelector(":scope > .list");
    const infos = list ? [...list.querySelectorAll(".row.unit > .info")] : [];
    if (!card || !list?.clientWidth || infos.length === 0) {
      if (this.beside && card?.clientWidth) {
        this.beside = false;
      }
      return true;
    }
    const heights = () => infos.map((info) => px(getComputedStyle(info).height));
    const was = card.classList.contains("beside");
    const scrollers = [...list.querySelectorAll(".scroll")].map((scroll) => [scroll, scroll.scrollTop]);
    list.style.height = `${Math.round(px(getComputedStyle(list).height) * 64) / 64}px`;
    list.style.overflow = "hidden";
    list.style.overflowAnchor = "none";
    card.classList.remove("beside");
    const under = heights();
    card.classList.add("beside");
    const sideBySide = heights();
    card.classList.add("measuring");
    const fits = infos.every((info, i5) => {
      const style = getComputedStyle(info);
      if (style.display !== "flex") {
        return false;
      }
      const parts = [...info.children].reduce((sum, part) => sum + px(getComputedStyle(part).width), 0);
      return parts + px(style.columnGap) <= px(style.width) + SLACK_PX && sideBySide[i5] <= under[i5] + SLACK_PX;
    });
    card.classList.remove("measuring");
    card.classList.toggle("beside", was);
    list.style.height = "";
    list.style.overflow = "";
    list.style.overflowAnchor = "";
    for (const [scroll, top] of scrollers) {
      if (scroll.scrollTop !== top) {
        scroll.scrollTop = top;
      }
    }
    if (fits === this.beside) return true;
    this.beside = fits;
    return false;
  }
  /**
   * In a sections view whose rows are left automatic, the card takes the whole rows its content needs, or the half rows
   * with `row_step: half`, so the cards under it stay on the rows, up to the limit of a card that grows up to one. The
   * room left over goes under the status line, or under the
   * progress bar while the queue has one.
   * Measured to where the folds' slides end rather than where they are, so the card is on its rows as a slide begins.
   */
  fillRows() {
    const card = this.renderRoot.querySelector("ha-card");
    if (!card || !card.clientWidth) {
      return;
    }
    const width = Math.round(card.getBoundingClientRect().width);
    if (width !== this.width) {
      this.width = width;
    }
    const limit = fillLimit(this.config ?? {}, this.layout, this.minimumHeight());
    if (!limit) {
      if (this.filled) this.filled = 0;
      if (this.spare) this.spare = 0;
      return;
    }
    const style = getComputedStyle(card);
    let content = px(style.borderTopWidth) + px(style.borderBottomWidth) + px(style.paddingTop) + px(style.paddingBottom);
    for (const part of card.querySelectorAll(CARD_PARTS)) {
      const partStyle = getComputedStyle(part);
      const height = part.classList.contains("list") ? listEndHeight(part) : part.getBoundingClientRect().height;
      content += px(partStyle.marginTop) + height + px(partStyle.marginBottom);
    }
    const list = card.querySelector(":scope > .list, :scope > .message");
    content -= Math.max(0, list ? px(getComputedStyle(list).marginTop) : 0);
    const filled = filledHeight(Math.round(content), this.config ?? {}, limit);
    const spare = Math.max(0, Math.floor(filled - content));
    if (filled !== this.filled) {
      this.filled = filled;
    }
    if (spare !== this.spare) {
      this.spare = spare;
    }
  }
  /** The card's inline style: the height it is held to, or the rows it fills up to any limit, with their spare room above the list. */
  cardStyle() {
    const style = filledStyle(this.config ?? {}, this.layout, this.minimumHeight(), this.filled);
    return this.filled ? `${style}; --wq-spare: ${this.spare}px` : style;
  }
  /** The card's classes: held to a height, its texts above the open section keep to one line, and a slide moves its rows along. */
  cardClass() {
    return [this.heightStyle() && "held", this.sliding && "sliding", this.beside && "beside"].filter(Boolean).join(" ");
  }
  /** Whether the card is held to a height that is set, fixed or in rows, and so may have room left under its content. */
  setHeight() {
    return this.heightStyle().startsWith("height");
  }
  shouldUpdate(changed) {
    if (!this.config || !changed.has("hass") || changed.size > 1) {
      return true;
    }
    const previous = changed.get("hass");
    if (!previous || !this.hass) {
      return true;
    }
    if ((previous.locale?.language ?? previous.language) !== (this.hass.locale?.language ?? this.hass.language)) {
      return true;
    }
    if (previous.entities !== this.hass.entities) {
      return true;
    }
    const queue = queueEntityId(this.hass);
    if (queue && previous.states[queue] !== this.hass.states[queue]) {
      return true;
    }
    const before = selectedEntities(previous, this.config);
    const after = selectedEntities(this.hass, this.config);
    return before.length !== after.length || after.some((id) => previous.states[id] !== this.hass?.states[id]);
  }
  /**
   * Brings what the card remembers of its installs up to date, and keeps a clock running while one is going.
   * An install is forgotten when its row is gone, which is also what happens when an even newer version
   * comes out, and a finished one after `DONE_KEEP`.
   */
  willUpdate() {
    this.projectList = this.projects();
    const units = new Map(this.projectList.flatMap((p3) => p3.units.map((u3) => [u3.key, u3])));
    const pending = [...units.values()].some((u3) => u3.pending);
    if (this.hadPending === false && pending) {
      this.open = void 0;
    }
    this.hadPending = pending;
    const installs = /* @__PURE__ */ new Map();
    this.followed = /* @__PURE__ */ new Map();
    for (const [key, install] of this.installs) {
      const unit = units.get(key);
      if (!unit) {
        continue;
      }
      const followed = follow(unit, install, this.now);
      if (followed.status === "done" && this.now - (followed.install.ended ?? this.now) > DONE_KEEP) {
        continue;
      }
      installs.set(key, followed.install);
      this.followed.set(key, followed);
    }
    this.installs = installs;
    const queue = this.hass && queueOf(this.hass);
    if (queue) {
      for (const [key, unit] of units) {
        const followed = followQueue(unit, queue);
        if (followed) {
          this.followed.set(key, followed);
        }
      }
    }
    const ticking = [...this.followed.values()].some((f3) => f3.status === "running" || f3.status === "done");
    if (ticking && this.timer === void 0) {
      this.timer = window.setInterval(() => this.now = Date.now(), 5e3);
    } else if (!ticking && this.timer !== void 0) {
      window.clearInterval(this.timer);
      this.timer = void 0;
    }
  }
  render() {
    if (!this.hass || !this.config) {
      return A;
    }
    const projects = this.projectList;
    const title = this.config.title ?? this.text("common.title");
    if (projects.length === 0) {
      return b2`<ha-card style=${this.cardStyle()} class=${this.cardClass()}>
                <div class="hd"><div class="hd-title" title=${title}>${title}</div></div>
                <div class="message">${this.text("common.no_entities")}</div>
            </ha-card>`;
    }
    const followed = this.followed;
    const queue = queueOf(this.hass);
    const active = (unit) => unit.pending || unit.installing || followed.has(unit.key);
    const pendingProjects = projects.filter((p3) => p3.units.some(active));
    const currentProjects = projects.filter((p3) => !p3.units.some(active));
    const pendingUnits = pendingProjects.flatMap((p3) => p3.units).filter(active);
    const currentCount = currentProjects.reduce((n5, p3) => n5 + p3.units.length, 0);
    const open = this.open === "current" ? "current" : pendingUnits.length > 0 ? "pending" : "none";
    const busy = queueEntityId(this.hass) !== void 0 ? !queue || queue.stopping || this.acting : pendingUnits.some((u3) => running(u3, followed));
    const idle = pendingUnits.length === 0 && open !== "current" && this.setHeight();
    return b2`
            <ha-card style=${this.cardStyle()} class=${this.cardClass()}>
                <div class="hd">
                    ${pendingUnits.length === 0 ? b2`<ha-icon class="hd-icon" icon="mdi:check-circle-outline"></ha-icon>` : A}
                    <div class="hd-title" title=${title}>${title}</div>
                    ${queue ? this.queueAction(queue, pendingUnits, followed) : A}
                </div>
                ${this.statusLine(pendingUnits, followed, queue)} ${queue && queue.items.length > 0 ? this.progress(queue) : A}
                <div class=${idle ? "list shut" : "list"}>
                    ${pendingUnits.length === 0 ? A : b2`${currentCount === 0 ? A : open === "pending" ? this.switchLine(this.text("common.pending_count", { n: pendingUnits.length }), "pending") : this.switchRow(
      this.text("common.pending_count", { n: pendingUnits.length }),
      "pending",
      this.sectionPill(pendingUnits, followed)
    )}
                              ${this.fold(
      open === "pending",
      b2`<div class="scroll pending">
                                      ${pendingProjects.map((p3) => this.pendingProject(p3, active, followed, busy))}
                                  </div>`
    )}`}
                    ${currentCount === 0 ? A : b2`${open === "current" && pendingUnits.length > 0 ? this.switchLine(this.text("common.current_count", { n: currentCount }), "current") : this.switchRow(
      this.text("common.current_count", { n: currentCount }),
      open === "current" ? "none" : "current"
    )}
                              ${this.fold(
      open === "current",
      b2`<div class="scroll current">${currentProjects.map((p3) => this.currentProject(p3))}</div>`
    )}`}
                </div>
                ${idle ? this.idle() : A}
            </ha-card>
        `;
  }
  /**
   * The room a card held to a set height has under its one shut line while nothing waits: a check, and lines on the
   * containers. How many containers and compose projects there are, per Docker host when there are several, the oldest
   * installed image by when it was built, and how many containers aren't running, when any. More lines than fit scroll.
   */
  idle() {
    const containers = this.projectList.flatMap((p3) => p3.units.flatMap((u3) => u3.containers));
    const watchers = [...new Set(containers.map((c4) => c4.watcher))].sort();
    const lines = watchers.map((watcher) => {
      const own = containers.filter((c4) => c4.watcher === watcher);
      const projects = new Set(own.filter((c4) => c4.stack).map((c4) => c4.stack)).size;
      const text2 = [
        watchers.length > 1 ? watcher : "",
        this.count("containers", own.length),
        projects > 0 ? this.count("projects", projects) : ""
      ].filter(Boolean).join(" \xB7 ");
      return { icon: "mdi:docker", text: text2 };
    });
    const oldest = containers.filter((c4) => Date.parse(c4.created) >= DOCKER_EPOCH).sort((a3, b3) => Date.parse(a3.created) - Date.parse(b3.created))[0];
    if (oldest) {
      lines.push({
        icon: "mdi:clock-outline",
        text: this.text("common.oldest_image", { name: oldest.name, age: this.age(oldest.created) })
      });
    }
    const stopped = containers.filter((c4) => c4.status && c4.status !== "running").length;
    if (stopped > 0) {
      lines.push({ icon: "mdi:stop-circle-outline", text: this.count("not_running", stopped) });
    }
    return b2`<div class="idle">
            <ha-icon class="idle-icon ${this.largeCheck ? "large" : ""}" icon="mdi:check-circle-outline"></ha-icon>
            <div class="idle-lines">
                ${lines.map(
      ({ icon, text: text2 }) => b2`<div class="idle-line"><ha-icon icon=${icon}></ha-icon><span title=${text2}>${text2}</span></div>`
    )}
            </div>
        </div>`;
  }
  /** A count with its noun, which takes the singular for one. */
  count(key, n5) {
    return this.text(`common.${key}${n5 === 1 ? "_one" : ""}`, { n: n5 });
  }
  /** How long ago a date was, in days, months or years, in the viewer's language. */
  age(date) {
    const days = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 864e5));
    const format = new Intl.RelativeTimeFormat(this.language(), { numeric: "auto" });
    if (days < 60) {
      return format.format(-days, "day");
    }
    return days < 730 ? format.format(-Math.round(days / 30.44), "month") : format.format(-Math.round(days / 365.25), "year");
  }
  /** One line under the title: what is going on, or what is waiting. */
  statusLine(units, followed, queue) {
    const line = (text2) => b2`<div class="hd-sub" title=${text2}>${text2}</div>`;
    const installing = units.filter((u3) => running(u3, followed));
    if (installing.length > 0) {
      return line(this.text("common.updating", { name: installing.map((u3) => u3.name).join(", ") }));
    }
    const failed = units.filter((u3) => followed.get(u3.key)?.status === "failed");
    if (failed.length > 0) {
      return line(this.text("common.failed", { name: failed.map((u3) => u3.name).join(", ") }));
    }
    if (queue?.state === "stopped") {
      return line(this.text("common.queue_stopped"));
    }
    return line(this.text(units.some((u3) => u3.pending) ? "common.available" : "common.all_current"));
  }
  /** A project with something to install: its label when it has several rows, then the rows. */
  pendingProject(project, active, followed, busy) {
    const rows = project.units.map((unit) => active(unit) ? this.unitRow(unit, followed.get(unit.key), busy) : this.siblingRow(unit));
    if (project.units.length === 1) {
      return b2`${rows}`;
    }
    return b2`<div class="proj">
            ${this.projectLabel(project, !project.units.some((u3) => u3.pending))}
            <div class="proj-body">${rows}</div>
        </div>`;
  }
  currentProject(project) {
    if (project.units.length === 1) {
      return this.siblingRow(project.units[0], false);
    }
    return b2`<div class="proj">
            ${this.projectLabel(project, true)}
            <div class="proj-body">${project.units.map((unit) => this.siblingRow(unit))}</div>
        </div>`;
  }
  /** A compose project's own row, dimmed like its containers unless one of them has an update. */
  projectLabel(project, muted) {
    const services = project.units.reduce((n5, u3) => n5 + u3.containers.length, 0);
    return b2`<div class="row proj-head ${muted ? "muted" : ""}">
            <ha-icon class="ico" icon="mdi:layers-outline"></ha-icon>
            <div class="info">
                <div class="name">${project.name}<span class="count">${this.text("common.services", { n: services })}</span></div>
            </div>
        </div>`;
  }
  /** A row with an update, or one the card has installed since the page was opened. */
  unitRow(unit, followed, busy) {
    const status = followed?.status ?? (unit.installing ? "running" : "pending");
    const moved = followed?.install.from ?? {};
    const shown = status === "done" ? unit.containers.find((c4) => moved[c4.entity_id] !== c4.installed) ?? unit.containers[0] : unit.containers.find((c4) => c4.pending) ?? unit.containers[0];
    const from = status === "done" ? moved[shown.entity_id] ?? "" : shown.installed;
    const to = status === "done" ? shown.installed : shown.latest;
    return b2`
            <div class="row unit" role="button" tabindex="0" @click=${() => this.moreInfo(unit)} @keydown=${this.onKey(unit)}>
                ${this.statusIcon(status)}
                <div class="info">
                    <div class="name">${unit.name}${this.serviceCount(unit, followed)}</div>
                    <div class="sub ver">${from} → <span class="new">${to}</span></div>
                </div>
                <div class="end">
                    ${// A failed row can be tried again. Its error stays under it until then.
    status === "pending" || status === "failed" || status === "not_run" ? b2`<button
                                  class="install"
                                  ?disabled=${busy}
                                  title=${this.text("common.install", { name: unit.name })}
                                  aria-label=${this.text("common.install", { name: unit.name })}
                                  @click=${(event) => this.install(event, unit)}
                              >
                                  <ha-icon icon="mdi:arrow-up"></ha-icon>
                              </button>` : b2`<span class="pill ${status}">${this.text(`status.${status}`)}</span>`}
                </div>
            </div>
            ${status === "failed" ? b2`<div class="errline">
                          ${this.text(`error.${followed?.reason ?? "version"}`, {
      version: shown.installed,
      message: followed?.install.error ?? ""
    })}
                      </div>` : A}
        `;
  }
  /** An up-to-date row with its version: a thin line in a project's group, or a project of its own. */
  siblingRow(unit, inGroup = true) {
    return b2`<div
            class="row ${inGroup ? "sib" : ""} muted"
            role="button"
            tabindex="0"
            @click=${() => this.moreInfo(unit)}
            @keydown=${this.onKey(unit)}
        >
            <ha-icon class="ico" icon="mdi:docker"></ha-icon>
            <div class="info"><div class="name">${unit.name}${this.serviceCount(unit)}</div></div>
            <div class="end"><span class="ver">${unit.containers[0].installed}</span></div>
        </div>`;
  }
  statusIcon(status) {
    const icons = {
      pending: "mdi:docker",
      queued: "mdi:timer-sand",
      not_run: "mdi:minus-circle-outline",
      running: "mdi:sync",
      done: "mdi:check",
      failed: "mdi:alert-circle-outline"
    };
    const label = status === "pending" ? A : this.text(`status.${status}`);
    return b2`<ha-icon class="ico ${status}" icon=${icons[status]} title=${label} aria-label=${label}></ha-icon>`;
  }
  /** "5 services", or "2/5 services" while they install. Nothing for a row of one container. */
  serviceCount(unit, followed) {
    const n5 = unit.containers.length;
    if (n5 < 2) {
      return A;
    }
    const label = followed?.status === "running" ? this.text("common.services_done", { done: servicesDone(unit, followed.install), n: n5 }) : this.text("common.services", { n: n5 });
    return b2`<span class="count">${label}</span>`;
  }
  /** A section's line with the button that opens it, or shuts it when nothing else could be opened instead. */
  switchRow(label, target, pill = A) {
    const section = target === "pending" ? "pending" : "current";
    return b2`<button
            class="switch ${section}"
            aria-expanded=${target === "none" ? "true" : "false"}
            @click=${() => this.switchTo(target)}
        >
            <span class="switch-label"><span class="switch-text" title=${label}>${label}</span>${pill}</span>
            <span>${this.text(target === "none" ? "common.hide" : "common.show")}</span>
        </button>`;
  }
  /** The open section's line, which has nothing to switch to. */
  switchLine(label, section) {
    return b2`<div class="switch ${section}"><span class="switch-text" title=${label}>${label}</span></div>`;
  }
  switchTo(target) {
    this.open = target;
    this.sliding = true;
    window.clearTimeout(this.slideTimer);
    this.slideTimer = window.setTimeout(() => this.sliding = false, 1e3);
  }
  /** Content that slides open and shut. A shut one stays in the page, so the change can be animated. */
  fold(isOpen, content) {
    return b2`<div class="fold ${isOpen ? "open" : ""}" ?inert=${!isOpen} @transitionend=${this.slid}>
            <div class="fold-in">${content}</div>
        </div>`;
  }
  /** On the closed row of waiting updates: whether something is installing or has failed. */
  sectionPill(units, followed) {
    if (units.some((u3) => running(u3, followed))) {
      return b2`<span class="pill running">${this.text("status.running")}</span>`;
    }
    if (units.some((u3) => followed.get(u3.key)?.status === "failed")) {
      return b2`<span class="pill failed">${this.text("status.failed")}</span>`;
    }
    return A;
  }
  async install(event, unit) {
    event.stopPropagation();
    if (!this.hass) {
      return;
    }
    const pending = unit.containers.filter((c4) => c4.pending);
    if (queueEntityId(this.hass) !== void 0) {
      const installs = new Map(this.installs);
      installs.delete(unit.key);
      this.installs = installs;
      this.call("enqueue", { entity_id: pending.map((c4) => c4.entity_id) });
      return;
    }
    const install = {
      at: Date.now(),
      from: Object.fromEntries(unit.containers.map((c4) => [c4.entity_id, c4.installed])),
      targets: Object.fromEntries(unit.containers.map((c4) => [c4.entity_id, c4.pending ? c4.latest : c4.installed])),
      started: false
    };
    this.installs = new Map(this.installs).set(unit.key, install);
    this.now = Date.now();
    try {
      await this.hass.callService("update", "install", {}, { entity_id: pending.map((c4) => c4.entity_id) });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error?.message ?? error);
      this.installs = new Map(this.installs).set(unit.key, { ...install, error: message });
    }
  }
  /** Opens a row's entity from the keyboard, as a click does. */
  onKey(unit) {
    return (event) => {
      if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        this.moreInfo(unit);
      }
    };
  }
  /** The queue's one button: update everything waiting, stop the run, try again after a failure, or clear a finished run. */
  queueAction(queue, units, followed) {
    if (queue.state === "running") {
      return this.actionButton(
        this.text(queue.stopping ? "common.stopping" : "common.stop"),
        "mdi:stop",
        queue.stopping,
        () => this.call("stop")
      );
    }
    if (queue.state === "failed") {
      return this.hass && retryable(this.hass, queue) ? this.actionButton(this.text("common.retry"), "mdi:refresh", false, () => this.call("retry")) : this.actionButton(this.text("common.clear"), "mdi:check", false, () => this.call("clear"));
    }
    const waiting = units.filter((u3) => u3.pending && !["queued", "running"].includes(followed.get(u3.key)?.status ?? "")).flatMap((u3) => u3.containers.filter((c4) => c4.pending).map((c4) => c4.entity_id));
    if (waiting.length > 0) {
      return this.actionButton(
        this.text("common.update_all"),
        "mdi:update",
        false,
        () => this.call("enqueue", { entity_id: waiting })
      );
    }
    if (queue.items.some((i5) => i5.status === "done")) {
      return this.actionButton(this.text("common.clear"), "mdi:check", false, () => this.call("clear"));
    }
    return A;
  }
  /** The text of a wide card, or a round icon on a narrow one, with the text as its tooltip and label. */
  actionButton(label, icon, disabled, action) {
    return b2`<button class="action" title=${label} aria-label=${label} ?disabled=${disabled || this.acting} @click=${action}>
            <ha-icon icon=${icon}></ha-icon><span>${label}</span>
        </button>`;
  }
  call(service, data = {}) {
    if (!this.hass) {
      return;
    }
    this.acting = true;
    void this.hass.callService("wud_queue", service, data).catch(() => void 0).finally(() => this.acting = false);
  }
  /** A thin bar with a segment per item of the queue, coloured by how it went. */
  progress(queue) {
    return b2`<div class="bar" role="presentation">
            ${queue.items.map((item) => b2`<span class="seg ${item.status}" title=${item.name}></span>`)}
        </div>`;
  }
  moreInfo(unit) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: unit.containers[0].entity_id },
        bubbles: true,
        composed: true
      })
    );
  }
  projects() {
    if (!this.hass || !this.config) {
      return [];
    }
    const hass = this.hass;
    const ids = selectedEntities(hass, this.config);
    const installing = /* @__PURE__ */ new Set([
      ...[...this.installs.values()].flatMap((install) => Object.keys(install.targets)),
      ...(queueOf(hass)?.items ?? []).flatMap((item) => item.entities.map((e5) => e5.entity_id))
    ]);
    for (const id of installing) {
      if (!ids.includes(id) && this.known.has(id) && hass.states[id] !== void 0) {
        ids.push(id);
      }
    }
    const containers = ids.map((id) => {
      const state = hass.states[id];
      const container = state && isWud(state) ? containerOf(state) : void 0;
      if (container) {
        this.known.set(id, container);
      }
      return container ?? this.known.get(id);
    }).filter((c4) => c4 !== void 0);
    for (const id of this.known.keys()) {
      if (hass.states[id] === void 0) {
        this.known.delete(id);
      }
    }
    return projectsOf(containers);
  }
  text(key, values = {}) {
    return translate(this.language(), key).replace(
      /\{(\w+)\}/g,
      (match, name) => name in values ? String(values[name]) : match
    );
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
  static get styles() {
    return [
      i`
                /*
             * A column, so that with a height of its own, given in the options or by the dashboard's grid, the
             * title and the section lines keep their place and the open section scrolls in what is left.
             */
                ha-card {
                    /* ha-card's own transition covers every property, so a change in the rows filled would animate. Only a slide does. */
                    transition: none;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    container-type: inline-size;
                    --wq-soft: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
                    --wq-track: rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.08);
                }

                .hd {
                    flex: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 12px 0 16px;
                }

                /* The card's one call to action, so it looks like one on any theme. */
                .action {
                    flex: none;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                    --mdc-icon-size: 18px;
                    font: inherit;
                    font-size: 12.5px;
                    font-weight: 500;
                    color: var(--text-primary-color, #fff);
                    background: var(--primary-color);
                    border: 0;
                    border-radius: 16px;
                    padding: 5px 12px;
                    cursor: pointer;
                }

                .action ha-icon {
                    display: none;
                }

                .action:disabled {
                    opacity: 0.5;
                    cursor: default;
                }

                .action:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }

                .bar {
                    flex: none;
                    display: flex;
                    gap: 3px;
                    margin: 8px 16px 0;
                }

                /* Waiting and not run: a grey that shows on light and dark themes alike. */
                .seg {
                    flex: 1 1 0;
                    height: 4px;
                    border-radius: 2px;
                    background: color-mix(in srgb, var(--secondary-text-color) 35%, transparent);
                }

                .seg.running {
                    background: var(--primary-color);
                    opacity: 0.6;
                }

                .seg.done {
                    background: var(--success-color, #43a047);
                }

                .seg.failed {
                    background: var(--error-color, #db4437);
                }

                /* A check before the title while nothing waits, as in updates-card. */
                .hd-icon {
                    flex: none;
                    color: var(--success-color, #43a047);
                }

                .hd-title {
                    flex: 1 1 auto;
                    min-width: 0;
                    font-size: var(--ha-card-header-font-size, 18px);
                    line-height: 1.4;
                }

                /* The status line reads the same in every state, in the text colour. The rows show the colours. */
                .hd-sub {
                    flex: none;
                    padding: 0 16px;
                    font-size: 12px;
                    color: var(--primary-text-color);
                }

                /* Under the check, the status line starts where the title does: the header's padding, the icon and the gap. */
                .hd:has(.hd-icon) + .hd-sub {
                    padding-left: 50px;
                }

                .message {
                    margin-top: var(--wq-spare, 0px);
                    padding: 4px 16px 14px;
                    font-size: 12px;
                    color: var(--secondary-text-color);
                }

                /* The room a whole row leaves over goes above the list, under the status line or the progress bar. */
                .list {
                    flex: 1 1 auto;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    margin-top: var(--wq-spare, 0px);
                    padding-top: 6px;
                }

                .list > * {
                    flex: none;
                }

                .list > .fold.open {
                    flex: 1 1 auto;
                    min-height: 0;
                }

                .scroll {
                    height: 100%;
                    box-sizing: border-box;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    padding-bottom: 4px;
                }

                .sliding .scroll {
                    overflow-y: hidden;
                }

                .row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 3px 12px 3px 16px;
                    min-height: 40px;
                    cursor: pointer;
                }

                .ico {
                    flex: 0 0 28px;
                    --mdc-icon-size: 20px;
                    display: flex;
                    justify-content: center;
                    color: var(--secondary-text-color);
                }

                .ico.running {
                    color: var(--primary-color);
                    animation: spin 1.4s linear infinite;
                }

                .ico.done {
                    color: var(--success-color, #43a047);
                }

                .ico.failed {
                    color: var(--error-color, #db4437);
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .info {
                    flex: 1 1 auto;
                    min-width: 0;
                }

                /* Names and versions wrap rather than being cut, digests and long build tags included. */
                .name,
                .sub,
                .ver {
                    line-height: 1.3;
                    overflow-wrap: anywhere;
                }

                .name {
                    font-size: 14px;
                }

                .sub {
                    font-size: 11.5px;
                    color: var(--secondary-text-color);
                }

                .ver {
                    font-family: var(--ha-font-family-code, ui-monospace, monospace);
                    font-size: 11.5px;
                }

                .ver .new {
                    color: var(--primary-color);
                    font-weight: 500;
                }

                /* Never squeezed below its pill or button. A long version wraps within its half of the row instead. */
                .end {
                    flex: none;
                    max-width: 50%;
                    text-align: right;
                    display: flex;
                    align-items: center;
                    color: var(--secondary-text-color);
                }

                .muted {
                    opacity: 0.62;
                }

                .count {
                    font-size: 11px;
                    color: var(--secondary-text-color);
                    background: var(--wq-track);
                    border-radius: 8px;
                    padding: 0 6px;
                    margin-left: 6px;
                    vertical-align: 1px;
                    white-space: nowrap;
                }

                .install {
                    flex: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 0;
                    padding: 0;
                    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
                    color: var(--primary-text-color);
                    display: grid;
                    place-items: center;
                    cursor: pointer;
                    --mdc-icon-size: 17px;
                }

                .install:disabled {
                    opacity: 0.35;
                    cursor: default;
                }

                /* Inside its edges, so the scrolling section doesn't clip it at the card's sides. */
                .row:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: -2px;
                }

                .install:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }

                /* Inside the line, as the card clips what is drawn outside it and the line is as wide as the card. */
                .switch:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: -2px;
                }

                .pill {
                    font-size: 11px;
                    font-weight: 500;
                    border-radius: 10px;
                    padding: 1px 8px;
                    white-space: nowrap;
                }

                .pill.running {
                    background: var(--wq-soft);
                    color: var(--primary-color);
                }

                .pill.queued,
                .pill.not_run {
                    background: var(--wq-track);
                    color: var(--secondary-text-color);
                }

                .pill.done {
                    background: rgba(var(--rgb-success-color, 67, 160, 71), 0.12);
                    color: var(--success-color, #43a047);
                }

                .pill.failed {
                    background: rgba(var(--rgb-error-color, 219, 68, 55), 0.1);
                    color: var(--error-color, #db4437);
                }

                .errline {
                    margin: 0 12px 6px 54px;
                    padding: 6px 9px;
                    border-radius: 8px;
                    font-size: 12px;
                    color: var(--error-color, #db4437);
                    background: rgba(var(--rgb-error-color, 219, 68, 55), 0.1);
                }

                /* A compose project with several rows: a small label, then its rows along a guide line. */
                .proj {
                    margin-top: 2px;
                }

                .row.proj-head {
                    min-height: 30px;
                    cursor: default;
                }

                .proj-body {
                    margin-left: 29px;
                    border-left: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
                }

                .proj-body .row {
                    padding-left: 10px;
                }

                .proj-body .errline {
                    margin-left: 48px;
                }

                .row.sib,
                .current .row,
                .current .row.proj-head {
                    min-height: 26px;
                    padding-top: 1px;
                    padding-bottom: 1px;
                }

                /* A thin row that can't fit its name and version side by side puts the version under the name. */
                .row.sib,
                .current .row:not(.proj-head) {
                    flex-wrap: wrap;
                    row-gap: 0;
                }

                .row.sib .info,
                .current .row .info {
                    flex: 1 0 auto;
                    max-width: 100%;
                }

                .row.sib .end,
                .current .row .end {
                    margin-left: auto;
                    max-width: 100%;
                }

                .row.sib .ico,
                .current .ico {
                    --mdc-icon-size: 16px;
                }

                .row.sib .name,
                .current .name {
                    font-size: 13px;
                }

                .fold {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows var(--ha-animation-duration-normal, 250ms) ease;
                }

                .fold.open {
                    grid-template-rows: 1fr;
                }

                .fold-in {
                    min-height: 0;
                    overflow: hidden;
                }

                .switch {
                    box-sizing: border-box;
                    width: 100%;
                    font: inherit;
                    font-size: 12.5px;
                    color: var(--secondary-text-color);
                    background: none;
                    border: 0;
                    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
                    padding: 9px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    text-align: left;
                }

                /* A narrow card gives the rows the room its indents would take. */
                @container (max-width: 300px) {
                    .hd,
                    .row {
                        padding-left: 10px;
                        gap: 8px;
                    }

                    .hd-sub,
                    .message,
                    .switch {
                        padding-left: 10px;
                        padding-right: 10px;
                    }

                    .hd:has(.hd-icon) + .hd-sub {
                        padding-left: 42px;
                    }

                    .proj-body {
                        margin-left: 22px;
                    }

                    .proj-body .row {
                        padding-left: 6px;
                    }

                    .errline,
                    .proj-body .errline {
                        margin-left: 10px;
                    }

                    /* A waiting row's versions take a line of their own across the row, under its icon too. */
                    .row.unit {
                        display: grid;
                        grid-template-columns: 28px minmax(0, 1fr) auto;
                        row-gap: 2px;
                    }

                    .row.unit .info {
                        display: contents;
                    }

                    .row.unit .name {
                        grid-column: 2;
                    }

                    .row.unit .sub {
                        grid-column: 1 / -1;
                        grid-row: 2;
                    }

                    /* A row's pill would take half of it, so its icon says the same instead. */
                    .row .end:has(> .pill) {
                        display: none;
                    }

                    .action {
                        width: 32px;
                        height: 32px;
                        padding: 0;
                        border-radius: 50%;
                        justify-content: center;
                    }

                    .action ha-icon {
                        display: inline-flex;
                    }

                    .action span {
                        display: none;
                    }
                }

                button.switch {
                    cursor: pointer;
                }

                .switch-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                }

                /* Held to a height, the texts above the open section keep to one line, cut short with their text as a tooltip. */
                .held .hd-title,
                .held .hd-sub,
                .held .switch-text {
                    min-width: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .held .switch-label .pill {
                    flex: none;
                }

                /* Held, the open section scrolls, so its scrollbar and, as the card's last part, its end keep off the card's edges. */
                .held .list > .fold.open {
                    margin-right: 4px;
                }

                .held .list > .fold.open:last-child {
                    margin-bottom: 8px;
                }

                /* Its rows are measured the same whether it scrolls or not. */
                .held .scroll {
                    scrollbar-gutter: stable;
                }

                .held .list > .fold.open:last-child .scroll {
                    padding-bottom: 0;
                }

                /* Held and shut, the room under the line goes to the check and its lines instead of the list. */
                .held .list.shut {
                    flex: none;
                }

                /* With more lines than fit, it scrolls from its top. The lists are shut, so it is the card's only scroller. */
                .idle {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: safe center;
                    gap: 4px;
                    margin-right: 4px;
                    padding: 0 12px 12px 16px;
                    color: var(--secondary-text-color);
                }

                .idle-icon {
                    --mdc-icon-size: 64px;
                    flex: none;
                    margin-bottom: 4px;
                    color: var(--success-color, #43a047);
                    opacity: 0.5;
                }

                /* When the room fits it with its lines. Its size and the room under it add up to LARGE_CHECK_PX. */
                .idle-icon.large {
                    --mdc-icon-size: 100px;
                    margin-bottom: 20px;
                }

                /* The lines are centred as one block, so their icons line up. */
                .idle-lines {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                    max-width: 100%;
                }

                /* A line wraps rather than cut short, its icon by its first line, as the room scrolls when they don't fit. */
                .idle-line {
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                    max-width: 100%;
                    font-size: 12px;
                    line-height: 16px;
                    --mdc-icon-size: 16px;
                }

                .idle-line ha-icon {
                    flex: none;
                }

                .idle-line span {
                    min-width: 0;
                    overflow-wrap: anywhere;
                }

                /* The rows the card fills, and the spare room above the list, change along with a slide, not on ha-card's own timing. */
                ha-card.sliding {
                    transition: min-height var(--ha-animation-duration-normal, 250ms) ease;
                }

                ha-card.sliding > .list {
                    transition: margin var(--ha-animation-duration-normal, 250ms) ease;
                }

                /*
                 * A waiting row's versions go beside its name, next to the button, when every waiting row's fit there, as
                 * measured, on one line. Its name wraps between words only, as its longest word was measured to fit. A narrow
                 * card keeps its own layout.
                 */
                @container (width > 300px) {
                    .beside .row.unit > .info {
                        display: flex;
                        align-items: baseline;
                        justify-content: space-between;
                        gap: 16px;
                    }

                    .beside .row.unit > .info > .name {
                        overflow-wrap: break-word;
                    }

                    .beside .row.unit > .info > .ver {
                        flex: none;
                        white-space: nowrap;
                        text-align: end;
                    }

                    /* Up-to-date siblings line their version up with the waiting rows', left of the buttons. */
                    .beside .pending .row.sib .end {
                        margin-right: 40px;
                    }

                    /* Measuring: each name at its longest word, never broken inside one, beside its whole version. */
                    .measuring .row.unit > .info > .name {
                        flex: none;
                        width: min-content;
                        overflow-wrap: normal;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ico.running {
                        animation: none;
                    }

                    .fold,
                    ha-card.sliding,
                    ha-card.sliding > .list {
                        transition: none;
                    }
                }
            `,
      fadeStyles
    ];
  }
};
__decorateClass([
  n4({ attribute: false })
], WudQueueCard.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], WudQueueCard.prototype, "layout", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "config", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "open", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "installs", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "now", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "acting", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "sliding", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "filled", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "spare", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "width", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "beside", 2);
__decorateClass([
  r5()
], WudQueueCard.prototype, "largeCheck", 2);
WudQueueCard = __decorateClass([
  t3("wud-queue-card")
], WudQueueCard);
export {
  WudQueueCard,
  listEndHeight
};
